import { io, Socket } from 'socket.io-client';
import { Language, Participant, CursorPosition, Selection } from '../types';

type EventCallback<T = unknown> = (data: T) => void;

interface SessionState {
  code: string;
  language: string;
  participants: Participant[];
  your_id: string;
  your_color: string;
}

class SocketService {
  private socket: Socket | null = null;
  private sessionId: string | null = null;
  
  connect(): void {
    console.log('SocketService.connect() called, current socket:', this.socket?.connected ? 'connected' : 'disconnected');
    if (this.socket?.connected) {
      console.log('Socket already connected, skipping');
      return;
    }
    
    console.log('Creating new socket connection...');
    this.socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  
  disconnect(): void {
    if (this.sessionId) {
      this.socket?.emit('leave', { session_id: this.sessionId });
    }
    this.socket?.disconnect();
    this.socket = null;
    this.sessionId = null;
  }
  
  joinSession(sessionId: string, userName?: string): void {
    console.log('joinSession() called for session:', sessionId, 'socket connected:', this.socket?.connected);
    this.sessionId = sessionId;
    this.socket?.emit('join', {
      session_id: sessionId,
      name: userName || `User-${Math.random().toString(36).substring(7)}`,
    });
  }
  
  leaveSession(): void {
    if (this.sessionId) {
      this.socket?.emit('leave', { session_id: this.sessionId });
      this.sessionId = null;
    }
  }
  
  sendCodeChange(code: string): void {
    if (this.sessionId) {
      this.socket?.emit('code_change', {
        session_id: this.sessionId,
        code,
      });
    }
  }
  
  sendCursorMove(position: CursorPosition): void {
    if (this.sessionId) {
      this.socket?.emit('cursor_move', {
        session_id: this.sessionId,
        position,
      });
    }
  }
  
  sendSelectionChange(selection: Selection | null): void {
    if (this.sessionId) {
      this.socket?.emit('selection_change', {
        session_id: this.sessionId,
        selection,
      });
    }
  }
  
  sendLanguageChange(language: Language): void {
    if (this.sessionId) {
      this.socket?.emit('language_change', {
        session_id: this.sessionId,
        language,
      });
    }
  }
  
  // Event listeners
  onSessionState(callback: EventCallback<SessionState>): void {
    this.socket?.on('session_state', callback);
  }
  
  onCodeChange(callback: EventCallback<{ code: string; user_id: string }>): void {
    this.socket?.on('code_change', callback);
  }
  
  onCursorMove(callback: EventCallback<{ user_id: string; position: CursorPosition }>): void {
    this.socket?.on('cursor_move', callback);
  }
  
  onSelectionChange(callback: EventCallback<{ user_id: string; selection: Selection | null }>): void {
    this.socket?.on('selection_change', callback);
  }
  
  onLanguageChange(callback: EventCallback<{ language: Language; user_id: string }>): void {
    this.socket?.on('language_change', callback);
  }
  
  onUserJoined(callback: EventCallback<Participant>): void {
    this.socket?.on('user_joined', callback);
  }
  
  onUserLeft(callback: EventCallback<{ user_id: string }>): void {
    this.socket?.on('user_left', callback);
  }
  
  onConnect(callback: () => void): void {
    console.log('onConnect() called, socket status:', this.socket?.connected ? 'connected' : 'not connected');
    this.socket?.on('connect', callback);
    // If already connected, call callback immediately
    if (this.socket?.connected) {
      console.log('Socket already connected, calling callback immediately');
      callback();
    }
  }
  
  offConnect(callback: () => void): void {
    this.socket?.off('connect', callback);
  }
  
  onDisconnect(callback: () => void): void {
    this.socket?.on('disconnect', callback);
  }
  
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
