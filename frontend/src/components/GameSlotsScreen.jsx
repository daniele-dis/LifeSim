import React, { useEffect, useState, useContext } from 'react';
import ThemeContext from '../ThemeContext';
import './../index.css';

/**
 * Componente GameSlotsScreen
 * Visualizza gli slot di gioco disponibili e consente la selezione.
 * @param {object} props
 * @param {'new'|'load'} props.mode - Modalità operativa: 'new' o 'load'
 * @param {function(number): void} props.onSlotSelect - Funzione di callback quando uno slot viene selezionato.
 * @param {function(): void} [props.onBack] - Funzione di callback per un pulsante "Indietro" (opzionale).
 */
const GameSlotsScreen = ({ mode, onSlotSelect, onBack }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [savedSlots, setSavedSlots] = useState({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const slots = [1, 2, 3];

  useEffect(() => {
    fetch('http://localhost:5050/get_all_slots')
      .then((res) => res.json())
      .then((data) => {
        setSavedSlots(data);
        setIsLoadingSlots(false);
      })
      .catch((err) => {
        console.error('Errore caricamento slot:', err);
        setIsLoadingSlots(false);
      });
  }, []);

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
                      <p>👤 {slotData.nome}</p>
                      <p>🧍 Avatar: {slotData.avatar}</p>
                      {mode === 'load' && (
                        <button onClick={() => onSlotSelect(slotNumber)}>Carica Partita</button>
                      )}
                      {mode === 'new' && (
                        <p className="info-text">Slot Occupato</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p>Empty</p>
                      {mode === 'new' && (
                        <button onClick={() => onSlotSelect(slotNumber)}>Nuova Partita</button>
                      )}
                      {/* mode === 'load' con slot vuoto: non mostrare niente */}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {onBack && (
        <button className="back-button" onClick={onBack} style={{ marginTop: '20px' }}>
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
