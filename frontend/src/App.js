import React from 'react';
import useGameNavigation from './hooks/useNavigation'; // Importa il custom hook

import StartScreen from './components/StartScreen';
import GameSelectionScreen from './components/GameSelectionScreen';
import GameSlotsScreen from './components/GameSlotsScreen';
import InputScreen from './components/InputScreen';
import './index.css'; 

function App() {
  // Utilizza il custom hook per ottenere tutti gli stati e le funzioni di navigazione
  const {
    gameState,
    currentPhase,
    selectedSlot,
    savedSlots,
    isLoadingSlots,
    gameSlotsMode,
    isDarkMode,
    toggleDarkMode,
    doAction,
    handleStartGame,
    handleSlotSelect,
    handleNameSubmit,
    handleBackFromInputToSlots,
    handleBackToGameSlots,
    handleBackToStart,
    handleBackToGameSelection, // Assicurati che questa funzione sia importata dal hook
    handleNewGameSelection,
    handleLoadGameSelection,
  } = useGameNavigation();

  // Debugging: Log per vedere la fase e la modalità prima del rendering
  console.log("App.js - Rendering. currentPhase:", currentPhase, "gameSlotsMode:", gameSlotsMode);

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
        onNewGame={handleNewGameSelection} // Usa l'handler dal hook
        onLoadGame={handleLoadGameSelection} // Usa l'handler dal hook
        onBackToStart={handleBackToStart}
      />
    );
  }

  if (currentPhase === 'gameSlots') {
    return (
      <GameSlotsScreen
        mode={gameSlotsMode} // Passa la modalità determinata dal hook
        onSlotSelect={handleSlotSelect} // Passa l'handler dal hook
        onBack={handleBackToGameSelection} // Passa l'handler dal hook
        savedSlots={savedSlots} // Passa gli slot caricati dal hook
        isLoadingSlots={isLoadingSlots} // Passa lo stato di caricamento dal hook
      />
    );
  }

  if (currentPhase === 'nameInput') {
    return (
      <InputScreen
        onNameSubmit={handleNameSubmit} // Passa l'handler dal hook
        onBack={handleBackFromInputToSlots} // Passa l'handler dal hook
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
        {/* Pulsante Indietro ora torna alla schermata di selezione del gioco (menu) */}
        <button className="back-button" onClick={handleBackToGameSelection}>
          &larr; Indietro
        </button>
        <h1 className="game-title">Benvenuto, {gameState.nome}!</h1>
        <p className="game-stat">👤 Avatar: {gameState.avatar}</p>
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
