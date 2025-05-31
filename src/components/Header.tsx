import React from 'react';
import { motion } from 'framer-motion';
import { Tally1 as Ball } from 'lucide-react';

const Header: React.FC = () => {
  return (
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
        <div className="hidden md:block">
          <div className="text-sm text-gray-400">
            <span className="neon-text">3v3</span> BALL MANAGEMENT
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;