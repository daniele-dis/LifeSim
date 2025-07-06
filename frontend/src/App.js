import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';

import StartScreen from './components/StartScreen';
import GameSelectionScreen from './components/GameSelectionScreen';
import GameSlotsScreen from './components/GameSlotsScreen';
import InputScreen from './components/InputScreen';

import ThemeContext from './ThemeContext';

function App() {
  const [gameState, setGameState] = useState(null); // Stato del gioco corrente (per lo slot selezionato)
  const [currentPhase, setCurrentPhase] = useState('start');
  const [selectedSlot, setSelectedSlot] = useState(null); // Lo slot attualmente selezionato/caricato
  const [savedSlots, setSavedSlots] = useState({}); // Stato per memorizzare tutti i riepiloghi degli slot salvati
  const [isLoadingSlots, setIsLoadingSlots] = useState(false); // NUOVO STATO: per il caricamento degli slot
  
  
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  // Debugging: Log del cambio di fase
  useEffect(() => {
    console.log(`*** App.js: currentPhase cambiato a: ${currentPhase} ***`);
  }, [currentPhase]);

  // Debugging: Traccia il valore di savedSlots in App.js
  useEffect(() => {
    console.log('App.js: savedSlots state updated to:', savedSlots);
  }, [savedSlots]);

  // Effetto per caricare i dati in base alla fase
  useEffect(() => {
    // Quando la fase è 'gameSlots', recupera l'elenco di tutti gli slot salvati
    if (currentPhase === 'gameSlots') {
      console.log('App.js: currentPhase è "gameSlots", chiamando fetchAllSavedSlots()...');
      fetchAllSavedSlots();
    }
    // Quando la fase è 'mainGame' e abbiamo uno slot selezionato, carica lo stato specifico di quello slot
    if (currentPhase === 'mainGame' && selectedSlot) {
      console.log(`App.js: currentPhase è "mainGame" per slot ${selectedSlot}, chiamando getGameState()...`);
      getGameState(selectedSlot); // Chiama getGameState con lo slot selezionato
    }
  }, [currentPhase, selectedSlot]); // selectedSlot è ora una dipendenza per ricaricare lo stato del gioco se cambia lo slot

  // Funzione per recuperare lo stato di un gioco specifico dal backend
  const getGameState = async (slotNum) => {
    try {
      console.log(`Backend Call: Tentativo di recuperare lo stato del gioco per slot ${slotNum}...`);
      const res = await axios.get(`http://localhost:5050/get_game_state/${slotNum}`);
      setGameState(res.data);
      console.log("Backend Response: Stato del gioco caricato:", res.data);
    } catch (error) {
      console.error("Backend Error: Errore nel caricare lo stato del gioco:", error);
      setCurrentPhase('gameSlots');
      setSelectedSlot(null);
    }
  };

  // Funzione per recuperare il riepilogo di tutti gli slot salvati dal backend
const fetchAllSavedSlots = async () => {
  setIsLoadingSlots(true);
  try {
    const res = await axios.get(`http://localhost:5050/get_all_slots?ts=${Date.now()}`);
    console.log("fetchAllSavedSlots: dati ricevuti", res.data);
    setSavedSlots(res.data);
  } catch (error) {
    console.error(error);
    setSavedSlots({});
  } finally {
    setIsLoadingSlots(false);
  }
};


  // Modifica la funzione doAction per inviare anche lo slot corrente al backend
  const doAction = async (azione) => {
    if (!selectedSlot) {
      console.error("Errore: Nessuno slot selezionato per eseguire l'azione.");
      return;
    }
    try {
      console.log(`Backend Call: Esecuzione azione: ${azione} per slot ${selectedSlot}`);
      const res = await axios.post("http://localhost:5050/do_action", {
        azione: azione,
        slot: selectedSlot // Ora inviamo l'ID dello slot al backend
      });
      setGameState(res.data); // Aggiorna lo stato del gioco corrente con la risposta
      console.log("Backend Response: Stato del gioco aggiornato dopo azione:", res.data);
    } catch (error) {
      console.error("Backend Error: Errore nell'esecuzione dell'azione:", error);
    }
  };

  // --- Handler per transizioni di fase ---

  const handleStartGame = () => {
    setCurrentPhase('gameSelection');
  };

  const handleNewGameFromSelection = () => {
    const firstSlot = 1;
    setSelectedSlot(firstSlot);
    setCurrentPhase('nameInput');
  };

  const handleSlotSelect = (slot) => {
    console.log("handleSlotSelect chiamato con slot:", slot);
    setSelectedSlot(slot);
    setCurrentPhase('nameInput');
  };

  const handleLoadGame = (slot) => {
    console.log(`Caricamento partita dallo slot: ${slot}`);
    setSelectedSlot(slot);
    setCurrentPhase('mainGame');
  };

  const handleNameSubmit = async (playerName, slot, selectedAvatar) => {
    try {
      console.log(`App.js: Inizializzazione gioco per slot ${slot}, nome ${playerName}, avatar ${selectedAvatar}`);
      const res = await axios.post("http://localhost:5050/initialize_game", {
        slot,
        playerName,
        selectedAvatar,
      });
      setGameState(res.data);
      setSelectedSlot(slot);
      // Forza un refresh degli slot salvati SUBITO dopo aver creato/aggiornato un gioco.
      // Questo è cruciale per assicurarsi che GameSlotsScreen abbia i dati più recenti
      await fetchAllSavedSlots(); // Attendiamo che il fetch sia completato
      setCurrentPhase('mainGame'); // Poi transizioniamo alla schermata principale
      console.log("App.js: Gioco inizializzato e slot salvati aggiornati.");
    } catch (error) {
      console.error("App.js: Errore nell'inizializzazione del gioco:", error);
      setCurrentPhase('gameSlots');
      setSelectedSlot(null);
    }
  };

  const handleBackFromInputToSlots = () => {
    setCurrentPhase('gameSlots');
    setSelectedSlot(null);
  };

  // NUOVA FUNZIONE: per tornare direttamente alla schermata degli slot
  const handleBackToGameSlots = () => {
    console.log("App.js: Navigando indietro alla GameSlotsScreen.");
    setCurrentPhase('gameSlots');
    setSelectedSlot(null); // Pulisci lo slot selezionato quando torni alla panoramica
    setGameState(null); // Pulisci lo stato del gioco corrente
    // fetchAllSavedSlots() sarà chiamato dall'useEffect quando currentPhase diventa 'gameSlots'
  };

  const handleBackToStart = () => { // Questa funzione ora è per un reset completo
    console.log("App.js: Navigando indietro alla StartScreen (reset completo).");
    setCurrentPhase('start');
    setSelectedSlot(null);
    setGameState(null);
    setSavedSlots({}); // Pulisci gli slot salvati quando torni all'inizio
  };

  

  // --- Render delle diverse fasi ---

  if (currentPhase === 'start') {
    return (
      <StartScreen
        onStart={handleStartGame}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  if (currentPhase === 'gameSelection') {
    return (
      <GameSelectionScreen
        isDarkMode={isDarkMode}
        onNewGame={handleNewGameFromSelection}
        onLoadGame={handleLoadGame}
        onGameSelected={(gameType, slotNumber) => {
          if (gameType === 'newGameStarted') {
            handleSlotSelect(slotNumber);
          }
        }}
        onBackToStart={handleBackToStart}
      />
    );
  }

  if (currentPhase === 'gameSlots') {
  return (
    <GameSlotsScreen
      isDarkMode={isDarkMode}
      onSlotSelect={handleSlotSelect}
      onLoadGame={handleLoadGame}
      onBack={handleBackToStart}
      savedSlots={savedSlots} // ✅ AGGIUNTO
      isLoadingSlots={isLoadingSlots} // ✅ AGGIUNTO
    />
  );
}

  if (currentPhase === 'nameInput') {
    return (
      <InputScreen
        onNameSubmit={handleNameSubmit}
        onBack={handleBackFromInputToSlots}
        slotNumber={selectedSlot}
      />
    );
  }

  if (currentPhase === 'mainGame') {
    if (!gameState) {
      return <div className="loading-screen">Caricamento stato del gioco...</div>;
    }
    return (
      <div className={`main-game-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        {/* Pulsante Indietro ora torna alla schermata degli slot */}
        <button className="back-button" onClick={handleBackToGameSlots}>
          &larr; Indietro
        </button>
        <h1 className="game-title">Benvenuto, {gameState.nome}!</h1>
        <p className="game-stat">💰 Soldi: {gameState.soldi}</p>
        <p className="game-stat">⚡ Energia: {gameState.energia}</p>
        <p className="game-stat">😄 Felicità: {gameState.felicità}</p>

        <div className="action-buttons">
          <button onClick={() => doAction('lavoro')} className="action-button">Vai a Lavorare</button>
          <button onClick={() => doAction('dormi')} className="action-button">Dormi</button>
          <button onClick={() => doAction('divertiti')} className="action-button">Divertiti</button>
        </div>
      </div>
    );
  }

  return <div className="error-screen">Errore: Stato sconosciuto dell'applicazione.</div>;
}

export default App;
