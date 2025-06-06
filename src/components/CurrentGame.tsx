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
        className="card court-bg text-center py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AlertCircle size={48} className="mx-auto mb-4 text-neon-orange" />
        <h2 className="text-2xl font-gretoon mb-2">Nenhum jogo iniciado</h2>
        <p className="text-gray-300 mb-4">
          Adicione jogadores e crie um time para iniciar!
        </p>
      </motion.div>
    );
  }
  
  return (
    <>
      <motion.div 
        className="card court-bg mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-gretoon mb-4 text-center text-neon-orange gretoon-text">
          Partida em Andamento
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {currentGame.teamA && (
            <div className="flex-1">
              <TeamDisplay 
                team={currentGame.teamA} 
                isPlaying={true}
                onEdit={isAdmin ? () => handleEdit(currentGame.teamA!) : undefined}
                showActions={!!isAdmin}
              />
              {isAdmin && (
                <div className="mt-3 text-center">
                  <button 
                    onClick={() => handleSetWinnerRequest(currentGame.teamA!.id)}
                    className="btn btn-primary flex items-center gap-2 mx-auto"
                  >
                    <Trophy size={16} /> Vencedor
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-center">
            <div className="text-4xl font-graffiti text-white">VS</div>
          </div>
          
          {currentGame.teamB ? (
            <div className="flex-1">
              <TeamDisplay 
                team={currentGame.teamB} 
                isPlaying={true}
                onEdit={isAdmin ? () => handleEdit(currentGame.teamB!) : undefined}
                showActions={!!isAdmin}
              />
              {isAdmin && (
                <div className="mt-3 text-center">
                  <button 
                    onClick={() => handleSetWinnerRequest(currentGame.teamB!.id)}
                    className="btn btn-primary flex items-center gap-2 mx-auto"
                  >
                    <Trophy size={16} /> Vencedor
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6 bg-court border border-dashed border-gray-600 rounded-lg">
                <AlertCircle size={24} className="mx-auto mb-2 text-neon-orange" />
                <p className="text-gray-300">Aguardando outro time...</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      {nextTeam && (
        <motion.div 
          className="card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-graffiti text-neon-blue">Próximo time</h3>
            {isAdmin ? (
              <button 
                onClick={() => handleEdit(nextTeam)}
                className="btn btn-outline btn-sm flex items-center gap-1"
              >
                <Edit size={14} /> Editar
              </button>
            ) : (
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <Lock size={14} />
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
        icon={<Trophy size={24} className="text-yellow-400" />}
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