import { Users } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';

export default function UserPresence() {
  const { participants, currentUserId } = useSessionStore();

  return (
    <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700">
        <Users className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">
          Participants ({participants.length})
        </span>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {participants.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No other participants
          </p>
        ) : (
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/50"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: participant.color }}
                >
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {participant.name}
                    {participant.id === currentUserId && (
                      <span className="text-gray-400 ml-1">(you)</span>
                    )}
                  </p>
                  {participant.cursor_position && (
                    <p className="text-xs text-gray-400">
                      Line {participant.cursor_position.line}
                    </p>
                  )}
                </div>
                <div
                  className="w-2 h-2 rounded-full bg-green-500"
                  title="Online"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
