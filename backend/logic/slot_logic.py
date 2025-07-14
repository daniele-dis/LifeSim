from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import shutil
import tempfile
import json
import os
from config.config import ( SAVE_FILE, SAVE_FOLDER)
app = Flask(__name__)

def load_game_slots():
    """Carica gli slot di gioco dal file JSON."""
    if os.path.exists(SAVE_FILE):
        with open(SAVE_FILE, 'r', encoding='utf-8') as f: 
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
    """Salva gli slot di gioco sul file JSON in modo più robusto usando un file temporaneo."""
    temp_file_path = None
    try:
        # Crea la cartella di salvataggio se non esiste
        os.makedirs(os.path.dirname(SAVE_FILE) or '.', exist_ok=True)
        
        # Crea un file temporaneo nello stesso direttorio del file di salvataggio
        # `mkstemp` restituisce un file descriptor (fd) e il percorso del file
        fd, temp_file_path = tempfile.mkstemp(dir=os.path.dirname(SAVE_FILE) or '.', suffix='.tmp')
        
        # Apri il file temporaneo usando il file descriptor per assicurare che sia chiuso correttamente
        with os.fdopen(fd, 'w', encoding='utf-8') as f: # Specifica encoding per compatibilità
            json.dump(slots, f, indent=4, ensure_ascii=False) # ensure_ascii=False per caratteri non-ASCII
        
        # Se la scrittura sul file temporaneo ha avuto successo, sposta/rinomina per sovrascrivere l'originale
        shutil.move(temp_file_path, SAVE_FILE)
        print(f"Backend: Salvati slot su {SAVE_FILE}: {slots}")
    except Exception as e:
        # Gestisce qualsiasi errore durante la scrittura
        print(f"Backend ERRORE CRITICO SALVATAGGIO: Impossibile salvare gli slot su {SAVE_FILE}. Errore: {e}")
    finally:
        # Pulisce il file temporaneo se per qualche motivo esiste ancora (es. errore prima di shutil.move)
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

