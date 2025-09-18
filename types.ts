
export interface Position {
  x: number;
  y: number;
}

export enum GameStatus {
  START_SCREEN,
  PLAYING,
  WAVE_IN_PROGRESS,
  GAME_OVER,
  VICTORY,
}

export interface GameState {
  status: GameStatus;
  wave: number;
  lives: number;
  money: number;
}

export interface EnemyType {
  name: string;
  hp: number;
  speed: number;
  reward: number;
  color: string;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  hp: number;
  position: Position;
  pathIndex: number;
}

export interface TowerType {
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number; // shots per second
  color: string;
  projectileColor: string;
  projectileSpeed: number;
}

export interface Tower {
  id: string;
  type: TowerType;
  position: Position;
  cooldown: number; // time until next shot
  targetId?: string;
}

export interface Projectile {
  id: string;
  tower: Tower;
  target: Enemy;
  position: Position;
}

export interface Wave {
  enemies: {
    type: EnemyType;
    count: number;
    spawnDelay: number; // ms between each enemy
  }[];
}
