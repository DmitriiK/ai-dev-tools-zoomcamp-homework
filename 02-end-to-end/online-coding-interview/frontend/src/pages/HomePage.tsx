import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Users, Play, Shield } from 'lucide-react';
import { createSession } from '../services/api';
import { Language } from '../types';

const LANGUAGES: { id: Language; name: string }[] = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'csharp', name: 'C#' },
  { id: 'go', name: 'Go' },
  { id: 'java', name: 'Java' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<Language>('javascript');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a session title');
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      const session = await createSession({
        title: title.trim(),
        language,
        password: password || undefined,
      });
      
      navigate(`/session/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code2 className="w-12 h-12 text-blue-500" />
            <h1 className="text-4xl font-bold text-white">
              Online Coding Interview
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Real-time collaborative coding platform for technical interviews
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <Users className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="text-white font-semibold mb-2">Real-time Collaboration</h3>
            <p className="text-gray-400 text-sm">
              Code together with candidates in real-time with live cursor tracking
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <Play className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="text-white font-semibold mb-2">Browser Execution</h3>
            <p className="text-gray-400 text-sm">
              Execute JavaScript, Python, C#, Go, and Java safely in the browser using WASM
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <Shield className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="text-white font-semibold mb-2">Secure by Design</h3>
            <p className="text-gray-400 text-sm">
              No server-side code execution - all code runs in sandboxed browser environment
            </p>
          </div>
        </div>

        {/* Create Session Form */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Create New Session
          </h2>
          
          <form onSubmit={handleCreateSession} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Session Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Frontend Developer Interview"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
                Default Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password (optional)
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty for no password"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Code2 className="w-5 h-5" />
                  Create Session
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
