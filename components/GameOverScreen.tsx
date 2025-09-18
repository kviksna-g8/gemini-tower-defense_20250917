
import React from 'react';

interface GameOverScreenProps {
  wave: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ wave, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
      <div className="bg-gray-800 p-10 rounded-lg shadow-2xl text-center border-2 border-red-500">
        <h1 className="text-6xl font-bold text-red-500 mb-4">Game Over</h1>
        <p className="text-2xl text-gray-300 mb-8">You survived until wave <span className="font-bold text-white">{wave}</span>.</p>
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xl rounded-lg shadow-lg
            transform hover:scale-105 transition-transform duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
