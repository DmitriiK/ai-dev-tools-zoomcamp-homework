// Python Worker using Pyodide
declare const loadPyodide: () => Promise<PyodideInterface>;

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (options: { batched: (text: string) => void }) => void;
  setStderr: (options: { batched: (text: string) => void }) => void;
}

let pyodide: PyodideInterface | null = null;
let pyodideLoading: Promise<PyodideInterface> | null = null;

async function initPyodide(): Promise<PyodideInterface> {
  if (pyodide) return pyodide;
  
  if (pyodideLoading) return pyodideLoading;
  
  pyodideLoading = (async () => {
    // Load Pyodide from CDN
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
    pyodide = await loadPyodide();
    return pyodide;
  })();
  
  return pyodideLoading;
}

self.onmessage = async (e: MessageEvent) => {
  const { code, id } = e.data;
  
  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  const startTime = performance.now();
  
  try {
    const py = await initPyodide();
    
    // Capture stdout and stderr
    const stdoutLines: string[] = [];
    const stderrLines: string[] = [];
    
    py.setStdout({
      batched: (text: string) => {
        stdoutLines.push(text);
      },
    });
    
    py.setStderr({
      batched: (text: string) => {
        stderrLines.push(text);
      },
    });
    
    await py.runPythonAsync(code);
    
    stdout = stdoutLines.join('');
    stderr = stderrLines.join('');
  } catch (error) {
    exitCode = 1;
    stderr = error instanceof Error ? error.message : String(error);
  }
  
  const executionTimeMs = Math.round(performance.now() - startTime);
  
  self.postMessage({
    id,
    result: {
      stdout,
      stderr,
      exitCode,
      executionTimeMs,
    },
  });
};

// Signal that the worker is ready
self.postMessage({ type: 'ready' });
