// src/components/GameSelectionScreen.js

import React, { useState, useContext } from 'react'; // Importa useState
import ThemeContext from '../ThemeContext';
import GameSlotsScreen from './GameSlotsScreen'; // Importa GameSlotsScreen

const GameSelectionScreen = ({ onGameSelected }) => {
  const { isDarkMode } = useContext(ThemeContext);

  // Stato per controllare quale parte di GameSelectionScreen mostrare:
  // 'selection' per i bottoni iniziali, 'gameSlots' per i tre slot vuoti.
  const [currentSubScreen, setCurrentSubScreen] = useState('selection');

  const handleNewGameClick = () => {
    // Al click di "Nuova Partita", cambia lo stato per mostrare GameSlotsScreen
    setCurrentSubScreen('gameSlots');
  };

  const handleLoadGameClick = () => {
    console.log('Carica Partita non ancora implementato!');
    if (onGameSelected) onGameSelected('loadGame'); // Notifica il componente padre
  };

  const handleSlotSelection = (slotNumber) => {
    console.log(`Avvio nuova partita nello Slot ${slotNumber}`);
    // Qui, in una vera applicazione, inizieresti il salvataggio del gioco
    // e poi passeresti alla schermata di gioco vera e propria.
    // Se onGameSelected è una prop che il componente padre usa per navigare tra macro-schermate,
    // potresti usarla qui per passare alla schermata di gioco.
    if (onGameSelected) onGameSelected('newGameStarted', slotNumber);
  };

  return (
    // Applica la classe del tema al container principale
    <div className={`game-selection-portal-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {currentSubScreen === 'selection' && ( // Mostra i bottoni di selezione se lo stato è 'selection'
        <>
          <h1 className="portal-title">Scegli La Modalità</h1>
          <p className="portal-subtitle">Esplora il multiverso, crea la tua storia.</p>

          <div className="portal-options-grid">
            <button
              className="portal-button new-game-portal"
              onClick={handleNewGameClick} // Chiama la funzione per cambiare schermata
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
            {/* Puoi aggiungere qui altri bottoni se necessario */}
          </div>

          <footer className="portal-footer">
            <p>&copy; {new Date().getFullYear()} LifeSim Adventures. All rights reserved.</p>
          </footer>
        </>
      )}

      {currentSubScreen === 'gameSlots' && ( // Mostra GameSlotsScreen se lo stato è 'gameSlots'
        <GameSlotsScreen onSlotSelect={handleSlotSelection} />
      )}
    </div>
  );
};

export default GameSelectionScreen;