import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
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
        className="relative z-10 bg-gradient-to-r from-neon-blue/20 via-white/10 to-neon-blue/20 border-b border-white/10 shadow-lg backdrop-blur-sm p-4 mb-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/WhatsApp_Image_2025-06-01_at_21.52.11-removebg-preview.png" alt="Logo" className="w-16 h-16 sm:w-24 sm:h-24 object-contain" />
            <h1 className="text-2xl sm:text-4xl font-graffiti graffiti-text">
              <span className="neon-text">Bola</span>
              <span className="neon-text-blue ml-2">Mais UM</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <div className="text-3xl text-gray-400">
                <span className="neon-text">3v3</span> 
              </div>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="btn btn-outline btn-sm flex items-center gap-2 whitespace-nowrap px-3 py-2"
            >
              <Trash2 size={14} />
              Resetar
            </button>
          </div>
        </div>
      </motion.header>

      {showResetModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-neon-blue/20 to-white/5 backdrop-blur border border-white/10 rounded-lg p-5 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neon-blue">Reseta</h2>
              <button 
                onClick={() => setShowResetModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-300 mb-4">
              Isso excluirá todos os jogadores, times e dados do jogo. Esta ação não pode ser desfeita.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Digite a senha do administrador para confirmar:
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
                {isResetting ? 'Resetando...' : 'Reseta todos os dados'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;