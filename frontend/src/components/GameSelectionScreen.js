// src/components/GameSelectionScreen.js

import React, { useState, useContext } from 'react'; // Importa useState
import ThemeContext from '../ThemeContext';
import GameSlotsScreen from './GameSlotsScreen'; // Importa GameSlotsScreen

// ✅ Aggiunta della prop onBackToStart
const GameSelectionScreen = ({ onGameSelected, onBackToStart }) => {
  const { isDarkMode } = useContext(ThemeContext);

  const [currentSubScreen, setCurrentSubScreen] = useState('selection');

  const handleNewGameClick = () => {
    setCurrentSubScreen('gameSlots');
  };

  const handleLoadGameClick = () => {
    console.log('Carica Partita non ancora implementato!');
    if (onGameSelected) onGameSelected('loadGame');
  };

  const handleSlotSelection = (slotNumber) => {
    console.log(`Avvio nuova partita nello Slot ${slotNumber}`);
    if (onGameSelected) onGameSelected('newGameStarted', slotNumber);
  };

  return (
    <div className={`game-selection-portal-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      
      {/* ✅ Pulsante Indietro: Aggiunto senza toccare il resto */}
      <button className="back-button" onClick={onBackToStart}>
        ⬅ Torna alla schermata iniziale
      </button>

      {currentSubScreen === 'selection' && (
        <>
          <h1 className="portal-title">Scegli La Modalità</h1>
          <p className="portal-subtitle">Esplora il multiverso, crea la tua storia.</p>

          <div className="portal-options-grid">
            <button
              className="portal-button new-game-portal"
              onClick={handleNewGameClick}
            >
              <span className="portal-button-text">Nuova Partita</span>
              <span className="portal-glow"></span>
            </button>
            <button
              className="portal-button load-game-portal"
              onClick={handleLoadGameClick}
            >
              <span className="portal-button-text">Carica Partita</span>
              <span className="portal-glow"></span>
            </button>
          </div>

          <footer className="portal-footer">
            <p>&copy; {new Date().getFullYear()} LifeSim Adventures. All rights reserved.</p>
          </footer>
        </>
      )}

      {currentSubScreen === 'gameSlots' && (
        <GameSlotsScreen onSlotSelect={handleSlotSelection} />
      )}
    </div>
  );
};

export default GameSelectionScreen;
