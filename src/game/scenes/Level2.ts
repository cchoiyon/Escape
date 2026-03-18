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
    localStorage.setItem('savedLevel', 'Level2');
    this.cameras.main.setBackgroundColor('#8BC34A');
    const { width, height } = this.scale;

    // Ensure textures exist (they should from MainScene, but just in case)
    if (!this.textures || !this.textures.exists('crop')) {
      generatePixelTexture(this, 'crop', SPRITES.crop, 4);
    }
    if (!this.textures || !this.textures.exists('farmer')) {
      generatePixelTexture(this, 'farmer', SPRITES.farmer, 4);
    }
    if (!this.textures || !this.textures.exists('fence')) {
      generatePixelTexture(this, 'fence', SPRITES.fence, 4);
    }
    if (!this.textures || !this.textures.exists('portalUnlocked')) {
      generatePixelTexture(this, 'portalUnlocked', SPRITES.portalUnlocked, 4);
    }

    // Create a back portal
    const backPortal = this.physics.add.staticSprite(16, height / 2, 'portalUnlocked');
    this.add.text(60, height / 2 - 60, 'BACK', {
      fontSize: '20px',
      color: '#10b981',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Create obstacles (fences) to make it harder
    const walls = this.physics.add.staticGroup();
    
    // Top and bottom boundaries
    for (let i = 0; i < width; i += 32) walls.create(i + 16, 16, 'fence');
    for (let i = 0; i < width; i += 32) walls.create(i + 16, height - 16, 'fence');
    
    // Maze-like obstacles
    for (let i = 100; i < 400; i += 32) walls.create(300, i, 'fence');
    for (let i = 200; i < 500; i += 32) walls.create(500, i, 'fence');
    for (let i = 100; i < 400; i += 32) walls.create(700, i, 'fence');

    // Create a farm plot
    for (let x = 150; x < 750; x += 40) {
      for (let y = 100; y < 500; y += 40) {
        // Don't place crops on top of walls
        if (x !== 310 && x !== 510 && x !== 710) {
          this.add.sprite(x, y, 'crop');
        }
      }
    }

    this.add.text(width / 2, 50, 'LEVEL 2: The Farm', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, 90, 'Navigate the maze to finish', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.player = this.physics.add.sprite(100, height / 2, 'farmer');
    this.player.setCollideWorldBounds(true);
    // Allow walking off the right edge
    this.physics.world.setBounds(0, 0, width + 100, height);

    this.physics.add.collider(this.player, walls);

    // Back portal overlap
    this.physics.add.overlap(this.player, backPortal, () => {
      if (!this.sys || !this.sys.isActive()) return;
      backPortal.destroy();
      this.scene.start('MainScene', { fromLevel2: true });
    });

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
