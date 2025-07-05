import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';

import StartScreen from './components/StartScreen';
import GameSelectionScreen from './components/GameSelectionScreen';
import GameSlotsScreen from './components/GameSlotsScreen';
import InputScreen from './components/InputScreen';

import ThemeContext from './ThemeContext';

function App() {
  const [gameState, setGameState] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('start');
  const [selectedSlot, setSelectedSlot] = useState(null);

  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    console.log(`*** currentPhase cambiato a: ${currentPhase} ***`);
  }, [currentPhase]);

  useEffect(() => {
    if (currentPhase === 'mainGame') {
      getGameState();
    }
  }, [currentPhase]);

  const getGameState = async () => {
    try {
      console.log("Backend Call: Tentativo di recuperare lo stato del gioco...");
      const res = await axios.get("http://localhost:5050/get_state");
      setGameState(res.data);
      console.log("Backend Response: Stato del gioco caricato:", res.data);
    } catch (error) {
      console.error("Backend Error: Errore nel caricare lo stato del gioco:", error);
    }
  };

  const doAction = async (azione) => {
    try {
      console.log(`Backend Call: Esecuzione azione: ${azione}`);
      const res = await axios.post("http://localhost:5050/do_action", { azione });
      setGameState(res.data);
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


  const handleNameSubmit = async (playerName, slot) => {
    try {
      const res = await axios.post("http://localhost:5050/initialize_game", {
        slot,
        playerName,
      });
      setGameState(res.data);
      setCurrentPhase('mainGame');
    } catch (error) {
      console.error("Errore nell'inizializzazione del gioco:", error);
      setCurrentPhase('gameSlots');
    }
  };

  const handleBackFromInputToSlots = () => {
    setCurrentPhase('gameSlots');
    setSelectedSlot(null);
  };

  const handleBackToStart = () => {
    setCurrentPhase('start');
  };

  // --- Render ---

  if (currentPhase === 'start') {
    return (
      <StartScreen
        onStart={handleStartGame}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  // App.js (solo la parte con GameSelectionScreen modificata)

if (currentPhase === 'gameSelection') {
  return (
    <GameSelectionScreen
      isDarkMode={isDarkMode}
      onNewGame={handleNewGameFromSelection}
      onGameSelected={(gameType) => {
        console.log("onGameSelected chiamato con gameType:", gameType);
        handleNewGameFromSelection(); // Avvia la fase gameSlots
      }}
      onBackToStart={handleBackToStart}
    />
  );
}

  if (currentPhase === 'gameSlots') {
  return (
    <GameSlotsScreen
      isDarkMode={isDarkMode}
      onSlotSelect={handleSlotSelect}  // Questa funzione dev'essere la tua vera handler
      onBack={handleBackToStart}
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
      return <div>Caricamento stato del gioco...</div>;
    }
    return (
      <div style={{ padding: '2rem', fontFamily: 'Arial', textAlign: 'center' }}>
        <h1>Ciao {gameState.nome}!</h1>
        <p>💰 Soldi: {gameState.soldi}</p>
        <p>⚡ Energia: {gameState.energia}</p>
        <p>😄 Felicità: {gameState.felicità}</p>

        <button onClick={() => doAction('lavoro')}>Vai a Lavorare</button>
        <button onClick={() => doAction('dormi')}>Dormi</button>
        <button onClick={() => doAction('divertiti')}>Divertiti</button>
      </div>
    );
  }

  return <div>Errore: Stato sconosciuto.</div>;
}

export default App;
