import { Scene, Physics } from 'phaser';
import { EventBus } from '../../EventBus';
import { generatePixelTexture, SPRITES } from '../utils/textures';

export class Level2 extends Scene {
  private player!: Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;

  constructor() {
    super('Level2');
  }

  create() {
    this.cameras.main.setBackgroundColor('#8BC34A');
    const { width, height } = this.scale;

    // Ensure textures exist (they should from MainScene, but just in case)
    if (!this.textures || !this.textures.exists('crop')) {
      generatePixelTexture(this, 'crop', SPRITES.crop, 4);
    }
    if (!this.textures || !this.textures.exists('farmer')) {
      generatePixelTexture(this, 'farmer', SPRITES.farmer, 4);
    }

    // Create a farm plot
    for (let x = 200; x < 600; x += 40) {
      for (let y = 200; y < 400; y += 40) {
        this.add.sprite(x, y, 'crop');
      }
    }

    this.add.text(width / 2, 100, 'LEVEL 2: The Farm', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, 150, 'Walk right to finish', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.player = this.physics.add.sprite(50, height / 2, 'farmer');
    this.player.setCollideWorldBounds(true);
    // Allow walking off the right edge
    this.physics.world.setBounds(0, 0, width + 100, height);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
      });
    }
  }

  update() {
    const speed = 200;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) velocityX = -speed;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) velocityX = speed;

    if (this.cursors.up.isDown || this.wasd.up.isDown) velocityY = -speed;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) velocityY = speed;

    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.7071;
      velocityY *= 0.7071;
    }

    this.player.setVelocity(velocityX, velocityY);

    if (this.player.x > this.scale.width) {
      if (!this.sys || !this.sys.isActive()) return;
      EventBus.emit('game-won');
      this.scene.pause();
    }
  }
}
