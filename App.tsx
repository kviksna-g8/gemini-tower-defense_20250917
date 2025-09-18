import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './components/GameBoard';
import GameUI from './components/GameUI';
import GameOverScreen from './components/GameOverScreen';
import StartScreen from './components/StartScreen';
import VictoryScreen from './components/VictoryScreen';
import type { GameState, Tower, Enemy, Projectile, Position, TowerType } from './types';
import { GameStatus } from './types';
import { GRID_WIDTH, GRID_HEIGHT, TOWER_TYPES, PATH, WAVES, INITIAL_GAME_STATE, GAME_TICK_RATE } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.START_SCREEN,
    wave: 0,
    lives: INITIAL_GAME_STATE.lives,
    money: INITIAL_GAME_STATE.money,
  });
  const [towers, setTowers] = useState<Tower[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  
  const spawnState = useRef({
    groupIndex: 0,
    spawnedInGroup: 0,
    nextSpawnTime: 0,
  });
  // Fix: The return type of `setInterval` in the browser is `number`, not `NodeJS.Timeout`.
  const gameLoopRef = useRef<number>();

  const resetGame = useCallback(() => {
    setGameState({
      status: GameStatus.PLAYING,
      wave: 0,
      lives: INITIAL_GAME_STATE.lives,
      money: INITIAL_GAME_STATE.money,
    });
    setTowers([]);
    setEnemies([]);
    setProjectiles([]);
    setSelectedTowerType(null);
    spawnState.current = { groupIndex: 0, spawnedInGroup: 0, nextSpawnTime: 0 };
  }, []);

  const handleStartGame = () => {
    resetGame();
  };

  const handlePlaceTower = useCallback((gridPos: Position) => {
    if (!selectedTowerType || gameState.money < selectedTowerType.cost) return;

    const isOccupied = towers.some(t => t.position.x === gridPos.x && t.position.y === gridPos.y);
    if (isOccupied) return;

    // A simple check to prevent blocking the path, more complex logic would be needed for dynamic paths
    const isPath = PATH.some((p, i) => {
      if (i === PATH.length - 1) return false;
      const p2 = PATH[i+1];
      return (gridPos.x >= Math.min(p.x, p2.x) && gridPos.x <= Math.max(p.x, p2.x) && gridPos.y >= Math.min(p.y, p2.y) && gridPos.y <= Math.max(p.y, p2.y));
    });

    if (isPath) return;

    const newTower: Tower = {
      id: `tower-${Date.now()}`,
      type: selectedTowerType,
      position: gridPos,
      cooldown: 0,
    };
    setTowers(prev => [...prev, newTower]);
    setGameState(prev => ({ ...prev, money: prev.money - selectedTowerType.cost! }));
    setSelectedTowerType(null);
  }, [selectedTowerType, gameState.money, towers]);

  const startNextWave = useCallback(() => {
    if (gameState.wave >= WAVES.length) {
        setGameState(prev => ({ ...prev, status: GameStatus.VICTORY }));
        return;
    }
    
    // Reset spawn state for the new wave
    spawnState.current = {
        groupIndex: 0,
        spawnedInGroup: 0,
        nextSpawnTime: Date.now(), // Start spawning immediately
    };

    setGameState(prev => ({ ...prev, status: GameStatus.WAVE_IN_PROGRESS, wave: prev.wave + 1 }));
  }, [gameState.wave]);

  const gameLoop = useCallback(() => {
    const now = Date.now();
    // Enemy Spawning
    if (gameState.status === GameStatus.WAVE_IN_PROGRESS) {
      const currentWaveData = WAVES[gameState.wave - 1];
      // Check if there are still groups to spawn from
      if (currentWaveData && spawnState.current.groupIndex < currentWaveData.enemies.length) {
        if (now >= spawnState.current.nextSpawnTime) {
          const currentGroup = currentWaveData.enemies[spawnState.current.groupIndex];

          // Spawn one enemy from the current group
          const newEnemy: Enemy = {
            id: `enemy-${gameState.wave}-${currentGroup.type.name}-${spawnState.current.spawnedInGroup}`,
            type: currentGroup.type,
            hp: currentGroup.type.hp,
            position: { ...PATH[0] },
            pathIndex: 0,
          };
          setEnemies(prev => [...prev, newEnemy]);

          // Update spawn state for the next enemy in this group
          spawnState.current.spawnedInGroup++;
          spawnState.current.nextSpawnTime = now + currentGroup.spawnDelay;

          // If the current group is finished, move to the next group
          if (spawnState.current.spawnedInGroup >= currentGroup.count) {
            spawnState.current.groupIndex++;
            spawnState.current.spawnedInGroup = 0;
          }
        }
      }
    }


    // Enemy Movement
    const newEnemies = enemies.map(enemy => {
      const nextWaypoint = PATH[enemy.pathIndex + 1];
      if (!nextWaypoint) return { ...enemy, reachedEnd: true };
      
      const dx = nextWaypoint.x - enemy.position.x;
      const dy = nextWaypoint.y - enemy.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const moveDistance = (enemy.type.speed * GAME_TICK_RATE) / 1000;

      if (distance < moveDistance) {
        return { ...enemy, position: nextWaypoint, pathIndex: enemy.pathIndex + 1 };
      } else {
        return { ...enemy, position: {
          x: enemy.position.x + (dx / distance) * moveDistance,
          y: enemy.position.y + (dy / distance) * moveDistance,
        }};
      }
    }).filter(e => e); // filter out undefined

    let livesLost = 0;
    const survivingEnemies = newEnemies.filter(e => {
      if (e.pathIndex >= PATH.length - 1) {
        livesLost++;
        return false;
      }
      return true;
    });

    if (livesLost > 0) {
      setGameState(prev => ({ ...prev, lives: Math.max(0, prev.lives - livesLost) }));
    }

    // Tower Actions
    const newProjectiles: Projectile[] = [...projectiles];
    const updatedTowers = towers.map(tower => {
      let newCooldown = Math.max(0, tower.cooldown - GAME_TICK_RATE);
      if (newCooldown === 0) {
        const enemiesInRange = survivingEnemies.filter(enemy => {
          const dx = enemy.position.x - tower.position.x;
          const dy = enemy.position.y - tower.position.y;
          return Math.sqrt(dx * dx + dy * dy) <= tower.type.range;
        });

        if (enemiesInRange.length > 0) {
          const target = enemiesInRange[0];
          newProjectiles.push({
            id: `proj-${Date.now()}-${Math.random()}`,
            tower: tower,
            target: target,
            position: { ...tower.position },
          });
          newCooldown = 1000 / tower.type.fireRate;
        }
      }
      return { ...tower, cooldown: newCooldown };
    });

    // Projectile Movement & Damage
    let moneyGained = 0;
    const tempEnemies = [...survivingEnemies];

    const updatedProjectiles = newProjectiles.filter(p => {
      const target = tempEnemies.find(e => e.id === p.target.id);
      if (!target) return false; // Target is gone

      const dx = target.position.x - p.position.x;
      const dy = target.position.y - p.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const moveDistance = (p.tower.type.projectileSpeed * GAME_TICK_RATE) / 1000;

      if (distance < moveDistance) {
        // Hit
        target.hp -= p.tower.type.damage;
        if (target.hp <= 0) {
            moneyGained += target.type.reward;
            const index = tempEnemies.findIndex(e => e.id === target.id);
            if (index !== -1) tempEnemies.splice(index, 1);
        }
        return false;
      } else {
        p.position.x += (dx / distance) * moveDistance;
        p.position.y += (dy / distance) * moveDistance;
        return true;
      }
    });

    if (moneyGained > 0) {
      setGameState(prev => ({...prev, money: prev.money + moneyGained }));
    }

    setEnemies(tempEnemies);
    setTowers(updatedTowers);
    setProjectiles(updatedProjectiles);

    // Check for wave end
    const isSpawningFinished = !WAVES[gameState.wave - 1] || spawnState.current.groupIndex >= WAVES[gameState.wave - 1].enemies.length;
    
    if (gameState.status === GameStatus.WAVE_IN_PROGRESS && tempEnemies.length === 0 && isSpawningFinished) {
        if (gameState.wave === WAVES.length) {
            setGameState(prev => ({ ...prev, status: GameStatus.VICTORY }));
        } else {
            setGameState(prev => ({ ...prev, status: GameStatus.PLAYING }));
        }
    }
  }, [enemies, towers, projectiles, gameState.status, gameState.wave]);

  useEffect(() => {
    if (gameState.status === GameStatus.WAVE_IN_PROGRESS || enemies.length > 0 || projectiles.length > 0) {
        gameLoopRef.current = setInterval(gameLoop, GAME_TICK_RATE);
    }
    
    return () => {
        if(gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
  }, [gameState.status, gameLoop, enemies.length, projectiles.length]);
  
  useEffect(() => {
    if (gameState.lives <= 0) {
        setGameState(prev => ({ ...prev, status: GameStatus.GAME_OVER }));
    }
  }, [gameState.lives]);

  const renderGameContent = () => {
    switch (gameState.status) {
      case GameStatus.START_SCREEN:
        return <StartScreen onStart={handleStartGame} />;
      case GameStatus.GAME_OVER:
        return <GameOverScreen onRestart={handleStartGame} wave={gameState.wave} />;
      case GameStatus.VICTORY:
        return <VictoryScreen onRestart={handleStartGame} />;
      default:
        return (
          <>
            <GameBoard 
              towers={towers} 
              enemies={enemies} 
              projectiles={projectiles}
              onPlaceTower={handlePlaceTower}
              selectedTowerType={selectedTowerType}
            />
            <GameUI
              gameState={gameState}
              selectedTowerType={selectedTowerType}
              onSelectTowerType={setSelectedTowerType}
              onStartWave={startNextWave}
            />
          </>
        );
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-900 text-white flex items-center justify-center font-mono select-none">
        <div className="relative" style={{width: GRID_WIDTH * 40, height: GRID_HEIGHT * 40}}>
            {renderGameContent()}
        </div>
    </div>
  );
};

export default App;
