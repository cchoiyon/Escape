import { Scene } from 'phaser';

export const PALETTE: Record<string, number> = {
  'W': 0x8B5A2B, // Wood
  'D': 0x5C3A21, // Dark Wood
  'G': 0x4CAF50, // Grass
  'L': 0x8BC34A, // Light Grass
  'R': 0xF44336, // Red
  'E': 0x4CAF50, // Green (for unlocked)
  'B': 0x1976D2, // Blue
  'S': 0xFFCC80, // Skin
  'H': 0xFFEB3B, // Hat
  'K': 0x000000, // Black
  'M': 0x9E9E9E, // Gray
  'C': 0x607D8B, // Dark Gray
  'P': 0x795548, // Dirt
  'O': 0xFF9800, // Orange
  'T': 0x388E3C  // Dark Green
};

export function generatePixelTexture(scene: Scene, key: string, data: string[], pixelSize: number = 4) {
  if (!scene.textures || scene.textures.exists(key)) return;
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      const char = data[y][x];
      if (char !== '.' && PALETTE[char] !== undefined) {
        graphics.fillStyle(PALETTE[char]);
        graphics.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
  graphics.generateTexture(key, data[0].length * pixelSize, data.length * pixelSize);
  graphics.destroy();
}

export const SPRITES = {
  farmer: [
    "...HHHH...",
    "..HHHHHH..",
    "...SSSS...",
    "...SKSK...",
    "...RRRR...",
    "..BRRRRB..",
    "..BBBBBB..",
    "..B.BB.B..",
    "..K....K.."
  ],
  fence: [
    "........",
    "..W..W..",
    "WWWWWWWW",
    "..W..W..",
    "WWWWWWWW",
    "..W..W..",
    "..W..W..",
    "........"
  ],
  portalLocked: [
    "........",
    "........",
    "........",
    "...RR...",
    "..RRRR..",
    ".RR..RR.",
    ".RR..RR.",
    "RR....RR",
    "RR....RR",
    "RR....RR",
    "RR....RR",
    "RR....RR",
    "RR....RR",
    "RR....RR",
    "RR....RR",
    "RR....RR",
    "RR....RR",
    ".RR..RR.",
    ".RR..RR.",
    "..RRRR..",
    "...RR...",
    "........",
    "........",
    "........"
  ],
  portalUnlocked: [
    "........",
    "........",
    "........",
    "...EE...",
    "..EEEE..",
    ".EE..EE.",
    ".EE..EE.",
    "EE....EE",
    "EE....EE",
    "EE....EE",
    "EE....EE",
    "EE....EE",
    "EE....EE",
    "EE....EE",
    "EE....EE",
    "EE....EE",
    "EE....EE",
    ".EE..EE.",
    ".EE..EE.",
    "..EEEE..",
    "...EE...",
    "........",
    "........",
    "........"
  ],
  computer: [
    "........",
    ".MMMMMM.",
    ".MKKKKM.",
    ".MKKKKM.",
    ".MMMMMM.",
    "...MM...",
    ".WWWWWW.",
    ".WWWWWW."
  ],
  crop: [
    "........",
    "...TT...",
    "..TTTT..",
    "...TT...",
    "...TT...",
    "..PPPP..",
    ".PPPPPP.",
    "........"
  ],
  robot: [
    "........",
    "..MMMM..",
    ".MRRMRM.",
    ".MMMMMM.",
    "..MMMM..",
    ".M.MM.M.",
    ".M.MM.M.",
    "...MM...",
    "..M..M.."
  ],
  bullet: [
    "........",
    "........",
    "........",
    "...OO...",
    "...OO...",
    "........",
    "........",
    "........"
  ]
};
