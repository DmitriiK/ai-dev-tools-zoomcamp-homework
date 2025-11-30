import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OutputPanel from './OutputPanel';
import { ExecutionResult } from '../../types';

describe('OutputPanel', () => {
  it('should show idle state when no result and not executing', () => {
    render(<OutputPanel result={null} isExecuting={false} />);
    expect(screen.getByText(/Click "Run" to execute the code/i)).toBeInTheDocument();
  });

  it('should show loading state when executing', () => {
    render(<OutputPanel result={null} isExecuting={true} />);
    expect(screen.getByText(/Executing.../i)).toBeInTheDocument();
    expect(screen.getByText(/Running code.../i)).toBeInTheDocument();
  });

  it('should display stdout output', () => {
    const result: ExecutionResult = {
      stdout: 'Hello, World!',
      stderr: '',
      exitCode: 0,
      executionTimeMs: 42,
    };
    
    render(<OutputPanel result={result} isExecuting={false} />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('should display stderr output', () => {
    const result: ExecutionResult = {
      stdout: '',
      stderr: 'Error: Something went wrong',
      exitCode: 1,
      executionTimeMs: 10,
    };
    
    render(<OutputPanel result={result} isExecuting={false} />);
    expect(screen.getByText('Error: Something went wrong')).toBeInTheDocument();
  });

  it('should display execution time', () => {
    const result: ExecutionResult = {
      stdout: 'test',
      stderr: '',
      exitCode: 0,
      executionTimeMs: 123,
    };
    
    render(<OutputPanel result={result} isExecuting={false} />);
    expect(screen.getByText('123ms')).toBeInTheDocument();
  });

  it('should show success status for exit code 0', () => {
    const result: ExecutionResult = {
      stdout: 'output',
      stderr: '',
      exitCode: 0,
      executionTimeMs: 50,
    };
    
    render(<OutputPanel result={result} isExecuting={false} />);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('should show error status for non-zero exit code', () => {
    const result: ExecutionResult = {
      stdout: '',
      stderr: 'error',
      exitCode: 1,
      executionTimeMs: 20,
    };
    
    render(<OutputPanel result={result} isExecuting={false} />);
    expect(screen.getByText('Exit code: 1')).toBeInTheDocument();
  });

  it('should show "No output" when both stdout and stderr are empty', () => {
    const result: ExecutionResult = {
      stdout: '',
      stderr: '',
      exitCode: 0,
      executionTimeMs: 5,
    };
    
    render(<OutputPanel result={result} isExecuting={false} />);
    expect(screen.getByText('No output')).toBeInTheDocument();
  });
});
