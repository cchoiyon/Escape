import { Scene, GameObjects, Physics } from 'phaser';
import { EventBus } from '../../EventBus';
import { generatePixelTexture, SPRITES } from '../utils/textures';

export abstract class BaseLevel extends Scene {
  protected player!: Physics.Arcade.Sprite;
  protected computer!: Physics.Arcade.Sprite;
  protected portal!: Physics.Arcade.Sprite;
  protected portalCollider!: Phaser.Physics.Arcade.Collider;
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected wasd!: any;
  protected interactKey!: Phaser.Input.Keyboard.Key;
  protected interactText!: GameObjects.Text;
  protected isTerminalOpen: boolean = false;
  protected isPortalUnlocked: boolean = false;
  protected levelNumber: number;
  protected nextScene: string;
  protected previousScene: string | null;
  protected hint: string;
  protected backPortal!: Physics.Arcade.Sprite;

  constructor(key: string, levelNumber: number, nextScene: string, previousScene: string | null = null, hint: string = "") {
    super(key);
    this.levelNumber = levelNumber;
    this.nextScene = nextScene;
    this.previousScene = previousScene;
    this.hint = hint;
  }

  preload() {
    generatePixelTexture(this, 'farmer', SPRITES.farmer, 4);
    generatePixelTexture(this, 'fence', SPRITES.fence, 4);
    generatePixelTexture(this, 'portalLocked', SPRITES.portalLocked, 4);
    generatePixelTexture(this, 'portalUnlocked', SPRITES.portalUnlocked, 4);
    generatePixelTexture(this, 'computer', SPRITES.computer, 4);
    this.customPreload();
  }

  protected customPreload() {}

  create() {
    localStorage.setItem('savedLevel', this.scene.key);
    const currentHealth = this.registry.get('health') || 9;
    EventBus.emit('update-health', currentHealth);

    const onPause = () => this.scene.pause();
    const onResume = () => this.scene.resume();
    EventBus.on('pause-game', onPause);
    EventBus.on('resume-game', onResume);

    this.cameras.main.setBackgroundColor('#1a1a1a');
    const { width, height } = this.scale;

    // Create Fences
    const walls = this.physics.add.staticGroup();
    this.createWalls(walls, width, height);

    // Create Portal (Exit)
    this.portal = this.physics.add.staticSprite(width - 48, height / 2, 'portalLocked');

    // Create Back Portal (Entrance)
    if (this.previousScene) {
      this.backPortal = this.physics.add.staticSprite(48, height / 2, 'portalUnlocked');
      this.physics.add.overlap(this.player, this.backPortal, () => {
        this.scene.start(this.previousScene!);
      });
      this.add.text(48, height / 2 - 60, 'BACK', {
        fontSize: '16px', color: '#666666'
      }).setOrigin(0.5);
    }

    // Create Computer
    this.computer = this.physics.add.staticSprite(width / 2, height / 2, 'computer');

    // Create Player
    this.player = this.physics.add.sprite(100, height / 2, 'farmer');
    this.player.setCollideWorldBounds(true);

    // Collisions
    this.physics.add.collider(this.player, walls);
    this.portalCollider = this.physics.add.collider(this.player, this.portal);
    this.physics.add.collider(this.player, this.computer);

    // Hint Button
    const hintBtn = this.add.text(width - 20, 20, '?', {
      fontSize: '24px', color: '#00ff00', backgroundColor: '#000000', padding: { x: 10, y: 5 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    
    hintBtn.on('pointerdown', () => {
      EventBus.emit('show-hint', this.hint);
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
    this.interactText = this.add.text(width / 2, height / 2 - 50, 'Press E to interact', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setOrigin(0.5).setVisible(false);

    // Event Listeners
    const onTerminalClosed = () => {
      this.isTerminalOpen = false;
    };
    EventBus.on('terminal-closed', onTerminalClosed);

    this.setupEventListeners();

    this.events.on('destroy', () => {
      this.cleanupEventListeners();
      EventBus.off('terminal-closed', onTerminalClosed);
      EventBus.off('pause-game', onPause);
      EventBus.off('resume-game', onResume);
    });
    this.events.on('shutdown', () => {
      this.cleanupEventListeners();
      EventBus.off('terminal-closed', onTerminalClosed);
      EventBus.off('pause-game', onPause);
      EventBus.off('resume-game', onResume);
    });

    this.customCreate();
  }

  protected createWalls(walls: Phaser.Physics.Arcade.StaticGroup, width: number, height: number) {
    // Default walls
    for (let i = 0; i < width; i += 32) walls.create(i + 16, 16, 'fence');
    for (let i = 0; i < width; i += 32) walls.create(i + 16, height - 16, 'fence');
    for (let i = 32; i < height - 32; i += 32) walls.create(16, i + 16, 'fence');
    for (let i = 32; i < height - 32; i += 32) {
      if (i < height / 2 - 48 || i > height / 2 + 48) {
        walls.create(width - 16, i + 16, 'fence');
      }
    }
  }

  protected abstract setupEventListeners(): void;
  protected abstract cleanupEventListeners(): void;
  protected customCreate() {}

  protected unlockPortal() {
    if (this.isPortalUnlocked) return;
    this.isPortalUnlocked = true;
    this.portal.setTexture('portalUnlocked');
    this.physics.world.removeCollider(this.portalCollider);
    
    this.physics.add.overlap(this.player, this.portal, () => {
      if (!this.sys || !this.sys.isActive()) return;
      if (this.nextScene === 'WON') {
        EventBus.emit('game-won');
      } else {
        this.scene.start(this.nextScene);
      }
    });

    this.add.text(this.portal.x, this.portal.y - 60, 'ENTER', {
      fontSize: '20px',
      color: '#10b981',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.cameras.main.shake(200, 0.01);
  }

  update() {
    if (this.isTerminalOpen) {
      this.player.setVelocity(0);
      return;
    }

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

    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.computer.x, this.computer.y);
    if (distance < 80) {
      this.interactText.setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.isTerminalOpen = true;
        this.interactText.setVisible(false);
        EventBus.emit('open-terminal', this.scene.key);
      }
    } else {
      this.interactText.setVisible(false);
    }

    this.customUpdate();
  }

  protected customUpdate() {}
}
