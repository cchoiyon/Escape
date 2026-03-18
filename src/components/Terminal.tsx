import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { EventBus } from '../EventBus';
import { X } from 'lucide-react';

interface TerminalProps {
  onClose: () => void;
}

export const Terminal = ({ onClose }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

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
    
    // Use ResizeObserver to fit the terminal when its container changes size (e.g., during animation)
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

    // Initial fit and focus after a short delay to ensure DOM is ready
    setTimeout(() => {
      try {
        if (terminalRef.current && terminalRef.current.clientWidth > 0) {
          fitAddon.fit();
          term.focus();
        }
      } catch (e) {}
    }, 50);

    xtermRef.current = term;

    const prompt = () => {
      term.write('\r\n$ ');
    };

    term.writeln('FARM-OS v1.0.4');
    term.writeln('Type "help" for a list of commands.');
    prompt();

    let input = '';

    const processCommand = (cmd: string) => {
      const args = cmd.trim().split(' ');
      const command = args[0].toLowerCase();

      switch (command) {
        case 'help':
          term.writeln('Available commands:');
          term.writeln('  ls       - List directory contents');
          term.writeln('  cat      - Read file contents');
          term.writeln('  clear    - Clear terminal screen');
          term.writeln('  exit     - Close terminal');
          break;
        case 'ls':
          term.writeln('farm_logs.txt    portal_config.conf');
          break;
        case 'cat':
          if (args[1] === 'portal_config.conf') {
            term.writeln('PORTAL_STATUS=LOCKED');
            term.writeln('EMERGENCY_OVERRIDE_CMD=sudo unlock');
          } else if (args[1] === 'farm_logs.txt') {
            term.writeln('Day 1: Planted parsnips.');
            term.writeln('Day 2: Watered crops. Found a locked portal.');
            term.writeln('Day 3: Need to find a way to open the portal.');
          } else if (!args[1]) {
            term.writeln('cat: missing file operand');
          } else {
            term.writeln(`cat: ${args[1]}: No such file or directory`);
          }
          break;
        case 'sudo':
          if (args[1] === 'unlock') {
            term.writeln('Access Granted. Portal Unlocked...');
            EventBus.emit('door-unlocked');
            setTimeout(() => {
              onClose();
            }, 1500);
          } else {
            term.writeln('sudo: command not found or unauthorized');
          }
          break;
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
        default:
          // Only allow printable characters
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
  }, [onClose]);

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
