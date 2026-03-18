import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhaserGame } from './components/PhaserGame';
import { Terminal } from './components/Terminal';
import { EventBus } from './EventBus';

export default function App() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    const handleOpenTerminal = () => setIsTerminalOpen(true);
    const handleGameWon = () => setHasWon(true);

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

  if (hasWon) {
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
          onClick={() => window.location.reload()}
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
