# config.py

# Altre costanti globali del tuo gioco potrebbero andare qui, ad esempio:
SAVE_FILE = 'game_slots.json'
SAVE_FOLDER = 'data'

# --- Education and Job Helper Data ---
EDUCATION_LEVELS = ["nessuno", "diploma_scuola_superiore", "laurea_triennale", "laurea_magistrale", "master"]

DAYS_TO_NEXT_LEVEL = {
    "nessuno": 20, # Per ottenere il diploma
    "diploma_scuola_superiore": 30, # Per ottenere la triennale
    "laurea_triennale": 40, # Per ottenere la magistrale
    "laurea_magistrale": 50, # Per ottenere il master
    "master": 60 # Già al massimo
}

JOBS = {
    "disoccupato": {"stipendio": 0, "requirements": "nessuno"},
    "lavoretto_saltuario": {"stipendio": 600, "requirements": "nessuno"}, # Nuovo lavoro base
    "commesso": {"stipendio": 1000, "requirements": "diploma_scuola_superiore"},
    "impiegato_amministrativo": {"stipendio": 1400, "requirements": "laurea_triennale"},
    "manager": {"stipendio": 2500, "requirements": "laurea_magistrale"},
    "dirigente": {"stipendio": 4000, "requirements": "master"},
}

