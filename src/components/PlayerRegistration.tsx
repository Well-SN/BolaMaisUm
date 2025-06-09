import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Plus, User, UsersRound, X, Lock } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { ActionType, Player } from '../types';

const PlayerRegistration: React.FC = () => {
  const { state, dispatch } = useGame();
  const { isAdmin } = useAuth();
  const [playerName, setPlayerName] = useState('');
  const [mode, setMode] = useState<'individual' | 'team'>('individual');
  const [teamName, setTeamName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [newPlayerNames, setNewPlayerNames] = useState<string[]>(['', '', '']);

  const showToastAtUserPosition = (message: string, type: 'success' | 'error' = 'success') => {
    // Get the scroll position to show toast near user's current view
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Calculate position - show toast in the middle of current viewport
    const toastPosition = scrollY + (windowHeight / 2);
    
    const toastOptions = {
      position: 'top-center' as const,
      style: {
        background: type === 'success' ? '#10B981' : '#EF4444',
        color: '#fff',
        border: '1px solid #1E293B',
        fontSize: '14px',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        marginTop: `${Math.max(0, toastPosition - windowHeight)}px`
      },
      duration: 3000,
    };

    if (type === 'success') {
      toast.success(message, toastOptions);
    } else {
      toast.error(message, toastOptions);
    }
  };

  const handleAddPlayer = () => {
    if (!isAdmin) {
      showToastAtUserPosition('Você precisa estar logado como administrador', 'error');
      return;
    }

    if (!playerName.trim()) {
      showToastAtUserPosition('Coloque o nome do jogador', 'error');
      return;
    }

    dispatch({
      type: ActionType.ADD_PLAYER,
      payload: { name: playerName.trim() }
    });
    
    showToastAtUserPosition(`${playerName} Adicionado!`, 'success');
    setPlayerName('');
  };

  const handleCreateTeam = () => {
    if (!isAdmin) {
      showToastAtUserPosition('Você precisa estar logado como administrador', 'error');
      return;
    }

    // Get new players that have names
    const newPlayers = newPlayerNames.filter(name => name.trim()).map(name => name.trim());
    const totalPlayers = selectedPlayers.length + newPlayers.length;

    if (totalPlayers === 0) {
      showToastAtUserPosition('Selecione jogadores ou adicione novos jogadores', 'error');
      return;
    }

    if (totalPlayers > 3) {
      showToastAtUserPosition('Uma equipe pode ter no máximo 3 jogadores', 'error');
      return;
    }

    // Add new players first if any
    if (newPlayers.length > 0) {
      newPlayers.forEach(name => {
        dispatch({
          type: ActionType.ADD_PLAYER,
          payload: { name }
        });
      });

      // Use timeout to ensure new players are added before creating team
      setTimeout(() => {
        // Get the latest added players
        const latestPlayers = state.unassignedPlayers.slice(-newPlayers.length);
        const latestPlayerIds = latestPlayers.map(p => p.id);
        
        // Combine selected existing players with new player IDs
        const allPlayerIds = [...selectedPlayers, ...latestPlayerIds];
        
        dispatch({
          type: ActionType.CREATE_TEAM,
          payload: { 
            playerIds: allPlayerIds,
            teamName: teamName.trim() || `Time ${state.teams.length + 1}`
          }
        });
        
        showToastAtUserPosition('Time criado!', 'success');
        setSelectedPlayers([]);
        setTeamName('');
        setNewPlayerNames(['', '', '']);
      }, 100);
    } else {
      // Create team with only selected players
      dispatch({
        type: ActionType.CREATE_TEAM,
        payload: { 
          playerIds: selectedPlayers,
          teamName: teamName.trim() || `Time ${state.teams.length + 1}`
        }
      });
      
      showToastAtUserPosition('Time criado!', 'success');
      setSelectedPlayers([]);
      setTeamName('');
      setNewPlayerNames(['', '', '']);
    }
  };

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      const totalSelected = selectedPlayers.length + newPlayerNames.filter(name => name.trim()).length;
      if (totalSelected < 3) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      } else {
        showToastAtUserPosition('Uma equipe pode ter no máximo 3 jogadores', 'error');
      }
    }
  };

  const updateNewPlayerName = (index: number, name: string) => {
    const newNames = [...newPlayerNames];
    newNames[index] = name;
    setNewPlayerNames(newNames);
  };

  const getTotalSelectedCount = () => {
    return selectedPlayers.length + newPlayerNames.filter(name => name.trim()).length;
  };

  if (!isAdmin) {
    return (
      <motion.div 
        className="card my-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Lock size={32} className="mx-auto mb-3 text-gray-400" />
        <h2 className="text-lg font-graffiti mb-2 text-gray-300">
          Área Restrita
        </h2>
        <p className="text-sm text-gray-400">
          Apenas administradores podem adicionar jogadores e criar times.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="card my-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg sm:text-xl font-graffiti mb-3 text-neon-orange graffiti-text">
        Gerenciar Jogadores
      </h2>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setMode('individual')}
          className={`btn flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm ${
            mode === 'individual' 
              ? 'bg-white text-court border-white' 
              : 'btn-outline'
          }`}
        >
          <User size={16} />
          Individual
        </button>
        <button 
          onClick={() => setMode('team')}
          className={`btn flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm ${
            mode === 'team' 
              ? 'bg-white text-court border-white' 
              : 'btn-outline'
          }`}
        >
          <UsersRound size={16} />
          Time
        </button>
      </div>

      {mode === 'individual' ? (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nome do jogador"
              className="input-field flex-1 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            />
            <button 
              onClick={handleAddPlayer}
              className="btn btn-primary flex items-center justify-center gap-1 whitespace-nowrap px-3 py-2 text-sm"
            >
              <Plus size={16} /> ADD
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Nome do Time (opcional)"
            className="input-field w-full text-sm"
          />

          <div className="space-y-3">
            <h3 className="text-sm font-bold">Novos Jogadores</h3>
            {newPlayerNames.map((name, index) => (
              <input
                key={index}
                type="text"
                value={name}
                onChange={(e) => updateNewPlayerName(index, e.target.value)}
                placeholder={`Jogador ${index + 1} (opcional)`}
                className="input-field w-full text-sm"
                disabled={getTotalSelectedCount() >= 3 && !name.trim()}
              />
            ))}
            <p className="text-xs text-gray-400">
              Você pode misturar novos jogadores com jogadores disponíveis (máximo 3 total)
            </p>
          </div>

          {state.unassignedPlayers.length > 0 && (
            <div className="bg-court-light rounded-md p-3">
              <h3 className="text-sm font-bold mb-2">Jogadores Disponíveis</h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {state.unassignedPlayers.map((player: Player) => (
                  <div
                    key={player.id}
                    onClick={() => togglePlayerSelection(player.id)}
                    className={`player-item cursor-pointer text-sm ${
                      selectedPlayers.includes(player.id) 
                        ? 'bg-neon-orange bg-opacity-20 border border-neon-orange' 
                        : getTotalSelectedCount() >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <User size={14} />
                    <span className="text-sm">{player.name}</span>
                    {selectedPlayers.includes(player.id) && (
                      <span className="ml-auto">
                        <X size={14} className="text-neon-orange" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {getTotalSelectedCount()}/3 jogadores
            </span>
            <button
              onClick={handleCreateTeam}
              disabled={getTotalSelectedCount() === 0}
              className={`bg-neon-pink hover:bg-neon-pink/80 text-white font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
                getTotalSelectedCount() === 0 ? 'opacity-50 cursor-not-allowed' : ''
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
