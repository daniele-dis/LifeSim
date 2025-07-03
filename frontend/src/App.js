// src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import StartScreen from "./components/StartScreen"; // StartScreen è nella cartella components
import GameSelectionScreen from "./components/GameSelectionScreen"; // Aggiungiamo GameSelectionScreen

function App() {
  // Nuovo stato per gestire la fase attuale dell'applicazione:
  // 'start': Schermata iniziale
  // 'gameSelection': Schermata di selezione del gioco
  // 'mainGame': Il gioco vero e proprio
  const [currentPhase, setCurrentPhase] = useState('start');

  // Stato per il gioco vero e proprio (soldi, energia, felicità)
  const [gameState, setGameState] = useState(null);

  // Stato per la modalità tema (chiaro/scuro), gestito qui in App.js
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('lifeSimDarkMode');
      return savedMode !== null ? JSON.parse(savedMode) : true; // Default a true (modalità scura)
    } catch (error) {
      console.error("Errore nel leggere il tema da localStorage:", error);
      return true; // Fallback alla modalità scura
    }
  });

  // Effetto per applicare la classe del tema all'elemento 'root' del DOM
  useEffect(() => {
    const rootElement = document.getElementById('root'); // L'elemento base dell'app in index.html
    if (rootElement) {
      if (isDarkMode) {
        rootElement.classList.remove('light-mode');
        rootElement.classList.add('dark-mode');
      } else {
        rootElement.classList.remove('dark-mode');
        rootElement.classList.add('light-mode');
      }
    }
    // Salva la preferenza del tema in localStorage
    try {
      localStorage.setItem('lifeSimDarkMode', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error("Errore nel salvare il tema in localStorage:", error);
    }
  }, [isDarkMode]); // L'effetto si riesegue solo quando isDarkMode cambia

  // Funzione per attivare/disattivare la modalità scura
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Funzione per caricare lo stato del gioco dal backend
  const getGameState = async () => {
    try {
      const res = await axios.get("http://localhost:5050/get_state");
      setGameState(res.data);
    } catch (error) {
      console.error("Errore nel caricare lo stato del gioco:", error);
      // Gestisci l'errore, magari mostrando un messaggio all'utente
    }
  };

  // Funzione per eseguire un'azione nel gioco
  const doAction = async (azione) => {
    try {
      const res = await axios.post("http://localhost:5050/do_action", {
        azione,
      });
      setGameState(res.data);
    } catch (error) {
      console.error("Errore nell'esecuzione dell'azione:", error);
      // Gestisci l'errore
    }
  };

  // Logica di transizione tra le fasi del gioco:

  // 1. Dalla StartScreen alla GameSelectionScreen
  const handleStartGame = () => {
    setCurrentPhase('gameSelection');
  };

  // 2. Dalla GameSelectionScreen al Gioco Principale
  const handleGameSelected = (gameType) => {
    // Qui potresti aggiungere logica per "Nuova Partita" vs "Carica Partita"
    // Per ora, semplicemente passiamo al gioco principale e carichiamo lo stato
    console.log(`Partita selezionata: ${gameType}`);
    setCurrentPhase('mainGame');
    getGameState(); // Carica lo stato del gioco quando si passa al mainGame
  };

  
  const handleBackToStart = () => {
  setCurrentPhase('start');
};

  // === Rendering Condizionale delle Fasi ===

  // Fase 1: Schermata Iniziale
  if (currentPhase === 'start') {
    return (
      <StartScreen
        onStart={handleStartGame} // Quando "Gioca" viene cliccato, passa a 'gameSelection'
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  // Fase 2: Schermata di Selezione del Gioco
if (currentPhase === 'gameSelection') {
  return (
    <GameSelectionScreen
      isDarkMode={isDarkMode}
      onGameSelected={handleGameSelected}
      onBackToStart={handleBackToStart} // ✅ AGGIUNGI QUESTO
    />
  );
}


  // Fase 3: Il Gioco Principale (con stato e azioni)
  if (currentPhase === 'mainGame') {
    if (!gameState) {
      return <div>Caricamento stato del gioco...</div>; // Mostra caricamento mentre si attende lo stato
    }
    return (
      <div style={{ padding: "2rem", fontFamily: "Arial", textAlign: "center" }}>
        <h1 className="title">Ciao {gameState.nome}!</h1> {/* Usa la classe title per coerenza */}
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



  // Fallback (non dovrebbe mai accadere)
  return <div>Errore: Fase sconosciuta.</div>;
}

export default App;