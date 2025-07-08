import React from 'react';
import useGameNavigation from './hooks/useNavigation'; // Importa il custom hook
import ThemeContext from './ThemeContext'; // Importa il contesto del tema

// Importa i componenti delle schermate
import StartScreen from './components/StartScreen';
import GameSelectionScreen from './components/GameSelectionScreen'; // Percorso corretto
import GameSlotsScreen from './components/GameSlotsScreen';
import InputScreen from './components/InputScreen';
import MainGameScreen from './components/MainGameScreen';

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
        aiSuggestion,
        handleAcceptSuggestion,
        handleRejectSuggestion,
        message,
    } = useGameNavigation();

    // Debugging: Log per vedere la fase e la modalità prima del rendering
    console.log("App.js - Rendering. currentPhase:", currentPhase, "gameSlotsMode:", gameSlotsMode);

    // --- Render delle diverse fasi ---
    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {/* Display di un messaggio globale se presente */}
            {message && (
                <div className="app-message-overlay">
                    <div className="app-message-box">
                        <p>{message}</p>
                    </div>
                </div>
            )}

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
                <MainGameScreen
                    gameState={gameState}
                    doAction={doAction}
                    onBack={handleBackToGameSelection}
                    isDarkMode={isDarkMode}
                    aiSuggestion={aiSuggestion}
                    onAcceptSuggestion={handleAcceptSuggestion}
                    onRejectSuggestion={handleRejectSuggestion}
                />
            )}

            {/* Gestione di uno stato sconosciuto, utile per debug */}
            {currentPhase === 'unknown' && (
                <div className="error-screen">Errore: Stato sconosciuto dell'applicazione.</div>
            )}
        </ThemeContext.Provider>
    );
}

export default App;
