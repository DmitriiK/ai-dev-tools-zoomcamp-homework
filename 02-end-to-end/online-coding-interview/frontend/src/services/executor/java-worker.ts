// Java Web Worker for code execution
// Note: Full Java WASM execution requires CheerpJ which is a large runtime
// For now, we'll provide a helpful message about limitations

self.onmessage = async (e: MessageEvent) => {
  const { code, id } = e.data;
  console.log('Java Worker received:', { id, codeLength: code?.length });
  
  const startTime = performance.now();
  
  // Java WASM execution is complex and requires large runtime
  // CheerpJ is ~20MB+ and requires specific setup
  const executionTimeMs = Math.round(performance.now() - startTime);
  
  self.postMessage({
    id,
    result: {
      stdout: '',
      stderr: `Java WASM execution requires CheerpJ runtime which is not yet integrated.

To enable Java execution in browser:
1. CheerpJ provides Java-to-WASM compilation
2. Runtime size is significant (~20MB+)
3. Requires specialized initialization

For production use, consider:
- Using Java Playground API
- Server-side sandboxed execution
- Or focus on JavaScript/Python which have excellent WASM support

Currently supported languages with full WASM execution:
- JavaScript (native browser support)
- Python (via Pyodide)
- Go (via Go Playground API)`,
      exitCode: 1,
      executionTimeMs,
    },
  });
};
