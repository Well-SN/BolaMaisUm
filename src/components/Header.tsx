
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, LogIn, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
  const { isAdmin, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    setIsMobileMenuOpen(false);
  };

  const openAuthModal = () => {
    setShowAuthModal(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header 
        className="bg-gradient-to-br from-neon-blue/20 to-white/5 backdrop-blur border-b border-white/10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/2d3cb20d-f317-4c80-aeb1-bd3bb5bcdb1c.png" 
                alt="Logo" 
                className="h-15 w-20 sm:h-15 sm:w-15 object-contain"
              />
              <div className="flex flex-row">
                <h1 className="text-lg lg:text-lg lg:text-2xl font-graffiti text-blue neon-text">
                  BOLA
                </h1>
                <h1 className="text-lg lg:text-lg lg:text-2xl font-graffiti text-white neon-text">
                  +1
                </h1>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isAdmin && (
                <div className="flex items-center gap-1 px-2 py-1 bg-neon-orange bg-opacity-20 border border-neon-orange rounded-md">
                  <Shield size={14} className="text-neon-orange" />
                  <span className="text-xs text-neon-orange font-medium">Admin</span>
                </div>
              )}
              
              {isAdmin ? (
                <button 
                  onClick={handleSignOut}
                  className="btn btn-outline btn-sm flex items-center gap-1 text-xs px-2 py-1"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              ) : (
                <button 
                  onClick={openAuthModal}
                  className="btn btn-primary btn-sm flex items-center gap-1 text-xs px-2 py-1"
                >
                  <LogIn size={14} />
                  Login
                </button>
              )}
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-1"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <motion.div 
              className="md:hidden mt-3 pb-3 border-t border-gray-700"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex flex-col gap-2 pt-3">
                {isAdmin && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-neon-orange bg-opacity-20 border border-neon-orange rounded-md w-fit">
                    <Shield size={14} className="text-neon-orange" />
                    <span className="text-xs text-neon-orange font-medium">Admin</span>
                  </div>
                )}
                
                {isAdmin ? (
                  <button 
                    onClick={handleSignOut}
                    className="btn btn-outline btn-sm flex items-center gap-1 text-xs px-2 py-1 w-fit"
                  >
                    <LogOut size={14} />
                    Sair
                  </button>
                ) : (
                  <button 
                    onClick={openAuthModal}
                    className="btn btn-primary btn-sm flex items-center gap-1 text-xs px-2 py-1 w-fit"
                  >
                    <LogIn size={14} />
                    Login
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default Header;
