import { BaseLevel } from './BaseLevel';
import { EventBus } from '../../EventBus';
import { generatePixelTexture, SPRITES } from '../utils/textures';

interface RobotSprite extends Phaser.Physics.Arcade.Sprite {
  health: number;
  healthBar: Phaser.GameObjects.Graphics;
}

export class Level2 extends BaseLevel {
  private robots!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private isRobotsDisabled: boolean = false;
  private areRobotsDead: boolean = false;

  constructor() {
    super('Level2', 2, 'Level3', 'MainScene', "Kill all robots first. Then use 'grep' in 'security_scripts/security_logs.txt' to find the ACCESS_CODE. Use 'unlock_portal [code]' to open the gate.");
  }

  protected customPreload() {
    generatePixelTexture(this, 'robot', SPRITES.robot, 4);
    generatePixelTexture(this, 'bullet', SPRITES.bullet, 4);
  }

  protected setupEventListeners() {
    EventBus.on('robots-disabled', this.handleRobotsDisabled, this);
    EventBus.on('level2-portal-unlocked', this.handlePortalUnlockAttempt, this);
  }

  private handleRobotsDisabled() {
    this.isRobotsDisabled = true;
    this.robots.children.iterate((child: any) => {
      const robot = child as RobotSprite;
      robot.setVelocity(0, 0);
      robot.setTint(0x555555);
      if (robot.healthBar) robot.healthBar.setVisible(false);
      return true;
    });
  }

  private handlePortalUnlockAttempt() {
    if (this.areRobotsDead || this.isRobotsDisabled) {
      this.unlockPortal();
    } else {
      // This shouldn't happen if the terminal logic is right, but good for safety
      // Maybe show a message that robots are still active
    }
  }

  protected cleanupEventListeners() {
    EventBus.off('robots-disabled', this.handleRobotsDisabled, this);
    EventBus.off('level2-portal-unlocked', this.handlePortalUnlockAttempt, this);
  }

  protected customCreate() {
    const { width, height } = this.scale;
    this.add.text(width / 2, 50, 'LEVEL 2: Security Breach', {
      fontSize: '32px', color: '#00ff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, 90, 'Click to shoot! (3 hits to destroy robots)', {
      fontSize: '16px', color: '#ffffff'
    }).setOrigin(0.5);

    // Bullets
    this.bullets = this.physics.add.group();

    // Robots
    this.robots = this.physics.add.group();
    this.createRobot(width - 100, height / 4);
    this.createRobot(width - 100, height * 3 / 4);

    // Shooting input
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isTerminalOpen) return;
      this.shoot(pointer.worldX, pointer.worldY);
    });

    // Collisions
    this.physics.add.overlap(this.player, this.robots, () => {
      if (!this.isRobotsDisabled) {
        let h = this.registry.get('health') || 9;
        h--;
        this.registry.set('health', h);
        localStorage.setItem('health', h.toString());
        EventBus.emit('update-health', h);

        if (h <= 0) {
          EventBus.emit('game-over');
          this.scene.pause();
        } else {
          this.player.setPosition(100, height / 2);
          this.cameras.main.flash(500, 255, 0, 0);
        }
      }
    });

    this.physics.add.overlap(this.bullets, this.robots, (bullet, robot) => {
      this.handleBulletHit(bullet as Phaser.Physics.Arcade.Sprite, robot as RobotSprite);
    });
  }

  private createRobot(x: number, y: number) {
    const robot = this.robots.create(x, y, 'robot') as RobotSprite;
    robot.setCollideWorldBounds(true);
    robot.setBounce(1);
    robot.health = 3;
    robot.healthBar = this.add.graphics();
    this.updateHealthBar(robot);
  }

  private updateHealthBar(robot: RobotSprite) {
    robot.healthBar.clear();
    if (robot.health <= 0 || !robot.active) return;

    const x = robot.x - 16;
    const y = robot.y - 24;
    const width = 32;
    const height = 6;

    // Background
    robot.healthBar.fillStyle(0x000000);
    robot.healthBar.fillRect(x, y, width, height);

    // Health (3 segments for 3 hearts)
    const segmentWidth = width / 3;
    robot.healthBar.fillStyle(0xff0000);
    for (let i = 0; i < robot.health; i++) {
      robot.healthBar.fillRect(x + (i * segmentWidth) + 1, y + 1, segmentWidth - 2, height - 2);
    }
  }

  private shoot(targetX: number, targetY: number) {
    const bullet = this.bullets.create(this.player.x, this.player.y, 'bullet') as Phaser.Physics.Arcade.Sprite;
    this.physics.moveTo(bullet, targetX, targetY, 400);
    
    // Destroy bullet after 2 seconds
    this.time.delayedCall(2000, () => {
      if (bullet.active) bullet.destroy();
    });
  }

  private handleBulletHit(bullet: Phaser.Physics.Arcade.Sprite, robot: RobotSprite) {
    bullet.destroy();
    if (this.isRobotsDisabled) return;

    robot.health--;
    this.updateHealthBar(robot);

    // Flash robot red
    robot.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      if (robot.active) robot.clearTint();
    });

    if (robot.health <= 0) {
      robot.healthBar.destroy();
      robot.destroy();
      
      // Check if all robots are destroyed
      if (this.robots.countActive() === 0) {
        this.areRobotsDead = true;
        this.add.text(this.scale.width / 2, 130, 'ROBOTS NEUTRALIZED. ACCESS TERMINAL.', {
          fontSize: '16px', color: '#ffff00'
        }).setOrigin(0.5);
      }
    }
  }

  protected customUpdate() {
    if (!this.isRobotsDisabled) {
      this.robots.children.iterate((child: any) => {
        const robot = child as RobotSprite;
        this.physics.moveToObject(robot, this.player, 60);
        this.updateHealthBar(robot);
        return true;
      });
    }
  }
}
