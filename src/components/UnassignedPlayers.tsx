import React from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, UserMinus, Users } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { ActionType, Player } from '../types';
import { generateTeamName } from '../utils/gameUtils';

const UnassignedPlayers: React.FC = () => {
  const { state, dispatch } = useGame();
  const { unassignedPlayers } = state;
  
  const handleRemovePlayer = (playerId: string) => {
    dispatch({
      type: ActionType.REMOVE_PLAYER,
      payload: { playerId }
    });
    toast.success('Player removed');
  };
  
  const handleCreateRandomTeam = () => {
    if (unassignedPlayers.length < 3) {
      toast.error('Need at least 3 unassigned players to form a team');
      return;
    }
    
    // Take the first 3 unassigned players
    const playerIds = unassignedPlayers.slice(0, 3).map(p => p.id);
    const teamName = generateTeamName(unassignedPlayers.slice(0, 3));
    
    dispatch({
      type: ActionType.CREATE_TEAM,
      payload: { playerIds, teamName }
    });
    
    toast.success(`Team "${teamName}" created!`);
  };
  
  if (unassignedPlayers.length === 0) {
    return null;
  }
  
  return (
    <motion.div 
      className="card mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <UserMinus size={20} className="text-neon-pink" />
          <h2 className="text-xl font-graffiti">Jogadores sem Time</h2>
        </div>
        
        {unassignedPlayers.length >= 3 && (
          <button 
            onClick={handleCreateRandomTeam}
            className="btn btn-accent btn-sm flex items-center gap-1"
          >
            <Users size={14} /> Formar Time
          </button>
        )}
      </div>
      
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {unassignedPlayers.map((player: Player) => (
          <div 
            key={player.id}
            className="player-item flex justify-between"
          >
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span>{player.name}</span>
            </div>
            <button
              onClick={() => handleRemovePlayer(player.id)}
              className="text-gray-500 hover:text-white"
            >
              <UserMinus size={16} />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default UnassignedPlayers;