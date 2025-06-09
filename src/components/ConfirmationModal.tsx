
import React from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmButtonClass?: string;
  icon?: React.ReactNode;
  variant?: 'danger' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  confirmButtonClass = 'btn-primary',
  icon,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const bgClass = variant === 'success' 
    ? 'from-green-500/20 to-white/5 border-green-500/20' 
    : 'from-red-500/20 to-white/5 border-red-500/20';
    
  const titleClass = variant === 'success' ? 'text-green-400' : 'text-red-400';

  return (
    <motion.div 
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className={`w-full max-w-md bg-gradient-to-br ${bgClass} backdrop-blur border rounded-lg shadow-xl`}
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {icon || <AlertTriangle size={24} className={titleClass} />}
              <h2 className={`text-xl font-bold ${titleClass}`}>{title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-gray-300 mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className={`btn ${confirmButtonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationModal;
