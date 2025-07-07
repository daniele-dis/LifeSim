import React from 'react';
import useGameNavigation from './hooks/useNavigation'; // Importa il custom hook
import ThemeContext from './ThemeContext'; // Importa il contesto del tema

// Importa i componenti delle schermate
import StartScreen from './components/StartScreen';
import GameSelectionScreen from './components/GameSelectionScreen';
import GameSlotsScreen from './components/GameSlotsScreen';
import InputScreen from './components/InputScreen';
// Rimosso l'import di MainGameScreen, poiché il suo contenuto è ora qui

import './index.css'; // Assicurati che il tuo CSS sia importato

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
        handleBackToGameSelection,
        handleBackToStart,
        handleNewGameSelection,
        handleLoadGameSelection,
    } = useGameNavigation();

    // Debugging: Log per vedere la fase e la modalità prima del rendering
    console.log("App.js - Rendering. currentPhase:", currentPhase, "gameSlotsMode:", gameSlotsMode);

    // --- Render delle diverse fasi ---
    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {currentPhase === 'start' && (
                <StartScreen
                    onStart={handleStartGame}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                />
            )}

            {currentPhase === 'gameSelection' && (
                <GameSelectionScreen
                    onNewGame={handleNewGameSelection}
                    onLoadGame={handleLoadGameSelection}
                    onBackToStart={handleBackToStart}
                />
            )}

            {currentPhase === 'gameSlots' && (
                <GameSlotsScreen
                    mode={gameSlotsMode}
                    onSlotSelect={handleSlotSelect}
                    onBack={handleBackToGameSelection}
                    savedSlots={savedSlots}
                    isLoadingSlots={isLoadingSlots}
                />
            )}

            {currentPhase === 'nameInput' && (
                <InputScreen
                    onNameSubmit={handleNameSubmit}
                    onBack={handleBackFromInputToSlots}
                    slotNumber={selectedSlot}
                />
            )}

            {currentPhase === 'mainGame' && (
                // Contenuto precedentemente in MainGameScreen.js
                !gameState ? (
                    <div className="loading-screen">Caricamento stato del gioco...</div>
                ) : (
                    <div className={`main-game-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
                        {/* DEBUGGING: Log dello stato del gioco corrente */}
                        {console.log("App.js - mainGame phase: Rendering with gameState:", gameState)}

                        <button className="back-button" onClick={handleBackToGameSelection}>
                            &larr; Indietro
                        </button>
                        <h1 className="game-title">Benvenuto, {gameState.nome}!</h1>
                        <p className="game-stat">👤 Avatar: {gameState.avatar}</p>
                        <p className="game-stat">💰 Soldi: {gameState.soldi}</p>
                        <p className="game-stat">⚡ Energia: {gameState.energia}</p>
                        <p className="game-stat">😄 Felicità: {gameState.felicita}</p> {/* <-- MODIFICATO QUI per 'felicita' */}

                        <div className="action-buttons">
                            <button onClick={() => doAction('lavoro')} className="action-button">Vai a Lavorare</button>
                            <button onClick={() => doAction('dormi')} className="action-button">Dormi</button>
                            <button onClick={() => doAction('divertiti')} className="action-button">Divertiti</button>
                        </div>
                        <footer className="footer">
                            <p>&copy; {new Date().getFullYear()} LifeSim. Tutti i diritti riservati.</p>
                            <p>Sviluppato da Daniele Di Sarno & Ciro La Rocca</p>
                        </footer>
                    </div>
                )
            )}

            {/* Gestione di uno stato sconosciuto, utile per debug */}
            {currentPhase === 'unknown' && (
                <div className="error-screen">Errore: Stato sconosciuto dell'applicazione.</div>
            )}
        </ThemeContext.Provider>
    );
}

export default App;
