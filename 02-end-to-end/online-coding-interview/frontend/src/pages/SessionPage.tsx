import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';
import { getSession } from '../services/api';
import { socketService } from '../services/socket';
import { executeCode } from '../services/executor';
import CodeEditor from '../components/Editor/CodeEditor';
import OutputPanel from '../components/Output/OutputPanel';
import Toolbar from '../components/Toolbar/Toolbar';
import UserPresence from '../components/UserPresence/UserPresence';
import PasswordModal from '../components/PasswordModal';
import { Language } from '../types';

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const {
    session,
    code,
    language,
    isLoading,
    error,
    isConnected,
    isExecuting,
    executionResult,
    setSession,
    setCode,
    setLanguage,
    setParticipants,
    addParticipant,
    removeParticipant,
    updateParticipantCursor,
    setCurrentUser,
    setLoading,
    setError,
    setConnected,
    setExecuting,
    setExecutionResult,
    reset,
  } = useSessionStore();

  const setupSocketListeners = useCallback(() => {
    console.log('Setting up socket listeners');
    
    socketService.onConnect(() => {
      console.log('Socket connect event - setting connected to true');
      setConnected(true);
    });
    
    socketService.onDisconnect(() => {
      console.log('Socket disconnect event - setting connected to false');
      setConnected(false);
    });
    
    socketService.onSessionState((data) => {
      console.log('Received session_state:', data);
      setCode(data.code);
      setLanguage(data.language as Language);
      setParticipants(data.participants);
      setCurrentUser(data.your_id, data.your_color);
    });
    
    socketService.onCodeChange((data) => {
      console.log('Received code_change from user:', data.user_id);
      setCode(data.code);
    });
    
    socketService.onLanguageChange((data) => {
      console.log('Received language_change:', data.language);
      setLanguage(data.language);
    });
    
    socketService.onUserJoined((participant) => {
      console.log('User joined:', participant);
      addParticipant(participant);
    });
    
    socketService.onUserLeft((data) => {
      console.log('User left:', data.user_id);
      removeParticipant(data.user_id);
    });
    
    socketService.onCursorMove((data) => {
      updateParticipantCursor(data.user_id, data.position);
    });
  }, [setConnected, setCode, setLanguage, setParticipants, setCurrentUser, addParticipant, removeParticipant, updateParticipantCursor]);

  const loadSession = useCallback(async (password?: string) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const sessionData = await getSession(sessionId, password);
      setSession(sessionData);
      setShowPasswordModal(false);
      setPasswordError(null);
      
      // Connect to WebSocket and setup listeners
      socketService.connect();
      setupSocketListeners();
      
      // Join session when connected
      if (socketService.isConnected()) {
        socketService.joinSession(sessionId);
      } else {
        const joinOnConnect = () => {
          console.log('Connected, now joining session');
          socketService.joinSession(sessionId);
          socketService.offConnect(joinOnConnect);
        };
        socketService.onConnect(joinOnConnect);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load session';
      
      if (message.includes('Password required') || message.includes('Incorrect password')) {
        setShowPasswordModal(true);
        setPasswordError(message.includes('Incorrect') ? 'Incorrect password' : null);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId, setSession, setLoading, setError, setupSocketListeners]);

  // Load session on mount
  useEffect(() => {
    loadSession();
    
    return () => {
      socketService.disconnect();
      reset();
    };
  }, [loadSession, reset]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    socketService.sendCodeChange(newCode);
  }, [setCode]);

  const handleLanguageChange = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
    socketService.sendLanguageChange(newLanguage);
  }, [setLanguage]);

  const handleRunCode = useCallback(async () => {
    console.log('Running code:', { language, codeLength: code.length });
    setExecuting(true);
    setExecutionResult(null);
    
    try {
      const result = await executeCode(code, language);
      console.log('Execution result:', result);
      setExecutionResult(result);
    } catch (err) {
      console.error('Execution error:', err);
      setExecutionResult({
        stdout: '',
        stderr: err instanceof Error ? err.message : 'Execution failed',
        exitCode: 1,
        executionTimeMs: 0,
      });
    } finally {
      setExecuting(false);
    }
  }, [code, language, setExecuting, setExecutionResult]);

  const handleShare = useCallback(() => {
    if (session) {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }, [session]);

  const handlePasswordSubmit = useCallback((password: string) => {
    loadSession(password);
  }, [loadSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error && !showPasswordModal) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Session Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (showPasswordModal) {
    return (
      <PasswordModal
        error={passwordError}
        onSubmit={handlePasswordSubmit}
        onCancel={() => navigate('/')}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Toolbar
        title={session?.title || 'Untitled Session'}
        language={language}
        isConnected={isConnected}
        isExecuting={isExecuting}
        onLanguageChange={handleLanguageChange}
        onRun={handleRunCode}
        onShare={handleShare}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <CodeEditor
            code={code}
            language={language}
            onChange={handleCodeChange}
          />
          <OutputPanel result={executionResult} isExecuting={isExecuting} />
        </div>
        
        <UserPresence />
      </div>
    </div>
  );
}
