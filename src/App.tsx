import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhaserGame } from './components/PhaserGame';
import { Terminal } from './components/Terminal';
import { EventBus } from './EventBus';

export default function App() {
  const [gameState, setGameState] = useState<'home' | 'playing' | 'won' | 'help'>('home');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('savedLevel');
    if (saved === 'MainScene' || saved === 'Level2') {
      setHasSavedGame(true);
    }
  }, []);

  useEffect(() => {
    const handleOpenTerminal = () => setIsTerminalOpen(true);
    const handleGameWon = () => setGameState('won');

    EventBus.on('open-terminal', handleOpenTerminal);
    EventBus.on('game-won', handleGameWon);

    return () => {
      EventBus.off('open-terminal', handleOpenTerminal);
      EventBus.off('game-won', handleGameWon);
    };
  }, []);

  const closeTerminal = () => {
    setIsTerminalOpen(false);
    EventBus.emit('terminal-closed');
  };

  const startNewGame = () => {
    localStorage.removeItem('savedLevel');
    setGameState('playing');
  };

  const resumeGame = () => {
    setGameState('playing');
  };

  if (gameState === 'home') {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-green-500 font-mono">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-8xl mb-12 text-center font-bold tracking-widest"
        >
          ESCAPE
        </motion.h1>
        
        <div className="flex flex-col gap-4 w-64">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={startNewGame}
            className="w-full px-8 py-4 border-2 border-green-500 hover:bg-green-500 hover:text-black transition-colors text-xl font-bold"
          >
            NEW GAME
          </motion.button>

          {hasSavedGame && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={resumeGame}
              className="w-full px-8 py-4 border-2 border-zinc-500 text-zinc-400 hover:border-green-500 hover:text-green-500 transition-colors text-xl font-bold"
            >
              RESUME
            </motion.button>
          )}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            onClick={() => setGameState('help')}
            className="w-full px-8 py-4 border-2 border-zinc-500 text-zinc-400 hover:border-blue-500 hover:text-blue-500 transition-colors text-xl font-bold"
          >
            HOW TO PLAY
          </motion.button>
        </div>
      </div>
    );
  }

  if (gameState === 'help') {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-green-500 font-mono p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl border-2 border-green-500 p-8 bg-black/80"
        >
          <h2 className="text-4xl mb-6 font-bold text-center border-b-2 border-green-500 pb-4">HOW TO PLAY</h2>
          
          <div className="space-y-6 text-lg text-zinc-300">
            <div>
              <h3 className="text-xl text-green-400 font-bold mb-2">ABOUT</h3>
              <p>You are trapped in a digital farm simulation. To escape, you must use your coding skills to hack the environment, unlock portals, and navigate through increasingly complex mazes.</p>
            </div>

            <div>
              <h3 className="text-xl text-green-400 font-bold mb-2">CONTROLS</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white">W, A, S, D</strong> or <strong className="text-white">Arrow Keys</strong> to move your character.</li>
                <li><strong className="text-white">E</strong> to interact with computers and terminals.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl text-green-400 font-bold mb-2">GAMEPLAY</h3>
              <p>Approach a computer and press 'E' to open the terminal. Type the correct commands to manipulate the world around you. Find the portal to escape to the next level!</p>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setGameState('home')}
              className="px-8 py-3 border-2 border-green-500 hover:bg-green-500 hover:text-black transition-colors text-xl font-bold"
            >
              BACK TO MENU
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-green-500 font-mono">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl mb-8"
        >
          WELCOME TO THE FARM
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xl text-zinc-400"
        >
          You have successfully unlocked the portal and started your new life.
        </motion.p>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={() => {
            localStorage.removeItem('savedLevel');
            window.location.reload();
          }}
          className="mt-12 px-6 py-3 border border-green-500 hover:bg-green-500 hover:text-black transition-colors"
        >
          PLAY AGAIN
        </motion.button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      <PhaserGame />

      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full h-1/2 z-50"
          >
            <Terminal onClose={closeTerminal} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
