
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { X, Save, UserMinus, UserPlus } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import ConfirmationModal from './ConfirmationModal';
import { Team, Player, ActionType } from '../types';

interface TeamEditorProps {
  team: Team;
  onClose: () => void;
}

const TeamEditor: React.FC<TeamEditorProps> = ({ team, onClose }) => {
  const { state, dispatch } = useGame();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(team.players.map(p => p.id));
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  const handleSaveTeamRequest = () => {
    if (selectedPlayers.length === 0) {
      toast.error('Um time deve ter pelo menos um jogador');
      return;
    }
    
    if (selectedPlayers.length > 3) {
      toast.error('Um time pode ter no máximo 3 jogadores');
      return;
    }
    
    setShowSaveConfirm(true);
  };

  const handleSaveTeamConfirm = () => {
    dispatch({
      type: ActionType.EDIT_TEAM,
      payload: {
        teamId: team.id,
        playerIds: selectedPlayers
      }
    });
    
    toast.success('Time atualizado!');
    onClose();
  };
  
  const togglePlayer = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      // Remove player
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      // Add player (if less than 3)
      if (selectedPlayers.length < 3) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      } else {
        toast.error('Um time pode ter no máximo 3 jogadores');
      }
    }
  };
  
  const isPlayerSelected = (playerId: string) => selectedPlayers.includes(playerId);
  
  // Get players not in the team
  const availablePlayers = state.unassignedPlayers.filter(
    player => !team.players.some(p => p.id === player.id)
  );
  
  // Categorize players by their state
  const getPlayerState = (player: Player) => {
    const wasInTeam = team.players.some(p => p.id === player.id);
    const isSelected = isPlayerSelected(player.id);
    
    if (wasInTeam && !isSelected) return 'removing'; // Red - being removed
    if (!wasInTeam && isSelected) return 'adding';   // Green - being added
    if (wasInTeam && isSelected) return 'unchanged'; // Default - staying
    return 'available'; // Default - not selected, not in team
  };
  
  const getPlayerStyles = (playerState: string) => {
    switch (playerState) {
      case 'removing':
        return 'bg-red-500/20 border border-red-500 text-red-300';
      case 'adding':
        return 'bg-green-500/20 border border-green-500 text-green-300';
      case 'unchanged':
        return 'bg-blue-500/20 border border-blue-500 text-blue-300';
      default:
        return 'border border-gray-600';
    }
  };
  
  return (
    <>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="w-full max-w-md bg-court-light border-2 border-gray-700 rounded-lg p-4 sm:p-5 my-4"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-graffiti neon-text truncate pr-2">Editar Time: {team.name}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mb-4">
            <h3 className="text-base sm:text-lg mb-2 font-bold">Jogadores Atuais</h3>
            <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
              {team.players.map((player: Player) => {
                const playerState = getPlayerState(player);
                return (
                  <div 
                    key={player.id}
                    onClick={() => togglePlayer(player.id)}
                    className={`player-item cursor-pointer flex items-center p-2 rounded ${getPlayerStyles(playerState)}`}
                  >
                    <UserMinus size={16} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{player.name}</span>
                    {playerState === 'removing' && (
                      <span className="ml-auto text-red-400 text-xs">Removendo</span>
                    )}
                    {playerState === 'unchanged' && (
                      <span className="ml-auto text-blue-400 text-xs">Mantendo</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-base sm:text-lg mb-2 font-bold">Jogadores Disponíveis</h3>
            {availablePlayers.length > 0 ? (
              <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                {availablePlayers.map((player: Player) => {
                  const playerState = getPlayerState(player);
                  return (
                    <div 
                      key={player.id}
                      onClick={() => togglePlayer(player.id)}
                      className={`player-item cursor-pointer flex items-center p-2 rounded ${getPlayerStyles(playerState)}`}
                    >
                      <UserPlus size={16} className="mr-2 flex-shrink-0" />
                      <span className="truncate">{player.name}</span>
                      {playerState === 'adding' && (
                        <span className="ml-auto text-green-400 text-xs">Adicionando</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 italic">Nenhum jogador disponível</p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <span className="text-sm text-gray-300 mb-2 sm:mb-0">
              {selectedPlayers.length}/3 jogadores selecionados
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={onClose}
                className="btn btn-outline w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveTeamRequest}
                className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Save size={16} /> Salvar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <ConfirmationModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSaveTeamConfirm}
        title="Salvar Alterações"
        message={`Você tem certeza que deseja salvar as alterações no time "${team.name}"? O time terá ${selectedPlayers.length} jogador(es).`}
        confirmText="Sim, Salvar"
        icon={<Save size={24} className="text-green-400" />}
      />
    </>
  );
};

export default TeamEditor;
