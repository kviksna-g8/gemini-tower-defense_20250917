
import React, { useState } from 'react';
import type { Tower, Enemy, Projectile, Position, TowerType } from '../types';
import { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, PATH } from '../constants';

interface GameBoardProps {
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  onPlaceTower: (position: Position) => void;
  selectedTowerType: TowerType | null;
}

const EnemyComponent: React.FC<{ enemy: Enemy }> = ({ enemy }) => {
  const { position, type, hp } = enemy;
  const healthPercentage = (hp / type.hp) * 100;

  return (
    <div
      className="absolute"
      style={{
        left: position.x * CELL_SIZE,
        top: position.y * CELL_SIZE,
        width: CELL_SIZE,
        height: CELL_SIZE,
        transition: `all ${1000/60}ms linear`,
      }}
    >
      <div className={`w-full h-full rounded-full ${type.color} transform scale-75`}></div>
      {/* Health bar */}
      <div className="absolute -top-1 w-full h-1 bg-gray-600 rounded">
        <div className="h-full bg-green-500 rounded" style={{ width: `${healthPercentage}%` }}></div>
      </div>
    </div>
  );
};

const TowerComponent: React.FC<{ tower: Tower }> = ({ tower }) => {
  const { position, type } = tower;
  return (
    <div
      className={`absolute flex items-center justify-center ${type.color} border-2 border-gray-400`}
      style={{
        left: position.x * CELL_SIZE,
        top: position.y * CELL_SIZE,
        width: CELL_SIZE,
        height: CELL_SIZE,
      }}
    >
      <div className="w-1/2 h-1/2 bg-gray-700"></div>
    </div>
  );
};

const ProjectileComponent: React.FC<{ projectile: Projectile }> = ({ projectile }) => {
  const { position, tower } = projectile;
  return (
    <div
      className={`absolute rounded-full ${tower.type.projectileColor}`}
      style={{
        left: position.x * CELL_SIZE + CELL_SIZE / 2 - 4,
        top: position.y * CELL_SIZE + CELL_SIZE / 2 - 4,
        width: 8,
        height: 8,
        transition: `all ${1000/60}ms linear`,
      }}
    ></div>
  );
};

const PathCanvas: React.FC = React.memo(() => {
  return (
    <canvas
      id="path-canvas"
      width={GRID_WIDTH * CELL_SIZE}
      height={GRID_HEIGHT * CELL_SIZE}
      className="absolute top-0 left-0 pointer-events-none"
      ref={canvasRef => {
        if (!canvasRef) return;
        const ctx = canvasRef.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
        ctx.strokeStyle = '#4A5568'; // gray-700
        ctx.lineWidth = CELL_SIZE * 0.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        const startPointX = (PATH[0].x + 0.5) * CELL_SIZE;
        const startPointY = (PATH[0].y + 0.5) * CELL_SIZE;
        ctx.moveTo(startPointX, startPointY);
        
        PATH.slice(1).forEach(point => {
           const pointX = (point.x + 0.5) * CELL_SIZE;
           const pointY = (point.y + 0.5) * CELL_SIZE;
           ctx.lineTo(pointX, pointY);
        });
        ctx.stroke();
      }}
    />
  );
});


const GameBoard: React.FC<GameBoardProps> = ({ towers, enemies, projectiles, onPlaceTower, selectedTowerType }) => {
  const [mousePos, setMousePos] = useState<Position | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  }

  const handleClick = () => {
    if (mousePos) {
      onPlaceTower(mousePos);
    }
  };

  return (
    <div
      className="relative bg-gray-800 border-2 border-gray-600 overflow-hidden"
      style={{
        width: GRID_WIDTH * CELL_SIZE,
        height: GRID_HEIGHT * CELL_SIZE,
        cursor: selectedTowerType ? 'pointer' : 'default'
      }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <PathCanvas />
      
      {/* Grid Lines */}
      {Array.from({ length: GRID_WIDTH -1 }).map((_, i) => (
        <div key={`v-${i}`} className="absolute bg-gray-700/50" style={{ left: (i + 1) * CELL_SIZE, top: 0, width: 1, height: '100%' }} />
      ))}
      {Array.from({ length: GRID_HEIGHT - 1 }).map((_, i) => (
        <div key={`h-${i}`} className="absolute bg-gray-700/50" style={{ left: 0, top: (i + 1) * CELL_SIZE, height: 1, width: '100%' }} />
      ))}
      
      {towers.map(tower => <TowerComponent key={tower.id} tower={tower} />)}
      {enemies.map(enemy => <EnemyComponent key={enemy.id} enemy={enemy} />)}
      {projectiles.map(projectile => <ProjectileComponent key={projectile.id} projectile={projectile} />)}

      {/* Tower Placement Preview */}
      {selectedTowerType && mousePos && (
        <>
            <div className="absolute bg-white/20" style={{
                left: mousePos.x * CELL_SIZE,
                top: mousePos.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
            }} />
            <div className="absolute rounded-full border-2 border-dashed border-white/50 pointer-events-none" style={{
                left: (mousePos.x + 0.5 - selectedTowerType.range) * CELL_SIZE,
                top: (mousePos.y + 0.5 - selectedTowerType.range) * CELL_SIZE,
                width: selectedTowerType.range * 2 * CELL_SIZE,
                height: selectedTowerType.range * 2 * CELL_SIZE,
            }} />
        </>
      )}
    </div>
  );
};

export default GameBoard;
