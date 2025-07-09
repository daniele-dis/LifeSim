import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://127.0.0.1:5050';

const useGameNavigation = () => {
    const [currentPhase, setCurrentPhase] = useState('start'); 
    const [gameState, setGameState] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [savedSlots, setSavedSlots] = useState({});
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [gameSlotsMode, setGameSlotsMode] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [message, setMessage] = useState(''); // This will now display backend messages

    const AI_SUGGESTION_COOLDOWN_TURNS = 5; // AI suggests every 5 turns/actions
    const [turnsSinceLastAiSuggestion, setTurnsSinceLastAiSuggestion] = useState(0);

    useEffect(() => {
        const savedTheme = localStorage.getItem('isDarkMode');
        if (savedTheme !== null) {
            setIsDarkMode(JSON.parse(savedTheme));
        }
    }, []);

    useEffect(() => {
        const root = document.getElementById('root');
        if (root) {
            if (isDarkMode) {
                root.classList.remove('light-mode');
            } else {
                root.classList.add('light-mode');
            }
        }
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    const generateAiSuggestion = useCallback(async (slot, force = false) => {
        // If game is over, no more suggestions
        if (gameState && gameState.is_game_over) {
            setAiSuggestion(null);
            return;
        }

        if (!force && turnsSinceLastAiSuggestion < AI_SUGGESTION_COOLDOWN_TURNS) {
            console.log(`AI Cooldown: ${turnsSinceLastAiSuggestion}/${AI_SUGGESTION_COOLDOWN_TURNS} turns. No AI suggestion for now.`);
            return;
        }

        setMessage('L\'IA sta pensando...');
        try {
            const response = await fetch(`${API_BASE_URL}/generate_ai_suggestion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slot: slot })
            });
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const data = await response.json();
            setAiSuggestion(data);
            setMessage('');
            setTurnsSinceLastAiSuggestion(0);
        } catch (error) {
            console.error("Error generating AI suggestion:", error);
            setMessage('Error loading AI suggestion.');
            setAiSuggestion(null);
        }
    }, [AI_SUGGESTION_COOLDOWN_TURNS, turnsSinceLastAiSuggestion, gameState]); 

    const loadGameState = useCallback(async (slotNumber) => {
        setMessage('Caricamento partita...');
        try {
            const response = await fetch(`${API_BASE_URL}/get_game_state/${slotNumber}`);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const data = await response.json();
            setGameState(data);
            setSelectedSlot(slotNumber);
            setCurrentPhase('mainGame');
            setMessage(data.message || ''); // Display initial message from loaded state
            setTurnsSinceLastAiSuggestion(0);
            generateAiSuggestion(slotNumber, true); 
        } catch (error) {
            console.error("Error loading game state:", error);
            setMessage(`Error loading game from slot ${slotNumber}.`);
            setGameState(null);
            setSelectedSlot(null);
        }
    }, [generateAiSuggestion]);

    const handleNameSubmit = useCallback(async (playerName, selectedAvatar) => {
        setMessage('Inizializzazione nuova partita...');
        try {
            const response = await fetch(`${API_BASE_URL}/initialize_game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slot: selectedSlot, playerName, selectedAvatar })
            });
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const data = await response.json();
            setGameState(data);
            setCurrentPhase('mainGame');
            setMessage(data.message || ''); // Display initial message from new game
            setTurnsSinceLastAiSuggestion(0);
            generateAiSuggestion(selectedSlot, true); 
        } catch (error) {
            console.error("Error initializing game:", error);
            setMessage('Error initializing new game.');
            setGameState(null);
            setSelectedSlot(null);
        }
    }, [selectedSlot, generateAiSuggestion]);

    const doAction = useCallback(async (actionType) => {
        if (!selectedSlot) {
            setMessage('No active game. Please load or start a new game.');
            return;
        }
        if (gameState && gameState.is_game_over) {
            setMessage(gameState.message); // Show death message if already game over
            return;
        }

        setMessage(`Executing action: ${actionType}...`);
        setAiSuggestion(null); 
        setTurnsSinceLastAiSuggestion(prev => prev + 1);

        try {
            const response = await fetch(`${API_BASE_URL}/do_action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ azione: actionType, slot: selectedSlot })
            });
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const updatedState = await response.json();
            setGameState(updatedState);
            setMessage(updatedState.message || ''); // Display message from action result

            // Only generate new AI suggestion if game is NOT over
            if (!updatedState.is_game_over) {
                generateAiSuggestion(selectedSlot);
            }
        } catch (error) {
            console.error(`Error in action ${actionType}:`, error);
            setMessage(`Error executing action ${actionType}.`);
        }
    }, [selectedSlot, generateAiSuggestion, gameState]);

    const handleAcceptSuggestion = useCallback(async (actionType) => {
        if (!selectedSlot) {
            setMessage('No active game to accept suggestion.');
            return;
        }
        if (gameState && gameState.is_game_over) {
            setMessage(gameState.message);
            return;
        }
        setMessage(`Accepting suggestion: ${actionType}...`);
        setAiSuggestion(null); 
        setTurnsSinceLastAiSuggestion(prev => prev + 1);

        try {
            const response = await fetch(`${API_BASE_URL}/do_action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ azione: actionType, slot: selectedSlot })
            });
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const updatedState = await response.json();
            setGameState(updatedState);
            setMessage(updatedState.message || '');

            if (!updatedState.is_game_over) {
                generateAiSuggestion(selectedSlot);
            }
        } catch (error) {
            console.error(`Error accepting suggestion ${actionType}:`, error);
            setMessage(`Error accepting suggestion ${actionType}.`);
        }
    }, [selectedSlot, generateAiSuggestion, gameState]);

    const handleRejectSuggestion = useCallback(() => {
        if (gameState && gameState.is_game_over) {
            setMessage(gameState.message);
            return;
        }
        setAiSuggestion(null);
        setMessage('AI suggestion rejected. You can choose a manual action.');
        setTurnsSinceLastAiSuggestion(prev => prev + 1); 
    }, [gameState]);

    const fetchGameSlotSummaries = useCallback(async () => {
        setIsLoadingSlots(true);
        setMessage('Loading game slots...');
        try {
            const response = await fetch(`${API_BASE_URL}/get_all_slots`);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const data = await response.json();
            setSavedSlots(data);
            setMessage('');
        } catch (error) {
            console.error("Error fetching slot summaries:", error);
            setMessage('Error loading game slots.');
            setSavedSlots({});
        } finally {
            setIsLoadingSlots(false);
        }
    }, []);

    const handleStartGame = useCallback(() => {
        setCurrentPhase('gameSelection');
    }, []);

    const handleNewGameSelection = useCallback(() => {
        setGameSlotsMode('new');
        fetchGameSlotSummaries();
        setCurrentPhase('gameSlots');
    }, [fetchGameSlotSummaries]);

    const handleLoadGameSelection = useCallback(() => {
        setGameSlotsMode('load');
        fetchGameSlotSummaries();
        setCurrentPhase('gameSlots');
    }, [fetchGameSlotSummaries]);



    const handleBackFromInputToSlots = useCallback(() => {
        setCurrentPhase('gameSlots');
    }, []);

    const handleBackToGameSelection = useCallback(() => {
        setGameState(null); 
        setAiSuggestion(null);
        setSelectedSlot(null);
        setTurnsSinceLastAiSuggestion(0);
        setMessage(''); // Clear any game-over messages
        setCurrentPhase('gameSelection');
    }, []);

    const handleBackToStart = useCallback(() => {
        setGameState(null); // Clear game state if going all the way back to start
        setAiSuggestion(null);
        setSelectedSlot(null);
        setTurnsSinceLastAiSuggestion(0);
        setMessage('');
        setCurrentPhase('start');
    }, []);

    const deleteSlot = useCallback(async (slotNumber) => {
    setMessage(`Eliminazione slot ${slotNumber}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/delete_slot/${slotNumber}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = await response.json();
        setMessage(data.message || 'Slot eliminato.');

        // Aggiorna la lista degli slot dopo eliminazione
        fetchGameSlotSummaries();

        // Se stavi giocando su questo slot, resetta lo stato
        if (selectedSlot === slotNumber) {
            setGameState(null);
            setSelectedSlot(null);
            setCurrentPhase('gameSelection');
        }

    } catch (error) {
        console.error("Errore eliminando slot:", error);
        setMessage('Errore durante l\'eliminazione dello slot.');
    }
}, [selectedSlot, fetchGameSlotSummaries]);


const handleSlotSelect = useCallback((slotNumber) => {
    setSelectedSlot(slotNumber);
    if (gameSlotsMode === 'new') {
        setCurrentPhase('nameInput');
    } else if (gameSlotsMode === 'load') {
        loadGameState(slotNumber);
    } else if (gameSlotsMode === 'delete') {
        deleteSlot(slotNumber); // questa funzione deve essere definita da te
    }
}, [gameSlotsMode, loadGameState, deleteSlot]); // ⬅️ aggiunto deleteSlot qui

    return {
        gameState,
        currentPhase,
        selectedSlot,
        savedSlots,
        isLoadingSlots,
        gameSlotsMode,
        isDarkMode,
        toggleDarkMode: () => setIsDarkMode(prevMode => !prevMode),
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
        deleteSlot,
    };
};

export default useGameNavigation;