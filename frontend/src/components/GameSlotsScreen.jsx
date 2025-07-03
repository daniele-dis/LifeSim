// src/components/GameSlotsScreen.jsx

import React, { useContext } from 'react';
import ThemeContext from '../ThemeContext';
import './../index.css';

const GameSlotsScreen = ({ onSlotSelect }) => {
  const slots = [1, 2, 3];
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className={`game-slots-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <h2>Select a Slot to Start a New Game</h2>
      <div className="slots-wrapper">
        {slots.map((slotNumber) => (
          <div
            key={slotNumber}
            className="game-slot"
            onClick={() => onSlotSelect(slotNumber)}
          >
            <div className="slot-content">
              <h3>Slot {slotNumber}</h3>
              <p>Empty</p>
              <button className="slot-button">Start New Game</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameSlotsScreen;