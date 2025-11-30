import { create } from 'zustand';
import { Session, Language, Participant, ExecutionResult } from '../types';

interface SessionState {
  // Session data
  session: Session | null;
  code: string;
  language: Language;
  
  // Participants
  participants: Participant[];
  currentUserId: string | null;
  currentUserColor: string | null;
  
  // Execution
  isExecuting: boolean;
  executionResult: ExecutionResult | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  
  // Actions
  setSession: (session: Session) => void;
  setCode: (code: string) => void;
  setLanguage: (language: Language) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (userId: string) => void;
  updateParticipantCursor: (userId: string, position: { line: number; column: number } | null) => void;
  setCurrentUser: (userId: string, color: string) => void;
  setExecuting: (isExecuting: boolean) => void;
  setExecutionResult: (result: ExecutionResult | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setConnected: (isConnected: boolean) => void;
  reset: () => void;
}

const initialState = {
  session: null,
  code: '',
  language: 'javascript' as Language,
  participants: [],
  currentUserId: null,
  currentUserColor: null,
  isExecuting: false,
  executionResult: null,
  isLoading: false,
  error: null,
  isConnected: false,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,
  
  setSession: (session) => set({ 
    session, 
    code: session.code, 
    language: session.language as Language 
  }),
  
  setCode: (code) => set({ code }),
  
  setLanguage: (language) => set({ language }),
  
  setParticipants: (participants) => set({ participants }),
  
  addParticipant: (participant) => set((state) => ({
    participants: [...state.participants.filter(p => p.id !== participant.id), participant],
  })),
  
  removeParticipant: (userId) => set((state) => ({
    participants: state.participants.filter(p => p.id !== userId),
  })),
  
  updateParticipantCursor: (userId, position) => set((state) => ({
    participants: state.participants.map(p => 
      p.id === userId ? { ...p, cursor_position: position } : p
    ),
  })),
  
  setCurrentUser: (userId, color) => set({ currentUserId: userId, currentUserColor: color }),
  
  setExecuting: (isExecuting) => set({ isExecuting }),
  
  setExecutionResult: (result) => set({ executionResult: result }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  setConnected: (isConnected) => set({ isConnected }),
  
  reset: () => set(initialState),
}));
