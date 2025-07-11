import React, { useContext, useState } from 'react'; // Aggiunto useState
import ThemeContext from '../ThemeContext';
import '../css/index.css';

/**
 * Componente GameSlotsScreen
 * Visualizza gli slot di gioco disponibili e consente la selezione.
 * @param {object} props
 * @param {'new'|'load'|'delete'} props.mode - Modalità operativa
 * @param {function(number): void} props.onSlotSelect - Callback quando uno slot viene selezionato (per new/load).
 * @param {function(number): void} props.onDeleteSlot - Callback per eliminare uno slot (chiamato dal modale di conferma).
 * @param {function(): void} [props.onBack] - Callback per pulsante "Indietro".
 * @param {object} props.savedSlots - Dati degli slot salvati.
 * @param {boolean} props.isLoadingSlots - Se gli slot stanno caricando.
 */
const GameSlotsScreen = ({ mode, onSlotSelect, onDeleteSlot, onBack, savedSlots, isLoadingSlots }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const slots = [1, 2, 3];

  // Stato per la gestione del modale di conferma eliminazione
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [slotToConfirmDelete, setSlotToConfirmDelete] = useState(null);

  // Funzione per aprire il modale di conferma
  const handleOpenDeleteConfirm = (slotNumber) => {
    // Non permettere l'eliminazione di slot vuoti
    if (!savedSlots?.[slotNumber]) {
      // Potresti aggiungere un messaggio all'utente qui se vuoi
      return;
    }
    setSlotToConfirmDelete(slotNumber);
    setShowConfirmModal(true);
  };

  // Funzione per confermare l'eliminazione (chiamata dal modale)
  const handleConfirmDelete = () => {
    if (slotToConfirmDelete !== null) {
      onDeleteSlot(slotToConfirmDelete); // Chiama la funzione di eliminazione passata da useGameNavigation
      setShowConfirmModal(false);
      setSlotToConfirmDelete(null);
    }
  };

  // Funzione per annullare l'eliminazione
  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setSlotToConfirmDelete(null);
  };

  return (
    <div className={`game-slots-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <h2 className="game-slots-title">
        {mode === 'new' && 'Che Abbia Inizio l\'Avventura'}
        {mode === 'load' && 'Riprendi la tua Storia'}
        {mode === 'delete' && 'Gestione Slot: Elimina Partita'}
      </h2>
      <p className="game-slots-subtitle">
        {mode === 'new' && 'Scegli uno slot libero per iniziare una nuova partita.'}
        {mode === 'load' && 'Scegli uno slot salvato da caricare.'}
        {mode === 'delete' && 'Scegli uno slot da eliminare.'}
      </p>

      {isLoadingSlots ? (
        <p className="loading-text">Caricamento degli slot in corso...</p>
      ) : (
        <div className="slots-wrapper">
          {slots.map((slotNumber) => {
            const slotData = savedSlots?.[slotNumber];
            const hasSave = !!slotData;

            return (
              <div
                key={slotNumber}
                className={`game-slot 
                  ${hasSave ? 'occupied' : 'empty'} 
                  ${mode === 'delete' ? 'delete-mode-slot' : ''} 
                  ${hasSave && slotData.is_game_over ? 'game-over-slot' : ''}
                `}
                // L'onClick principale del div non fa nulla in modalità delete,
                // l'azione è sul bottone interno.
                // In modalità new/load, il click sul div potrebbe selezionare lo slot
                onClick={mode !== 'delete' ? () => onSlotSelect(slotNumber) : undefined}
              >
                <div className="slot-content">
                  <h3>Slot {slotNumber}</h3>

                  {hasSave ? (
                    <>
                      <p>👤: {slotData.nome} 🎂: {slotData.eta} anni</p>
                      {slotData.is_game_over && (
                        <p className="game-over-info">GAME OVER: {slotData.death_reason}</p>
                      )}

                      {mode === 'load' && (
                        <button onClick={() => onSlotSelect(slotNumber)}>Carica Partita</button>
                      )}

                      {mode === 'new' && (
                        <p className="info-text">Slot Occupato</p>
                      )}

                      {mode === 'delete' && (
                        <button
                          className="delete-button"
                          onClick={() => handleOpenDeleteConfirm(slotNumber)} // Apre il modale
                        >
                          Elimina Partita
                        </button>
                      )}
                    </>
                  ) : (
                    <>

                      {mode === 'new' && (
                        <button onClick={() => onSlotSelect(slotNumber)}>Nuova Partita</button>
                      )}

                      {mode === 'load' && (
                        <p className="info-text">Slot Vuoto</p>
                      )}

                      {mode === 'delete' && (
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

      {onBack && (
        <button className="back-button" onClick={onBack}>
          &larr; Indietro
        </button>
      )}

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} LifeSim. Tutti i diritti riservati.</p>
        <p>Sviluppato da Daniele Di Sarno & Ciro La Rocca</p>
      </footer>

      {/* Modale di conferma eliminazione */}
      {showConfirmModal && (
        <div className="game-slot-modal-overlay">
          <div className="game-slot game-slot-modal">
            <div className="slot-content">
              <h3>Conferma Eliminazione</h3>
              <p>Sei sicuro di voler eliminare la partita nello Slot {slotToConfirmDelete}?</p>
              <div className="modal-actions">
                <button onClick={handleConfirmDelete} className="modal-btn modal-btn--danger">Elimina</button>
                <button onClick={handleCancelDelete} className="modal-btn modal-btn--cancel">Annulla</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSlotsScreen;
