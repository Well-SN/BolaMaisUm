import React from 'react';
import { Toaster } from 'react-hot-toast';
import { GameProvider } from './contexts/GameContext';
import Header from './components/Header';
import PlayerRegistration from './components/PlayerRegistration';
import CurrentGame from './components/CurrentGame';
import QueueDisplay from './components/QueueDisplay';
import UnassignedPlayers from './components/UnassignedPlayers';

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-asphalt text-white">
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
        
        <main className="container mx-auto px-4 pb-16">
          <PlayerRegistration />
          <CurrentGame />
          <UnassignedPlayers />
          <QueueDisplay />
        </main>
        
        <footer className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
          <div className="container mx-auto px-4">
            Street Queue - The Ultimate 3v3 Streetball Management App
          </div>
        </footer>
      </div>
    </GameProvider>
  );
}

export default App;