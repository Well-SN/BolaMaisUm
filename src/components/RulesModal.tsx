
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
              <h3 className="text-lg font-bold text-neon-blue mb-2">⏰ Localização e Horário </h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                <li>Domingos: 8:30 às 11h30</li>
                <li>Quartas: 20:00 às 22:30</li>
                <li>Local: Endereço: R. Francisco Portilho de Melo, 40 - Jardim Virginia, São Paulo - SP</li>
                <li>Observação: Levem água 🚰.</li>
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-bold text-neon-blue mb-2">🎯 PONTUAÇÃO</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                <li>Cestas normais: 1 ponto</li>
                <li>Cestas de 3 pontos: 2 pontos</li>
                <li>O jogo vai até 11 pontos.</li>
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-bold text-neon-blue mb-2">📜 Regras do jogo </h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                <li>Caso haja 3 times ou menos, o jogo dura 10 minutos.</li>
                <li>Caso haja mais de 3 times, o jogo dura 8 minutos.</li>
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-bold text-neon-blue mb-2">🏀 FORMATO DO JOGO</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                <li>Laterais, fundo e faltas: Checkball (bola volta para o meio após essas situações).</li>
                <li>Cesta = Saída livre: após fazer uma cesta, o time que fez pode sair livre, sem reinício de jogo.</li>
                <li>Faltas e cesta não contabilizam pontos. A jogada reinicia com checkball.</li>
                <li>Toda troca de posse deve ser feita saindo da linha de 3 pontos.</li>
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-bold text-neon-blue mb-2">🔄 SISTEMA DE FILA</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
               <li>Equipe vencedora permanece na quadra</li>
                <li>Equipe perdedora vai para o final da fila</li>
                <li>Próxima equipe da fila entra para jogar</li>
                <li>Sistema de rotação contínua</li>
                <li>Quem chegar primeiro começa jogando, e os times serão formados por ordem de chegada ni sistema.</li>
                <li>Quem chegar depois, vai esperar os times já formados jogarem até que todos da lista tenham jogado.</li>            
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-bold text-neon-blue mb-2">🔄 Montar o time</h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                <li>Quem quiser montar seu time, precisa esperar todos jogarem uma vez antes de escolher jogadores.</li>
                <li>Quando for sua vez de montar, respeite a ordem de chegada e escolha dentro da lista de quem ainda não jogou.</li>
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-bold text-neon-blue mb-2"> ❗IMPORTANTE </h3>
              <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                <li>Proibido jogar descalço – sem exceções.</li>
                <li>Se houver empate e dois times na espera, ambos os times saem.</li>
                <li>O foco é a diversão, mas sempre com respeito às regras e ao próximo.</li>
              </ul>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RulesModal;
