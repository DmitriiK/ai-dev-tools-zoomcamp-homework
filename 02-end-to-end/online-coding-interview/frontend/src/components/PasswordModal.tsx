import { useState } from 'react';
import { Lock } from 'lucide-react';

interface PasswordModalProps {
  error: string | null;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export default function PasswordModal({ error, onSubmit, onCancel }: PasswordModalProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <Lock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Protected Session</h2>
          <p className="text-gray-400 mt-2">
            This session requires a password to join
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Join Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
