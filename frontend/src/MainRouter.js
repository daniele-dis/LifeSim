// src/MainRouter.jsx
import React, { useState, useContext } from 'react'; // Importa useContext
import StartScreen from './StartScreen';
import GameSelectionScreen from './GameSelectionScreen';
import ThemeContext from './ThemeContext'; // Importa il ThemeContext

function MainRouter() {
  const [currentScreen, setCurrentScreen] = useState('start');

  // ✅ Ottieni isDarkMode e toggleDarkMode dal contesto globale
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  const handleStartGame = () => {
    setCurrentScreen('gameSelection');
  };

  const handleBackToStart = () => {
  setCurrentScreen('start');
};

  // ✅ Rimosso lo stato isDarkMode e toggleDarkMode locali, vengono dal contesto

  return (
    // ✅ Rimosso className={isDarkMode ? '' : 'light-mode'} da qui
    // La classe sul #root viene applicata da ThemeContext.js
    // Questo div app-main-container è un contenitore interno, non deve avere id="root"
    <div className="app-main-container"> 
      {currentScreen === 'start' && (
        <StartScreen
          onStart={handleStartGame}
          // ✅ Passa isDarkMode e toggleDarkMode dal contesto
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode}
        />
      )}
      {currentScreen === 'gameSelection' && (
        <GameSelectionScreen 
          // ✅ Passa isDarkMode dal contesto (se GameSelectionScreen ne ha bisogno)
          isDarkMode={isDarkMode} 
          onBackToStart={handleBackToStart}
          // Se GameSelectionScreen avesse un suo toggle, dovresti passargli anche toggleDarkMode
        />
      )}
    </div>
  );
}

export default MainRouter;