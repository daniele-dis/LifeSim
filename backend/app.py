from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import shutil
import random

app = Flask(__name__)
CORS(app)

SAVE_FILE = 'game_slots.json'
SAVE_FOLDER = 'data'

def load_game_slots():
    if os.path.exists(SAVE_FILE):
        with open(SAVE_FILE, 'r') as f:
            try:
                data = json.load(f)
                print(f"Backend: Caricati slot da {SAVE_FILE}: {data}")
                return data
            except json.JSONDecodeError:
                print(f"Backend: Errore di decodifica JSON in {SAVE_FILE}. Inizializzazione a vuoto.")
                return {}
    print(f"Backend: {SAVE_FILE} non trovato. Inizializzazione a vuoto.")
    return {}

def save_game_slots(slots):
    with open(SAVE_FILE, 'w') as f:
        json.dump(slots, f, indent=4)
        print(f"Backend: Salvati slot su {SAVE_FILE}: {slots}")

# --- Helper Functions for Game Logic ---

def clamp(value, min_val, max_val):
    return max(min_val, min(value, max_val))

def get_random_partner_name():
    first_names = ["Marco", "Giulia", "Andrea", "Sofia", "Luca", "Chiara", "Francesco", "Martina"]
    last_names = ["Rossi", "Bianchi", "Verdi", "Russo", "Ferrari", "Esposito"]
    return f"{random.choice(first_names)} {random.choice(last_names)}"

def generate_random_child_name():
    gender = random.choice(['male', 'female'])
    male_names = ["Alessandro", "Gabriele", "Leonardo", "Riccardo", "Tommaso"]
    female_names = ["Aurora", "Beatrice", "Camilla", "Elena", "Emma"]
    return random.choice(male_names) if gender == 'male' else random.choice(female_names)

def check_game_over(state):
    # Death by old age
    if state["eta"] >= 100:
        return True, "sei morto di vecchiaia dopo una lunga vita!"
    
    # Death by extreme unhappiness/lack of energy/money
    if state["felicita"] <= 0:
        return True, "sei morto di tristezza e disperazione."
    if state["energia"] <= 0:
        return True, "sei morto di sfinimento totale."
    if state["soldi"] <= -50: # Example: go into deep debt
        return True, "sei morto di stenti e povertà estrema."
    
    # Random accidents (e.g., 1% chance per turn after age 30)
    if state["eta"] >= 30 and random.random() < 0.005: # 0.5% chance per turn
        death_reasons = [
            "sei morto in un bizzarro incidente domestico.",
            "sei morto in un incidente stradale.",
            "sei morto a causa di un'improvvisa malattia.",
            "sei morto per un attacco di cuore inaspettato."
        ]
        return True, random.choice(death_reasons)
        
    return False, None

# --- API Endpoints ---

@app.route("/initialize_game", methods=["POST"])
def initialize_game():
    game_slots = load_game_slots()
    data = request.json
    slot_number = str(data.get("slot"))
    player_name = data.get("playerName")
    selected_avatar = data.get("selectedAvatar")

    if not all([slot_number, player_name, selected_avatar]):
        return jsonify({"message": "Dati insufficienti per inizializzare il gioco."}), 400

    game_slots[slot_number] = {
        "nome": player_name,
        "avatar": selected_avatar,
        "soldi": 200,      # Start with more money
        "energia": 70,     # Start with more energy
        "felicita": 80,    # Start with more happiness
        "eta": 18,
        "giorni_passati": 0,
        "relazione": {
            "stato": "single",
            "partner_nome": None,
            "felicita_relazione": 0
        },
        "figli": [],
        "current_suggestion": None,
        "message": "Benvenuto nella tua nuova vita!",
        "is_game_over": False,
        "death_reason": None
    }
    save_game_slots(game_slots)
    return jsonify(game_slots[slot_number])

@app.route("/get_game_state/<int:slot_num>", methods=["GET"])
def get_game_state(slot_num):
    game_slots = load_game_slots()
    slot_key = str(slot_num)
    if slot_key in game_slots:
        return jsonify(game_slots[slot_key])
    return jsonify({"message": f"Slot {slot_num} non trovato."}), 404

@app.route("/debug_slots", methods=["GET"])
def debug_slots():
    slots = load_game_slots()
    return jsonify(slots)



