import { BaseLevel } from './BaseLevel';
import { EventBus } from '../../EventBus';

export class Level5 extends BaseLevel {
  constructor() {
    super('Level5', 5, 'WON', 'Level4', "Use 'rm' to delete the corrupted file, then 'mv' to restore the backup. Restart the portal service.");
  }

  protected setupEventListeners() {
    EventBus.on('portal-repaired', this.unlockPortal, this);
  }

  protected cleanupEventListeners() {
    EventBus.off('portal-repaired', this.unlockPortal, this);
  }

  protected customCreate() {
    this.add.text(this.scale.width / 2, 50, 'LEVEL 5: System Restoration', {
      fontSize: '32px', color: '#00ff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    // Add some "sparking" effects around the portal
    this.time.addEvent({
      delay: 200,
      callback: () => {
        if (!this.isPortalUnlocked) {
          const spark = this.add.circle(this.portal.x + Phaser.Math.Between(-20, 20), this.portal.y + Phaser.Math.Between(-20, 20), 2, 0x00ffff);
          this.tweens.add({
            targets: spark,
            alpha: 0,
            scale: 2,
            duration: 500,
            onComplete: () => spark.destroy()
          });
        }
      },
      loop: true
    });
  }
}
