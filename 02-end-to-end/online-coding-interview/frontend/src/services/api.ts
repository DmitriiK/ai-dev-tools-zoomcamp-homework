import { Session, SessionCreate, LanguageInfo } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export async function createSession(data: SessionCreate): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create session');
  }
  
  return response.json();
}

export async function getSession(sessionId: string, password?: string): Promise<Session> {
  const url = new URL(`${API_BASE_URL}/sessions/${sessionId}`, window.location.origin);
  if (password) {
    url.searchParams.set('password', password);
  }
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get session');
  }
  
  return response.json();
}

export async function updateSession(
  sessionId: string, 
  data: Partial<{ title: string; language: string; code: string }>
): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update session');
  }
  
  return response.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete session');
  }
}

export async function getLanguages(): Promise<LanguageInfo[]> {
  const response = await fetch(`${API_BASE_URL}/languages`);
  
  if (!response.ok) {
    throw new Error('Failed to get languages');
  }
  
  const data = await response.json();
  return data.languages;
}
