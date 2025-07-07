import React, { useContext } from 'react'; // Rimosso useEffect e useState
import ThemeContext from '../ThemeContext';
import './../index.css';

/**
 * Componente GameSlotsScreen
 * Visualizza gli slot di gioco disponibili e consente la selezione.
 * @param {object} props
 * @param {'new'|'load'} props.mode - Modalità operativa: 'new' o 'load'
 * @param {function(number): void} props.onSlotSelect - Funzione di callback quando uno slot viene selezionato.
 * @param {function(): void} [props.onBack] - Funzione di callback per un pulsante "Indietro" (opzionale).
 * @param {object} props.savedSlots - Oggetto contenente i dati degli slot salvati.
 * @param {boolean} props.isLoadingSlots - Indica se gli slot sono in fase di caricamento.
 */
const GameSlotsScreen = ({ mode, onSlotSelect, onBack, savedSlots, isLoadingSlots }) => {
  const { isDarkMode } = useContext(ThemeContext);
  // Rimosso lo stato interno savedSlots e isLoadingSlots, ora vengono passati tramite props.
  // Rimosso l'useEffect per il caricamento interno degli slot, ora gestito dal custom hook.

  const slots = [1, 2, 3]; // Ipotizziamo sempre 3 slot

  return (
    <div className={`game-slots-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <h2 className="game-slots-title">
        {mode === 'new' ? 'Che Abbia Inizio l\'Avventura' : 'Riprendi la tua Storia'}
      </h2>
      <p className="game-slots-subtitle">
        {mode === 'new'
          ? 'Scegli uno slot libero per iniziare una nuova partita.'
          : 'Scegli uno slot salvato da caricare.'}
      </p>
      

      {isLoadingSlots ? (
        <p className="loading-text">Caricamento degli slot in corso...</p>
      ) : (
        <div className="slots-wrapper">
          {slots.map((slotNumber) => {
            const slotData = savedSlots?.[slotNumber];
            const hasSave = !!slotData;

            return (
              <div key={slotNumber} className="game-slot">
                <div className="slot-content">
                  <h3>Slot {slotNumber}</h3>

                  {hasSave ? (
                    <>
                      <p>👤: {slotData.nome} 🧍: {slotData.avatar}</p>
                      {/* Mostra "Carica Partita" solo in modalità 'load' */}
                      {mode === 'load' && (
                        <button onClick={() => onSlotSelect(slotNumber)}>Carica Partita</button>
                      )}
                      {/* Mostra "Slot Occupato" solo in modalità 'new' */}
                      {mode === 'new' && (
                        <p className="info-text">Slot Occupato</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p>Empty</p>
                      {/* Mostra "Nuova Partita" solo in modalità 'new' */}
                      {mode === 'new' && (
                        <button onClick={() => onSlotSelect(slotNumber)}>Nuova Partita</button>
                      )}
                      {/* Mostra "Slot Vuoto" in modalità 'load' */}
                      {mode === 'load' && (
                        <p className="info-text">Slot Vuoto</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Questo è il SOLO pulsante "Indietro" gestito da GameSlotsScreen.
          Appare sempre se la prop onBack è fornita, indipendentemente dalla modalità. */}
      {onBack && (
        <button className="back-button" onClick={onBack}>
          &larr; Indietro
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
