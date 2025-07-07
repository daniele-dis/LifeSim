import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ThemeContext from '../ThemeContext'; // Importa ThemeContext se usato anche qui

/**
 * Custom Hook per gestire la navigazione e lo stato del gioco.
 */
const useGameNavigation = () => {
  const [gameState, setGameState] = useState(null); // Stato del gioco corrente (per lo slot selezionato)
  const [currentPhase, setCurrentPhase] = useState('start');
  const [selectedSlot, setSelectedSlot] = useState(null); // Lo slot attualmente selezionato/caricato
  const [savedSlots, setSavedSlots] = useState({}); // Stato per memorizzare tutti i riepiloghi degli slot salvati
  const [isLoadingSlots, setIsLoadingSlots] = useState(false); // Stato per il caricamento degli slot
  const [gameSlotsMode, setGameSlotsMode] = useState(null); // Stato per la modalità di GameSlotsScreen ('new' o 'load')

  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext); // Ottieni isDarkMode e toggleDarkMode dal contesto

  // Debugging: Log del cambio di fase
  useEffect(() => {
    console.log(`*** useGameNavigation: currentPhase cambiato a: ${currentPhase} ***`);
  }, [currentPhase]);

  // Debugging: Traccia il valore di savedSlots
  useEffect(() => {
    console.log('useGameNavigation: savedSlots state updated to:', savedSlots);
  }, [savedSlots]);

  // Debugging: Traccia il valore di gameSlotsMode
  useEffect(() => {
    console.log('useGameNavigation: gameSlotsMode state updated to:', gameSlotsMode);
  }, [gameSlotsMode]);

  // Effetto per caricare i dati in base alla fase
  useEffect(() => {
    if (currentPhase === 'gameSlots') {
      console.log('useGameNavigation: currentPhase è "gameSlots", chiamando fetchAllSavedSlots()...');
      fetchAllSavedSlots();
    }
    if (currentPhase === 'mainGame' && selectedSlot) {
      console.log(`useGameNavigation: currentPhase è "mainGame" per slot ${selectedSlot}, chiamando getGameState()...`);
      getGameState(selectedSlot);
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
      console.error("Backend Error: Errore nel recuperare tutti gli slot salvati:", error);
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
        slot: selectedSlot
      });
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

  const handleSlotSelect = (slot) => {
    console.log("handleSlotSelect chiamato con slot:", slot, "gameSlotsMode corrente:", gameSlotsMode);
    setSelectedSlot(slot);

    // La decisione sulla prossima fase si basa sullo stato effettivo dello slot.
    if (savedSlots[slot]) {
      console.log("handleSlotSelect: Slot occupato, transizione a mainGame.");
      setCurrentPhase('mainGame');
    } else {
      console.log("handleSlotSelect: Slot vuoto, transizione a nameInput.");
      setCurrentPhase('nameInput');
    }
  };

  const handleNameSubmit = async (playerName, slot, selectedAvatar) => {
    try {
      console.log(`useGameNavigation: Inizializzazione gioco per slot ${slot}, nome ${playerName}, avatar ${selectedAvatar}`);
      const res = await axios.post("http://localhost:5050/initialize_game", {
        slot,
        playerName,
        selectedAvatar,
      });
      setGameState(res.data);
      setSelectedSlot(slot);
      await fetchAllSavedSlots();
      setCurrentPhase('mainGame');
      console.log("useGameNavigation: Gioco inizializzato e slot salvati aggiornati.");
    } catch (error) {
      console.error("useGameNavigation: Errore nell'inizializzazione del gioco:", error);
      setCurrentPhase('gameSlots');
      setSelectedSlot(null);
    }
  };

  const handleBackFromInputToSlots = () => {
    console.log("useGameNavigation: Navigando indietro dalla InputScreen alla GameSlotsScreen.");
    setCurrentPhase('gameSlots');
    setGameSlotsMode('new');
    setSelectedSlot(null);
    setGameState(null);
    console.log("useGameNavigation: Dopo handleBackFromInputToSlots, gameSlotsMode impostato a 'new'.");
  };

  const handleBackToGameSlots = () => {
    console.log("useGameNavigation: Navigando indietro dalla MainGame alla GameSlotsScreen.");
    setCurrentPhase('gameSlots');
    setGameSlotsMode('load');
    setSelectedSlot(null);
    setGameState(null);
    console.log("useGameNavigation: Dopo handleBackToGameSlots, gameSlotsMode impostato a 'load'.");
  };

  const handleBackToStart = () => {
    console.log("useGameNavigation: Navigando indietro alla StartScreen (reset completo).");
    setCurrentPhase('start');
    setSelectedSlot(null);
    setGameState(null);
    setSavedSlots({});
    setGameSlotsMode(null);
  };

  const handleBackToGameSelection = () => {
    console.log("useGameNavigation: Navigando indietro alla GameSelectionScreen.");
    setCurrentPhase('gameSelection');
    setGameSlotsMode(null);
  };

  const handleNewGameSelection = () => {
    setGameSlotsMode('new');
    setCurrentPhase('gameSlots');
    console.log("useGameNavigation: handleNewGameSelection chiamato. gameSlotsMode impostato a 'new'.");
  };

  const handleLoadGameSelection = () => {
    setGameSlotsMode('load');
    setCurrentPhase('gameSlots');
    console.log("useGameNavigation: handleLoadGameSelection chiamato. gameSlotsMode impostato a 'load'.");
  };

  // Restituisci tutti gli stati e le funzioni necessarie al componente App
  return {
    gameState,
    currentPhase,
    selectedSlot,
    savedSlots,
    isLoadingSlots,
    gameSlotsMode,
    isDarkMode, // Passa anche isDarkMode dal contesto
    toggleDarkMode, // Passa anche toggleDarkMode dal contesto
    doAction,
    handleStartGame,
    handleSlotSelect,
    handleNameSubmit,
    handleBackFromInputToSlots,
    handleBackToGameSlots,
    handleBackToStart,
    handleBackToGameSelection,
    handleNewGameSelection,
    handleLoadGameSelection,
  };
};

export default useGameNavigation;