@app.route("/generate_ai_suggestion", methods=["POST"])
def generate_ai_suggestion():
    game_slots = load_game_slots()
    data = request.json
    current_slot = str(data.get("slot"))

    if current_slot not in game_slots:
        return jsonify({"message": "Nessun gioco attivo per questo slot."}), 400

    state = game_slots[current_slot]
    suggestion = None

    # Priority 1: Critical Stats
    if state["energia"] < 20:
        suggestion = {"action": "dormi", "text": f"{state['nome']}, sei esausto. È vitale riposare!"}
    elif state["felicita"] < 30:
        if state["relazione"]["stato"] in ["fidanzato", "sposato"] and state["relazione"]["felicita_relazione"] < 50:
            suggestion = {"action": "esci_con_partner", "text": f"{state['nome']}, la tua felicità è bassa, e anche quella di {state['relazione']['partner_nome']} non è al top. Un'uscita insieme potrebbe aiutare entrambi!"}
        else:
            suggestion = {"action": "divertiti", "text": f"{state['nome']}, la tua felicità è bassa. Fai qualcosa che ti piace!"}
    elif state["soldi"] < 100:
        suggestion = {"action": "lavoro", "text": f"I tuoi soldi stanno scarseggiando, {state['nome']}. È tempo di guadagnare!"}
    elif state["relazione"]["stato"] in ["fidanzato", "sposato"] and state["relazione"]["felicita_relazione"] < 40:
        # **Aggiunto: Suggerimento per crisi di relazione**
        if state["relazione"]["felicita_relazione"] < 20 and random.random() < 0.5: # Più probabile se molto bassa
            suggestion = {"action": "parla_con_partner", "text": f"La tua relazione con {state['relazione']['partner_nome']} è in crisi profonda. Devi parlare seriamente con lui/lei!"}
        else:
            suggestion = {"action": "esci_con_partner", "text": f"Il rapporto con {state['relazione']['partner_nome']} non è al massimo, {state['nome']}. Passa del tempo di qualità insieme."}
    
    # Priority 2: Life Stages & Opportunities
    if not suggestion:
        if state["eta"] >= 18 and state["eta"] < 30 and state["relazione"]["stato"] == "single" and random.random() < 0.3:
            suggestion = {"action": "cerca_partner", "text": f"{state['nome']}, sei giovane e single. È il momento di trovare qualcuno di speciale!"}
        elif state["relazione"]["stato"] == "fidanzato" and state["relazione"]["felicita_relazione"] >= 70 and random.random() < 0.2:
            suggestion = {"action": "proponi_matrimonio", "text": f"La tua relazione con {state['relazione']['partner_nome']} è forte. Forse è tempo di fare il grande passo?"}
        elif state["relazione"]["stato"] == "sposato" and len(state["figli"]) == 0 and state["eta"] >= 25 and state["eta"] < 40 and random.random() < 0.25:
            suggestion = {"action": "cerca_figli", "text": f"Tu e {state['relazione']['partner_nome']} siete sposati e felici. Non è ora di allargare la famiglia?"}
        elif state["soldi"] > 500 and state["felicita"] > 70 and random.random() < 0.15:
            suggestion = {"action": "investi", "text": f"Hai soldi e sei felice, {state['nome']}. Potresti pensare di investire per il futuro!"}

    # Fallback: General suggestions if no critical or specific opportunity
    if not suggestion:
        possible_suggestions = [
            {"action": "lavoro", "text": f"{state['nome']}, potresti guadagnare un po' di più. Hai voglia di lavorare?"},
            {"action": "dormi", "text": f"Un po' di riposo non guasta mai, {state['nome']}. Vuoi fare un pisolino?"},
            {"action": "divertiti", "text": f"La vita è anche divertimento! Che ne dici di goderti un po' di tempo libero, {state['nome']}?"}
        ]
        if state["relazione"]["stato"] in ["fidanzato", "sposato"]:
            possible_suggestions.append({"action": "esci_con_partner", "text": f"Perché non passi un po' di tempo con {state['relazione']['partner_nome']}?"})
            # **Aggiunto: Suggerimento generale per parlare con il partner**
            if state["relazione"]["felicita_relazione"] < 70:
                possible_suggestions.append({"action": "parla_con_partner", "text": f"Una buona conversazione con {state['relazione']['partner_nome']} potrebbe fare bene alla relazione."})
        if len(state["figli"]) > 0:
            possible_suggestions.append({"action": "passa_tempo_figli", "text": f"I tuoi figli sentono la tua mancanza, {state['nome']}. Gioca con loro!"})
        
        suggestion = random.choice(possible_suggestions)

    # Store the suggestion in the game state (for potential future use, e.g., if AI remembers what it suggested)
    state["current_suggestion"] = suggestion 
    save_game_slots(game_slots)
    return jsonify(suggestion)


