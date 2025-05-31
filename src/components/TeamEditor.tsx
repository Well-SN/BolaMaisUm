import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { X, Save, UserMinus, UserPlus } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { Team, Player, ActionType } from '../types';

interface TeamEditorProps {
  team: Team;
  onClose: () => void;
}

const TeamEditor: React.FC<TeamEditorProps> = ({ team, onClose }) => {
  const { state, dispatch } = useGame();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  
  // Initialize with current team players
  useEffect(() => {
    setSelectedPlayers(team.players.map(p => p.id));
  }, [team]);
  
  const handleSaveTeam = () => {
    if (selectedPlayers.length === 0) {
      toast.error('A team must have at least one player');
      return;
    }
    
    if (selectedPlayers.length > 3) {
      toast.error('A team can have a maximum of 3 players');
      return;
    }
    
    dispatch({
      type: ActionType.EDIT_TEAM,
      payload: {
        teamId: team.id,
        playerIds: selectedPlayers
      }
    });
    
    toast.success('Team updated!');
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
        toast.error('A team can have a maximum of 3 players');
      }
    }
  };
  
  const isPlayerSelected = (playerId: string) => selectedPlayers.includes(playerId);
  const isPlayerInTeam = (playerId: string) => team.players.some(p => p.id === playerId);
  
  // Get players not in the team
  const availablePlayers = state.unassignedPlayers.filter(
    player => !team.players.some(p => p.id === player.id)
  );
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="w-full max-w-md bg-court-light border-2 border-gray-700 rounded-lg p-5"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-graffiti neon-text">Edit Team: {team.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg mb-2 font-bold">Current Players</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {team.players.map((player: Player) => (
              <div 
                key={player.id}
                onClick={() => togglePlayer(player.id)}
                className={`player-item cursor-pointer ${
                  isPlayerSelected(player.id) ? 'border border-neon-orange' : ''
                }`}
              >
                <UserMinus size={16} className="text-neon-orange" />
                <span>{player.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg mb-2 font-bold">Available Players</h3>
          {availablePlayers.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availablePlayers.map((player: Player) => (
                <div 
                  key={player.id}
                  onClick={() => togglePlayer(player.id)}
                  className={`player-item cursor-pointer ${
                    isPlayerSelected(player.id) ? 'border border-neon-blue' : ''
                  }`}
                >
                  <UserPlus size={16} className="text-neon-blue" />
                  <span>{player.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No available players</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">
            {selectedPlayers.length}/3 players selected
          </span>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveTeam}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TeamEditor;