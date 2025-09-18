import type { Position, TowerType, EnemyType, Wave } from './types';

export const GRID_WIDTH = 24;
export const GRID_HEIGHT = 16;
export const CELL_SIZE = 40; // in pixels

export const GAME_TICK_RATE = 1000 / 60; // 60 FPS

export const PATH: Position[] = [
  { x: -1, y: 7 },
  { x: 2, y: 7 },
  { x: 2, y: 3 },
  { x: 6, y: 3 },
  { x: 6, y: 11 },
  { x: 10, y: 11 },
  { x: 10, y: 2 },
  { x: 17, y: 2 },
  { x: 17, y: 8 },
  { x: 21, y: 8 },
  { x: 21, y: 5 },
  { x: 24, y: 5 },
];

export const ENEMY_TYPES: { [key: string]: EnemyType } = {
  NORMAL: { name: 'Normal', hp: 100, speed: 1.5, reward: 10, color: 'bg-red-500' },
  FAST: { name: 'Fast', hp: 70, speed: 3, reward: 15, color: 'bg-yellow-400' },
  HEAVY: { name: 'Heavy', hp: 300, speed: 1, reward: 25, color: 'bg-blue-600' },
  BOSS: { name: 'Boss', hp: 5000, speed: 0.8, reward: 200, color: 'bg-purple-700' },
};

export const TOWER_TYPES: { [key: string]: TowerType } = {
  BASIC: { name: 'Gun Turret', cost: 100, damage: 20, range: 3, fireRate: 2, color: 'bg-cyan-500', projectileColor: 'bg-cyan-300', projectileSpeed: 10 },
  SNIPER: { name: 'Sniper Tower', cost: 250, damage: 100, range: 6, fireRate: 0.5, color: 'bg-green-500', projectileColor: 'bg-green-300', projectileSpeed: 20 },
  MACHINE_GUN: { name: 'Machine Gun', cost: 400, damage: 15, range: 2.5, fireRate: 8, color: 'bg-orange-500', projectileColor: 'bg-orange-300', projectileSpeed: 15 },
};

export const WAVES: Wave[] = [
  { enemies: [{ type: ENEMY_TYPES.NORMAL, count: 10, spawnDelay: 500 }] },
  { enemies: [{ type: ENEMY_TYPES.NORMAL, count: 15, spawnDelay: 400 }, { type: ENEMY_TYPES.FAST, count: 5, spawnDelay: 1000 }] },
  { enemies: [{ type: ENEMY_TYPES.HEAVY, count: 8, spawnDelay: 800 }, { type: ENEMY_TYPES.FAST, count: 10, spawnDelay: 500 }] },
  { enemies: [{ type: ENEMY_TYPES.HEAVY, count: 15, spawnDelay: 600 }, { type: ENEMY_TYPES.FAST, count: 5, spawnDelay: 1200 }] },
  { enemies: [{ type: ENEMY_TYPES.NORMAL, count: 50, spawnDelay: 200 }] },
  { enemies: [{ type: ENEMY_TYPES.BOSS, count: 1, spawnDelay: 1000 }] },
];

export const INITIAL_GAME_STATE = {
  lives: 20,
  money: 200,
};