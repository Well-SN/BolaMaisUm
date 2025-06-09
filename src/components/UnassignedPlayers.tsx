
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, UserMinus, Users, Lock } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import { ActionType, Player } from '../types';
import { generateTeamName } from '../utils/gameUtils';

const UnassignedPlayers: React.FC = () => {
  const { state, dispatch } = useGame();
  const { isAdmin } = useAuth();
  const { unassignedPlayers } = state;
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  
  const handleRemovePlayerRequest = (playerId: string) => {
    if (!isAdmin) {
      toast.error('Você precisa estar logado como administrador');
      return;
    }

    setSelectedPlayerId(playerId);
    setShowRemoveConfirm(true);
  };

  const handleRemovePlayerConfirm = () => {
    if (!selectedPlayerId) return;

    dispatch({
      type: ActionType.REMOVE_PLAYER,
      payload: { playerId: selectedPlayerId }
    });
    toast.success('Jogador removido');
    setSelectedPlayerId(null);
  };
  
  const handleCreateRandomTeam = () => {
    if (!isAdmin) {
      toast.error('Você precisa estar logado como administrador');
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

  const getSelectedPlayerName = () => {
    if (!selectedPlayerId) return '';
    const player = unassignedPlayers.find(p => p.id === selectedPlayerId);
    return player?.name || '';
  };
  
  if (unassignedPlayers.length === 0) {
    return null;
  }
  
  return (
    <>
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
            isAdmin ? (
              <button 
                onClick={handleCreateRandomTeam}
                className="btn btn-accent btn-sm flex items-center gap-1"
              >
                <Users size={14} /> Formar Time
              </button>
            ) : (
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <Lock size={14} />
                <span className="hidden sm:inline">Admin necessário</span>
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
              {isAdmin ? (
                <button
                  onClick={() => handleRemovePlayerRequest(player.id)}
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

      <ConfirmationModal
        isOpen={showRemoveConfirm}
        onClose={() => {
          setShowRemoveConfirm(false);
          setSelectedPlayerId(null);
        }}
        onConfirm={handleRemovePlayerConfirm}
        title="Remover Jogador"
        message={`Você tem certeza que deseja remover o jogador "${getSelectedPlayerName()}" do jogo?`}
        confirmText="Sim, Remover"
        icon={<UserMinus size={24} className="text-red-400" />}
      />
    </>
  );
};

export default UnassignedPlayers;
