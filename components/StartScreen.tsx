
import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
      <div className="bg-gray-800 p-10 rounded-lg shadow-2xl text-center border-2 border-cyan-500">
        <h1 className="text-6xl font-bold text-cyan-400 mb-2">Gemini</h1>
        <h2 className="text-5xl font-bold text-white mb-8">Tower Defense</h2>
        <p className="text-lg text-gray-400 max-w-md mx-auto mb-10">
          Place your towers along the path to destroy the incoming waves of enemies before they reach the end.
        </p>
        <button
          onClick={onStart}
          className="px-12 py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-2xl rounded-lg shadow-lg
            transform hover:scale-105 transition-transform duration-200"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
