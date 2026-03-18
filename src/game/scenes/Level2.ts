import { Scene, Physics, GameObjects } from 'phaser';
import { EventBus } from '../../EventBus';
import { generatePixelTexture, SPRITES } from '../utils/textures';

export class Level2 extends Scene {
  private player!: Physics.Arcade.Sprite;
  private computer!: Physics.Arcade.Sprite;
  private robots!: Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactText!: GameObjects.Text;
  
  private isTerminalOpen: boolean = false;
  private isRobotsDisabled: boolean = false;
  private onTerminalClosed!: () => void;
  private onRobotsDisabled!: () => void;

  constructor() {
    super('Level2');
  }

  create() {
    localStorage.setItem('savedLevel', 'Level2');
    let currentHealth = this.registry.get('health');
    EventBus.emit('update-health', currentHealth || 9);

    const onPause = () => this.scene.pause();
    const onResume = () => this.scene.resume();
    EventBus.on('pause-game', onPause);
    EventBus.on('resume-game', onResume);

    this.cameras.main.setBackgroundColor('#8BC34A');
    const { width, height } = this.scale;

    // Ensure textures exist
    if (!this.textures || !this.textures.exists('crop')) generatePixelTexture(this, 'crop', SPRITES.crop, 4);
    if (!this.textures || !this.textures.exists('farmer')) generatePixelTexture(this, 'farmer', SPRITES.farmer, 4);
    if (!this.textures || !this.textures.exists('fence')) generatePixelTexture(this, 'fence', SPRITES.fence, 4);
    if (!this.textures || !this.textures.exists('portalUnlocked')) generatePixelTexture(this, 'portalUnlocked', SPRITES.portalUnlocked, 4);
    if (!this.textures || !this.textures.exists('computer')) generatePixelTexture(this, 'computer', SPRITES.computer, 4);
    if (!this.textures || !this.textures.exists('robot')) generatePixelTexture(this, 'robot', SPRITES.robot, 4);

    // Create a back portal
    const backPortal = this.physics.add.staticSprite(16, height / 2, 'portalUnlocked');
    this.add.text(60, height / 2 - 60, 'BACK', {
      fontSize: '20px', color: '#10b981', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    // Create safe zone (fences)
    const walls = this.physics.add.staticGroup();
    
    // Top and bottom boundaries
    for (let i = 0; i < width; i += 32) walls.create(i + 16, 16, 'fence');
    for (let i = 0; i < width; i += 32) walls.create(i + 16, height - 16, 'fence');
    
    // Safe zone box in the middle (with a small opening on the left)
    const safeZoneX = width / 2;
    const safeZoneY = height / 2;
    for (let i = -100; i <= 100; i += 32) {
      walls.create(safeZoneX + i, safeZoneY - 100, 'fence'); // Top wall of safe zone
      walls.create(safeZoneX + i, safeZoneY + 100, 'fence'); // Bottom wall of safe zone
    }
    for (let i = -100; i <= 100; i += 32) {
      walls.create(safeZoneX + 100, safeZoneY + i, 'fence'); // Right wall of safe zone
      if (i < -30 || i > 30) {
        walls.create(safeZoneX - 100, safeZoneY + i, 'fence'); // Left wall with opening
      }
    }

    // Computer inside safe zone
    this.computer = this.physics.add.staticSprite(safeZoneX, safeZoneY, 'computer');

    this.add.text(width / 2, 50, 'LEVEL 2: Security Breach', {
      fontSize: '32px', color: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, 90, 'Get to the safe zone and disable the robots!', {
      fontSize: '16px', color: '#ffffff'
    }).setOrigin(0.5);

    // Player
    this.player = this.physics.add.sprite(100, height / 2, 'farmer');
    this.player.setCollideWorldBounds(true);

    // Robots
    this.robots = this.physics.add.group();
    const robot1 = this.robots.create(width - 100, height / 4, 'robot');
    const robot2 = this.robots.create(width - 100, height * 3 / 4, 'robot');
    
    this.robots.children.iterate((child: any) => {
      child.setCollideWorldBounds(true);
      child.setBounce(1);
    });

    // Collisions
    this.physics.add.collider(this.player, walls);
    this.physics.add.collider(this.robots, walls);
    this.physics.add.collider(this.player, this.computer);
    this.physics.add.collider(this.robots, this.robots);

    // Robot hits player
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
          // Reset player position if caught
          this.player.setPosition(100, height / 2);
        }
      }
    });

    // Back portal overlap
    this.physics.add.overlap(this.player, backPortal, () => {
      if (!this.sys || !this.sys.isActive()) return;
      backPortal.destroy();
      this.scene.start('MainScene', { fromLevel2: true });
    });

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
      this.input.keyboard.removeCapture('SPACE');
    }

    // Interact Text
    this.interactText = this.add.text(safeZoneX, safeZoneY - 50, 'Press E to interact', {
      fontSize: '16px', color: '#ffffff', backgroundColor: '#000000', padding: { x: 5, y: 5 }
    }).setOrigin(0.5).setVisible(false);

    // Event Listeners
    this.onTerminalClosed = () => {
      this.isTerminalOpen = false;
    };
    EventBus.on('terminal-closed', this.onTerminalClosed);

    this.onRobotsDisabled = () => {
      if (!this.sys || !this.sys.isActive()) return;
      this.isRobotsDisabled = true;
      
      // Stop robots
      this.robots.children.iterate((child: any) => {
        child.setVelocity(0, 0);
        child.setTint(0x555555); // Gray out disabled robots
      });

      // Create next portal
      const nextPortal = this.physics.add.staticSprite(width - 50, height / 2, 'portalUnlocked');
      this.add.text(width - 50, height / 2 - 60, 'NEXT', {
        fontSize: '20px', color: '#10b981', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5);

      this.physics.add.overlap(this.player, nextPortal, () => {
        if (!this.sys || !this.sys.isActive()) return;
        nextPortal.destroy();
        this.scene.start('Level3');
      });
    };
    EventBus.on('robots-disabled', this.onRobotsDisabled);

    this.events.on('destroy', () => {
      EventBus.off('terminal-closed', this.onTerminalClosed);
      EventBus.off('robots-disabled', this.onRobotsDisabled);
      EventBus.off('pause-game', onPause);
      EventBus.off('resume-game', onResume);
    });
    this.events.on('shutdown', () => {
      EventBus.off('terminal-closed', this.onTerminalClosed);
      EventBus.off('robots-disabled', this.onRobotsDisabled);
      EventBus.off('pause-game', onPause);
      EventBus.off('resume-game', onResume);
    });
  }

  update() {
    if (this.isTerminalOpen) {
      this.player.setVelocity(0);
      return;
    }

    // Player Movement
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

    // Robot AI (chase player)
    if (!this.isRobotsDisabled) {
      this.robots.children.iterate((child: any) => {
        // Simple chase logic
        this.physics.moveToObject(child, this.player, 60);
      });
    }

    // Interaction logic
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.computer.x, this.computer.y);
    if (distance < 80) {
      this.interactText.setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.isTerminalOpen = true;
        this.interactText.setVisible(false);
        EventBus.emit('open-terminal', 'Level2');
      }
    } else {
      this.interactText.setVisible(false);
    }
  }
}
