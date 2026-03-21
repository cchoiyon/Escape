import { BaseLevel } from './BaseLevel';
import { EventBus } from '../../EventBus';

export class Level3 extends BaseLevel {
  constructor() {
    super('Level3', 3, 'Level4', 'Level2', "Use 'ls -a' to find hidden files. Use 'grep' to find the passcode in the hidden system file.");
  }

  protected setupEventListeners() {
    EventBus.on('portal-activated', this.unlockPortal, this);
  }

  protected cleanupEventListeners() {
    EventBus.off('portal-activated', this.unlockPortal, this);
  }

  protected customCreate() {
    this.add.text(this.scale.width / 2, 50, 'LEVEL 3: The Hidden Truth', {
      fontSize: '32px', color: '#00ff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);
    
    this.cameras.main.setBackgroundColor('#050505'); // Dark room
  }
}
