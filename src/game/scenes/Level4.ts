import { BaseLevel } from './BaseLevel';
import { EventBus } from '../../EventBus';

export class Level4 extends BaseLevel {
  private bridge!: Phaser.GameObjects.Rectangle;
  private bridgeCollider!: Phaser.Physics.Arcade.Collider;

  constructor() {
    super('Level4', 4, 'Level5', 'Level3', "Use 'ls -l' to check permissions. Use 'chmod +x' to make the bridge script executable.");
  }

  protected setupEventListeners() {
    EventBus.on('bridge-extended', this.extendBridge, this);
  }

  protected cleanupEventListeners() {
    EventBus.off('bridge-extended', this.extendBridge, this);
  }

  protected customCreate() {
    const { width, height } = this.scale;
    const title = this.add.text(width / 2, 50, 'LEVEL 4: The Permissions Lock', {
      fontSize: '32px', color: '#00ff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);
    title.setDepth(100);

    // Create a gap (lava/void)
    this.add.rectangle(width * 0.75, height / 2, 100, height, 0x330000);
    
    // Create retracted bridge (invisible/no collision initially)
    this.bridge = this.add.rectangle(width * 0.75, height / 2, 100, 64, 0x666666).setVisible(false);
    
    // Move portal behind the gap
    this.portal.setPosition(width - 48, height / 2);
    
    // Add a collider that prevents crossing the gap unless bridge is extended
    const invisibleWall = this.physics.add.staticGroup();
    const wall = invisibleWall.add(this.add.rectangle(width * 0.75, height / 2, 10, height).setVisible(false));
    this.bridgeCollider = this.physics.add.collider(this.player, wall);
  }

  private extendBridge() {
    this.bridge.setVisible(true);
    this.physics.world.removeCollider(this.bridgeCollider);
    this.unlockPortal();
    this.add.text(this.scale.width * 0.75, this.scale.height / 2 - 50, 'BRIDGE EXTENDED', {
      fontSize: '16px', color: '#00ff00'
    }).setOrigin(0.5);
  }
}
