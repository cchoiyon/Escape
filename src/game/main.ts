import { AUTO, Game } from 'phaser';
import { Boot } from './scenes/Boot';
import { MainScene } from './scenes/MainScene';
import { Level2 } from './scenes/Level2';
import { Level3 } from './scenes/Level3';
import { Level4 } from './scenes/Level4';
import { Level5 } from './scenes/Level5';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a1a1a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [
        Boot,
        MainScene,
        Level2,
        Level3,
        Level4,
        Level5
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
