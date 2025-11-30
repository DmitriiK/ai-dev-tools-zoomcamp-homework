import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';

// Mock the API
vi.mock('../services/api', () => ({
  createSession: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHomePage = () => {
    return render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
  };

  it('should render the home page title', () => {
    renderHomePage();
    expect(screen.getByText('Online Coding Interview')).toBeInTheDocument();
  });

  it('should render the create session form', () => {
    renderHomePage();
    expect(screen.getByText('Create New Session')).toBeInTheDocument();
    expect(screen.getByLabelText('Session Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Default Language')).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
  });

  it('should have all language options', () => {
    renderHomePage();
    const select = screen.getByLabelText('Default Language');
    
    expect(select).toContainHTML('JavaScript');
    expect(select).toContainHTML('Python');
    expect(select).toContainHTML('C#');
    expect(select).toContainHTML('Go');
    expect(select).toContainHTML('Java');
  });

  it('should show error when submitting without title', async () => {
    renderHomePage();
    
    const submitButton = screen.getByRole('button', { name: /Create Session/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText('Please enter a session title')).toBeInTheDocument();
  });

  it('should update title input', () => {
    renderHomePage();
    
    const titleInput = screen.getByLabelText('Session Title');
    fireEvent.change(titleInput, { target: { value: 'My Test Interview' } });
    
    expect(titleInput).toHaveValue('My Test Interview');
  });

  it('should update language selection', () => {
    renderHomePage();
    
    const languageSelect = screen.getByLabelText('Default Language');
    fireEvent.change(languageSelect, { target: { value: 'python' } });
    
    expect(languageSelect).toHaveValue('python');
  });

  it('should render feature cards', () => {
    renderHomePage();
    
    expect(screen.getByText('Real-time Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Browser Execution')).toBeInTheDocument();
    expect(screen.getByText('Secure by Design')).toBeInTheDocument();
  });
});