@app.route("/do_action", methods=["POST"])
def do_action():
    game_slots = load_game_slots()
    data = request.json
    azione = data.get("azione")
    current_slot = str(data.get("slot"))

    if current_slot not in game_slots:
        return jsonify({"message": "Nessun gioco attivo per questo slot."}), 400

    state = game_slots[current_slot]
    
    # Check for game over before processing action
    is_game_over, death_reason = check_game_over(state)
    if is_game_over:
        state["is_game_over"] = True
        state["death_reason"] = death_reason
        state["message"] = f"GAME OVER! {death_reason}"
        save_game_slots(game_slots)
        return jsonify(state)

    state["message"] = None # Clear previous message
    state["current_suggestion"] = None # Clear suggestion after action

    # --- Core Actions (Existing) ---
    if azione == "lavoro":
        state["soldi"] += random.randint(30, 70)
        state["energia"] -= random.randint(20, 30)
        state["felicita"] = clamp(state["felicita"] - random.randint(5, 15), 0, 100)
        state["message"] = "Hai lavorato sodo e guadagnato un po' di soldi."
    elif azione == "dormi":
        state["energia"] = clamp(state["energia"] + random.randint(30, 50), 0, 100)
        state["felicita"] = clamp(state["felicita"] + random.randint(5, 15), 0, 100)
        state["message"] = "Una bella dormita ti ha ricaricato le batterie."
    elif azione == "divertiti":
        state["felicita"] = clamp(state["felicita"] + random.randint(20, 40), 0, 100)
        state["soldi"] = clamp(state["soldi"] - random.randint(10, 30), -100, state["soldi"]) # Can go negative but not too much initially
        state["energia"] = clamp(state["energia"] - random.randint(10, 20), 0, 100)
        state["message"] = "Ti sei divertito un mondo! Ma è costato un po'."
    
    # --- New Relationship/Family Actions ---
    elif azione == "cerca_partner":
        if state["relazione"]["stato"] == "single" and state["eta"] >= 18:
            if state["soldi"] >= 30 and state["felicita"] >= 60 and random.random() < 0.6: # Chance to find partner
                partner_name = get_random_partner_name()
                state["relazione"]["stato"] = "fidanzato"
                state["relazione"]["partner_nome"] = partner_name
                state["relazione"]["felicita_relazione"] = random.randint(50, 80)
                state["soldi"] -= 30 # Cost of dating
                state["felicita"] = clamp(state["felicita"] + 10, 0, 100)
                state["message"] = f"Hai trovato l'amore! Ora sei fidanzato con {partner_name}."
            else:
                state["soldi"] -= 10 # Minor cost even if failed
                state["felicita"] = clamp(state["felicita"] - 5, 0, 100)
                state["message"] = "Hai cercato un partner, ma non hai avuto fortuna questa volta."
        else:
            state["message"] = "Non puoi cercare un partner in questo momento."

    elif azione == "esci_con_partner":
        if state["relazione"]["stato"] in ["fidanzato", "sposato"]:
            if state["soldi"] >= 20 and state["energia"] >= 10:
                state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] + random.randint(15, 25), 0, 100)
                state["felicita"] = clamp(state["felicita"] + random.randint(5, 10), 0, 100)
                state["soldi"] -= 20
                state["energia"] -= 10
                state["message"] = f"Hai passato del tempo di qualità con {state['relazione']['partner_nome']}. La relazione è migliorata!"
            else:
                state["message"] = "Non hai abbastanza soldi o energia per uscire con il tuo partner."
        else:
            state["message"] = "Non hai un partner con cui uscire."

    # **Nuova Azione: Parla con Partner (per migliorare o peggiorare)**
    elif azione == "parla_con_partner":
        if state["relazione"]["stato"] in ["fidanzato", "sposato"]:
            if state["energia"] >= 5:
                state["energia"] = clamp(state["energia"] - 5, 0, 100)
                if random.random() < 0.7: # Buona conversazione
                    state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] + random.randint(5, 15), 0, 100)
                    state["felicita"] = clamp(state["felicita"] + random.randint(2, 5), 0, 100)
                    state["message"] = f"Hai avuto una conversazione costruttiva con {state['relazione']['partner_nome']}. Vi siete capiti meglio!"
                else: # Litigio o incomprensione
                    state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] - random.randint(10, 20), 0, 100)
                    state["felicita"] = clamp(state["felicita"] - random.randint(5, 10), 0, 100)
                    state["message"] = f"La conversazione con {state['relazione']['partner_nome']} si è trasformata in un litigio. La tensione è alta."
            else:
                state["message"] = "Sei troppo stanco per una conversazione significativa."
        else:
            state["message"] = "Non hai un partner con cui parlare."

    elif azione == "proponi_matrimonio":
        if state["relazione"]["stato"] == "fidanzato" and state["relazione"]["felicita_relazione"] >= 70:
            if state["soldi"] >= 200 and random.random() < 0.8: # High chance if conditions met
                state["relazione"]["stato"] = "sposato"
                state["soldi"] -= 200 # Cost of wedding
                state["felicita"] = clamp(state["felicita"] + 20, 0, 100)
                state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] + 10, 0, 100)
                state["message"] = f"Congratulazioni! Ti sei sposato con {state['relazione']['partner_nome']}!"
            else:
                state["soldi"] = clamp(state["soldi"] - 50, -100, state["soldi"]) # Financial hit for failed proposal
                state["felicita"] = clamp(state["felicita"] - 15, 0, 100)
                state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] - 30, 0, 100) # Relationship hit
                state["message"] = "La proposta non è andata come speravi... la relazione ha preso una botta."
        else:
            state["message"] = "Non puoi proporre il matrimonio in questo momento."

    elif azione == "cerca_figli":
        if state["relazione"]["stato"] == "sposato" and state["eta"] >= 20 and state["eta"] <= 45: # Age limit for children
            if state["relazione"]["felicita_relazione"] >= 60 and state["soldi"] >= 150 and random.random() < 0.7:
                child_name = generate_random_child_name()
                state["figli"].append({"nome": child_name, "eta_nascita_genitore": state["eta"]})
                state["soldi"] -= 150 # Cost of having a child
                state["felicita"] = clamp(state["felicita"] + 25, 0, 100)
                state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] + 15, 0, 100)
                state["message"] = f"È nato un bambino! Benvenuto/a {child_name}!"
            else:
                state["soldi"] = clamp(state["soldi"] - 50, -100, state["soldi"])
                state["felicita"] = clamp(state["felicita"] - 10, 0, 100)
                state["message"] = "Cercare di avere figli non è facile, non è successo nulla questa volta."
        else:
            state["message"] = "Non puoi avere figli in questo momento."
            
    elif azione == "passa_tempo_figli":
        if len(state["figli"]) > 0:
            if state["energia"] >= 10:
                state["felicita"] = clamp(state["felicita"] + 15, 0, 100)
                state["energia"] = clamp(state["energia"] - 10, 0, 100)
                # Relationship with partner also improves if spending time with kids
                if state["relazione"]["stato"] in ["fidanzato", "sposato"]:
                    state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] + 5, 0, 100)
                state["message"] = "Hai passato del tempo prezioso con i tuoi figli. Che gioia!"
            else:
                state["message"] = "Sei troppo stanco per giocare con i tuoi figli."
        else:
            state["message"] = "Non hai figli con cui passare il tempo."

    elif azione == "divorzia":
        if state["relazione"]["stato"] == "sposato":
            # Il divorzio ora ha più impatto e non è garantito se la relazione è ancora buona
            if state["relazione"]["felicita_relazione"] < 50 or random.random() < 0.8: # Easier to divorce if unhappy, or high chance if chosen
                state["relazione"]["stato"] = "divorziato"
                state["relazione"]["partner_nome"] = None
                state["relazione"]["felicita_relazione"] = 0
                state["soldi"] = clamp(state["soldi"] - 300, -500, state["soldi"]) # Significant financial hit
                state["felicita"] = clamp(state["felicita"] - 40, 0, 100) # Significant happiness hit
                state["message"] = "Hai divorziato. Un nuovo capitolo si apre, ma con qualche cicatrice."
                # Kids might impact happiness too
                if len(state["figli"]) > 0:
                    state["felicita"] = clamp(state["felicita"] - 10, 0, 100)
            else:
                state["message"] = "Il tuo partner non ha accettato il divorzio, o la situazione è troppo stabile per una rottura così drastica."
        else:
            state["message"] = "Non sei sposato per divorziare."
    
    # **Nuova Azione: Lasciare il partner (se fidanzato)**
    elif azione == "lascia_partner":
        if state["relazione"]["stato"] == "fidanzato":
            state["relazione"]["stato"] = "single"
            state["relazione"]["partner_nome"] = None
            state["relazione"]["felicita_relazione"] = 0
            state["felicita"] = clamp(state["felicita"] - random.randint(15, 30), 0, 100) # Felicità diminuita
            state["message"] = "Hai deciso di lasciare il tuo partner. È stata una decisione difficile."
        else:
            state["message"] = "Non sei fidanzato per lasciare qualcuno."
            
    # --- Other Advanced Actions (Examples) ---
    elif azione == "studia":
        if state["energia"] >= 15:
            state["soldi"] = clamp(state["soldi"] - 10, -100, state["soldi"]) # Cost of books/courses
            state["felicita"] = clamp(state["felicita"] - 5, 0, 100)
            state["energia"] = clamp(state["energia"] - 15, 0, 100)
            # Maybe a hidden "knowledge" stat that increases chances of better jobs
            state["message"] = "Hai studiato duramente. Chissà quali opportunità si apriranno!"
        else:
            state["message"] = "Sei troppo stanco per studiare."

    elif azione == "viaggia":
        if state["soldi"] >= 100 and state["energia"] >= 30:
            state["soldi"] = clamp(state["soldi"] - 100, -100, state["soldi"])
            state["felicita"] = clamp(state["felicita"] + 40, 0, 100)
            state["energia"] = clamp(state["energia"] - 30, 0, 100)
            state["message"] = "Un viaggio indimenticabile! Ti senti rigenerato."
        else:
            state["message"] = "Non hai abbastanza soldi o energia per viaggiare."
    
    elif azione == "investi":
        if state["soldi"] >= 150:
            investment_gain = random.randint(-100, 200) # Can lose or gain
            state["soldi"] = clamp(state["soldi"] + investment_gain, -100, state["soldi"] + investment_gain)
            if investment_gain > 0:
                state["message"] = f"Hai investito e guadagnato {investment_gain} soldi! Ben fatto!"
                state["felicita"] = clamp(state["felicita"] + 10, 0, 100)
            else:
                state["message"] = f"Hai investito e perso {-investment_gain} soldi. Non tutte le ciambelle riescono col buco."
                state["felicita"] = clamp(state["felicita"] - 10, 0, 100)
        else:
            state["message"] = "Non hai abbastanza soldi per investire."

    # --- Time Progression and Daily Decay ---
    state["giorni_passati"] += 1
    # Every 30 days, age up
    if state["giorni_passati"] % 30 == 0:
        state["eta"] += 1
        state["message"] = f"{state['nome']} ha compiuto {state['eta']} anni!"
        # Apply age-related decay or events
        if state["eta"] > 50: # Energy decay accelerates with age
            state["energia"] = clamp(state["energia"] - 5, 0, 100)
        # **Aggiunto: Morte del partner per vecchiaia/malattia se sposati da tempo**
        if state["relazione"]["stato"] == "sposato" and state["eta"] > 60 and random.random() < 0.05: # Chance increases with player's age
            state["relazione"]["stato"] = "vedovo"
            state["relazione"]["partner_nome"] = None
            state["relazione"]["felicita_relazione"] = 0
            state["felicita"] = clamp(state["felicita"] - 30, 0, 100)
            state["message"] = f"Il tuo amato/a {state['relazione']['partner_nome']} è venuto a mancare. Ti senti un vuoto incolmabile."
            # Potremmo anche aggiungere un costo per il funerale o una piccola eredità

    # Daily decay for stats (even if no specific action taken)
    state["energia"] = clamp(state["energia"] - random.randint(2, 5), 0, 100)
    state["felicita"] = clamp(state["felicita"] - random.randint(1, 3), 0, 100)
    
    # Financial drain for children
    if len(state["figli"]) > 0:
        state["soldi"] = clamp(state["soldi"] - (len(state["figli"]) * 5), -500, state["soldi"]) # Children cost money

    # **Nuova Logica: Deterioramento automatico e rottura della relazione**
    if state["relazione"]["stato"] in ["fidanzato", "sposato"]:
        # Deterioramento naturale se non si dedica tempo
        if random.random() < 0.2: # 20% chance per turno di calo leggero se non si esce col partner
            state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] - random.randint(1, 3), 0, 100)
            if state["message"] is None: # Se non c'è già un messaggio più importante
                 state["message"] = "La relazione col tuo partner sembra un po' trascurata."
        
        # Crisi più profonda o rottura se la felicità della relazione è troppo bassa
        if state["relazione"]["felicita_relazione"] < 30 and random.random() < 0.1: # 10% chance di crisi se sotto 30%
            if state["relazione"]["stato"] == "fidanzato":
                state["relazione"]["stato"] = "single"
                state["relazione"]["partner_nome"] = None
                state["relazione"]["felicita_relazione"] = 0
                state["felicita"] = clamp(state["felicita"] - random.randint(20, 40), 0, 100) # Grande calo di felicità
                state["message"] = "La relazione è finita! Siete tornati single. Ti senti molto giù."
            elif state["relazione"]["stato"] == "sposato":
                # Per il matrimonio, la rottura è il divorzio, che può avvenire in modo più "passivo"
                # se la felicità della relazione è troppo bassa.
                state["relazione"]["stato"] = "divorziato"
                state["relazione"]["partner_nome"] = None
                state["relazione"]["felicita_relazione"] = 0
                state["soldi"] = clamp(state["soldi"] - random.randint(150, 400), -500, state["soldi"]) # Costi legali e divisione
                state["felicita"] = clamp(state["felicita"] - random.randint(30, 50), 0, 100)
                state["message"] = "Il tuo matrimonio è fallito e avete divorziato! Un periodo difficile ti aspetta."
                if len(state["figli"]) > 0:
                    state["felicita"] = clamp(state["felicita"] - 10, 0, 100) # Impatto negativo sui figli
    
    # Check for game over again after stat changes and aging
    is_game_over, death_reason = check_game_over(state)
    if is_game_over:
        state["is_game_over"] = True
        state["death_reason"] = death_reason
        state["message"] = f"GAME OVER! {death_reason}"


    save_game_slots(game_slots)
    return jsonify(state)

