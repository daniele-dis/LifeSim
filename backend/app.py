# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import random

app = Flask(__name__)
# Abilita CORS per permettere al frontend React di comunicare con questo backend
CORS(app)

# Percorso del file dove salveremo i dati di gioco
SAVE_FILE = 'game_slots.json'

# --- Funzioni per Caricare/Salvare Slot su File ---
def load_game_slots():
    """
    Carica gli slot di gioco dal file SAVE_FILE.
    Viene chiamata ad ogni richiesta per assicurare che i dati siano sempre aggiornati.
    """
    if os.path.exists(SAVE_FILE):
        with open(SAVE_FILE, 'r') as f:
            try:
                data = json.load(f)
                print(f"Backend: Caricati slot da {SAVE_FILE}: {data}") # Log per debug
                return data
            except json.JSONDecodeError:
                print(f"Backend: Errore di decodifica JSON in {SAVE_FILE}. Inizializzazione a vuoto.")
                return {}
    print(f"Backend: {SAVE_FILE} non trovato. Inizializzazione a vuoto.") # Log per debug
    return {}

def save_game_slots(slots):
    """
    Salva gli slot di gioco nel file SAVE_FILE.
    Viene chiamata dopo ogni modifica ai dati di gioco.
    """
    with open(SAVE_FILE, 'w') as f:
        json.dump(slots, f, indent=4)
        print(f"Backend: Salvati slot su {SAVE_FILE}: {slots}") # Log per debug

# --- Endpoint per inizializzare o caricare uno slot ---
@app.route("/initialize_game", methods=["POST"])
def initialize_game():
    """
    Inizializza un nuovo gioco in uno slot specificato, salvando nome e avatar.
    Se lo slot esiste, lo sovrascrive.
    Aggiunge il campo 'current_suggestion' per le interazioni AI.
    """
    # Carica lo stato più recente dal file prima di modificarlo
    game_slots = load_game_slots()

    data = request.json
    slot_number = str(data.get("slot")) # Converti in stringa per chiavi JSON
    player_name = data.get("playerName")
    selected_avatar = data.get("selectedAvatar")

    if not all([slot_number, player_name, selected_avatar]):
        return jsonify({"message": "Dati insufficienti per inizializzare il gioco."}), 400

    # Inizializza un nuovo stato per questo slot o aggiorna uno esistente
    game_slots[slot_number] = {
        "nome": player_name,
        "avatar": selected_avatar, # Salviamo l'avatar qui
        "soldi": 100,
        "energia": 50,
        "felicita": 70,
        "current_suggestion": None # NEW: Campo per la suggerimento AI corrente
    }

    # Salva i game_slots aggiornati sul file per persistenza
    save_game_slots(game_slots)

    # Restituisce lo stato del gioco appena creato/aggiornato per lo slot corrente
    return jsonify(game_slots[slot_number])

# --- Endpoint per ottenere lo stato di un gioco specifico (ad esempio, dopo il caricamento) ---
@app.route("/get_game_state/<int:slot_num>", methods=["GET"])
def get_game_state(slot_num):
    """
    Restituisce lo stato completo del gioco per uno slot specifico.
    Usato quando si carica una partita.
    """
    # Carica lo stato più recente dal file
    game_slots = load_game_slots()

    slot_key = str(slot_num)
    if slot_key in game_slots:
        return jsonify(game_slots[slot_key])
    return jsonify({"message": f"Slot {slot_num} non trovato."}), 404

@app.route("/debug_slots", methods=["GET"])
def debug_slots():
    slots = load_game_slots()
    print(f"Debug: slot correnti: {slots}")
    return jsonify(slots)

