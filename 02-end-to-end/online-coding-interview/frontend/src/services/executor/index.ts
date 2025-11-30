import { Language, ExecutionResult } from '../../types';

// Worker instances
let jsWorker: Worker | null = null;
let pyWorker: Worker | null = null;

// Execution timeout in milliseconds
const EXECUTION_TIMEOUT = 10000;

// Pending executions
const pendingExecutions = new Map<string, {
  resolve: (result: ExecutionResult) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}>();

function generateId(): string {
  return Math.random().toString(36).substring(7);
}

function getJavaScriptWorker(): Worker {
  if (!jsWorker) {
    jsWorker = new Worker(
      new URL('./javascript-worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    jsWorker.onmessage = (e) => {
      const { id, result } = e.data;
      const pending = pendingExecutions.get(id);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingExecutions.delete(id);
        pending.resolve(result);
      }
    };
    
    jsWorker.onerror = (e) => {
      console.error('JavaScript worker error:', e);
    };
  }
  return jsWorker;
}

function getPythonWorker(): Worker {
  if (!pyWorker) {
    pyWorker = new Worker(
      new URL('./python-worker.ts', import.meta.url),
      { type: 'classic' } // Classic worker for importScripts
    );
    
    pyWorker.onmessage = (e) => {
      if (e.data.type === 'ready') {
        console.log('Python worker ready');
        return;
      }
      
      const { id, result } = e.data;
      const pending = pendingExecutions.get(id);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingExecutions.delete(id);
        pending.resolve(result);
      }
    };
    
    pyWorker.onerror = (e) => {
      console.error('Python worker error:', e);
    };
  }
  return pyWorker;
}

export async function executeCode(
  code: string,
  language: Language
): Promise<ExecutionResult> {
  const id = generateId();
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingExecutions.delete(id);
      resolve({
        stdout: '',
        stderr: 'Execution timed out after 10 seconds',
        exitCode: -1,
        executionTimeMs: EXECUTION_TIMEOUT,
      });
    }, EXECUTION_TIMEOUT);
    
    pendingExecutions.set(id, { resolve, reject, timeout });
    
    switch (language) {
      case 'javascript':
        getJavaScriptWorker().postMessage({ code, id });
        break;
      
      case 'python':
        getPythonWorker().postMessage({ code, id });
        break;
      
      case 'csharp':
      case 'go':
      case 'java':
        // These languages require more complex WASM setup
        // For now, return a placeholder message
        clearTimeout(timeout);
        pendingExecutions.delete(id);
        resolve({
          stdout: '',
          stderr: `${language.toUpperCase()} execution is not yet implemented.\n` +
                  `This would require loading the appropriate WASM runtime:\n` +
                  `- C#: Blazor WebAssembly\n` +
                  `- Go: TinyGo WASM\n` +
                  `- Java: CheerpJ\n\n` +
                  `Currently, JavaScript and Python are fully supported.`,
          exitCode: 1,
          executionTimeMs: 0,
        });
        break;
      
      default:
        clearTimeout(timeout);
        pendingExecutions.delete(id);
        reject(new Error(`Unsupported language: ${language}`));
    }
  });
}

export function terminateWorkers(): void {
  if (jsWorker) {
    jsWorker.terminate();
    jsWorker = null;
  }
  if (pyWorker) {
    pyWorker.terminate();
    pyWorker = null;
  }
  
  // Clear all pending executions
  for (const [id, pending] of pendingExecutions) {
    clearTimeout(pending.timeout);
    pending.reject(new Error('Execution cancelled'));
  }
  pendingExecutions.clear();
}
