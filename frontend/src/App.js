// src/App.js
import React, { useState, useContext } from 'react'; // Removed useEffect
import axios from 'axios';
import StartScreen from './components/StartScreen';
import GameSelectionScreen from './components/GameSelectionScreen';
import ThemeContext from './ThemeContext'; // Removed ThemeProvider import

// MainRouterContent is now directly in App.js
function MainRouterContent({ onStartGame, onGameSelected, onBackToStart }) {
  const [currentScreen, setCurrentScreen] = useState('start');
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  const handleStartGame = () => {
    setCurrentScreen('gameSelection');
    onStartGame(); // Call the prop to notify App.js
  };

  const handleBackToStart = () => {
    setCurrentScreen('start');
    onBackToStart(); // Call the prop to notify App.js
  };

  return (
    <div className="app-main-container">
      {currentScreen === 'start' && (
        <StartScreen
          onStart={handleStartGame}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}
      {currentScreen === 'gameSelection' && (
        <GameSelectionScreen
          isDarkMode={isDarkMode}
          onGameSelected={onGameSelected} // Pass this directly to GameSelectionScreen
          onBackToStart={handleBackToStart}
        />
      )}
    </div>
  );
}


function App() {
  const [gameState, setGameState] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('start');

  const getGameState = async () => {
    try {
      const res = await axios.get("http://localhost:5050/get_state");
      setGameState(res.data);
    } catch (error) {
      console.error("Errore nel caricare lo stato del gioco:", error);
    }
  };

  const doAction = async (azione) => {
    try {
      const res = await axios.post("http://localhost:5050/do_action", {
        azione,
      });
      setGameState(res.data);
    } catch (error) {
      console.error("Errore nell'esecuzione dell'azione:", error);
    }
  };

  const handleStartGameFromMainRouter = () => {
    setCurrentPhase('gameSelection');
  };

  const handleGameSelected = (gameType) => {
    console.log(`Partita selezionata: ${gameType}`);
    setCurrentPhase('mainGame');
    getGameState();
  };

  const handleBackToStartFromMainRouter = () => {
    setCurrentPhase('start');
  };

  if (currentPhase === 'mainGame') {
    if (!gameState) {
      return <div>Caricamento stato del gioco...</div>;
    }
    return (
      <div style={{ padding: "2rem", fontFamily: "Arial", textAlign: "center" }}>
        <h1 className="title">Ciao {gameState.nome}!</h1>
        <p className="subtitle">💰 Soldi: {gameState.soldi}</p>
        <p className="subtitle">⚡ Energia: {gameState.energia}</p>
        <p className="subtitle">😄 Felicità: {gameState.felicità}</p>

        <div style={{ marginTop: "20px" }}>
          <button className="button" onClick={() => doAction("lavoro")}>Vai a Lavorare</button>
          <button className="button" onClick={() => doAction("dormi")}>Dormi</button>
          <button className="button" onClick={() => doAction("divertiti")}>Divertiti</button>
        </div>
      </div>
    );
  }

  return (
    <MainRouterContent
      onStartGame={handleStartGameFromMainRouter}
      onGameSelected={handleGameSelected}
      onBackToStart={handleBackToStartFromMainRouter}
    />
  );
}

export default App;