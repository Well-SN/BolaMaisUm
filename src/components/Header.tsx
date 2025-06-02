import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CircleDot as Ball, Trash2, X } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { resetGame } = useGame();
  const [showResetModal, setShowResetModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    const success = await resetGame(password);
    setIsResetting(false);
    
    if (success) {
      toast.success('Game data has been reset');
      setShowResetModal(false);
      setPassword('');
    } else {
      toast.error('Invalid password');
    }
  };

  return (
    <>
      <motion.header 
        className="bg-gradient-to-r from-neon-orange/20 to-neon-blue/20 border-b border-gray-800 shadow-lg p-4 mb-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                rotate: [0, 20, 0, -20, 0],
                y: [0, -5, 0, -5, 0] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: 'loop' 
              }}
            >
              <Ball size={36} className="text-neon-orange" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-graffiti graffiti-text">
              <span className="neon-text">STREET</span>
              <span className="neon-text-blue ml-2">QUEUE</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <div className="text-sm text-gray-400">
                <span className="neon-text">3v3</span> BALL MANAGEMENT
              </div>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="btn btn-outline btn-sm flex items-center gap-2"
            >
              <Trash2 size={14} />
              Reset
            </button>
          </div>
        </div>
      </motion.header>

      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-court-light border-2 border-gray-700 rounded-lg p-5 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neon-orange">Reset Game Data</h2>
              <button 
                onClick={() => setShowResetModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-300 mb-4">
              This will delete all players, teams, and game data. This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter admin password to confirm:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="Password"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="btn btn-outline"
                disabled={isResetting}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="btn btn-primary flex items-center gap-2"
                disabled={isResetting}
              >
                <Trash2 size={16} />
                {isResetting ? 'Resetting...' : 'Reset All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;