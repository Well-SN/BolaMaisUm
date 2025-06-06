import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import Header from './components/Header';
import PlayerRegistration from './components/PlayerRegistration';
import CurrentGame from './components/CurrentGame';
import QueueDisplay from './components/QueueDisplay';
import UnassignedPlayers from './components/UnassignedPlayers';
import RulesModal from './components/RulesModal';
import { Book } from 'lucide-react';

function App() {
  const [showRules, setShowRules] = useState(false);

  return (
    <AuthProvider>
      <GameProvider>
        <div 
          className="min-h-screen bg-[url('/c3cc4fe4d712e94b0990d0d81f63e2b1%20copy.jpg')] bg-cover bg-center bg-fixed bg-no-repeat before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/80 before:to-black/40 before:pointer-events-none relative"
        >
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#334155',
                color: '#fff',
                border: '1px solid #1E293B',
              },
              success: {
                iconTheme: {
                  primary: '#00FF85',
                  secondary: '#000',
                },
              },
              error: {
                iconTheme: {
                  primary: '#FF00AA',
                  secondary: '#000',
                },
              },
            }}
          />
          
          <Header />
          
          <main className="container mx-auto px-4 pb-16 relative">
            <button
              onClick={() => setShowRules(true)}
              className="fixed bottom-6 right-6 bg-neon-blue text-black rounded-full p-3 shadow-neon-blue hover:bg-opacity-90 transition-all duration-200 z-10"
            >
              <Book size={24} />
            </button>

            <PlayerRegistration />
            <CurrentGame />
            <UnassignedPlayers />
            <QueueDisplay />
          </main>
          
          <footer className="border-t border-white/10 py-4 text-center text-sm text-gray-500 relative">
            <div className="container mx-auto px-4">
              Street 3v3 - BOLA MAIS UM 
            </div>
          </footer>

          <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
        </div>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;