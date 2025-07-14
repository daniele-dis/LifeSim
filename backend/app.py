from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import shutil
import random
import tempfile
from config.config import (SAVE_FILE,SAVE_FOLDER, DAYS_TO_NEXT_LEVEL, EDUCATION_LEVELS, JOBS)

#import di tutti gli altri file app.py, fatto per aumentare la modularità
from logic.slot_logic import ( load_game_slots ,load_game_slots, save_game_slots)
from logic.gamelogic import(clamp, check_game_over, get_random_partner_name, generate_random_child_name, get_job_opportunities, get_next_study_level)

app = Flask(__name__)

# Abilita CORS per tutta l'applicazione. Questo gestisce automaticamente le richieste OPTIONS.
CORS(app)


# Inizializzazione di un nuovo game dopo aver confermato la scelta di avatar e game
@app.route("/initialize_game", methods=["POST"])
def initialize_game():
    """Inizializza un nuovo slot di gioco."""
    game_slots = load_game_slots()
    data = request.json
    slot_number = str(data.get("slot"))
    player_name = data.get("playerName")
    selected_avatar = data.get("selectedAvatar")
    partner_gender_preference = data.get("partnerGenderPreference", "indifferent") # Nuovo campo

    if not all([slot_number, player_name, selected_avatar]):
        return jsonify({"message": "Dati insufficienti per inizializzare il gioco."}), 400

    game_slots[slot_number] = {
        "nome": player_name,
        "avatar": selected_avatar,
        "soldi": 200,      # Parametri iniziali
        "energia": 70,     
        "felicita": 80,    
        "eta": 18,
        "giorni_passati": 0,
        "relazione": {
            "stato": "single",
            "partner_nome": None,
            "felicita_relazione": 0,
            "preferenza_genere": partner_gender_preference # Preferenza Sesso Partner Giocatore
        },
        "figli": [],
        "current_suggestion": None,
        "message": "Benvenuto nella tua nuova vita!",
        "is_game_over": False,
        "death_reason": None,
        "titolo_studio": "nessuno",
        "giorni_per_prossimo_livello_studio": DAYS_TO_NEXT_LEVEL["nessuno"],
        "lavoro_attuale": "disoccupato",
        "stipendio": 0 # Stipendio associato al lavoro attuale
    }
    save_game_slots(game_slots)
    return jsonify(game_slots[slot_number])

@app.route("/get_game_state/<int:slot_num>", methods=["GET"])
def get_game_state(slot_num):
    """Restituisce lo stato di un gioco specifico."""
    game_slots = load_game_slots()
    slot_key = str(slot_num)
    if slot_key in game_slots:
        state = game_slots[slot_key]
        state.setdefault("titolo_studio", "nessuno") 
        state.setdefault("giorni_per_prossimo_livello_studio", DAYS_TO_NEXT_LEVEL.get(state["titolo_studio"], 0)) 
        state.setdefault("lavoro_attuale", "disoccupato")
        state.setdefault("stipendio", JOBS.get(state["lavoro_attuale"], {"stipendio": 0})["stipendio"]) 
        state["relazione"].setdefault("preferenza_genere", "indifferent") 
        save_game_slots(game_slots) 
        return jsonify(state)
    return jsonify({"message": f"Slot {slot_num} non trovato."}), 404

@app.route("/debug_slots", methods=["GET"])
def debug_slots():
    """Endpoint di debug per visualizzare tutti gli slot."""
    slots = load_game_slots()
    return jsonify(slots)

@app.route("/get_all_slots", methods=["GET"])
def get_all_slots():
    """Restituisce un riepilogo di tutti gli slot di gioco."""
    game_slots = load_game_slots()
    slot_summaries = {}
    for slot_num, data in game_slots.items():
        slot_summaries[slot_num] = {
            "nome": data.get("nome"),
            "avatar": data.get("avatar"),
            "eta": data.get("eta", 18), 
            "relazione_stato": data.get("relazione", {}).get("stato", "single") 
        }
    print(f"Backend: Restituiti riepiloghi slot: {slot_summaries}")
    return jsonify(slot_summaries)

