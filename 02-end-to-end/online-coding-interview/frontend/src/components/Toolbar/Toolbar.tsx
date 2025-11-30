import { Play, Share2, Loader2, Wifi, WifiOff } from 'lucide-react';
import { Language } from '../../types';

interface ToolbarProps {
  title: string;
  language: Language;
  isConnected: boolean;
  isExecuting: boolean;
  onLanguageChange: (language: Language) => void;
  onRun: () => void;
  onShare: () => void;
}

const LANGUAGES: { id: Language; name: string }[] = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'csharp', name: 'C#' },
  { id: 'go', name: 'Go' },
  { id: 'java', name: 'Java' },
];

export default function Toolbar({
  title,
  language,
  isConnected,
  isExecuting,
  onLanguageChange,
  onRun,
  onShare,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={onRun}
          disabled={isExecuting}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run
            </>
          )}
        </button>
        
        <button
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}
