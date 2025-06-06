import React from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, UserMinus, Users, Lock } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { ActionType, Player } from '../types';
import { generateTeamName } from '../utils/gameUtils';

const UnassignedPlayers: React.FC = () => {
  const { state, dispatch } = useGame();
  const { user } = useAuth();
  const { unassignedPlayers } = state;
  
  const handleRemovePlayer = (playerId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para remover jogadores');
      return;
    }

    dispatch({
      type: ActionType.REMOVE_PLAYER,
      payload: { playerId }
    });
    toast.success('Jogador removido');
  };
  
  const handleCreateRandomTeam = () => {
    if (!user) {
      toast.error('Você precisa estar logado para criar times');
      return;
    }

    if (unassignedPlayers.length < 3) {
      toast.error('Precisa de pelo menos 3 jogadores não atribuídos para formar um time');
      return;
    }
    
    // Take the first 3 unassigned players
    const playerIds = unassignedPlayers.slice(0, 3).map(p => p.id);
    const teamName = generateTeamName(unassignedPlayers.slice(0, 3));
    
    dispatch({
      type: ActionType.CREATE_TEAM,
      payload: { playerIds, teamName }
    });
    
    toast.success(`Time "${teamName}" criado!`);
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
          user ? (
            <button 
              onClick={handleCreateRandomTeam}
              className="btn btn-accent btn-sm flex items-center gap-1"
            >
              <Users size={14} /> Formar Time
            </button>
          ) : (
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Lock size={14} />
              <span className="hidden sm:inline">Login necessário</span>
            </div>
          )
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
            {user ? (
              <button
                onClick={() => handleRemovePlayer(player.id)}
                className="text-gray-500 hover:text-white"
              >
                <UserMinus size={16} />
              </button>
            ) : (
              <Lock size={16} className="text-gray-500" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default UnassignedPlayers;