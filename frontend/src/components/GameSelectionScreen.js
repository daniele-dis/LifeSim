// src/components/GameSelectionScreen.js

import React, { useContext } from 'react';
import ThemeContext from '../ThemeContext';

const GameSelectionScreen = ({ onGameSelected }) => {
  // Anche se non useremo toggleDarkMode qui, isDarkMode è ancora utile
  // per applicare le classi del tema al container.
  const { isDarkMode } = useContext(ThemeContext);

  return (
    // Applica la classe del tema al container principale
    <div className={`game-selection-portal-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <h1 className="portal-title">Scegli La Modalità</h1>
      <p className="portal-subtitle">Esplora il multiverso, crea la tua storia.</p>

      <div className="portal-options-grid">
        <button
          className="portal-button new-game-portal"
          onClick={() => {
            alert('Nuova Partita Iniziata!');
            // Chiamare onGameSelected per passare alla fase successiva dell'app (se fornito)
            if (onGameSelected) onGameSelected('newGame');
          }}
        >
          <span className="portal-button-text">Nuova Partita</span>
          <span className="portal-glow"></span>
        </button>
        <button
          className="portal-button load-game-portal"
          onClick={() => {
            alert('Carica Partita non ancora implementato!');
            // Chiamare onGameSelected per passare alla fase successiva dell'app (se fornito)
            if (onGameSelected) onGameSelected('loadGame');
          }}
        >
          <span className="portal-button-text">Carica Partita</span>
          <span className="portal-glow"></span>
        </button>
      </div>

      {/* Il pulsante per cambiare tema è stato rimosso da qui */}

      <footer className="portal-footer">
        <p>&copy; {new Date().getFullYear()} LifeSim Adventures. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default GameSelectionScreen;