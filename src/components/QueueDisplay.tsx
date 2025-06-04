import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Edit, Search } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import TeamDisplay from './TeamDisplay';
import TeamEditor from './TeamEditor';
import { Team } from '../types';

const QueueDisplay: React.FC = () => {
  const { state } = useGame();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get teams that are in the queue (not currently playing)
  const queuedTeams = state.teams.filter(team => 
    !team.isPlaying && 
    team.id !== state.currentGame.teamA?.id && 
    team.id !== state.currentGame.teamB?.id
  );
  
  const hasNextTeam = queuedTeams.length > 0;
  
  // Skip the first team as it's shown in the "Next Up" section
  const restOfQueue = hasNextTeam ? queuedTeams.slice(1) : [];
  
  // Filter teams based on search query
  const filteredTeams = restOfQueue.filter(team =>
    team.players.some(player =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
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
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList size={20} className="text-neon-blue" />
            <h2 className="text-xl font-graffiti">Fila</h2>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Procurar jogador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-10"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        {filteredTeams.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team, index) => (
              <div key={team.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Posição {index + 2}</span>
                  <button 
                    onClick={() => setEditingTeam(team)}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <Edit size={14} /> Editar
                  </button>
                </div>
                <TeamDisplay team={team} />
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <p className="text-gray-400 italic">
            Nenhum jogador encontrado com "{searchQuery}"
          </p>
        ) : (
          <p className="text-gray-400 italic">
            Não há mais equipes na fila. Adicione mais equipes para manter os jogos!
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