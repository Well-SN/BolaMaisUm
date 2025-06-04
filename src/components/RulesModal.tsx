
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-neon-blue/20 to-white/5 backdrop-blur border border-white/10 rounded-lg shadow-xl"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-gradient-to-br from-neon-blue/20 to-white/5 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 border-b border-white/10">
            <h2 className="text-xl sm:text-2xl font-graffiti text-neon-blue">REGRAS DO 3x3</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6 text-gray-100">
            <section>
              <h3 className="text-lg font-bold text-neon-blue mb-2">🏀 FORMATO DO JOGO</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                <li>Cada equipe tem exatamente 3 jogadores</li>
                <li>Jogo em meia quadra</li>
                <li>Uma cesta apenas</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-neon-blue mb-2">⚡ SISTEMA DE FILA</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                <li>Equipe vencedora permanece na quadra</li>
                <li>Equipe perdedora vai para o final da fila</li>
                <li>Próxima equipe da fila entra para jogar</li>
                <li>Sistema de rotação contínua</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-neon-blue mb-2">🎯 PONTUAÇÃO</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                <li>Cestas normais: 1 ponto</li>
                <li>Cestas de 3 pontos: 2 pontos</li>
                <li>Primeiro a fazer 21 pontos vence</li>
                <li>Ou quem estiver na frente aos 10 minutos</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-neon-blue mb-2">🔄 POSSE DE BOLA</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                <li>Após cesta: bola para o adversário</li>
                <li>Após rebote defensivo: levar a bola além da linha de 3</li>
                <li>Início do jogo: decidido no "check ball"</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-neon-blue mb-2">⚠️ FALTAS</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                <li>6 faltas coletivas = adversário ganha posse</li>
                <li>Falta em arremesso = 1 ou 2 lances livres</li>
                <li>Jogo limpo e respeitoso sempre!</li>
              </ul>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RulesModal;
