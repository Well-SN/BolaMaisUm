import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Edit } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import TeamDisplay from './TeamDisplay';
import TeamEditor from './TeamEditor';
import { Team } from '../types';

const QueueDisplay: React.FC = () => {
  const { state } = useGame();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  
  // Get teams that are in the queue (not currently playing)
  const queuedTeams = state.teams.filter(team => 
    !team.isPlaying && 
    team.id !== state.currentGame.teamA?.id && 
    team.id !== state.currentGame.teamB?.id
  );
  
  const hasNextTeam = queuedTeams.length > 0;
  
  // Skip the first team as it's shown in the "Next Up" section
  const restOfQueue = hasNextTeam ? queuedTeams.slice(1) : [];
  
  if (restOfQueue.length === 0 && !hasNextTeam) {
    return null;
  }
  
  return (
    <>
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={20} className="text-neon-green" />
          <h2 className="text-xl font-graffiti">Queue</h2>
        </div>
        
        {restOfQueue.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restOfQueue.map((team, index) => (
              <div key={team.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Position {index + 2}</span>
                  <button 
                    onClick={() => setEditingTeam(team)}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <Edit size={14} /> Edit
                  </button>
                </div>
                <TeamDisplay team={team} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">
            No more teams in the queue. Add more teams to keep the games going!
          </p>
        )}
      </motion.div>
      
      {editingTeam && (
        <TeamEditor 
          team={editingTeam} 
          onClose={() => setEditingTeam(null)} 
        />
      )}
    </>
  );
};

export default QueueDisplay;