import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { EventBus } from '../EventBus';
import { X } from 'lucide-react';

interface TerminalProps {
  onClose: () => void;
  level: string;
}

export const Terminal = ({ onClose, level }: TerminalProps) => {
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

    const prompt = () => {
      term.write('\r\n$ ');
    };

    term.writeln('FARM-OS v1.0.4');
    term.writeln(`Connected to: ${level === 'Level2' ? 'SECURITY_TERMINAL' : 'MAIN_TERMINAL'}`);
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
          if (level === 'Level2') {
            term.writeln('  ./       - Execute a script');
          }
          break;
        case 'ls':
          if (level === 'Level2') {
            term.writeln('robot_logs.txt    disable_robots.sh');
          } else {
            term.writeln('farm_logs.txt    portal_config.conf');
          }
          break;
        case 'cat':
          if (level === 'Level2') {
            if (args[1] === 'robot_logs.txt') {
              term.writeln('WARNING: Security robots activated.');
              term.writeln('To disable, run the disable script with sudo.');
            } else if (args[1] === 'disable_robots.sh') {
              term.writeln('#!/bin/bash');
              term.writeln('echo "Disabling robots..."');
              term.writeln('systemctl stop robot-patrol');
            } else if (!args[1]) {
              term.writeln('cat: missing file operand');
            } else {
              term.writeln(`cat: ${args[1]}: No such file or directory`);
            }
          } else {
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
          }
          break;
        case 'sudo':
          if (level === 'Level2') {
            if (args[1] === './disable_robots.sh') {
              term.writeln('Executing disable_robots.sh...');
              term.writeln('Robots disabled successfully.');
              term.writeln('Access Granted. Next Portal Unlocked...');
              EventBus.emit('robots-disabled');
              setTimeout(() => {
                onClose();
              }, 1500);
            } else {
              term.writeln('sudo: command not found or unauthorized');
            }
          } else {
            if (args[1] === 'unlock') {
              term.writeln('Access Granted. Portal Unlocked...');
              EventBus.emit('door-unlocked');
              setTimeout(() => {
                onClose();
              }, 1500);
            } else {
              term.writeln('sudo: command not found or unauthorized');
            }
          }
          break;
        case './disable_robots.sh':
          if (level === 'Level2') {
            term.writeln('Permission denied. Try running with sudo.');
          } else {
            term.writeln(`Command not found: ${command}`);
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
  }, [onClose, level]);

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
