import React, { useState, useContext } from 'react';
import ThemeContext from '../ThemeContext';
import './../index.css';

const InputScreen = ({ onNameSubmit, onBack, slotNumber }) => {
  const [playerName, setPlayerName] = useState('');
  const { isDarkMode } = useContext(ThemeContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      onNameSubmit(playerName.trim(), slotNumber);
    } else {
      console.log("Per favore, inserisci un nome.");
    }
  };

  return (
    // The main app container (#root in index.css) should handle the overall flex layout and background.
    // The name-input-container will be centered within that.
    // The footer will then be absolutely positioned at the bottom of the *viewport* (or #root).
    <> {/* Use a fragment to return multiple top-level elements */}
      <div className={`name-input-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        {/* If you want a back button INSIDE the input container, give name-input-container position: relative;
            and style the button relative to it.
            If you want it to be at the top-left of the *screen* (like the menu toggle),
            it should be a direct child of whatever element has min-height: 100vh (likely #root).
            For consistency with other screens, putting it as a separate element positioned absolutely to the viewport is often cleaner.
            Let's assume it should be at the top-left of the viewport. */}
        <button type="button" onClick={onBack} className="back-button">Indietro</button> {/* This is positioned absolutely to the viewport */}

        <h2 className="name-input-title">Dai un Nome al Tuo Personaggio</h2>
        <p className="name-input-subtitle">Inserisci il nome del tuo avatar per iniziare l'avventura nello Slot {slotNumber}.</p>
        <form onSubmit={handleSubmit} className="name-input-form">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Il tuo nome qui..."
            className="name-input-field"
            maxLength="20"
            required
          />
          
          <div className="name-input-buttons">
            {/*  in index.css vedi di farlo molto più piccolo e centrato */}
            <button type="submit" className="name-input-button">Inizia Partita</button>
            {/* The back button is moved outside the form and positioned globally */}
          </div>
        </form>
      </div>

      {/* Footer per InputScreen - Posizionato al fondo della viewport */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} LifeSim. Tutti i diritti riservati.</p>
        <p>Sviluppato da Daniele Di Sarno & Ciro La Rocca</p>
      </footer>
    </>
  );
};

export default InputScreen;