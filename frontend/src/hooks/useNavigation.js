import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ThemeContext from '../ThemeContext';

const useGameNavigation = () => {
  const [gameState, setGameState] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('start');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [savedSlots, setSavedSlots] = useState({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [gameSlotsMode, setGameSlotsMode] = useState(null);

  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (currentPhase === 'gameSlots') {
      fetchAllSavedSlots();
    }
    if (currentPhase === 'mainGame' && selectedSlot) {
      getGameState(selectedSlot);
    }
  }, [currentPhase, selectedSlot]);

  const getGameState = async (slotNum) => {
    try {
      const res = await axios.get(`http://localhost:5050/get_game_state/${slotNum}`);
      setGameState(res.data);
    } catch (error) {
      console.error("Errore nel caricare lo stato:", error);
      setCurrentPhase('gameSlots');
      setSelectedSlot(null);
    }
  };

  const fetchAllSavedSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const res = await axios.get(`http://localhost:5050/get_all_slots?ts=${Date.now()}`); 
      setSavedSlots(res.data);
    } catch (error) {
      console.error("Errore nel recuperare gli slot:", error);
      setSavedSlots({});
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const doAction = async (azione) => {
  if (!selectedSlot) return;
  try {
    const res = await axios.post("http://localhost:5050/do_action", {
      azione: azione,
      slot: selectedSlot
    });

    const updatedState = res.data;

    // Forza il re-render azzerando e poi aggiornando lo stato
    setGameState(null);
    setTimeout(() => {
      setGameState(updatedState);
    }, 10);

    console.log("Stato aggiornato dopo azione:", updatedState);
  } catch (error) {
    console.error("Errore nell'azione:", error);
  }
};



  // Funzioni di navigazione (rimangono invariate)
  const handleStartGame = () => setCurrentPhase('gameSelection');
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    savedSlots[slot] ? setCurrentPhase('mainGame') : setCurrentPhase('nameInput');
  };
  const handleNameSubmit = async (playerName, slot, selectedAvatar) => {
    try {
      const res = await axios.post("http://localhost:5050/initialize_game", { slot, playerName, selectedAvatar });
      setGameState(res.data);
      setSelectedSlot(slot);
      await fetchAllSavedSlots();
      setCurrentPhase('mainGame');
    } catch (error) {
      console.error("Errore inizializzazione:", error);
      setCurrentPhase('gameSlots');
      setSelectedSlot(null);
    }
  };
  const handleBackFromInputToSlots = () => {
    setCurrentPhase('gameSlots');
    setGameSlotsMode('new');
    setSelectedSlot(null);
    setGameState(null);
  };
  const handleBackToGameSlots = () => {
    setCurrentPhase('gameSlots');
    setGameSlotsMode('load');
    setSelectedSlot(null);
    setGameState(null);
  };
  const handleBackToStart = () => {
    setCurrentPhase('start');
    setSelectedSlot(null);
    setGameState(null);
    setSavedSlots({});
    setGameSlotsMode(null);
  };
  const handleBackToGameSelection = () => setCurrentPhase('gameSelection');
  const handleNewGameSelection = () => {
    setGameSlotsMode('new');
    setCurrentPhase('gameSlots');
  };
  const handleLoadGameSelection = () => {
    setGameSlotsMode('load');
    setCurrentPhase('gameSlots');
  };

  return {
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
    handleBackToGameSelection,
    handleNewGameSelection,
    handleLoadGameSelection,
  };
};

export default useGameNavigation;