# --- NEW: Endpoint per generare un suggerimento AI ---
@app.route("/generate_ai_suggestion", methods=["POST"])
def generate_ai_suggestion():
    game_slots = load_game_slots()
    data = request.json
    current_slot = str(data.get("slot"))

    if current_slot not in game_slots:
        return jsonify({"message": "Nessun gioco attivo per questo slot."}), 400

    state = game_slots[current_slot]
    suggestion = None

    # Logic for AI suggestions based on game state
    if state["energia"] < 30 and state["felicita"] < 50:
        suggestion = {"action": "dormi", "text": f"{state['nome']}, sembri esausto e un po' giù. Forse una bella dormita ti rimetterebbe in sesto?"}
    elif state["soldi"] < 50:
        suggestion = {"action": "lavoro", "text": f"I tuoi soldi stanno scarseggiando, {state['nome']}. È tempo di rimboccarsi le maniche e andare a lavorare!"}
    elif state["felicita"] < 40:
        suggestion = {"action": "divertiti", "text": f"La felicità è bassa, {state['nome']}. Che ne dici di fare qualcosa di divertente per tirarti su il morale?"}
    elif state["energia"] < 20:
        suggestion = {"action": "dormi", "text": f"{state['nome']}, la tua energia è quasi a zero. È fondamentale riposare!"}
    else:
        # If no critical need, suggest a random action or a balanced one
        possible_suggestions = [
            {"action": "lavoro", "text": f"{state['nome']}, potresti guadagnare un po' di più. Hai voglia di lavorare?"},
            {"action": "dormi", "text": f"Un po' di riposo non guasta mai, {state['nome']}. Vuoi fare un pisolino?"},
            {"action": "divertiti", "text": f"La vita è anche divertimento! Che ne dici di goderti un po' di tempo libero, {state['nome']}?"}
        ]
        suggestion = random.choice(possible_suggestions)

    state["current_suggestion"] = suggestion # Store the suggestion in the game state
    save_game_slots(game_slots)
    return jsonify(suggestion)

# --- Endpoint per eseguire azioni (modificato per usare lo slot corrente e gestire suggerimenti) ---
@app.route("/do_action", methods=["POST"])
def do_action():
    game_slots = load_game_slots()

    data = request.json
    azione = data.get("azione")
    current_slot = str(data.get("slot"))

    if current_slot not in game_slots:
        return jsonify({"message": "Nessun gioco attivo per questo slot."}), 400

    state = game_slots[current_slot]

    # Clear current suggestion after an action is performed
    state["current_suggestion"] = None

    if azione == "lavoro":
        state["soldi"] += 50
        state["energia"] -= 20
        state["felicita"] = max(0, state.get("felicita", 0) - 10) # Adjusted happiness decrease for working
    elif azione == "dormi":
        state["energia"] = min(100, state.get("energia", 0) + 40) # Increased energy recovery
        state["felicita"] = min(100, state.get("felicita", 0) + 10) # Increased happiness from rest
    elif azione == "divertiti":
        state["felicita"] = min(100, state.get("felicita", 0) + 30) # Increased happiness from fun
        state["soldi"] = max(0, state.get("soldi", 0) - 20) # Increased money cost for fun
        state["energia"] = max(0, state.get("energia", 0) - 15) # Increased energy cost for fun

    # Assicuriamoci di limare tutti i valori
    state["energia"] = max(0, min(state.get("energia", 0), 100))
    state["felicita"] = max(0, min(state.get("felicita", 0), 100))
    state["soldi"] = max(0, state.get("soldi", 0))

    save_game_slots(game_slots)
    return jsonify(state)

# --- Endpoint per ottenere tutti gli slot disponibili (utile per "Carica Partita") ---
@app.route("/get_all_slots", methods=["GET"])
def get_all_slots():
    """
    Restituisce un riepilogo di tutti gli slot di gioco salvati (nome e avatar).
    Usato per popolare la schermata di selezione slot.
    """
    # Carica lo stato più recente dal file prima di restituirlo
    game_slots = load_game_slots()

    slot_summaries = {}
    for slot_num, data in game_slots.items():
        slot_summaries[slot_num] = {
            "nome": data.get("nome"),
            "avatar": data.get("avatar")
        }
    print(f"Backend: Restituiti riepiloghi slot: {slot_summaries}") # Log per debug
    return jsonify(slot_summaries)

if __name__ == "__main__":
    # Assicurati che questa porta sia la stessa configurata nel tuo frontend (API_BASE_URL)
    app.run(debug=True, port=5050)
