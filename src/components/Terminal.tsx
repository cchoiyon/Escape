import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { EventBus } from '../EventBus';
import { X } from 'lucide-react';
import { getLevelVFS } from '../vfsData';
import { VFSDirectory, VFSNode } from '../types';

interface TerminalProps {
  onClose: () => void;
  level: string;
}

export const Terminal = ({ onClose, level }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const [levelNumber] = useState(() => {
    if (level === 'MainScene') return 1;
    if (level === 'Level2') return 2;
    if (level === 'Level3') return 3;
    if (level === 'Level4') return 4;
    if (level === 'Level5') return 5;
    return 1;
  });

  const [vfs, setVfs] = useState<VFSDirectory>(() => getLevelVFS(levelNumber));
  const [cwd, setCwd] = useState<string[]>([]); // Array of directory names
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#000000',
        foreground: '#00ff00',
        cursor: '#00ff00',
      },
      fontFamily: 'monospace',
      fontSize: 16,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    
    const resizeObserver = new ResizeObserver(() => {
      try {
        if (terminalRef.current && terminalRef.current.clientWidth > 0) {
          fitAddon.fit();
        }
      } catch (e) {
        console.warn('FitAddon error:', e);
      }
    });
    
    resizeObserver.observe(terminalRef.current);

    setTimeout(() => {
      try {
        if (terminalRef.current && terminalRef.current.clientWidth > 0) {
          fitAddon.fit();
          term.focus();
        }
      } catch (e) {}
    }, 50);

    xtermRef.current = term;

    const getPrompt = () => {
      const path = cwd.length === 0 ? '~' : '~/' + cwd.join('/');
      return `\r\nuser@farm-os:${path}$ `;
    };

    const prompt = () => {
      term.write(getPrompt());
    };

    const writeAIHint = (message: string) => {
      term.writeln(`\x1b[36m[COMPANION AI]: ${message}\x1b[0m`);
    };

    term.writeln('FARM-OS v1.0.5');
    term.writeln(`Connected to: ${level.toUpperCase()}_TERMINAL`);
    term.writeln('Type "help" for a list of commands.');
    prompt();

    let input = '';

    const getNodeAtPath = (path: string[], root: VFSDirectory): VFSNode | null => {
      let current: VFSNode = root;
      for (const segment of path) {
        if (current.type === 'dir' && current.contents[segment]) {
          current = current.contents[segment];
        } else {
          return null;
        }
      }
      return current;
    };

    const processCommand = (cmd: string) => {
      const trimmedCmd = cmd.trim();
      if (trimmedCmd) {
        setHistory(prev => [trimmedCmd, ...prev]);
        setHistoryIndex(-1);
      }

      const args = trimmedCmd.split(/\s+/);
      const command = args[0].toLowerCase();

      const currentDir = getNodeAtPath(cwd, vfs) as VFSDirectory;

      switch (command) {
        case 'help':
          term.writeln('Available commands:');
          term.writeln('  ls [-a] [-l] - List directory contents');
          term.writeln('  cd [dir]     - Change directory');
          term.writeln('  cat [file]   - Read file contents');
          term.writeln('  pwd          - Print working directory');
          term.writeln('  grep [str] [file] - Search for string in file');
          term.writeln('  chmod [+x] [file] - Change file permissions');
          term.writeln('  rm [file]    - Remove file');
          term.writeln('  mv [src] [dst] - Move/rename file');
          term.writeln('  cp [src] [dst] - Copy file');
          term.writeln('  clear        - Clear terminal screen');
          term.writeln('  exit         - Close terminal');
          term.writeln('  ./[script]   - Execute a script');
          break;
        case 'ls': {
          const showHidden = args.includes('-a');
          const showLong = args.includes('-l');
          const entries = Object.entries(currentDir.contents);
          entries.forEach(([name, node]) => {
            if (node.hidden && !showHidden) return;
            if (showLong) {
              const perms = node.type === 'file' ? node.permissions : 'drwxr-xr-x';
              term.writeln(`${perms} user user 4096 Mar 21 01:57 ${name}`);
            } else {
              term.write(`${name}  `);
            }
          });
          if (!showLong) term.writeln('');
          break;
        }
        case 'cd': {
          const target = args[1];
          if (!target || target === '~') {
            setCwd([]);
          } else if (target === '..') {
            if (cwd.length > 0) setCwd(prev => prev.slice(0, -1));
          } else if (target === '.') {
            // Do nothing
          } else {
            const node = currentDir.contents[target];
            if (node && node.type === 'dir') {
              setCwd(prev => [...prev, target]);
            } else if (node && node.type === 'file') {
              term.writeln(`cd: ${target}: Not a directory`);
              writeAIHint(`'${target}' is a file, not a folder. You can only 'cd' into directories.`);
            } else {
              term.writeln(`cd: ${target}: No such file or directory`);
              writeAIHint(`I can't find a folder named '${target}'. Use 'ls' to see what's here.`);
            }
          }
          break;
        }
        case 'cat': {
          const filename = args[1];
          if (!filename) {
            term.writeln('Usage: cat [file]');
            writeAIHint("You need to tell me WHICH file to read. Try 'cat filename.txt'.");
            break;
          }
          const node = currentDir.contents[filename];
          if (node && node.type === 'file') {
            term.writeln(node.content);
          } else if (node && node.type === 'dir') {
            term.writeln(`cat: ${filename}: Is a directory`);
            writeAIHint(`'${filename}' is a folder. Use 'ls' to see inside it, or 'cat' on a file.`);
          } else {
            term.writeln(`cat: ${filename}: No such file or directory`);
            writeAIHint(`I can't find a file named '${filename}'. Double-check the spelling!`);
          }
          break;
        }
        case 'pwd': {
          term.writeln('/home/user' + (cwd.length > 0 ? '/' + cwd.join('/') : ''));
          break;
        }
        case 'grep': {
          const pattern = args[1];
          const filename = args[2];
          if (!pattern || !filename) {
            term.writeln('Usage: grep [pattern] [file]');
            writeAIHint("Grep helps you search for text. Try 'grep passcode logs.txt' to find a specific word.");
            break;
          }
          const node = currentDir.contents[filename];
          if (node && node.type === 'file') {
            const lines = node.content.split('\n');
            const matches = lines.filter(line => line.includes(pattern));
            matches.forEach(match => term.writeln(match));
          } else {
            term.writeln(`grep: ${filename}: No such file or directory`);
            writeAIHint(`I can't search in '${filename}' because it doesn't exist here.`);
          }
          break;
        }
        case 'chmod': {
          const mode = args[1];
          const filename = args[2];
          if (mode === '+x' && filename) {
            const node = currentDir.contents[filename];
            if (node && node.type === 'file') {
              node.permissions = node.permissions.replace(/^r-/, 'rx').replace(/^-/, 'x');
              // Simple logic to make it executable for our game
              if (!node.permissions.includes('x')) {
                 node.permissions = 'rwxr-xr-x';
              }
              term.writeln(`Updated permissions for ${filename}`);
            } else {
              term.writeln(`chmod: ${filename}: No such file or directory`);
              writeAIHint(`I can't change permissions for '${filename}' because it's not here.`);
            }
          } else if (filename && !mode.startsWith('+')) {
            term.writeln('chmod: missing operand');
            writeAIHint("Bzzzt! You forgot the permission flags! Try telling it WHAT permissions to add, like +x for execute.");
          } else {
            term.writeln('Usage: chmod +x [file]');
            writeAIHint("Chmod changes file permissions. Use '+x' to make a script runnable!");
          }
          break;
        }
        case 'rm': {
          const filename = args[1];
          if (currentDir.contents[filename]) {
            delete currentDir.contents[filename];
            term.writeln(`Removed ${filename}`);
          } else {
            term.writeln(`rm: ${filename}: No such file or directory`);
          }
          break;
        }
        case 'mv': {
          const src = args[1];
          const dst = args[2];
          if (currentDir.contents[src]) {
            currentDir.contents[dst] = currentDir.contents[src];
            delete currentDir.contents[src];
            term.writeln(`Renamed ${src} to ${dst}`);
          } else {
            term.writeln(`mv: ${src}: No such file or directory`);
          }
          break;
        }
        case 'cp': {
          const src = args[1];
          const dst = args[2];
          if (currentDir.contents[src]) {
            currentDir.contents[dst] = JSON.parse(JSON.stringify(currentDir.contents[src]));
            term.writeln(`Copied ${src} to ${dst}`);
          } else {
            term.writeln(`cp: ${src}: No such file or directory`);
          }
          break;
        }
        case 'sudo': {
          const subCommand = args[1];
          if (levelNumber === 1 && subCommand === 'unlock') {
            term.writeln('Access Granted. Portal Unlocked...');
            EventBus.emit('door-unlocked');
            setTimeout(onClose, 1500);
          } else if (levelNumber === 2 && subCommand === './disable_robots.sh') {
             const node = currentDir.contents['disable_robots.sh'];
             if (node && node.type === 'file' && node.permissions.includes('x')) {
                term.writeln('Executing disable_robots.sh...');
                term.writeln('Robots disabled successfully.');
                term.writeln('Access Granted. Next Portal Unlocked...');
                EventBus.emit('robots-disabled');
                setTimeout(onClose, 1500);
             } else {
                term.writeln('sudo: permission denied or file not executable');
             }
          } else if (levelNumber === 5 && subCommand === 'systemctl' && args[2] === 'restart' && args[3] === 'portal') {
             const config = currentDir.contents['portal.conf'];
             if (config && config.type === 'file' && config.content.includes('PORTAL_STATUS=READY')) {
                term.writeln('Restarting portal service...');
                term.writeln('Portal stabilized. Escape route open.');
                EventBus.emit('portal-repaired');
                setTimeout(onClose, 1500);
             } else {
                term.writeln('Error: portal.conf is corrupted or missing.');
             }
          } else {
            term.writeln('sudo: command not found or unauthorized');
          }
          break;
        }
        case 'activate_portal': {
          if (levelNumber === 3 && args[1] === '8891') {
            term.writeln('Portal activation code accepted.');
            term.writeln('Portal Unlocked...');
            EventBus.emit('portal-activated');
            setTimeout(onClose, 1500);
          } else {
            term.writeln('Invalid activation code.');
          }
          break;
        }
        case 'unlock_portal': {
          if (levelNumber === 2 && args[1] === '4291') {
            term.writeln('Security override code accepted.');
            term.writeln('Portal Unlocked...');
            EventBus.emit('level2-portal-unlocked');
            setTimeout(onClose, 1500);
          } else {
            term.writeln('Invalid override code.');
          }
          break;
        }
        case './extend_bridge.sh': {
          if (levelNumber === 4) {
            const node = currentDir.contents['extend_bridge.sh'];
            if (node && node.type === 'file') {
              if (node.permissions.includes('x')) {
                term.writeln('Executing extend_bridge.sh...');
                term.writeln('Bridge extended successfully.');
                EventBus.emit('bridge-extended');
                setTimeout(onClose, 1500);
              } else {
                term.writeln('bash: ./extend_bridge.sh: Permission denied');
              }
            } else {
              term.writeln('bash: ./extend_bridge.sh: No such file or directory');
            }
          } else {
            term.writeln(`Command not found: ${command}`);
          }
          break;
        }
        case './disable_robots.sh': {
           if (levelNumber === 2) {
              term.writeln('Permission denied. Try running with sudo.');
           } else {
              term.writeln(`Command not found: ${command}`);
           }
           break;
        }
        case 'clear':
          term.clear();
          break;
        case 'exit':
          onClose();
          break;
        case '':
          break;
        default:
          term.writeln(`Command not found: ${command}`);
          writeAIHint("Bzzzt! I don't recognize that command. Type 'help' to see what I can do!");
      }
    };

    term.onData((e) => {
      switch (e) {
        case '\r': // Enter
          term.write('\r\n');
          processCommand(input);
          input = '';
          prompt();
          break;
        case '\u007F': // Backspace (DEL)
          if (input.length > 0) {
            input = input.substring(0, input.length - 1);
            term.write('\b \b');
          }
          break;
        case '\u001b[A': // Up arrow
          if (history.length > 0 && historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            // Clear current input
            for (let i = 0; i < input.length; i++) term.write('\b \b');
            input = history[newIndex];
            term.write(input);
          }
          break;
        case '\u001b[B': // Down arrow
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            for (let i = 0; i < input.length; i++) term.write('\b \b');
            input = history[newIndex];
            term.write(input);
          } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            for (let i = 0; i < input.length; i++) term.write('\b \b');
            input = '';
          }
          break;
        default:
          if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
            input += e;
            term.write(e);
          }
      }
    });

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [onClose, level, levelNumber, vfs, cwd]);

  return (
    <div className="w-full h-full bg-black border-t-4 border-green-500 flex flex-col shadow-2xl relative">
      <div className="bg-zinc-900 text-green-500 px-4 py-2 flex justify-between items-center font-mono text-sm">
        <span>TERMINUS OS</span>
        <button onClick={onClose} className="hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-hidden" ref={terminalRef} />
    </div>
  );
};
