import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    create() {
        // Read saved level from localStorage
        const savedLevel = localStorage.getItem('savedLevel');
        const savedHealth = localStorage.getItem('health');
        
        if (savedHealth) {
            this.registry.set('health', parseInt(savedHealth, 10));
        } else {
            this.registry.set('health', 9);
        }
        
        if (savedLevel && (savedLevel === 'MainScene' || savedLevel === 'Level2' || savedLevel === 'Level3')) {
            this.scene.start(savedLevel);
        } else {
            this.scene.start('MainScene');
        }
    }
}
