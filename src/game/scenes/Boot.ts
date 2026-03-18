import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    create() {
        // Read saved level from localStorage
        const savedLevel = localStorage.getItem('savedLevel');
        
        if (savedLevel && (savedLevel === 'MainScene' || savedLevel === 'Level2')) {
            this.scene.start(savedLevel);
        } else {
            this.scene.start('MainScene');
        }
    }
}
