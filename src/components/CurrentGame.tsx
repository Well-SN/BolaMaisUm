
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Trophy, AlertCircle, Edit, Lock } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import TeamDisplay from './TeamDisplay';
import TeamEditor from './TeamEditor';
import ConfirmationModal from './ConfirmationModal';
import { ActionType, Team } from '../types';

const CurrentGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const { isAdmin } = useAuth();
  const { currentGame } = state;
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showWinnerConfirm, setShowWinnerConfirm] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  
  const handleSetWinnerRequest = (teamId: string) => {
    if (!isAdmin) {
      toast.error('Você precisa estar logado como administrador');
      return;
    }

    if (!currentGame.teamA || !currentGame.teamB) {
      toast.error("Não é possível definir um vencedor quando não há um jogo completo");
      return;
    }
    
    setSelectedWinner(teamId);
    setShowWinnerConfirm(true);
  };

  const handleSetWinnerConfirm = () => {
    if (!selectedWinner) return;

    dispatch({
      type: ActionType.SET_WINNER,
      payload: { teamId: selectedWinner }
    });
    
    const winnerTeam = selectedWinner === currentGame.teamA?.id 
      ? currentGame.teamA 
      : currentGame.teamB;
    
    toast.success(`${winnerTeam?.name} ganhou a partida 🏆`);
    setSelectedWinner(null);
  };

  const handleEdit = (team: Team) => {
    if (!isAdmin) {
      toast.error('Você precisa estar logado como administrador');
      return;
    }
    setEditingTeam(team);
  };
  
  // Find the next team in the queue
  const nextTeam = state.teams.find(team => 
    !team.isPlaying && 
    team.id !== currentGame.teamA?.id && 
    team.id !== currentGame.teamB?.id
  );

  const getWinnerTeamName = () => {
    if (!selectedWinner) return '';
    return selectedWinner === currentGame.teamA?.id 
      ? currentGame.teamA?.name 
      : currentGame.teamB?.name;
  };
  
  if (!currentGame.teamA && !currentGame.teamB) {
    return (
      <motion.div 
        className="card text-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AlertCircle size={40} className="mx-auto mb-3 text-neon-orange" />
        <h2 className="text-xl font-graffiti mb-2">Nenhum jogo iniciado</h2>
        <p className="text-gray-300 mb-4 text-sm">
          Adicione jogadores e crie um time para iniciar!
        </p>
      </motion.div>
    );
  }
  
  return (
    <>
      <motion.div 
        className="card mb-4 bg-gradient-to-br from-neon-blue/20 to-white/5 border-2 border-neon-blue/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg sm:text-xl font-graffiti mb-3 text-center text-neon-blue">
          Partida em Andamento
        </h2>
        
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          {currentGame.teamA && (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">{currentGame.teamA.name}</h3>
                <div className="flex gap-2">
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => handleSetWinnerRequest(currentGame.teamA!.id)}
                        className="btn btn-primary flex items-center gap-1 text-xs px-2 py-1"
                      >
                        <Trophy size={12} /> Vencedor
                      </button>
                      <button 
                        onClick={() => handleEdit(currentGame.teamA!)}
                        className="btn btn-outline btn-sm flex items-center gap-1 text-xs px-2 py-1"
                      >
                        <Edit size={12} /> Editar
                      </button>
                    </>
                  )}
                </div>
              </div>
              <TeamDisplay 
                team={currentGame.teamA} 
                isPlaying={true}
                showActions={false}
              />
            </div>
          )}
          
          <div className="flex items-center justify-center">
            <div className="text-2xl sm:text-3xl font-graffiti text-white">VS</div>
          </div>
          
          {currentGame.teamB ? (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">{currentGame.teamB.name}</h3>
                <div className="flex gap-2">
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => handleSetWinnerRequest(currentGame.teamB!.id)}
                        className="btn btn-primary flex items-center gap-1 text-xs px-2 py-1"
                      >
                        <Trophy size={12} /> Vencedor
                      </button>
                      <button 
                        onClick={() => handleEdit(currentGame.teamB!)}
                        className="btn btn-outline btn-sm flex items-center gap-1 text-xs px-2 py-1"
                      >
                        <Edit size={12} /> Editar
                      </button>
                    </>
                  )}
                </div>
              </div>
              <TeamDisplay 
                team={currentGame.teamB} 
                isPlaying={true}
                showActions={false}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-4 bg-court border border-dashed border-gray-600 rounded-lg">
                <AlertCircle size={20} className="mx-auto mb-2 text-neon-orange" />
                <p className="text-gray-300 text-sm">Aguardando outro time...</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      {nextTeam && (
        <motion.div 
          className="card mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-graffiti text-neon-blue">Próximo time</h3>
            {isAdmin ? (
              <button 
                onClick={() => handleEdit(nextTeam)}
                className="btn btn-outline btn-sm flex items-center gap-1 text-xs px-2 py-1"
              >
                <Edit size={12} /> Editar
              </button>
            ) : (
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Lock size={12} />
                <span className="hidden sm:inline">Admin necessário</span>
              </div>
            )}
          </div>
          
          <TeamDisplay team={nextTeam} isNext={true} showActions={!!isAdmin} />
        </motion.div>
      )}

      <ConfirmationModal
        isOpen={showWinnerConfirm}
        onClose={() => {
          setShowWinnerConfirm(false);
          setSelectedWinner(null);
        }}
        onConfirm={handleSetWinnerConfirm}
        title="Definir Vencedor"
        message={`Você tem certeza que deseja definir "${getWinnerTeamName()}" como vencedor desta partida? O time perdedor irá para o final da fila.`}
        confirmText="Sim, Definir Vencedor"
        icon={<Trophy size={24} className="text-green-400" />}
        variant="success"
      />
      
      {editingTeam && isAdmin && (
        <TeamEditor 
          team={editingTeam} 
          onClose={() => setEditingTeam(null)} 
        />
      )}
    </>
  );
};

export default CurrentGame;
