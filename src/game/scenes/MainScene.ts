import { Scene, GameObjects, Physics } from 'phaser';
import { EventBus } from '../../EventBus';
import { generatePixelTexture, SPRITES } from '../utils/textures';

export class MainScene extends Scene {
  private player!: Physics.Arcade.Sprite;
  private computer!: Physics.Arcade.Sprite;
  private door!: Physics.Arcade.Sprite;
  private doorCollider!: Phaser.Physics.Arcade.Collider;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactText!: GameObjects.Text;
  private isTerminalOpen: boolean = false;
  private isDoorUnlocked: boolean = false;

  private onDoorUnlocked!: () => void;
  private onTerminalClosed!: () => void;

  constructor() {
    super('MainScene');
  }

  preload() {
    generatePixelTexture(this, 'farmer', SPRITES.farmer, 4);
    generatePixelTexture(this, 'fence', SPRITES.fence, 4);
    generatePixelTexture(this, 'portalLocked', SPRITES.portalLocked, 4);
    generatePixelTexture(this, 'portalUnlocked', SPRITES.portalUnlocked, 4);
    generatePixelTexture(this, 'computer', SPRITES.computer, 4);
  }

  create() {
    this.cameras.main.setBackgroundColor('#8BC34A'); // Grass green
    const { width, height } = this.scale;

    // Create Fences
    const walls = this.physics.add.staticGroup();
    // Top wall
    for (let i = 0; i < width; i += 32) walls.create(i + 16, 16, 'fence');
    // Bottom wall
    for (let i = 0; i < width; i += 32) walls.create(i + 16, height - 16, 'fence');
    // Left wall
    for (let i = 32; i < height - 32; i += 32) walls.create(16, i + 16, 'fence');
    // Right wall (with gap for door)
    for (let i = 32; i < height - 32; i += 32) {
      if (i < height / 2 - 48 || i > height / 2 + 48) {
        walls.create(width - 16, i + 16, 'fence');
      }
    }

    // Create Portal
    this.door = this.physics.add.staticSprite(width - 16, height / 2, 'portalLocked');

    // Create Computer
    this.computer = this.physics.add.staticSprite(width / 2, height / 2, 'computer');

    // Create Player
    this.player = this.physics.add.sprite(100, height / 2, 'farmer');
    this.player.setCollideWorldBounds(true);

    // Collisions
    this.physics.add.collider(this.player, walls);
    this.doorCollider = this.physics.add.collider(this.player, this.door);
    this.physics.add.collider(this.player, this.computer);

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
      });
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      
      // Prevent Phaser from swallowing the spacebar so it can be used in the terminal
      this.input.keyboard.removeCapture('SPACE');
    }

    // Interact Text
    this.interactText = this.add.text(width / 2, height / 2 - 50, 'Press E to interact', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setOrigin(0.5).setVisible(false);

    // Event Listeners from React
    this.onTerminalClosed = () => {
      this.isTerminalOpen = false;
    };
    EventBus.on('terminal-closed', this.onTerminalClosed);

    this.onDoorUnlocked = () => {
      if (!this.sys || !this.sys.isActive()) return;
      this.isDoorUnlocked = true;
      this.door.setTexture('portalUnlocked');
      this.physics.world.removeCollider(this.doorCollider);
      
      this.physics.add.overlap(this.player, this.door, () => {
        if (!this.sys || !this.sys.isActive()) return;
        this.door.destroy();
        this.scene.start('Level2');
      });

      // Add a visual cue for the exit
      this.add.text(width - 60, height / 2 - 60, 'ENTER', {
        fontSize: '20px',
        color: '#10b981',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
    };
    EventBus.on('door-unlocked', this.onDoorUnlocked);

    this.events.on('destroy', () => {
      EventBus.off('door-unlocked', this.onDoorUnlocked);
      EventBus.off('terminal-closed', this.onTerminalClosed);
    });
    this.events.on('shutdown', () => {
      EventBus.off('door-unlocked', this.onDoorUnlocked);
      EventBus.off('terminal-closed', this.onTerminalClosed);
    });
  }

  update() {
    if (this.isTerminalOpen) {
      this.player.setVelocity(0);
      return;
    }

    // Movement
    const speed = 200;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) velocityX = -speed;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) velocityX = speed;

    if (this.cursors.up.isDown || this.wasd.up.isDown) velocityY = -speed;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) velocityY = speed;

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.7071;
      velocityY *= 0.7071;
    }

    this.player.setVelocity(velocityX, velocityY);

    // Interaction logic
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.computer.x, this.computer.y);
    if (distance < 80) {
      this.interactText.setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.isTerminalOpen = true;
        this.interactText.setVisible(false);
        EventBus.emit('open-terminal');
      }
    } else {
      this.interactText.setVisible(false);
    }
  }
}
