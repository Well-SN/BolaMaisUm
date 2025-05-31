import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Plus, User, UsersRound, X } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { ActionType, Player } from '../types';

const PlayerRegistration: React.FC = () => {
  const { state, dispatch } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [teamMode, setTeamMode] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      toast.error('Please enter a player name');
      return;
    }

    dispatch({
      type: ActionType.ADD_PLAYER,
      payload: { name: playerName.trim() }
    });
    
    toast.success(`${playerName} added to the roster!`);
    setPlayerName('');
  };

  const handleCreateTeam = () => {
    if (selectedPlayers.length === 0) {
      toast.error('Please select at least one player');
      return;
    }

    if (selectedPlayers.length > 3) {
      toast.error('A team can have a maximum of 3 players');
      return;
    }

    dispatch({
      type: ActionType.CREATE_TEAM,
      payload: { 
        playerIds: selectedPlayers,
        teamName: teamName.trim() 
      }
    });
    
    toast.success('Team created!');
    setSelectedPlayers([]);
    setTeamName('');
    setTeamMode(false);
  };

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      if (selectedPlayers.length < 3) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      } else {
        toast.error('A team can have a maximum of 3 players');
      }
    }
  };

  const isPlayerSelected = (playerId: string) => selectedPlayers.includes(playerId);

  return (
    <motion.div 
      className="card fence-bg my-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-graffiti mb-4 text-neon-orange graffiti-text">
        {teamMode ? 'Create Your Squad' : 'Sign Up to Ball'}
      </h2>

      <div className="mb-4">
        <button 
          onClick={() => setTeamMode(!teamMode)}
          className={`btn ${teamMode ? 'btn-secondary' : 'btn-primary'} flex items-center gap-2`}
        >
          {teamMode ? <UsersRound size={18} /> : <User size={18} />}
          {teamMode ? 'Team Mode' : 'Individual Mode'}
        </button>
      </div>

      {!teamMode ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name"
              className="input-field flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            />
            <button 
              onClick={handleAddPlayer}
              className="btn btn-primary flex items-center gap-1"
            >
              <Plus size={18} /> Add
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name (optional)"
            className="input-field w-full"
          />

          <div className="bg-court-light rounded-md p-2">
            <h3 className="text-lg font-bold mb-2">Select Players (max 3)</h3>
            {state.unassignedPlayers.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {state.unassignedPlayers.map((player: Player) => (
                  <div
                    key={player.id}
                    onClick={() => togglePlayerSelection(player.id)}
                    className={`player-item cursor-pointer ${
                      isPlayerSelected(player.id) 
                        ? 'bg-neon-blue bg-opacity-20 border border-neon-blue' 
                        : ''
                    }`}
                  >
                    <User size={16} />
                    <span>{player.name}</span>
                    {isPlayerSelected(player.id) && (
                      <span className="ml-auto">
                        <X size={16} className="text-neon-blue" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No available players. Add some first!</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">
              {selectedPlayers.length}/3 players selected
            </span>
            <button
              onClick={handleCreateTeam}
              disabled={selectedPlayers.length === 0}
              className={`btn btn-primary ${
                selectedPlayers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Create Team
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PlayerRegistration;