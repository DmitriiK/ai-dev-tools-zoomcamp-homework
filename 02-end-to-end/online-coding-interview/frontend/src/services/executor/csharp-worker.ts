// C# Web Worker for code execution
// Uses Try.NET or similar API for execution

self.onmessage = async (e: MessageEvent) => {
  const { code, id } = e.data;
  console.log('C# Worker received:', { id, codeLength: code?.length });
  
  const startTime = performance.now();
  
  try {
    // Use our backend proxy to avoid CORS issues
    // Note: Backend only proxies the request, doesn't execute code
    const apiUrl = (self as any).VITE_API_URL ? `${(self as any).VITE_API_URL}/api/proxy/csharp` : '/api/proxy/csharp';
    const response = await fetch(apiUrl, {
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

    // Rextester API response format
    let stdout = result.Result || '';
    let stderr = '';
    let exitCode = 0;

    // Check for errors or warnings
    if (result.Errors) {
      stderr = result.Errors;
      exitCode = 1;
    }

    // Check for compilation warnings
    if (result.Warnings) {
      stdout += '\nWarnings:\n' + result.Warnings;
    }

    self.postMessage({
      id,
      result: {
        stdout,
        stderr,
        exitCode,
        executionTimeMs,
      },
    });
  } catch (error) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    
    // If API fails, provide helpful message about true WASM implementation
    let stderr = `C# execution failed: ${error instanceof Error ? error.message : 'Unknown error'}

Note: This uses Rextester API which may have rate limits or CORS issues.

For true browser-only WASM execution, we would need:
- Blazor WebAssembly runtime (~2-3MB)
- Roslyn compiler (Microsoft.CodeAnalysis.CSharp)
- Full .NET runtime initialization in browser

This is a substantial integration requiring:
1. Blazor WASM project setup
2. Roslyn NuGet packages compiled to WASM
3. .NET runtime bootstrap code
4. IL compilation and execution infrastructure

Current approach: Calling Rextester API from browser
(execution happens externally but call is client-side)

For production: Consider integrating Blazor WASM + Roslyn
or using Microsoft's Try.NET infrastructure`;

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
