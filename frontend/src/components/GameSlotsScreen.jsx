// src/components/GameSlotsScreen.jsx
import React, { useContext } from 'react';
import ThemeContext from '../ThemeContext';
import './../index.css';

/**
 * Componente GameSlotsScreen
 * Visualizza gli slot di gioco disponibili e consente la selezione.
 * @param {object} props - Le proprietà del componente.
 * @param {function(number): void} props.onSlotSelect - Funzione di callback quando uno slot viene selezionato.
 * @param {function(): void} [props.onBack] - Funzione di callback per un pulsante "Indietro" (opzionale).
 */
const GameSlotsScreen = ({ onSlotSelect, onBack }) => { // onBack è correttamente ricevuto
  const slots = [1, 2, 3]; // Definisce gli slot di gioco disponibili
  const { isDarkMode } = useContext(ThemeContext); // Accede allo stato della modalità scura dal contesto

  return (
    <div className={`game-slots-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <h2 className="game-slots-title">Che Abbia Inizio l'Avventura</h2>
      <p className="game-slots-subtitle">Scegli Uno Slot Per Avviare La Partita.</p>
      <div className="slots-wrapper">
        {slots.map((slotNumber) => (
          <div
            key={slotNumber}
            className="game-slot"
            // L'onClick è stato rimosso dal div esterno per concentrare l'azione sul pulsante.
            // Ora solo il pulsante "Start New Game" attiverà onSlotSelect.
          >
            <div className="slot-content">
              <h3>Slot {slotNumber}</h3>
              <p>Empty</p> {/* Segnaposto per lo stato del gioco (es. "Ultima Partita: 10/07/2024") */}
              {/* L'onClick è ora ESPLICITAMENTE sul pulsante "Start New Game" */}
              
              <button onClick={() => {
                console.log("Cliccato Start New Game con slot:", slotNumber);
                onSlotSelect(slotNumber);
              }}>Nuova Partita
              </button>


            </div>
          </div>
        ))}
      </div>
      {onBack && ( // Renderizza il pulsante "Indietro" solo se la prop onBack è fornita
        <button className="back-button" onClick={() => {
          console.log("GameSlotsScreen: Pulsante 'Indietro' cliccato.");
          onBack();
        }} style={{ marginTop: '20px' }}>
          Indietro
        </button>
      )}
      <footer className="footer">
       <p>&copy; {new Date().getFullYear()} LifeSim. Tutti i diritti riservati.</p>
       <p>Sviluppato da Daniele Di Sarno & Ciro La Rocca</p>
        
      </footer>
    </div>
  );
};

export default GameSlotsScreen;
