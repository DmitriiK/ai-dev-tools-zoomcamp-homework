// Go Web Worker for code execution
// Uses proxy-free API approach with better.dev/playground or alternative

self.onmessage = async (e: MessageEvent) => {
  const { code, id } = e.data;
  console.log('Go Worker received:', { id, codeLength: code?.length });
  
  const startTime = performance.now();
  
  try {
    // Use our backend proxy to avoid CORS issues
    // Note: Backend only proxies the request, doesn't execute code
    const response = await fetch('/api/proxy/go', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    const executionTimeMs = Math.round(performance.now() - startTime);

    // Parse Go Playground response format
    const events = result.Events || [];
    let stdout = '';
    let stderr = '';

    for (const event of events) {
      if (event.Kind === 'stdout') {
        stdout += event.Message;
      } else if (event.Kind === 'stderr') {
        stderr += event.Message;
      }
    }

    // Check for compilation errors
    if (result.Errors) {
      stderr = result.Errors + '\n' + stderr;
    }

    self.postMessage({
      id,
      result: {
        stdout,
        stderr,
        exitCode: stderr || result.Errors ? 1 : 0,
        executionTimeMs,
      },
    });
  } catch (error) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    
    // If API fails, provide helpful message about true WASM implementation
    let stderr = `Go execution failed: ${error instanceof Error ? error.message : 'Unknown error'}

Note: This uses Go Playground API which may have CORS restrictions.

For true browser-only WASM execution, we would need:
- Yaegi interpreter compiled to WASM (~5-10MB)
- Or GopherJS for Go-to-JavaScript transpilation
- Or TinyGo for compiling Go to WASM (requires build step)

Current approach: Calling Go Playground API from browser
(execution happens externally but call is client-side)`;

    self.postMessage({
      id,
      result: {
        stdout: '',
        stderr,
        exitCode: 1,
        executionTimeMs,
      },
    });
  }
};
