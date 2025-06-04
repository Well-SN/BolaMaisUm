import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserMinus, Edit, Trash } from 'lucide-react';
import { Team, Player } from '../types';
import { useGame } from '../contexts/GameContext';
import toast from 'react-hot-toast';

interface TeamDisplayProps {
  team: Team;
  isPlaying?: boolean;
  isNext?: boolean;
  onEdit?: () => void;
}

const TeamDisplay: React.FC<TeamDisplayProps> = ({ 
  team, 
  isPlaying = false,
  isNext = false,
  onEdit 
}) => {
  const { dispatch } = useGame();

  const handleDeleteTeam = () => {
    if (isPlaying) {
      toast.error("Não é possível excluir um time que está jogando no momento");
      return;
    }
    
    dispatch({
      type: ActionType.REMOVE_TEAM,
      payload: { teamId: team.id }
    });
    toast.success('Time Deletado');
  };

  const cardVariants = {
    initial: { scale: 0.96, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      boxShadow: isPlaying 
        ? '0 0 0 2px #FF5D00, 0 0 15px rgba(255, 93, 0, 0.5)' 
        : isNext
        ? '0 0 0 2px #00C2FF, 0 0 15px rgba(0, 194, 255, 0.5)'
        : 'none'
    }
  };


  return (
    <motion.div
      className={`team-card ${
        isPlaying 
          ? 'border-neon-orange' 
          : isNext
          ? 'border-neon-blue'
          : 'border-gray-700'
      }`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.3 }}
    >
      {(isPlaying || isNext) && (
        <div 
          className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-bold ${
            isPlaying 
              ? 'bg-neon-orange text-black' 
              : 'bg-neon-blue text-black'
          }`}
        >
          {isPlaying ? 'NA QUADRA' : 'PRÓXIMO'}
        </div>
      )}
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-graffiti text-lg">
          <span className={isPlaying ? 'neon-text' : isNext ? 'neon-text-blue' : ''}>
            {team.name}
          </span>
        </h3>
        
        <div className="flex gap-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-court transition-colors"
            >
              <Edit size={16} />
            </button>
          )}
          {!isPlaying && (
            <button 
              onClick={handleDeleteTeam}
              className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-court transition-colors"
            >
              <Trash size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <Users size={16} className="text-gray-400" />
        <span className="text-sm text-gray-300">
          {team.players.length} Jogadores
        </span>
      </div>
      
      <div className="space-y-2">
        {team.players.map((player: Player) => (
          <div 
            key={player.id} 
            className="flex items-center gap-2 bg-court p-2 rounded"
          >
            <UserMinus size={14} className="text-gray-400" />
            <span>{player.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TeamDisplay;