
import React from 'react';

interface VictoryScreenProps {
  onRestart: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
      <div className="bg-gray-800 p-10 rounded-lg shadow-2xl text-center border-2 border-yellow-400">
        <h1 className="text-6xl font-bold text-yellow-400 mb-4">Victory!</h1>
        <p className="text-2xl text-gray-300 mb-8">You have defeated all the waves and defended the base!</p>
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-xl rounded-lg shadow-lg
            transform hover:scale-105 transition-transform duration-200"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default VictoryScreen;
