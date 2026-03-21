import { BaseLevel } from './BaseLevel';
import { EventBus } from '../../EventBus';

export class MainScene extends BaseLevel {
  constructor() {
    super('MainScene', 1, 'Level2', null, "Try listing files with 'ls' and reading them with 'cat'. Look for an unlock command.");
  }

  protected setupEventListeners() {
    EventBus.on('door-unlocked', this.unlockPortal, this);
  }

  protected cleanupEventListeners() {
    EventBus.off('door-unlocked', this.unlockPortal, this);
  }

  protected customCreate() {
    this.add.text(this.scale.width / 2, 50, 'LEVEL 1: The Awakening', {
      fontSize: '32px', color: '#00ff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);
  }
}
