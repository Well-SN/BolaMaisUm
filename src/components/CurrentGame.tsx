import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Trophy, AlertCircle, Edit } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import TeamDisplay from './TeamDisplay';
import TeamEditor from './TeamEditor';
import { ActionType, Team } from '../types';

const CurrentGame: React.FC = () => {
  const { state, dispatch } = useGame();
  const { currentGame } = state;
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  
  const handleSetWinner = (teamId: string) => {
    if (!currentGame.teamA || !currentGame.teamB) {
      toast.error("Can't set a winner when there's not a full game");
      return;
    }
    
    dispatch({
      type: ActionType.SET_WINNER,
      payload: { teamId }
    });
    
    const winnerTeam = teamId === currentGame.teamA.id 
      ? currentGame.teamA 
      : currentGame.teamB;
    
    toast.success(`${winnerTeam.name} wins and stays on the court! 🏆`);
  };
  
  // Find the next team in the queue
  const nextTeam = state.teams.find(team => 
    !team.isPlaying && 
    team.id !== currentGame.teamA?.id && 
    team.id !== currentGame.teamB?.id
  );
  
  if (!currentGame.teamA && !currentGame.teamB) {
    return (
      <motion.div 
        className="card court-bg text-center py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AlertCircle size={48} className="mx-auto mb-4 text-neon-orange" />
        <h2 className="text-2xl font-graffiti mb-2">No Game in Progress</h2>
        <p className="text-gray-300 mb-4">
          Add some players and create teams to get started!
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
        <h2 className="text-2xl font-graffiti mb-4 text-center text-neon-orange graffiti-text">
          CURRENT MATCH
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {currentGame.teamA && (
            <div className="flex-1">
              <TeamDisplay 
                team={currentGame.teamA} 
                isPlaying={true}
                onEdit={() => setEditingTeam(currentGame.teamA!)}
              />
              <div className="mt-3 text-center">
                <button 
                  onClick={() => handleSetWinner(currentGame.teamA!.id)}
                  className="btn btn-primary flex items-center gap-2 mx-auto"
                >
                  <Trophy size={16} /> Winner
                </button>
              </div>
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
                onEdit={() => setEditingTeam(currentGame.teamB!)}
              />
              <div className="mt-3 text-center">
                <button 
                  onClick={() => handleSetWinner(currentGame.teamB!.id)}
                  className="btn btn-primary flex items-center gap-2 mx-auto"
                >
                  <Trophy size={16} /> Winner
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6 bg-court border border-dashed border-gray-600 rounded-lg">
                <AlertCircle size={24} className="mx-auto mb-2 text-neon-orange" />
                <p className="text-gray-300">Waiting for another team...</p>
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
            <h3 className="text-xl font-graffiti text-neon-blue">Next Up</h3>
            <button 
              onClick={() => setEditingTeam(nextTeam)}
              className="btn btn-outline btn-sm flex items-center gap-1"
            >
              <Edit size={14} /> Edit
            </button>
          </div>
          
          <TeamDisplay team={nextTeam} isNext={true} />
        </motion.div>
      )}
      
      {editingTeam && (
        <TeamEditor 
          team={editingTeam} 
          onClose={() => setEditingTeam(null)} 
        />
      )}
    </>
  );
};

export default CurrentGame;