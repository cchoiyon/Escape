import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, X } from 'lucide-react';
import { PhaserGame } from './components/PhaserGame';
import { Terminal } from './components/Terminal';
import { EventBus } from './EventBus';

export default function App() {
  const [gameState, setGameState] = useState<'home' | 'playing' | 'won' | 'help'>('home');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState('MainScene');
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [health, setHealth] = useState(9);
  const [isPaused, setIsPaused] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('savedLevel');
    const validLevels = ['MainScene', 'Level2', 'Level3', 'Level4', 'Level5'];
    if (validLevels.includes(saved || '')) {
      setHasSavedGame(true);
    }
  }, []);

  useEffect(() => {
    const handleOpenTerminal = (level: string = 'MainScene') => {
      setCurrentLevel(level);
      setIsTerminalOpen(true);
    };
    const handleGameWon = () => setGameState('won');
    const handleGameOver = () => {
      localStorage.removeItem('savedLevel');
      localStorage.removeItem('health');
      setHasSavedGame(false);
      setGameState('home');
    };
    const handleUpdateHealth = (h: number) => setHealth(h);
    const handleShowHint = (text: string) => setHint(text);

    EventBus.on('open-terminal', handleOpenTerminal);
    EventBus.on('game-won', handleGameWon);
    EventBus.on('game-over', handleGameOver);
    EventBus.on('update-health', handleUpdateHealth);
    EventBus.on('show-hint', handleShowHint);

    return () => {
      EventBus.off('open-terminal', handleOpenTerminal);
      EventBus.off('game-won', handleGameWon);
      EventBus.off('game-over', handleGameOver);
      EventBus.off('update-health', handleUpdateHealth);
      EventBus.off('show-hint', handleShowHint);
    };
  }, []);

  const handlePause = () => {
    setIsPaused(true);
    EventBus.emit('pause-game');
  };

  const handleResume = () => {
    setIsPaused(false);
    EventBus.emit('resume-game');
  };

  const handleQuit = () => {
    setIsPaused(false);
    EventBus.emit('resume-game');
    setGameState('home');
  };

  const closeTerminal = () => {
    setIsTerminalOpen(false);
    EventBus.emit('terminal-closed');
  };

  const startNewGame = () => {
    localStorage.removeItem('savedLevel');
    localStorage.removeItem('health');
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
        {hint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-[60] flex items-center justify-center p-8 pointer-events-none"
          >
            <div className="bg-zinc-900 border-2 border-blue-500 p-6 max-w-md shadow-[0_0_30px_rgba(59,130,246,0.3)] pointer-events-auto">
              <div className="flex justify-between items-center mb-4 border-b border-blue-500/30 pb-2">
                <h3 className="text-blue-400 font-bold tracking-widest">SYSTEM HINT</h3>
                <button onClick={() => setHint(null)} className="text-zinc-500 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <p className="text-zinc-300 font-mono text-sm leading-relaxed">
                {hint}
              </p>
              <button 
                onClick={() => setHint(null)}
                className="mt-6 w-full py-2 bg-blue-500/10 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black transition-all font-bold text-xs tracking-widest"
              >
                DISMISS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-4">
        <div className="flex items-center gap-2 bg-black/80 p-3 rounded border-2 border-green-500/50 shadow-lg shadow-green-900/20">
          <div className="text-green-500 text-sm font-bold tracking-widest">HP</div>
          <div className="flex gap-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`w-3 h-5 rounded-sm ${i < health ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-zinc-800'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-40">
        <button onClick={handlePause} className="bg-black/80 p-3 rounded border-2 border-green-500/50 text-green-500 hover:bg-green-500 hover:text-black transition-all shadow-lg shadow-green-900/20">
          <Pause size={24} />
        </button>
      </div>

      {/* Pause Menu */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center font-mono backdrop-blur-sm"
          >
            <h2 className="text-6xl text-green-500 mb-12 font-bold tracking-widest drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">PAUSED</h2>
            <div className="flex flex-col gap-4 w-64">
              <button onClick={handleResume} className="w-full px-8 py-4 border-2 border-green-500 bg-green-500/10 hover:bg-green-500 hover:text-black transition-colors text-xl font-bold text-green-500">
                RESUME
              </button>
              <button onClick={handleQuit} className="w-full px-8 py-4 border-2 border-zinc-500 text-zinc-400 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 transition-colors text-xl font-bold">
                QUIT TO MENU
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full h-1/2 z-50"
          >
            <Terminal onClose={closeTerminal} level={currentLevel} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