@app.route("/get_all_slots", methods=["GET"])
def get_all_slots():
    game_slots = load_game_slots()
    slot_summaries = {}
    for slot_num, data in game_slots.items():
        slot_summaries[slot_num] = {
            "nome": data.get("nome"),
            "avatar": data.get("avatar"),
            "eta": data.get("eta", 18), # Include age in summary
            "relazione_stato": data.get("relazione", {}).get("stato", "single") # Include relationship status
        }
    print(f"Backend: Restituiti riepiloghi slot: {slot_summaries}")
    return jsonify(slot_summaries)

if __name__ == "__main__":
    app.run(debug=True, port=5050)

@app.route('/delete_slot/<int:slot_number>', methods=['DELETE'])
def delete_slot(slot_number):
    try:
        # Controlla che il file esista
        if not os.path.exists(SAVE_FILE):
            return jsonify({'message': 'File salvataggi non trovato.'}), 404

        # Carica il contenuto
        with open(SAVE_FILE, 'r', encoding='utf-8') as f:
            slots_data = json.load(f)

        slot_key = str(slot_number)
        if slot_key not in slots_data:
            return jsonify({'message': f'Slot {slot_number} non trovato.'}), 404

        # Rimuovi lo slot
        del slots_data[slot_key]

        # Salva il file aggiornato
        with open(SAVE_FILE, 'w', encoding='utf-8') as f:
            json.dump(slots_data, f, indent=4, ensure_ascii=False)

        # Elimina cartella associata (se esiste)
        slot_folder = os.path.join(SAVE_FOLDER, f"slot{slot_number}")
        if os.path.exists(slot_folder) and os.path.isdir(slot_folder):
            shutil.rmtree(slot_folder)

        return jsonify({'message': f'Slot {slot_number} eliminato correttamente.'}), 200

    except Exception as e:
        print(f"Errore eliminazione slot: {e}")
        return jsonify({'error': f"Errore: {str(e)}"}), 500