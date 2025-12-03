import { Language, ExecutionResult } from '../../types';

// Worker instances
let jsWorker: Worker | null = null;
let pyWorker: Worker | null = null;
let goWorker: Worker | null = null;
let javaWorker: Worker | null = null;
let csharpWorker: Worker | null = null;

// Worker ready states
let jsWorkerReady = false;
let pyWorkerReady = false;

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
    console.log('[EXECUTOR] Creating JavaScript worker');
    jsWorker = new Worker(
      new URL('./javascript-worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    jsWorker.onmessage = (e) => {
      console.log('[EXECUTOR] JS worker response:', e.data);
      const { id, result } = e.data;
      const pending = pendingExecutions.get(id);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingExecutions.delete(id);
        pending.resolve(result);
      } else {
        console.warn('[EXECUTOR] No pending execution found for id:', id);
      }
    };
    
    jsWorker.onerror = (e) => {
      console.error('[EXECUTOR] JavaScript worker error:', e);
    };
    
    // Mark as ready after a small delay to ensure worker script is loaded
    setTimeout(() => {
      jsWorkerReady = true;
      console.log('[EXECUTOR] JavaScript worker marked ready');
    }, 100);
  }
  return jsWorker;
}

function getPythonWorker(): Worker {
  if (!pyWorker) {
    console.log('[EXECUTOR] Creating Python worker');
    pyWorker = new Worker(
      new URL('./python-worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    pyWorker.onmessage = (e) => {
      if (e.data.type === 'ready') {
        pyWorkerReady = true;
        console.log('[EXECUTOR] Python worker marked ready');
        return;
      }
      
      console.log('[EXECUTOR] Python worker response:', e.data);
      const { id, result } = e.data;
      const pending = pendingExecutions.get(id);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingExecutions.delete(id);
        pending.resolve(result);
      }
    };
    
    pyWorker.onerror = (e) => {
      console.error('[EXECUTOR] Python worker error:', e);
    };
  }
  return pyWorker;
}

function getGoWorker(): Worker {
  if (!goWorker) {
    goWorker = new Worker(
      new URL('./go-worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    goWorker.onmessage = (e) => {
      const { id, result } = e.data;
      console.log('Go worker response:', { id, result });
      const pending = pendingExecutions.get(id);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingExecutions.delete(id);
        pending.resolve(result);
      }
    };
    
    goWorker.onerror = (error) => {
      console.error('Go worker error:', error);
    };
  }
  return goWorker;
}

function getJavaWorker(): Worker {
  if (!javaWorker) {
    javaWorker = new Worker(
      new URL('./java-worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    javaWorker.onmessage = (e) => {
      const { id, result } = e.data;
      const pending = pendingExecutions.get(id);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingExecutions.delete(id);
        pending.resolve(result);
      }
    };
    
    javaWorker.onerror = (error) => {
      console.error('Java worker error:', error);
    };
  }
  return javaWorker;
}

function getCSharpWorker(): Worker {
  if (!csharpWorker) {
    csharpWorker = new Worker(
      new URL('./csharp-worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    csharpWorker.onmessage = (e) => {
      const { id, result } = e.data;
      const pending = pendingExecutions.get(id);
      if (pending) {
        clearTimeout(pending.timeout);
        pendingExecutions.delete(id);
        pending.resolve(result);
      }
    };
    
    csharpWorker.onerror = (error) => {
      console.error('C# worker error:', error);
    };
  }
  return csharpWorker;
}

// Initialize workers for immediate availability
export function initializeWorkers(language?: Language): void {
  console.log('[EXECUTOR] initializeWorkers called with language:', language);
  // Pre-initialize workers based on language
  if (!language || language === 'javascript') {
    getJavaScriptWorker();
  } else if (language === 'python') {
    getPythonWorker();
  } else if (language === 'go') {
    getGoWorker();
  } else if (language === 'java') {
    getJavaWorker();
  } else if (language === 'csharp') {
    getCSharpWorker();
  }
}

export async function executeCode(code: string, language: Language): Promise<ExecutionResult> {
  const id = generateId();
  console.log('[EXECUTOR] executeCode called:', { id, language, codeLength: code.length });
  
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log('[EXECUTOR] Execution timeout for:', id);
      pendingExecutions.delete(id);
      resolve({
        stdout: '',
        stderr: 'Execution timed out after 10 seconds',
        exitCode: -1,
        executionTimeMs: EXECUTION_TIMEOUT,
      });
    }, EXECUTION_TIMEOUT);
    
    pendingExecutions.set(id, { resolve, reject, timeout });
    
    // Wait for worker to be ready
    const waitForWorker = async (checkReady: () => boolean, workerName: string, maxWait = 5000) => {
      const start = Date.now();
      console.log(`[EXECUTOR] Waiting for ${workerName} worker to be ready...`);
      while (!checkReady() && Date.now() - start < maxWait) {
        await new Promise(r => setTimeout(r, 50));
      }
      const elapsed = Date.now() - start;
      if (checkReady()) {
        console.log(`[EXECUTOR] ${workerName} worker ready after ${elapsed}ms`);
      } else {
        console.warn(`[EXECUTOR] ${workerName} worker NOT ready after ${elapsed}ms - proceeding anyway`);
      }
    };
    
    switch (language) {
      case 'javascript':
        console.log('[EXECUTOR] JS worker ready state before wait:', jsWorkerReady);
        await waitForWorker(() => jsWorkerReady, 'JavaScript');
        console.log('[EXECUTOR] Posting to JS worker:', { code: code.substring(0, 50) + '...', id });
        getJavaScriptWorker().postMessage({ code, id });
        break;
      
      case 'python':
        console.log('[EXECUTOR] Python worker ready state before wait:', pyWorkerReady);
        await waitForWorker(() => pyWorkerReady, 'Python');
        console.log('[EXECUTOR] Posting to Python worker:', { code: code.substring(0, 50) + '...', id });
        getPythonWorker().postMessage({ code, id });
        break;
      
      case 'go':
        getGoWorker().postMessage({ code, id });
        break;
      
      case 'java':
        getJavaWorker().postMessage({ code, id });
        break;
      
      case 'csharp':
        getCSharpWorker().postMessage({ code, id });
        break;
      
      case 'sql':
        clearTimeout(timeout);
        pendingExecutions.delete(id);
        resolve({
          stdout: `SQL (PostgreSQL) - Syntax highlighting only

This language is for demonstrating SQL queries and database design.
Code execution is not supported.

Your SQL code looks well-formatted! In a real interview setting, you would:
- Explain your query logic
- Discuss indexing strategies
- Talk about query optimization
- Consider edge cases and data validation`,
          stderr: '',
          exitCode: 0,
          executionTimeMs: 0,
        });
        break;
      
      default:
        clearTimeout(timeout);
        pendingExecutions.delete(id);
        resolve({
          stdout: '',
          stderr: `Unsupported language: ${language}`,
          exitCode: 1,
          executionTimeMs: 0,
        });
        break;
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
  if (goWorker) {
    goWorker.terminate();
    goWorker = null;
  }
  if (javaWorker) {
    javaWorker.terminate();
    javaWorker = null;
  }
  if (csharpWorker) {
    csharpWorker.terminate();
    csharpWorker = null;
  }
  
  // Clear all pending executions
  for (const [, pending] of pendingExecutions) {
    clearTimeout(pending.timeout);
    pending.reject(new Error('Execution cancelled'));
  }
  pendingExecutions.clear();
}
