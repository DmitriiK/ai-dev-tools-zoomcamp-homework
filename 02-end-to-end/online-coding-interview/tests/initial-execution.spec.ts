import { test, expect } from '@playwright/test';

test.describe('Initial Code Execution Bug', () => {
  test('should execute JavaScript code immediately after session load', async ({ page, context }) => {
    // Enable console message capture
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Step 1: Create a new session with JavaScript
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    
    console.log('Creating new JavaScript session...');
    await page.fill('#title', 'Test Session JS');
    await page.selectOption('#language', 'javascript');
    await page.click('button[type="submit"]');
    
    // Wait for session page to load
    await page.waitForURL(/\/session\/.+/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Give workers time to initialize
    
    const sessionUrl = page.url();
    console.log(`Session URL: ${sessionUrl}`);
    
    // Capture console logs to understand worker initialization
    console.log('\n=== Console logs after page load ===');
    consoleMessages.forEach(msg => console.log(msg));
    consoleMessages.length = 0; // Clear for next phase
    
    // Step 2: Immediately click "Run" button
    console.log('\nClicking Run button immediately...');
    await page.click('button:has-text("Run")');
    
    // Wait a bit for execution
    await page.waitForTimeout(2000);
    
    // Step 3: Check output panel
    console.log('\n=== Console logs during execution ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    // Wait for the "Hello, World!" output to appear
    await page.waitForSelector('text=Hello, World!', { timeout: 5000 });
    
    // Check if we have the success indicator
    const hasSuccess = await page.locator('text=Success').count() > 0;
    const outputText = await page.textContent('body');
    console.log(`\nOutput contains "Hello, World!": ${outputText?.includes('Hello, World!')}`);
    console.log(`Has success indicator: ${hasSuccess}`);
    
    // Check if output is empty or contains "No output"
    const hasEmptyOutput = !outputText || 
                          !outputText.includes('Hello, World!') ||
                          outputText.includes('No output') ||
                          outputText.includes('No Output');
    
    if (hasEmptyOutput) {
      console.log('❌ BUG CONFIRMED: Empty output on first execution!');
      console.log('Looking for executor logs...');
      
      // Print executor-specific logs
      const executorLogs = consoleMessages.filter(msg => msg.includes('[EXECUTOR]'));
      console.log('\n=== Executor logs ===');
      executorLogs.forEach(log => console.log(log));
      
      // Try running again to see if second execution works
      console.log('\nTrying second execution...');
      consoleMessages.length = 0;
      await page.click('button:has-text("Run")');
      await page.waitForTimeout(2000);
      
      const secondOutput = await outputPanel.textContent();
      console.log(`Second execution output: "${secondOutput}"`);
      
      console.log('\n=== Console logs during second execution ===');
      consoleMessages.forEach(msg => console.log(msg));
    } else {
      console.log('✓ Output received on first execution');
      console.log(`Output: ${outputText}`);
    }
    
    // Fail the test if first execution had empty output
    expect(hasEmptyOutput, 'First execution should produce output').toBe(false);
  });

  test('should execute Python code immediately after session load', async ({ page }) => {
    // Enable console message capture
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Step 1: Create a new session with Python
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    
    console.log('Creating new Python session...');
    await page.fill('#title', 'Test Session Python');
    await page.selectOption('#language', 'python');
    await page.click('button[type="submit"]');
    
    // Wait for session page to load
    await page.waitForURL(/\/session\/.+/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Python worker needs more time for Pyodide
    
    const sessionUrl = page.url();
    console.log(`Session URL: ${sessionUrl}`);
    
    // Capture console logs
    console.log('\n=== Console logs after page load ===');
    consoleMessages.forEach(msg => console.log(msg));
    consoleMessages.length = 0;
    
    // Step 2: Immediately click "Run" button
    console.log('\nClicking Run button immediately...');
    await page.click('button:has-text("Run")');
    
    // Wait for execution (Python/Pyodide takes longer)
    await page.waitForTimeout(3000);
    
    // Step 3: Check output panel
    console.log('\n=== Console logs during execution ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    // Wait for the "Hello, World!" output to appear
    await page.waitForSelector('text=Hello, World!', { timeout: 6000 });
    
    // Check if we have the success indicator
    const hasSuccess = await page.locator('text=Success').count() > 0;
    const outputText = await page.textContent('body');
    console.log(`\nOutput contains "Hello, World!": ${outputText?.includes('Hello, World!')}`);
    console.log(`Has success indicator: ${hasSuccess}`);
    
    // Check if output is empty
    const hasEmptyOutput = !outputText || 
                          !outputText.includes('Hello, World!') ||
                          outputText.includes('No output') ||
                          outputText.includes('No Output');
    
    if (hasEmptyOutput) {
      console.log('❌ BUG CONFIRMED: Empty output on first Python execution!');
      
      // Print executor-specific logs
      const executorLogs = consoleMessages.filter(msg => msg.includes('[EXECUTOR]'));
      console.log('\n=== Executor logs ===');
      executorLogs.forEach(log => console.log(log));
      
      // Try running again
      console.log('\nTrying second execution...');
      consoleMessages.length = 0;
      await page.click('button:has-text("Run")');
      await page.waitForTimeout(3000);
      
      const secondOutput = await outputPanel.textContent();
      console.log(`Second execution output: "${secondOutput}"`);
      
      console.log('\n=== Console logs during second execution ===');
      consoleMessages.forEach(msg => console.log(msg));
    } else {
      console.log('✓ Output received on first execution');
    }
    
    expect(hasEmptyOutput, 'First execution should produce output').toBe(false);
  });
});
