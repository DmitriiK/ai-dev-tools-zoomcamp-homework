import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from '../store/sessionStore';

describe('sessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
  });

  it('should have correct initial state', () => {
    const state = useSessionStore.getState();
    
    expect(state.session).toBeNull();
    expect(state.code).toBe('');
    expect(state.language).toBe('javascript');
    expect(state.participants).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.isConnected).toBe(false);
    expect(state.isExecuting).toBe(false);
    expect(state.executionResult).toBeNull();
  });

  it('should set session and update code/language', () => {
    const session = {
      id: 'test-id',
      title: 'Test Session',
      language: 'python' as const,
      code: 'print("hello")',
      created_at: new Date().toISOString(),
      expires_at: null,
      is_protected: false,
      is_active: true,
      share_url: 'http://test.com/session/test-id',
    };

    useSessionStore.getState().setSession(session);
    
    const state = useSessionStore.getState();
    expect(state.session).toEqual(session);
    expect(state.code).toBe('print("hello")');
    expect(state.language).toBe('python');
  });

  it('should update code', () => {
    useSessionStore.getState().setCode('console.log("test")');
    expect(useSessionStore.getState().code).toBe('console.log("test")');
  });

  it('should update language', () => {
    useSessionStore.getState().setLanguage('go');
    expect(useSessionStore.getState().language).toBe('go');
  });

  it('should add participant', () => {
    const participant = {
      id: 'user-1',
      name: 'Test User',
      color: '#FF0000',
      cursor_position: null,
      joined_at: new Date().toISOString(),
    };

    useSessionStore.getState().addParticipant(participant);
    
    const participants = useSessionStore.getState().participants;
    expect(participants).toHaveLength(1);
    expect(participants[0]).toEqual(participant);
  });

  it('should not duplicate participant on re-add', () => {
    const participant = {
      id: 'user-1',
      name: 'Test User',
      color: '#FF0000',
      cursor_position: null,
      joined_at: new Date().toISOString(),
    };

    useSessionStore.getState().addParticipant(participant);
    useSessionStore.getState().addParticipant(participant);
    
    expect(useSessionStore.getState().participants).toHaveLength(1);
  });

  it('should remove participant', () => {
    const participant = {
      id: 'user-1',
      name: 'Test User',
      color: '#FF0000',
      cursor_position: null,
      joined_at: new Date().toISOString(),
    };

    useSessionStore.getState().addParticipant(participant);
    useSessionStore.getState().removeParticipant('user-1');
    
    expect(useSessionStore.getState().participants).toHaveLength(0);
  });

  it('should update participant cursor', () => {
    const participant = {
      id: 'user-1',
      name: 'Test User',
      color: '#FF0000',
      cursor_position: null,
      joined_at: new Date().toISOString(),
    };

    useSessionStore.getState().addParticipant(participant);
    useSessionStore.getState().updateParticipantCursor('user-1', { line: 10, column: 5 });
    
    const updated = useSessionStore.getState().participants[0];
    expect(updated.cursor_position).toEqual({ line: 10, column: 5 });
  });

  it('should set execution result', () => {
    const result = {
      stdout: 'Hello, World!',
      stderr: '',
      exitCode: 0,
      executionTimeMs: 42,
    };

    useSessionStore.getState().setExecutionResult(result);
    expect(useSessionStore.getState().executionResult).toEqual(result);
  });

  it('should reset state', () => {
    useSessionStore.getState().setCode('test code');
    useSessionStore.getState().setLanguage('python');
    useSessionStore.getState().setConnected(true);
    
    useSessionStore.getState().reset();
    
    const state = useSessionStore.getState();
    expect(state.code).toBe('');
    expect(state.language).toBe('javascript');
    expect(state.isConnected).toBe(false);
  });
});
