// JavaScript Web Worker for code execution
self.onmessage = async (e: MessageEvent) => {
  const { code, id } = e.data;
  
  const startTime = performance.now();
  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  
  // Override console.log to capture output
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  const logs: string[] = [];
  const errors: string[] = [];
  
  console.log = (...args) => {
    logs.push(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' '));
  };
  
  console.error = (...args) => {
    errors.push(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' '));
  };
  
  console.warn = (...args) => {
    logs.push('[WARN] ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' '));
  };
  
  try {
    // Create a function from the code and execute it
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const fn = new AsyncFunction(code);
    await fn();
    
    stdout = logs.join('\n');
    stderr = errors.join('\n');
  } catch (error) {
    exitCode = 1;
    stderr = error instanceof Error 
      ? `${error.name}: ${error.message}\n${error.stack || ''}`
      : String(error);
  } finally {
    // Restore original console methods
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
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