# delete slot permettere l'eliminazione dello slot, dato uno slot number e controllando che effettivamente sia popolato
@app.route('/delete_slot/<int:slot_number>', methods=['DELETE'])
def delete_slot(slot_number):
    """Elimina uno slot di gioco e la sua cartella associata."""
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


# Route che permette di, data una data azione in input scelta dall'utente, di avere una conseguenza
@app.route("/do_action", methods=["POST"])
def do_action():
    """Esegue un'azione nel gioco e aggiorna lo stato."""
    game_slots = load_game_slots()
    data = request.json
    azione = data.get("azione")
    current_slot = str(data.get("slot"))

    if current_slot not in game_slots:
        return jsonify({"message": "Nessun gioco attivo per questo slot."}), 400

    state = game_slots[current_slot]
    
    # Controlla il game over prima di elaborare l'azione, perchè il game over è bloccante 
    is_game_over, death_reason = check_game_over(state)
    if is_game_over:
        state["is_game_over"] = True
        state["death_reason"] = death_reason
        state["message"] = f"GAME OVER! {death_reason}"
        save_game_slots(game_slots)
        return jsonify(state)

    state["message"] = None # Cancella il messaggio precedente
    state["current_suggestion"] = None # Cancella il suggerimento dopo l'azione

    # -- Principali Azioni --

    # se l'azioene è lavoro, fai tot
    if azione == "lavoro":
        if state["lavoro_attuale"] == "disoccupato":
            state["message"] = "Non hai un lavoro da cui andare!"
        else:
            job_details = JOBS[state["lavoro_attuale"]]
            state["soldi"] += job_details["stipendio"] // 30 # il lavoro attuale, diviso per 30 gg, con questa operazione si indica
                                                             # il guadagno giornaliero (es: 1400/30 = 46,67 euro)
            state["energia"] -= random.randint(20, 30)
            state["felicita"] = clamp(state["felicita"] - random.randint(5, 15), 0, 100)
            state["message"] = f"Hai lavorato sodo e guadagnato un po' di soldi."

    # altrimenti, se l'azione è dormi, divertiti, cerca partner e così via
    elif azione == "dormi":
        state["energia"] = clamp(state["energia"] + random.randint(30, 50), 0, 100)
        state["felicita"] = clamp(state["felicita"] + random.randint(5, 15), 0, 100)
        state["message"] = "Una bella dormita ti ha ricaricato le batterie."

    # esci e divertiti un pò
    elif azione == "divertiti":
        state["felicita"] = clamp(state["felicita"] + random.randint(20, 40), 0, 100)
        state["soldi"] = clamp(state["soldi"] - random.randint(10, 30), -100, state["soldi"]) 
        state["energia"] = clamp(state["energia"] - random.randint(10, 20), 0, 100)
        state["message"] = "Ti sei divertito un mondo! Ma è costato un po'."
    
    # cerca un partner
    elif azione == "cerca_partner":
        if state["relazione"]["stato"] == "single" and state["eta"] >= 18:
            if state["soldi"] >= 30 and state["felicita"] >= 60 and random.random() < 0.6: # Probabilità di trovare partner
                partner_name = get_random_partner_name(state["relazione"]["preferenza_genere"]) # Usa la preferenza
                state["relazione"]["stato"] = "fidanzato"
                state["relazione"]["partner_nome"] = partner_name
                state["relazione"]["felicita_relazione"] = random.randint(50, 80)
                state["soldi"] -= 30 # Costo degli appuntamenti
                state["felicita"] = clamp(state["felicita"] + 10, 0, 100)
                state["message"] = f"Hai trovato l'amore! Ora sei fidanzato con {partner_name}."
            else:
                state["soldi"] -= 10 # Costo minore anche se fallito
                state["felicita"] = clamp(state["felicita"] - 5, 0, 100)
                state["message"] = "Hai cercato un partner, ma non hai avuto fortuna questa volta."
        else:
            state["message"] = "Non puoi cercare un partner in questo momento."

    # esci con il tuo partner
    elif azione == "esci_con_partner":
        if state["relazione"]["stato"] in ["fidanzato", "sposato"]:
            if state["soldi"] >= 20 and state["energia"] >= 10:
                state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] + random.randint(15, 25), 0, 100)
                state["felicita"] = clamp(state["felicita"] + random.randint(5, 10), 0, 100)
                state["soldi"] -= 10
                state["energia"] -= 10
                state["message"] = f"Hai passato del tempo di qualità con {state['relazione']['partner_nome']}. La relazione è migliorata!"
            else:
                state["message"] = "Non hai abbastanza soldi o energia per uscire con il tuo partner."
        else:
            state["message"] = "Non hai un partner con cui uscire."

    # parla con partner
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

    # proponi matrimonio al tuo partner
    elif azione == "proponi_matrimonio":
        if state["relazione"]["stato"] == "fidanzato" and state["relazione"]["felicita_relazione"] >= 70:
            if state["soldi"] >= 200 and random.random() < 0.8: # Alta probabilità se le condizioni sono soddisfatte
                state["relazione"]["stato"] = "sposato"
                state["soldi"] -= 200 # Costo del matrimonio
                state["felicita"] = clamp(state["felicita"] + 20, 0, 100)
                state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] + 10, 0, 100)
                state["message"] = f"Congratulazioni! Ti sei sposato con {state['relazione']['partner_nome']}!"
            else:
                # se la proposta non è andata a buon fine, decremento soldi, felicià, stato relazione e messaggio inerente
                state["soldi"] = clamp(state["soldi"] - 50, -100, state["soldi"])
                state["felicita"] = clamp(state["felicita"] - 15, 0, 100)
                state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] - 30, 0, 100) 
                state["message"] = "La proposta non è andata come speravi... la relazione ha preso una botta."
        else:
            state["message"] = "Non puoi proporre il matrimonio in questo momento."

    # prova ad aver figli
    elif azione == "cerca_figli":
        if state["relazione"]["stato"] == "sposato" and state["eta"] >= 20 and state["eta"] <= 45: # Limite di età per i figli
            if state["relazione"]["felicita_relazione"] >= 60 and state["soldi"] >= 150 and random.random() < 0.7:
                child_name = generate_random_child_name()
                state["figli"].append({"nome": child_name, "eta_nascita_genitore": state["eta"]})
                state["soldi"] -= 150 # Costo di avere un figlio
                state["felicita"] = clamp(state["felicita"] + 25, 0, 100)
                state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] + 15, 0, 100)
                state["message"] = f"È nato un bambino! Benvenuto/a {child_name}!"
            else:
                state["soldi"] = clamp(state["soldi"] - 50, -100, state["soldi"])
                state["felicita"] = clamp(state["felicita"] - 10, 0, 100)
                state["message"] = "Cercare di avere figli non è facile, non è successo nulla questa volta."
        else:
            state["message"] = "Non puoi avere figli in questo momento."
    
    # sblocco di una nuova azione, dopo aver avuto figli puoi passar del tempo con 
    elif azione == "passa_tempo_figli":
        if len(state["figli"]) > 0:
            if state["energia"] >= 10:
                state["felicita"] = clamp(state["felicita"] + 15, 0, 100)
                state["energia"] = clamp(state["energia"] - 10, 0, 100)
                # La relazione con il partner migliora anche se si passa tempo con i figli
                if state["relazione"]["stato"] in ["fidanzato", "sposato"]:
                    state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] + 5, 0, 100)
                state["message"] = "Hai passato del tempo prezioso con i tuoi figli. Che gioia!"
            else:
                state["message"] = "Sei troppo stanco per giocare con i tuoi figli."
        else:
            state["message"] = "Non hai figli con cui passare il tempo."

    #divorzio dal partner
    elif azione == "divorzia":
        if state["relazione"]["stato"] == "sposato":
            # Il divorzio ora ha più impatto e non è garantito se la relazione è ancora buona
            if state["relazione"]["felicita_relazione"] < 50 or random.random() < 0.8: # Più facile divorziare se infelici, o alta probabilità se scelto
                state["relazione"]["stato"] = "divorziato"
                state["relazione"]["partner_nome"] = None
                state["relazione"]["felicita_relazione"] = 0
                state["soldi"] = clamp(state["soldi"] - 100, -300, state["soldi"]) # Danno finanziario significativo
                state["felicita"] = clamp(state["felicita"] - 40, 0, 100) # Danno significativo alla felicità
                state["message"] = "Hai divorziato. Un nuovo capitolo si apre, ma con qualche cicatrice."
                # I figli potrebbero influenzare anche la felicità
                if len(state["figli"]) > 0:
                    state["felicita"] = clamp(state["felicita"] - 10, 0, 100)
            else:
                state["message"] = "Il tuo partner non ha accettato il divorzio, o la situazione è troppo stabile per una rottura così drastica."
        else:
            state["message"] = "Non sei sposato per divorziare."
    
    # Possibilitàà di lasciar il partner, se si è fidanzati
    elif azione == "lascia_partner":
        if state["relazione"]["stato"] == "fidanzato":
            state["relazione"]["stato"] = "single"
            state["relazione"]["partner_nome"] = None
            state["relazione"]["felicita_relazione"] = 0
            state["felicita"] = clamp(state["felicita"] - random.randint(15, 30), 0, 100) # Felicità diminuita
            state["message"] = "Hai deciso di lasciare il tuo partner. È stata una decisione difficile."
        else:
            state["message"] = "Non sei fidanzato per lasciare qualcuno."
            
    # Studia per ottenere nuovi titolo di studio e migliorare la tua posizione lavorativa
    elif azione == "studia":
        if state["titolo_studio"] == "master":
            state["message"] = "Hai già raggiunto il massimo livello di istruzione!"
        elif state["energia"] < 15:
            state["message"] = "Sei troppo stanco per studiare."
        else:
            state["soldi"] = clamp(state["soldi"] - 10, -50, state["soldi"]) # Costo di libri/corsi
            state["felicita"] = clamp(state["felicita"] - 5, 0, 100)
            state["energia"] = clamp(state["energia"] - 15, 0, 100)
            state["giorni_per_prossimo_livello_studio"] -= 1 # Un giorno di studio in meno

            if state["giorni_per_prossimo_livello_studio"] <= 0:
                current_index = EDUCATION_LEVELS.index(state["titolo_studio"])
                if current_index < len(EDUCATION_LEVELS) - 1:
                    state["titolo_studio"] = EDUCATION_LEVELS[current_index + 1]
                    state["message"] = f"Congratulazioni! Hai ottenuto il tuo {state['titolo_studio'].replace('_', ' ')}!"
                    # Resetta i giorni per il prossimo livello, se non è il master
                    if state["titolo_studio"] != "master":
                        state["giorni_per_prossimo_livello_studio"] = DAYS_TO_NEXT_LEVEL[state["titolo_studio"]]
                else:
                    state["message"] = "Hai completato tutti i tuoi studi!"
            else:
                state["message"] = f"Stai studiando per il {get_next_study_level(state['titolo_studio']).replace('_', ' ')}. Ti mancano {state['giorni_per_prossimo_livello_studio']} giorni."
    
    elif azione == "cerca_lavoro":
        if state["energia"] < 20:
            state["message"] = "Sei troppo stanco per cercare lavoro."
        else:
            available_jobs = get_job_opportunities(state["titolo_studio"])
            
            # Filtra i lavori disponibili per quelli migliori del tuo attuale (se ne hai uno)
            current_job_stipendio = JOBS.get(state["lavoro_attuale"], {"stipendio": 0})["stipendio"]
            better_jobs = [job for job in available_jobs if JOBS[job]["stipendio"] > current_job_stipendio]
            
            state["energia"] = clamp(state["energia"] - 20, 0, 100)
            state["soldi"] = clamp(state["soldi"] - 10, -100, state["soldi"]) # Costo per la ricerca

            # Ora cerca solo tra i lavori migliori, o tra tutti se non ce ne sono di migliori (es. disoccupato)
            jobs_to_consider = better_jobs if better_jobs else available_jobs

            if jobs_to_consider and random.random() < 0.7: # Alta probabilità di trovare un lavoro se qualificato
                # Scegli casualmente tra i lavori migliori disponibili
                new_job = random.choice(jobs_to_consider)
                
                # Aggiungi una piccola logica per non downgradare il lavoro
                if JOBS[new_job]["stipendio"] > current_job_stipendio or state["lavoro_attuale"] == "disoccupato":
                    state["lavoro_attuale"] = new_job
                    state["stipendio"] = JOBS[new_job]["stipendio"]
                    state["felicita"] = clamp(state["felicita"] + 20, 0, 100)
                    state["message"] = f"Congratulazioni! Hai trovato un lavoro come {new_job.replace('_', ' ')} con uno stipendio di {state['stipendio']} soldi al mese!"
                else:
                    state["felicita"] = clamp(state["felicita"] - 5, 0, 100)
                    state["message"] = "Hai cercato lavoro, ma non hai trovato nulla di meglio questa volta."
            else:
                state["felicita"] = clamp(state["felicita"] - 10, 0, 100)
                state["message"] = "Hai cercato lavoro, ma non hai trovato nulla di adatto questa volta. Continua a provare o studia!"
    
    # Viaggia, che aumenta la felicità, diminuisce i soldi, come se fosse un divertiti dai
    elif azione == "viaggia":
        if state["soldi"] >= 100 and state["energia"] >= 30:
            state["soldi"] = clamp(state["soldi"] - 50, -50, state["soldi"])
            state["felicita"] = clamp(state["felicita"] + 40, 0, 100)
            state["energia"] = clamp(state["energia"] - 30, 0, 100)
            state["message"] = "Un viaggio indimenticabile! Ti senti rigenerato."
        else:
            state["message"] = "Non hai abbastanza soldi o energia per viaggiare."
    
    # probabilità di investir soldi, con conseguente perdita o guadagno, o semplicemente se troppi pochi soldi, non puoi investire
    elif azione == "investi":
        if state["soldi"] >= 150:
            investment_gain = random.randint(-100, 200) 
            state["soldi"] = clamp(state["soldi"] + investment_gain, -100, state["soldi"] + investment_gain)
            if investment_gain > 0:
                state["message"] = f"Hai investito e guadagnato {investment_gain} soldi! Ben fatto!"
                state["felicita"] = clamp(state["felicita"] + 10, 0, 100)
            else:
                state["message"] = f"Hai investito e perso {-investment_gain} soldi. Non tutte le ciambelle riescono col buco."
                state["felicita"] = clamp(state["felicita"] - 10, 0, 100)
        else:
            state["message"] = "Non hai abbastanza soldi per investire."

    # --- Progressione del tempo e decadimento giornaliero ---
    state["giorni_passati"] += 1
    # Ogni 30 giorni, invecchia
    if state["giorni_passati"] % 30 == 0:
        state["eta"] += 1
        state["message"] = f"{state['nome']} ha compiuto {state['eta']} anni!"
        # Applica decadimento o eventi legati all'età
        if state["eta"] > 50: # Il decadimento dell'energia accelera con l'età
            state["energia"] = clamp(state["energia"] - 5, 0, 100)
        # Morte del partner per vecchiaia/malattia se sposati da tempo
        if state["relazione"]["stato"] == "sposato" and state["eta"] > 60 and random.random() < 0.05: # La probabilità aumenta con l'età del giocatore
            state["relazione"]["stato"] = "vedovo"
            state["relazione"]["partner_nome"] = None
            state["relazione"]["felicita_relazione"] = 0
            state["felicita"] = clamp(state["felicita"] - 30, 0, 100)
            state["message"] = f"Il tuo amato/a è venuto a mancare. Ti senti un vuoto incolmabile."
            # Potremmo anche aggiungere un costo per il funerale o una piccola eredità

    # Decadimento giornaliero per le statistiche (anche se non è stata intrapresa alcuna azione specifica)
    state["energia"] = clamp(state["energia"] - random.randint(2, 5), 0, 100)
    state["felicita"] = clamp(state["felicita"] - random.randint(1, 3), 0, 100)
    
    # Drenaggio finanziario per i figli
    if len(state["figli"]) > 0:
        state["soldi"] = clamp(state["soldi"] - (len(state["figli"]) * 5), -500, state["soldi"]) # I figli costano soldi

    # Nuova Logica: Deterioramento automatico e rottura della relazione
    if state["relazione"]["stato"] in ["fidanzato", "sposato"]:
        # Deterioramento naturale se non si dedica tempo
        if random.random() < 0.2: # 20% di probabilità per turno di calo leggero se non si esce col partner
            state["relazione"]["felicita_relazione"] = clamp(state["relazione"]["felicita_relazione"] - random.randint(1, 3), 0, 100)
            if state["message"] is None: # Se non c'è già un messaggio più importante
                state["message"] = "La relazione col tuo partner sembra un po' trascurata."
        
        # Crisi più profonda o rottura se la felicità della relazione è troppo bassa
        if state["relazione"]["felicita_relazione"] < 30 and random.random() < 0.1: # 10% di probabilità di crisi se sotto 30%
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
    
    # Controlla di nuovo il game over dopo i cambiamenti di statistiche e l'invecchiamento
    is_game_over, death_reason = check_game_over(state)
    if is_game_over:
        state["is_game_over"] = True
        state["death_reason"] = death_reason
        state["message"] = f"GAME OVER! {death_reason}"

    save_game_slots(game_slots)
    return jsonify(state)


