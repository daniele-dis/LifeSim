// src/components/GameSlotsScreen.jsx

import React, { useContext } from 'react'; // <--- Aggiungi useContext
import ThemeContext from '../ThemeContext'; // <--- Importa ThemeContext
import './../index.css';

const GameSlotsScreen = ({ onSlotSelect }) => {
  const slots = [1, 2, 3];
  const { isDarkMode } = useContext(ThemeContext); // <--- Usa il contesto del tema

  return (
    // <--- Applica la classe del tema qui
    <div className={`game-slots-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <h2>Select a Slot to Start a New Game</h2>
      <div className="slots-wrapper">
        {slots.map((slotNumber) => (
          <div
            key={slotNumber}
            className="game-slot empty-slot"
            onClick={() => onSlotSelect(slotNumber)}
          >
            <h3>Slot {slotNumber}</h3>
            <p>Empty</p>
            <button>Start New Game</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameSlotsScreen;