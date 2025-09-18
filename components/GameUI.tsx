
import React from 'react';
import type { GameState, TowerType } from '../types';
import { GameStatus } from '../types';
import { TOWER_TYPES } from '../constants';

interface GameUIProps {
  gameState: GameState;
  selectedTowerType: TowerType | null;
  onSelectTowerType: (type: TowerType | null) => void;
  onStartWave: () => void;
}

const StatDisplay: React.FC<{ label: string; value: string | number; icon: string }> = ({ label, value, icon }) => (
    <div className="flex items-center space-x-2 bg-gray-800/50 p-2 rounded-md">
        <span className="text-xl text-cyan-400">{icon}</span>
        <div>
            <div className="text-xs text-gray-400">{label}</div>
            <div className="font-bold text-lg">{value}</div>
        </div>
    </div>
);


const GameUI: React.FC<GameUIProps> = ({ gameState, selectedTowerType, onSelectTowerType, onStartWave }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-4 flex flex-col justify-between">
      {/* Top Stats */}
      <div className="flex justify-between w-full">
        <div className="flex space-x-4">
            <StatDisplay label="Money" value={`$${gameState.money}`} icon="💰" />
            <StatDisplay label="Lives" value={gameState.lives} icon="❤️" />
        </div>
        <StatDisplay label="Wave" value={gameState.wave} icon="🌊" />
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-between items-end w-full pointer-events-auto">
        {/* Tower Selection */}
        <div className="flex space-x-2 p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-600">
          {Object.values(TOWER_TYPES).map(type => {
            const isSelected = selectedTowerType?.name === type.name;
            const canAfford = gameState.money >= type.cost;
            return (
              <button
                key={type.name}
                onClick={() => onSelectTowerType(isSelected ? null : type)}
                disabled={!canAfford}
                className={`w-24 h-24 p-2 rounded-md flex flex-col items-center justify-center text-center border-2 transition-all duration-200
                    ${isSelected ? 'border-cyan-400 bg-cyan-500/30' : 'border-gray-500 hover:border-cyan-500'}
                    ${canAfford ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}
                `}
              >
                <div className={`w-8 h-8 ${type.color} mb-1 border border-gray-400`}></div>
                <div className="text-xs font-bold">{type.name}</div>
                <div className="text-xs text-yellow-400">${type.cost}</div>
              </button>
            );
          })}
        </div>
        
        {/* Start Wave Button */}
        <button
          onClick={onStartWave}
          disabled={gameState.status === GameStatus.WAVE_IN_PROGRESS}
          className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-xl rounded-lg shadow-lg
            transform hover:scale-105 transition-transform duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
        >
          {gameState.status === GameStatus.WAVE_IN_PROGRESS ? `Wave ${gameState.wave} in Progress` : `Start Wave ${gameState.wave + 1}`}
        </button>
      </div>
    </div>
  );
};

export default GameUI;
