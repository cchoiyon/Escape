export interface VFSFile {
  type: 'file';
  content: string;
  permissions: string;
  hidden?: boolean;
}

export interface VFSDirectory {
  type: 'dir';
  contents: Record<string, VFSFile | VFSDirectory>;
  hidden?: boolean;
}

export type VFSNode = VFSFile | VFSDirectory;

export interface VFS {
  [path: string]: VFSNode;
}

export interface GameState {
  level: number;
  health: number;
  inventory: string[];
}
