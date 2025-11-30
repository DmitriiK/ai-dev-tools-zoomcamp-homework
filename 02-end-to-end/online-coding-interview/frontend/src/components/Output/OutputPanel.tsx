import { Terminal, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ExecutionResult } from '../../types';

interface OutputPanelProps {
  result: ExecutionResult | null;
  isExecuting: boolean;
}

export default function OutputPanel({ result, isExecuting }: OutputPanelProps) {
  return (
    <div className="h-48 bg-gray-950 border-t border-gray-700 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2 text-gray-300">
          <Terminal className="w-4 h-4" />
          <span className="text-sm font-medium">Output</span>
        </div>
        
        {isExecuting && (
          <div className="flex items-center gap-2 text-yellow-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Executing...</span>
          </div>
        )}
        
        {result && !isExecuting && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{result.executionTimeMs}ms</span>
            </div>
            {result.exitCode === 0 ? (
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Success</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-400">
                <XCircle className="w-4 h-4" />
                <span>Exit code: {result.exitCode}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {isExecuting && (
          <div className="text-gray-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Running code...
          </div>
        )}
        
        {!isExecuting && result && (
          <div className="space-y-2">
            {result.stdout && (
              <pre className="text-green-400 whitespace-pre-wrap">{result.stdout}</pre>
            )}
            {result.stderr && (
              <pre className="text-red-400 whitespace-pre-wrap">{result.stderr}</pre>
            )}
            {!result.stdout && !result.stderr && (
              <p className="text-gray-500 italic">No output</p>
            )}
          </div>
        )}
        
        {!isExecuting && !result && (
          <p className="text-gray-500 italic">
            Click "Run" to execute the code
          </p>
        )}
      </div>
    </div>
  );
}
