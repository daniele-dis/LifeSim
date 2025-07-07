from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
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
        "felicità": 70
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


# --- Endpoint per eseguire azioni (modificato per usare lo slot corrente) ---
@app.route("/do_action", methods=["POST"])
def do_action():
    """
    Esegue un'azione di gioco (es. lavoro, dormi) per lo slot corrente
    e aggiorna il suo stato.
    """
    # Carica lo stato più recente dal file
    game_slots = load_game_slots() 
    
    data = request.json
    azione = data.get("azione")
    current_slot = str(data.get("slot")) # Ottieni l'ID dello slot dalla richiesta frontend

    if current_slot not in game_slots:
        return jsonify({"message": "Nessun gioco attivo per questo slot."}), 400

    state_in_slot = game_slots[current_slot]

    if azione == "lavoro":
        state_in_slot["soldi"] += 50
        state_in_slot["energia"] -= 20
    elif azione == "dormi":
        state_in_slot["energia"] += 30
        state_in_slot["felicità"] += 5
    elif azione == "divertiti":
        state_in_slot["felicità"] += 20
        state_in_slot["soldi"] -= 15
    
    # Salva i game_slots aggiornati sul file dopo ogni azione
    save_game_slots(game_slots)

    return jsonify(state_in_slot)

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
    app.run(debug=True, port=5050)
