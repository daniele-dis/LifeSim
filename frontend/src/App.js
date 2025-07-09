import React from 'react';
import useGameNavigation from './hooks/useNavigation'; // Importa il custom hook
import ThemeContext from './ThemeContext'; // Importa il contesto del tema

// Importa i componenti delle schermate
import StartScreen from './components/StartScreen';
import GameSelectionScreen from './components/GameSelectionScreen';
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
        handleDeleteGameSelection,
        aiSuggestion,
        handleAcceptSuggestion,
        handleRejectSuggestion,
        message,
        deleteSlot, // <--- ASSICURATI CHE deleteSlot SIA DESTRUTTURATO QUI!
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
                    onDeleteGame={handleDeleteGameSelection} // <- importante: questa funzione imposta la modalità 'delete'
                    onBackToStart={handleBackToStart}
                />
            )}

            {currentPhase === 'gameSlots' && (
                <GameSlotsScreen
                    mode={gameSlotsMode} // Passa la modalità al GameSlotsScreen
                    onSlotSelect={handleSlotSelect} // Questa gestirà la selezione per new/load E l'apertura del modale per delete
                    onDeleteSlot={deleteSlot} // <--- PASSA deleteSlot A GAMESLOTSSCREEN
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
                    message={message}
                />
            )}

            {currentPhase === 'unknown' && (
                <div className="error-screen">Errore: Stato sconosciuto dell'applicazione.</div>
            )}
        </ThemeContext.Provider>
    );
}

export default App;
