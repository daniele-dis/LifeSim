import { useState, useEffect, useCallback } from 'react';

// URL del tuo backend Flask. Assicurati che corrisponda a dove sta girando il tuo Flask!
const API_BASE_URL = 'http://127.0.0.1:5050';

const useGameNavigation = () => {
    // Stato per la schermata corrente
    const [currentPhase, setCurrentPhase] = useState('start'); // 'start', 'gameSelection', 'gameSlots', 'nameInput', 'mainGame'
    // Stato del gioco corrente (felicita, soldi, energia, nome, avatar)
    const [gameState, setGameState] = useState(null);
    // Numero dello slot di gioco attualmente attivo
    const [selectedSlot, setSelectedSlot] = useState(null);
    // Stato per i riepiloghi degli slot (usato in GameSlotsScreen)
    const [savedSlots, setSavedSlots] = useState({});
    // Stato per indicare se il caricamento degli slot è in corso
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    // Modalità degli slot (es. 'new' o 'load')
    const [gameSlotsMode, setGameSlotsMode] = useState(null);
    // Stato per il tema (modalità scura/chiara)
    const [isDarkMode, setIsDarkMode] = useState(true);
    // Stato per i suggerimenti dell'IA
    const [aiSuggestion, setAiSuggestion] = useState(null);
    // Stato per messaggi di caricamento/errore
    const [message, setMessage] = useState('');

    // NEW: Stato per gestire il cooldown dei suggerimenti AI
    const AI_SUGGESTION_COOLDOWN_TURNS = 3; // L'IA suggerirà ogni 3 turni
    const [turnsSinceLastAiSuggestion, setTurnsSinceLastAiSuggestion] = useState(0);

    // Effetto per caricare il tema salvato all'avvio
    useEffect(() => {
        const savedTheme = localStorage.getItem('isDarkMode');
        if (savedTheme !== null) {
            setIsDarkMode(JSON.parse(savedTheme));
        }
    }, []);

    // Effetto per applicare la classe del tema al body (o #root)
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

    // Funzione per generare un suggerimento AI
    const generateAiSuggestion = useCallback(async (slot, force = false) => {
        // Se non è un'azione forzata (es. inizio partita) e il cooldown non è terminato, non suggerire
        if (!force && turnsSinceLastAiSuggestion < AI_SUGGESTION_COOLDOWN_TURNS) {
            console.log(`AI Cooldown: ${turnsSinceLastAiSuggestion}/${AI_SUGGESTION_COOLDOWN_TURNS} turni. Nessun suggerimento AI per ora.`);
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
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            const data = await response.json();
            setAiSuggestion(data); // Imposta il suggerimento AI ricevuto
            setMessage('');
            // Resetta il contatore dei turni dopo un suggerimento effettivo
            setTurnsSinceLastAiSuggestion(0);
        } catch (error) {
            console.error("Errore nel generare il suggerimento AI:", error);
            setMessage('Errore nel caricare il suggerimento IA.');
            setAiSuggestion(null);
        }
    }, [AI_SUGGESTION_COOLDOWN_TURNS, turnsSinceLastAiSuggestion]); // Dipende anche da questi stati

    // Funzione per caricare lo stato del gioco da un dato slot
    const loadGameState = useCallback(async (slotNumber) => {
        setMessage('Caricamento partita...');
        try {
            const response = await fetch(`${API_BASE_URL}/get_game_state/${slotNumber}`);
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            const data = await response.json();
            setGameState(data);
            setSelectedSlot(slotNumber);
            setCurrentPhase('mainGame');
            setMessage('');
            // Dopo aver caricato lo stato, genera subito un suggerimento AI (forzato)
            setTurnsSinceLastAiSuggestion(0); // Assicurati che parta da 0 per il primo suggerimento
            generateAiSuggestion(slotNumber, true); // Forza il suggerimento al caricamento
        } catch (error) {
            console.error("Errore nel caricare lo stato del gioco:", error);
            setMessage(`Errore nel caricare la partita dallo slot ${slotNumber}.`);
            setGameState(null);
            setSelectedSlot(null);
        }
    }, [generateAiSuggestion]); // Dipende da generateAiSuggestion

    // Funzione per inizializzare un nuovo gioco
    const handleNameSubmit = useCallback(async (playerName, selectedAvatar) => {
        setMessage('Inizializzazione nuova partita...');
        try {
            const response = await fetch(`${API_BASE_URL}/initialize_game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slot: selectedSlot, playerName, selectedAvatar })
            });
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            const data = await response.json();
            setGameState(data);
            setCurrentPhase('mainGame');
            setMessage('');
            // Dopo aver inizializzato, genera il primo suggerimento AI (forzato)
            setTurnsSinceLastAiSuggestion(0); // Assicurati che parta da 0 per il primo suggerimento
            generateAiSuggestion(selectedSlot, true); // Forza il suggerimento all'inizializzazione
        } catch (error) {
            console.error("Errore nell'inizializzare il gioco:", error);
            setMessage('Errore nell\'inizializzare la nuova partita.');
            setGameState(null);
            setSelectedSlot(null);
        }
    }, [selectedSlot, generateAiSuggestion]); // Dipende da selectedSlot e generateAiSuggestion

    // Funzione per eseguire un'azione di gioco
    const doAction = useCallback(async (actionType) => {
        if (!selectedSlot) {
            setMessage('Nessun gioco attivo. Si prega di caricare o iniziare una nuova partita.');
            return;
        }
        setMessage(`Esecuzione azione: ${actionType}...`);
        setAiSuggestion(null); // Pulisce il suggerimento AI quando l'utente esegue un'azione manuale
        setTurnsSinceLastAiSuggestion(prev => prev + 1); // Incrementa il contatore dei turni

        try {
            const response = await fetch(`${API_BASE_URL}/do_action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ azione: actionType, slot: selectedSlot })
            });
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            const updatedState = await response.json();
            setGameState(updatedState);
            setMessage('');
            // Dopo ogni azione, se il cooldown è terminato, chiedi un nuovo suggerimento all'IA
            generateAiSuggestion(selectedSlot);
        } catch (error) {
            console.error(`Errore nell'azione ${actionType}:`, error);
            setMessage(`Errore nell'esecuzione dell'azione ${actionType}.`);
        }
    }, [selectedSlot, generateAiSuggestion]); // Dipende da selectedSlot e generateAiSuggestion

    // Funzione per accettare un suggerimento AI
    const handleAcceptSuggestion = useCallback(async (actionType) => {
        if (!selectedSlot) {
            setMessage('Nessun gioco attivo per accettare il suggerimento.');
            return;
        }
        setMessage(`Accettando il suggerimento: ${actionType}...`);
        setAiSuggestion(null); // Pulisce il suggerimento prima di eseguire l'azione
        setTurnsSinceLastAiSuggestion(prev => prev + 1); // Incrementa il contatore dei turni

        try {
            const response = await fetch(`${API_BASE_URL}/do_action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ azione: actionType, slot: selectedSlot })
            });
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            const updatedState = await response.json();
            setGameState(updatedState);
            setMessage('');
            // Dopo aver accettato il suggerimento, genera un nuovo suggerimento AI (se il cooldown lo permette)
            generateAiSuggestion(selectedSlot);
        } catch (error) {
            console.error(`Errore nell'accettare il suggerimento ${actionType}:`, error);
            setMessage(`Errore nell'accettare il suggerimento ${actionType}.`);
        }
    }, [selectedSlot, generateAiSuggestion]); // Dipende da selectedSlot e generateAiSuggestion

    // Funzione per rifiutare un suggerimento AI
    const handleRejectSuggestion = useCallback(() => {
        setAiSuggestion(null); // Semplicemente nasconde il suggerimento
        setMessage('Suggerimento IA rifiutato. Puoi scegliere un\'azione manuale.');
        setTurnsSinceLastAiSuggestion(prev => prev + 1); // Incrementa il contatore dei turni anche se rifiutato
        // Non generiamo un nuovo suggerimento subito, l'utente può fare un'azione manuale.
        // Un nuovo suggerimento verrà generato dopo la prossima azione dell'utente (se il cooldown lo permette).
    }, []);

    // Funzione per caricare tutti gli slot di gioco disponibili
    const fetchGameSlotSummaries = useCallback(async () => {
        setIsLoadingSlots(true);
        setMessage('Caricamento slot di gioco...');
        try {
            const response = await fetch(`${API_BASE_URL}/get_all_slots`);
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            const data = await response.json();
            setSavedSlots(data);
            setMessage('');
        } catch (error) {
            console.error("Errore nel recuperare i riepiloghi degli slot:", error);
            setMessage('Errore nel caricare gli slot di gioco.');
            setSavedSlots({});
        } finally {
            setIsLoadingSlots(false);
        }
    }, []);

    // --- Funzioni di navigazione ---
    const handleStartGame = useCallback(() => {
        setCurrentPhase('gameSelection');
    }, []);

    const handleNewGameSelection = useCallback(() => {
        setGameSlotsMode('new');
        fetchGameSlotSummaries(); // Per vedere quali slot sono già occupati
        setCurrentPhase('gameSlots');
    }, [fetchGameSlotSummaries]);

    const handleLoadGameSelection = useCallback(() => {
        setGameSlotsMode('load');
        fetchGameSlotSummaries(); // Per caricare i riepiloghi degli slot esistenti
        setCurrentPhase('gameSlots');
    }, [fetchGameSlotSummaries]);

    const handleSlotSelect = useCallback((slotNumber) => {
        setSelectedSlot(slotNumber);
        if (gameSlotsMode === 'new') {
            setCurrentPhase('nameInput');
        } else if (gameSlotsMode === 'load') {
            loadGameState(slotNumber);
        }
    }, [gameSlotsMode, loadGameState]);

    const handleBackFromInputToSlots = useCallback(() => {
        setCurrentPhase('gameSlots');
    }, []);

    const handleBackToGameSelection = useCallback(() => {
        setGameState(null); // Resetta lo stato del gioco quando si torna indietro dalla partita
        setAiSuggestion(null); // Resetta il suggerimento AI
        setSelectedSlot(null);
        setTurnsSinceLastAiSuggestion(0); // Resetta il contatore dei turni AI
        setCurrentPhase('gameSelection');
    }, []);

    const handleBackToStart = useCallback(() => {
        setCurrentPhase('start');
    }, []);

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
    };
};

export default useGameNavigation;
