import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Edit, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import TeamDisplay from './TeamDisplay';
import TeamEditor from './TeamEditor';
import { Team, ActionType } from '../types';

const QueueDisplay: React.FC = () => {
  const { state, dispatch } = useGame();
  const { isAdmin } = useAuth();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get teams that are in the queue (not currently playing and have players)
  const queuedTeams = state.teams.filter(team => 
    team.players.length > 0 && // Only teams with players
    !team.isPlaying // Not currently playing
  );
  
  console.log('All teams:', state.teams.map(t => `${t.name} (playing: ${t.isPlaying}, players: ${t.players.length})`));
  console.log('Queued teams:', queuedTeams.map(t => t.name));
  console.log('Current game:', {
    teamA: state.currentGame.teamA?.name,
    teamB: state.currentGame.teamB?.name
  });
  
  // Filter teams based on search query
  const filteredTeams = queuedTeams.filter(team =>
    team.players.some(player =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const moveTeamUp = (teamIndex: number) => {
    if (teamIndex > 0 && isAdmin) {
      console.log('Moving team up - Index:', teamIndex);
      
      const currentTeam = queuedTeams[teamIndex];
      const teamAbove = queuedTeams[teamIndex - 1];
      
      console.log('Current team:', currentTeam.name, 'Team above:', teamAbove.name);
      
      // Create a new teams array with swapped positions
      const newTeams = [...state.teams];
      const currentTeamIndex = newTeams.findIndex(t => t.id === currentTeam.id);
      const teamAboveIndex = newTeams.findIndex(t => t.id === teamAbove.id);
      
      if (currentTeamIndex !== -1 && teamAboveIndex !== -1) {
        // Swap the teams in the array - preserving all data
        [newTeams[currentTeamIndex], newTeams[teamAboveIndex]] = [newTeams[teamAboveIndex], newTeams[currentTeamIndex]];
        
        console.log('Swapping teams at indices:', currentTeamIndex, teamAboveIndex);
        
        // Use a specific action type for reordering to avoid data loss
        dispatch({
          type: ActionType.INITIALIZE_GAME,
          payload: { 
            state: {
              ...state,
              teams: newTeams
            }
          }
        });
      }
    }
  };

  const moveTeamDown = (teamIndex: number) => {
    if (teamIndex < queuedTeams.length - 1 && isAdmin) {
      console.log('Moving team down - Index:', teamIndex);
      
      const currentTeam = queuedTeams[teamIndex];
      const teamBelow = queuedTeams[teamIndex + 1];
      
      console.log('Current team:', currentTeam.name, 'Team below:', teamBelow.name);
      
      // Create a new teams array with swapped positions
      const newTeams = [...state.teams];
      const currentTeamIndex = newTeams.findIndex(t => t.id === currentTeam.id);
      const teamBelowIndex = newTeams.findIndex(t => t.id === teamBelow.id);
      
      if (currentTeamIndex !== -1 && teamBelowIndex !== -1) {
        // Swap the teams in the array - preserving all data
        [newTeams[currentTeamIndex], newTeams[teamBelowIndex]] = [newTeams[teamBelowIndex], newTeams[currentTeamIndex]];
        
        console.log('Swapping teams at indices:', currentTeamIndex, teamBelowIndex);
        
        // Use a specific action type for reordering to avoid data loss
        dispatch({
          type: ActionType.INITIALIZE_GAME,
          payload: { 
            state: {
              ...state,
              teams: newTeams
            }
          }
        });
      }
    }
  };

  if (queuedTeams.length === 0) {
    return (
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList size={18} className="text-neon-blue" />
          <h2 className="text-lg font-graffiti">Fila</h2>
        </div>
        <p className="text-gray-400 italic text-sm">
          Não há equipes na fila. Todos os times estão jogando ou não há times disponíveis.
        </p>
      </motion.div>
    );
  }
  
  return (
    <>
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-neon-blue" />
            <h2 className="text-lg font-graffiti">Fila ({queuedTeams.length} times)</h2>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Procurar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-8 text-sm"
            />
            <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        {filteredTeams.length > 0 ? (
          <div className="space-y-3">
            {filteredTeams.map((team, index) => {
              // Calculate the actual position in the queue based on the original order
              const actualPosition = queuedTeams.findIndex(t => t.id === team.id) + 1;
              const isNext = actualPosition === 1;
              
              return (
                <div key={team.id} className={`${isNext ? 'bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-2' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isNext ? 'text-neon-blue' : 'text-gray-400'}`}>
                        {isNext ? 'PRÓXIMO' : `${actualPosition}º na fila`}
                      </span>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => moveTeamUp(queuedTeams.findIndex(t => t.id === team.id))}
                            disabled={actualPosition === 1}
                            className="text-gray-400 hover:text-white disabled:opacity-30 p-1"
                            title="Mover para cima"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button 
                            onClick={() => moveTeamDown(queuedTeams.findIndex(t => t.id === team.id))}
                            disabled={actualPosition === queuedTeams.length}
                            className="text-gray-400 hover:text-white disabled:opacity-30 p-1"
                            title="Mover para baixo"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => setEditingTeam(team)}
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                      >
                        <Edit size={12} /> Editar
                      </button>
                    )}
                  </div>
                  <TeamDisplay team={team} isNext={isNext} />
                </div>
              );
            })}
          </div>
        ) : searchQuery ? (
          <p className="text-gray-400 italic text-sm">
            Nenhum resultado encontrado para "{searchQuery}"
          </p>
        ) : (
          <p className="text-gray-400 italic text-sm">
            Não há equipes na fila.
          </p>
        )}
      </motion.div>
      
      {editingTeam && isAdmin && (
        <TeamEditor 
          team={editingTeam} 
          onClose={() => setEditingTeam(null)} 
        />
      )}
    </>
  );
};

export default QueueDisplay;