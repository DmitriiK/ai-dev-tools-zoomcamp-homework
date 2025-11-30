import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Toolbar from './Toolbar';

describe('Toolbar', () => {
  const defaultProps = {
    title: 'Test Session',
    language: 'javascript' as const,
    isConnected: true,
    isExecuting: false,
    onLanguageChange: vi.fn(),
    onRun: vi.fn(),
    onShare: vi.fn(),
  };

  it('should render the session title', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText('Test Session')).toBeInTheDocument();
  });

  it('should show connected status when connected', () => {
    render(<Toolbar {...defaultProps} isConnected={true} />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('should show disconnected status when not connected', () => {
    render(<Toolbar {...defaultProps} isConnected={false} />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('should have all language options in dropdown', () => {
    render(<Toolbar {...defaultProps} />);
    const select = screen.getByRole('combobox');
    
    expect(select).toContainHTML('JavaScript');
    expect(select).toContainHTML('Python');
    expect(select).toContainHTML('C#');
    expect(select).toContainHTML('Go');
    expect(select).toContainHTML('Java');
  });

  it('should call onLanguageChange when language is changed', () => {
    const onLanguageChange = vi.fn();
    render(<Toolbar {...defaultProps} onLanguageChange={onLanguageChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'python' } });
    
    expect(onLanguageChange).toHaveBeenCalledWith('python');
  });

  it('should call onRun when Run button is clicked', () => {
    const onRun = vi.fn();
    render(<Toolbar {...defaultProps} onRun={onRun} />);
    
    const runButton = screen.getByRole('button', { name: /Run/i });
    fireEvent.click(runButton);
    
    expect(onRun).toHaveBeenCalled();
  });

  it('should disable Run button when executing', () => {
    render(<Toolbar {...defaultProps} isExecuting={true} />);
    
    const runButton = screen.getByRole('button', { name: /Running/i });
    expect(runButton).toBeDisabled();
  });

  it('should show "Running..." text when executing', () => {
    render(<Toolbar {...defaultProps} isExecuting={true} />);
    expect(screen.getByText('Running...')).toBeInTheDocument();
  });

  it('should call onShare when Share button is clicked', () => {
    const onShare = vi.fn();
    render(<Toolbar {...defaultProps} onShare={onShare} />);
    
    const shareButton = screen.getByRole('button', { name: /Share/i });
    fireEvent.click(shareButton);
    
    expect(onShare).toHaveBeenCalled();
  });
});