# route chee gestisce tutti i mssaggi di AI gestiti nel gioco
@app.route("/generate_ai_suggestion", methods=["POST"])
def generate_ai_suggestion():
    """Genera un suggerimento AI basato sullo stato del gioco."""
    game_slots = load_game_slots()
    data = request.json
    current_slot = str(data.get("slot"))

    if current_slot not in game_slots:
        return jsonify({"message": "Nessun gioco attivo per questo slot."}), 400

    state = game_slots[current_slot]
    suggestion = None

    # Priorità 1: Statistiche critiche
    if state["energia"] < 20:
        suggestion = {"action": "dormi", "text": f"{state['nome']}, sei esausto. È vitale riposare!"}
    elif state["felicita"] < 30:
        if state["relazione"]["stato"] in ["fidanzato", "sposato"] and state["relazione"]["felicita_relazione"] < 50:
            suggestion = {"action": "esci_con_partner", "text": f"{state['nome']}, la tua felicità è bassa, e anche quella di {state['relazione']['partner_nome']} non è al top. Un'uscita insieme potrebbe aiutare entrambi!"}
        else:
            suggestion = {"action": "divertiti", "text": f"{state['nome']}, la tua felicità è bassa. Fai qualcosa che ti piace!"}
    # NUOVA LOGICA: Prioritizza il cambio lavoro se qualificato e non disoccupato
    elif state["lavoro_attuale"] != "disoccupato" and \
         EDUCATION_LEVELS.index(state["titolo_studio"]) > EDUCATION_LEVELS.index(JOBS[state["lavoro_attuale"]]["requirements"]) and \
         random.random() < 0.8: # Alta probabilità di suggerire il cambio lavoro se qualificato
        suggestion = {"action": "cerca_lavoro", "text": f"{state['nome']}, hai un {state['titolo_studio'].replace('_', ' ')}! È ora di cercare un lavoro migliore rispetto a {state['lavoro_attuale'].replace('_', ' ')}!"}
    elif state["soldi"] < 100:
        # Se i soldi sono bassi, suggerisci di lavorare o cercare lavoro (dopo il controllo di upgrade)
        if state["lavoro_attuale"] == "disoccupato":
            suggestion = {"action": "cerca_lavoro", "text": f"I tuoi soldi stanno scarseggiando, {state['nome']}. Trova un lavoro per guadagnare!"}
        else:
            suggestion = {"action": "lavoro", "text": f"I tuoi soldi stanno scarseggiando, {state['nome']}. È tempo di guadagnare con il tuo lavoro!"}
    elif state["relazione"]["stato"] in ["fidanzato", "sposato"] and state["relazione"]["felicita_relazione"] < 40:
        # Suggerimento per crisi di relazione
        if state["relazione"]["felicita_relazione"] < 20 and random.random() < 0.5: # Più probabile se molto bassa
            suggestion = {"action": "parla_con_partner", "text": f"La tua relazione con {state['relazione']['partner_nome']} è in crisi profonda. Devi parlare seriamente con lui/lei!"}
        else:
            suggestion = {"action": "esci_con_partner", "text": f"Il rapporto con {state['relazione']['partner_nome']} non è al massimo, {state['nome']}. Passa del tempo di qualità insieme."}
    
    # Priorità 2: Fasi della vita e opportunità (inclusi istruzione e lavoro)
    if not suggestion:
        # Suggerimento per l'istruzione se non al massimo livello e giorni rimanenti bassi
        if state["titolo_studio"] != "master" and state["giorni_per_prossimo_livello_studio"] <= 30 and random.random() < 0.4:
            next_study_level = get_next_study_level(state["titolo_studio"])
            suggestion = {"action": "studia", "text": f"{state['nome']}, continua a studiare per ottenere il tuo {next_study_level.replace('_', ' ')}!"}
        # Suggerimento per cercare lavoro se disoccupato (se non già coperto dalla priorità 1)
        elif state["lavoro_attuale"] == "disoccupato" and random.random() < 0.5: 
            suggestion = {"action": "cerca_lavoro", "text": f"{state['nome']}, hai bisogno di un impiego. Cerca un lavoro per iniziare a guadagnare!"}
        elif state["eta"] >= 18 and state["eta"] < 30 and state["relazione"]["stato"] == "single" and random.random() < 0.3:
            suggestion = {"action": "cerca_partner", "text": f"{state['nome']}, sei giovane e single. È il momento di trovare qualcuno di speciale!"}
        elif state["relazione"]["stato"] == "fidanzato" and state["relazione"]["felicita_relazione"] >= 70 and random.random() < 0.2:
            suggestion = {"action": "proponi_matrimonio", "text": f"La tua relazione con {state['relazione']['partner_nome']} è forte. Forse è tempo di fare il grande passo?"}
        elif state["relazione"]["stato"] == "sposato" and len(state["figli"]) == 0 and state["eta"] >= 25 and state["eta"] < 40 and random.random() < 0.25:
            suggestion = {"action": "cerca_figli", "text": f"Tu e {state['relazione']['partner_nome']} siete sposati e felici. Non è ora di allargare la famiglia?"}
        elif state["soldi"] > 500 and state["felicita"] > 70 and random.random() < 0.15:
            suggestion = {"action": "investi", "text": f"Hai soldi e sei felice, {state['nome']}. Potresti pensare di investire per il futuro!"}

    # Fallback: Suggerimenti generali se non ci sono opportunità critiche o specifiche
    if not suggestion:
        possible_suggestions = [
            {"action": "lavoro", "text": f"{state['nome']}, potresti guadagnare un po' di più. Hai voglia di lavorare?"},
            {"action": "dormi", "text": f"Un po' di riposo non guasta mai, {state['nome']}. Vuoi fare un pisolino?"},
            {"action": "divertiti", "text": f"La vita è anche divertimento! Che ne dici di goderti un po' di tempo libero, {state['nome']}?"},
            {"action": "studia", "text": f"Migliora le tue conoscenze, {state['nome']}. Un buon titolo di studio apre molte porte!"} # Suggerimento generale per studiare
        ]
        if state["relazione"]["stato"] in ["fidanzato", "sposato"]:
            possible_suggestions.append({"action": "esci_con_partner", "text": f"Perché non passi un po' di tempo con {state['relazione']['partner_nome']}?"})
            # Suggerimento generale per parlare con il partner
            if state["relazione"]["felicita_relazione"] < 70:
                possible_suggestions.append({"action": "parla_con_partner", "text": f"Una buona conversazione con {state['relazione']['partner_nome']} potrebbe fare bene alla relazione."})
        if len(state["figli"]) > 0:
            possible_suggestions.append({"action": "passa_tempo_figli", "text": f"I tuoi figli sentono la tua mancanza, {state['nome']}. Gioca con loro!"})
        
        suggestion = random.choice(possible_suggestions)

    # Memorizza il suggerimento nello stato del gioco
    state["current_suggestion"] = suggestion 
    save_game_slots(game_slots)
    return jsonify(suggestion)


# Sempre dopo tutte le definizioni delle route
if __name__ == "__main__":
    app.run(debug=True, port=5050)