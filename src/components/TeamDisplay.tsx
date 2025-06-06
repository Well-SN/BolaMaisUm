import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserMinus, Edit, Trash, Lock } from 'lucide-react';
import { Team, Player, ActionType } from '../types';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import toast from 'react-hot-toast';

interface TeamDisplayProps {
  team: Team;
  isPlaying?: boolean;
  isNext?: boolean;
  onEdit?: () => void;
  showActions?: boolean;
}

const TeamDisplay: React.FC<TeamDisplayProps> = ({ 
  team, 
  isPlaying = false,
  isNext = false,
  onEdit,
  showActions = true
}) => {
  const { dispatch } = useGame();
  const { isAdmin } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteTeamRequest = () => {
    if (!isAdmin) {
      toast.error('Você precisa estar logado como administrador');
      return;
    }

    if (isPlaying) {
      toast.error("Não é possível excluir um time que está jogando no momento");
      return;
    }
    
    setShowDeleteConfirm(true);
  };

  const handleDeleteTeamConfirm = () => {
    dispatch({
      type: ActionType.REMOVE_TEAM,
      payload: { teamId: team.id }
    });
    toast.success('Time e jogadores removidos');
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
    <>
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
          
          {showActions && (
            <div className="flex gap-2">
              {onEdit && isAdmin && (
                <button 
                  onClick={onEdit}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-court transition-colors"
                >
                  <Edit size={16} />
                </button>
              )}
              {!isPlaying && isAdmin && (
                <button 
                  onClick={handleDeleteTeamRequest}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-court transition-colors"
                  title="Deletar time e jogadores"
                >
                  <Trash size={16} />
                </button>
              )}
              {!isAdmin && (onEdit || !isPlaying) && (
                <div className="text-gray-500 p-1" title="Admin necessário">
                  <Lock size={16} />
                </div>
              )}
            </div>
          )}
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
              <span className="truncate">{player.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTeamConfirm}
        title="Excluir Time"
        message={`Você tem certeza que deseja excluir o time "${team.name}"? Todos os jogadores deste time serão movidos de volta para a lista de jogadores sem time.`}
        confirmText="Sim, Excluir"
        confirmButtonClass="btn-primary"
        icon={<Trash size={24} className="text-red-400" />}
      />
    </>
  );
};

export default TeamDisplay;