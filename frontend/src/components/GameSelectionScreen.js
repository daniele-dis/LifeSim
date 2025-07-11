import React, { useContext } from 'react'; 
import ThemeContext from '../ThemeContext';
import '../css/index.css';

const GameSelectionScreen = ({ onNewGame, onLoadGame, onDeleteGame, onBackToStart }) => {

  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className={`game-selection-portal-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <button className="back-button" onClick={onBackToStart}>
        ⬅ Indietro
      </button>

      {/* Questa parte è sempre visibile quando currentPhase è 'gameSelection' */}
      <>
        <h1 className="portal-title">Scegli La Modalità</h1>
        <p className="portal-subtitle">Esplora il multiverso, crea la tua storia.</p>

        <div className="portal-options-grid">
          {/* Questi pulsanti ora chiamano direttamente le prop onNewGame e onLoadGame */}
          <button className="portal-button new-game-portal" onClick={onNewGame}>
            <span className="portal-button-text">Nuova Partita</span>
            <span className="portal-glow"></span>
          </button>
          <button className="portal-button load-game-portal" onClick={onLoadGame}>
            <span className="portal-button-text">Carica Partita</span>
            <span className="portal-glow"></span>
          </button>

        <button className="portal-button load-game-portal" onClick={onDeleteGame}>
          <span className="portal-button-text">Elimina Partita</span>
          <span className="portal-glow"></span>
        </button>

        </div>

        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} LifeSim. Tutti i diritti riservati.</p>
          <p>Sviluppato da Daniele Di Sarno & Ciro La Rocca</p>
        </footer>
      </>

      {/* Rimosso il blocco di rendering di GameSlotsScreen,
          ora è gestito dal componente App.js in base a currentPhase */}
    </div>
  );
};

export default GameSelectionScreen;
