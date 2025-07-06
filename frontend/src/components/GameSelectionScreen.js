import React, { useState, useContext } from 'react';
import ThemeContext from '../ThemeContext';
import GameSlotsScreen from './GameSlotsScreen';

const GameSelectionScreen = ({ onNewGame, onLoadGame, onGameSelected, onBackToStart }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [currentSubScreen, setCurrentSubScreen] = useState('selection');
  const [gameMode, setGameMode] = useState(null); // Aggiunto

  const handleNewGameClick = () => {
    setGameMode('new');
    setCurrentSubScreen('gameSlots');
  };

  const handleLoadGameClick = () => {
    setGameMode('load');
    setCurrentSubScreen('gameSlots');
  };

  const handleBackFromSlots = () => {
    setCurrentSubScreen('selection');
    setGameMode(null);
  };

  const handleSlotSelection = (slotNumber) => {
    console.log(`Slot ${slotNumber} selezionato in modalità ${gameMode}`);
    if (onGameSelected) {
      const action = gameMode === 'new' ? 'newGameStarted' : 'loadGameStarted';
      onGameSelected(action, slotNumber);
    }
  };

  return (
    <div className={`game-selection-portal-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <button className="back-button" onClick={onBackToStart}>
        ⬅ Indietro
      </button>

      {currentSubScreen === 'selection' && (
        <>
          <h1 className="portal-title">Scegli La Modalità</h1>
          <p className="portal-subtitle">Esplora il multiverso, crea la tua storia.</p>

          <div className="portal-options-grid">
            <button className="portal-button new-game-portal" onClick={handleNewGameClick}>
              <span className="portal-button-text">Nuova Partita</span>
              <span className="portal-glow"></span>
            </button>
            <button className="portal-button load-game-portal" onClick={handleLoadGameClick}>
              <span className="portal-button-text">Carica Partita</span>
              <span className="portal-glow"></span>
            </button>
          </div>

          <footer className="footer">
            <p>&copy; {new Date().getFullYear()} LifeSim. Tutti i diritti riservati.</p>
            <p>Sviluppato da Daniele Di Sarno & Ciro La Rocca</p>
          </footer>
        </>
      )}

      {currentSubScreen === 'gameSlots' && (
        <GameSlotsScreen
          mode={gameMode}
          onSlotSelect={handleSlotSelection}
          onBack={handleBackFromSlots}
        />
      )}
    </div>
  );
};

export default GameSelectionScreen;
