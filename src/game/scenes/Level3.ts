import { Scene } from 'phaser';

import { EventBus } from '../../EventBus';

export class Level3 extends Scene {
    constructor() {
        super('Level3');
    }

    create() {
        localStorage.setItem('savedLevel', 'Level3');
        let currentHealth = this.registry.get('health');
        EventBus.emit('update-health', currentHealth || 9);

        const onPause = () => this.scene.pause();
        const onResume = () => this.scene.resume();
        EventBus.on('pause-game', onPause);
        EventBus.on('resume-game', onResume);

        this.events.on('shutdown', () => {
            EventBus.off('pause-game', onPause);
            EventBus.off('resume-game', onResume);
        });
        this.events.on('destroy', () => {
            EventBus.off('pause-game', onPause);
            EventBus.off('resume-game', onResume);
        });

        this.cameras.main.setBackgroundColor('#000000');
        const { width, height } = this.scale;

        this.add.text(width / 2, height / 2 - 50, 'LEVEL 3', {
            fontSize: '48px',
            color: '#00ff00',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 20, 'Under Construction...', {
            fontSize: '24px',
            color: '#ffffff',
        }).setOrigin(0.5);

        // Allow walking back to Level 2
        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start('Level2');
        });
    }
}
