import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Plus, User, UsersRound, X, Lock } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { ActionType, Player } from '../types';

const PlayerRegistration: React.FC = () => {
  const { state, dispatch } = useGame();
  const { user } = useAuth();
  const [playerName, setPlayerName] = useState('');
  const [teamMode, setTeamMode] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const handleAddPlayer = () => {
    if (!user) {
      toast.error('Você precisa estar logado para adicionar jogadores');
      return;
    }

    if (!playerName.trim()) {
      toast.error('Coloque o nome do jogador');
      return;
    }

    dispatch({
      type: ActionType.ADD_PLAYER,
      payload: { name: playerName.trim() }
    });
    
    toast.success(`${playerName} Adicionado!`);
    setPlayerName('');
  };

  const handleCreateTeam = () => {
    if (!user) {
      toast.error('Você precisa estar logado para criar times');
      return;
    }

    if (selectedPlayers.length === 0) {
      toast.error('Selecione pelo menos um jogador');
      return;
    }

    if (selectedPlayers.length > 3) {
      toast.error('Uma equipe pode ter no máximo 3 jogadores');
      return;
    }

    dispatch({
      type: ActionType.CREATE_TEAM,
      payload: { 
        playerIds: selectedPlayers,
        teamName: teamName.trim() 
      }
    });
    
    toast.success('Time criado!');
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
        toast.error('Uma time pode ter no máximo 3 jogadores');
      }
    }
  };

  const isPlayerSelected = (playerId: string) => selectedPlayers.includes(playerId);

  if (!user) {
    return (
      <motion.div 
        className="card fence-bg my-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Lock size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-graffiti mb-2 text-gray-300">
          Área Restrita
        </h2>
        <p className="text-gray-400">
          Apenas usuários logados podem adicionar jogadores e criar times.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="card fence-bg my-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-graffiti mb-4 text-neon-orange graffiti-text">
        {teamMode ? 'Crie seu time' : 'Inscreva um jogador!'}
      </h2>

      <div className="mb-4">
        <button 
          onClick={() => setTeamMode(!teamMode)}
          className={`btn ${teamMode ? 'btn-secondary' : 'btn-primary'} flex items-center gap-2 whitespace-nowrap px-4 py-2`}
        >
          {teamMode ? <UsersRound size={18} /> : <User size={18} />}
          {teamMode ? 'Time' : 'Individual'}
        </button>
      </div>

      {!teamMode ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Coloque o nome do jogador"
              className="input-field flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            />
            <button 
              onClick={handleAddPlayer}
              className="btn btn-primary flex items-center justify-center gap-1 whitespace-nowrap px-4 py-2"
            >
              <Plus size={18} /> ADD
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Nome do Time (opcional)"
            className="input-field w-full"
          />

          <div className="bg-court-light rounded-md p-2">
            <h3 className="text-lg font-bold mb-2">Selecione no máximo 3</h3>
            {state.unassignedPlayers.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {state.unassignedPlayers.map((player: Player) => (
                  <div
                    key={player.id}
                    onClick={() => togglePlayerSelection(player.id)}
                    className={`player-item cursor-pointer ${
                      isPlayerSelected(player.id) 
                        ? 'bg-neon-orange bg-opacity-20 border border-neon-orange' 
                        : ''
                    }`}
                  >
                    <User size={16} />
                    <span>{player.name}</span>
                    {isPlayerSelected(player.id) && (
                      <span className="ml-auto">
                        <X size={16} className="text-neon-orange" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">Nenhum jogador disponível. Adicione alguns primeiro!</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">
              {selectedPlayers.length}/3 jogadores selecionados
            </span>
            <button
              onClick={handleCreateTeam}
              disabled={selectedPlayers.length === 0}
              className={`btn btn-primary whitespace-nowrap px-4 py-2 ${
                selectedPlayers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Criar time
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PlayerRegistration;