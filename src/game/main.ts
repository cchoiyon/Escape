import { AUTO, Game } from 'phaser';
import { Boot } from './scenes/Boot';
import { MainScene } from './scenes/MainScene';
import { Level2 } from './scenes/Level2';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#8BC34A',
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
        Level2
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
