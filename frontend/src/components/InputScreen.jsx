import React, { useState, useContext } from 'react';
import ThemeContext from '../ThemeContext';
import './../index.css';

// Importa le tue immagini avatar
import maleAvatar from '../img/raw.png'; // Aggiusta il percorso se necessario
import femaleAvatar from '../img/rawwoman.png'; // Aggiusta il percorso se necessario

const InputScreen = ({ onNameSubmit, onBack, slotNumber }) => {
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null); // Stato per memorizzare l'avatar selezionato
  const { isDarkMode } = useContext(ThemeContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim() && selectedAvatar) { // Assicurati che un avatar sia selezionato
      onNameSubmit(playerName.trim(), slotNumber, selectedAvatar); // Passa selectedAvatar
    } else if (!playerName.trim()) {
      console.log("Per favore, inserisci un nome.");
    } else {
      console.log("Per favor, seleziona un avatar.");
    }
  };

  return (
    <>
      {/* Pulsante "Indietro" - SPOSTATO FUORI DAL CONTENITORE */}
      <button
        className="back-button" // Applica la classe per lo stile
        onClick={onBack} // Usa la prop onBack per gestire il ritorno
      >
        &larr; Indietro {/* Freccia a sinistra e testo */}
      </button>

      <div className={`name-input-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <h3 className="name-input-title">Selezione Nome e Avatar Personaggio:</h3>

        {/* Selezione Avatar */}
        <div className="avatar-selection-container">
          <div
            className={`avatar-option ${selectedAvatar === 'male' ? 'selected-avatar' : ''}`}
            onClick={() => setSelectedAvatar('male')}
          >
            <img src={maleAvatar} alt="Avatar Maschile" className="avatar-image" />
            <p className="avatar-label">Ragazzo</p>
          </div>
          <div
            className={`avatar-option ${selectedAvatar === 'female' ? 'selected-avatar' : ''}`}
            onClick={() => setSelectedAvatar('female')}
          >
            <img src={femaleAvatar} alt="Avatar Femminile" className="avatar-image" />
            <p className="avatar-label">Ragazza</p>
          </div>
        </div>
        {/* Fine Selezione Avatar */}

        <p className="name-input-subtitle">Dopo averlo selezionato, inserisci il nome del tuo avatar per iniziare l'avventura nello Slot {slotNumber}.</p>
        <form onSubmit={handleSubmit} className="name-input-form">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Inserisci il Tuo Nome"
            className="name-input-field"
            maxLength="20"
            required
          />

          <button type="submit" className="name-input-button">Inizia Partita</button>

        </form>
      </div>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} LifeSim. Tutti i diritti riservati.</p>
        <p>Sviluppato da Daniele Di Sarno & Ciro La Rocca</p>
      </footer>
    </>
  );
};

export default InputScreen;