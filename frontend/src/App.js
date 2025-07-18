import React, { useContext } from 'react'; // Importa useContext
import useGameNavigation from './hooks/useNavigation'; // Importa il custom hook
import ThemeContext, { ThemeProvider } from './ThemeContext'; // Importa ThemeContext E ThemeProvider

// Importa i componenti delle schermate
import StartScreen from './components/StartScreen';
import GameSelectionScreen from './components/GameSelectionScreen';
import GameSlotsScreen from './components/GameSlotsScreen';
import InputScreen from './components/InputScreen';
import MainGameScreen from './components/MainGameScreen';

import './css/index.css';

function App() {
    // Utilizza il custom hook per ottenere tutti gli stati e le funzioni di navigazione
    const {
        gameState,
        currentPhase,
        selectedSlot,
        savedSlots,
        isLoadingSlots,
        gameSlotsMode,
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
        deleteSlot, 
    } = useGameNavigation();

    // Ottieni lo stato del tema e la funzione per cambiarlo direttamente dal ThemeContext
    const { isDarkMode, toggleDarkMode } = useContext(ThemeContext); 

    // Debugging: Log per vedere la fase e la modalità prima del rendering
    console.log("App.js - Rendering. currentPhase:", currentPhase, "gameSlotsMode:", gameSlotsMode);

    // --- Render delle diverse fasi ---
    return (
        // Avvolgi l'intera applicazione con ThemeProvider per fornire il contesto del tema
        <ThemeProvider> 
            <div id="root"> {/* Assicurati che l'ID 'root' sia presente per l'applicazione del tema */}
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
                        onDeleteGame={handleDeleteGameSelection} 
                        onBackToStart={handleBackToStart}
                    />
                )}

                {currentPhase === 'gameSlots' && (
                    <GameSlotsScreen
                        mode={gameSlotsMode} 
                        onSlotSelect={handleSlotSelect} 
                        onDeleteSlot={deleteSlot} 
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
                        isDarkMode={isDarkMode} // Passa isDarkMode da ThemeContext
                        aiSuggestion={aiSuggestion}
                        onAcceptSuggestion={handleAcceptSuggestion}
                        onRejectSuggestion={handleRejectSuggestion}
                        message={message}
                    />
                )}

                {currentPhase === 'unknown' && (
                    <div className="error-screen">Errore: Stato sconosciuto dell'applicazione.</div>
                )}
            </div>
        </ThemeProvider>
    );
}

export default App;
