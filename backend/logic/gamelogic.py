from flask import Flask, jsonify, request
import random
from config.config import (EDUCATION_LEVELS, JOBS)


def clamp(value, min_val, max_val):
    """Limita un valore all'interno di un intervallo."""
    return max(min_val, min(value, max_val))

def get_random_partner_name(gender_preference=None):
    """Genera un nome casuale per il partner, con preferenza di genere."""
    male_first_names = ["Marco", "Andrea", "Luca", "Francesco", "Alessandro", "Gabriele"]
    female_first_names = ["Giulia", "Sofia", "Chiara", "Martina", "Aurora", "Beatrice"]
    last_names = ["Rossi", "Bianchi", "Verdi", "Russo", "Ferrari", "Esposito"]

    if gender_preference == "male":
        first_name = random.choice(male_first_names)
    elif gender_preference == "female":
        first_name = random.choice(female_first_names)
    else: # "indifferent" or no preference
        first_name = random.choice(male_first_names + female_first_names)
        
    return f"{first_name} {random.choice(last_names)}"


def generate_random_child_name():
    """Genera un nome casuale per un figlio."""
    gender = random.choice(['male', 'female'])
    male_names = ["Alessandro", "Gabriele", "Leonardo", "Riccardo", "Tommaso"]
    female_names = ["Aurora", "Beatrice", "Camilla", "Elena", "Emma", "Gaia", "Cecilia"]
    return random.choice(male_names) if gender == 'male' else random.choice(female_names)


def check_game_over(state):
    """Controlla le condizioni di Game Over."""
    # Morte per vecchiaia
    if state["eta"] >= 100:
        return True, "sei morto di vecchiaia dopo una lunga vita!"
    
    # Morte per estrema infelicità/mancanza di energia/denaro
    if state["felicita"] <= 0:
        return True, "sei morto di tristezza e disperazione."
    if state["energia"] <= 0:
        return True, "sei morto di sfinimento totale."
    if state["soldi"] <= -5000: # Esempio: debito profondo
        return True, "sei morto di stenti e povertà estrema."
    
    # Incidenti casuali (es. 0.5% di probabilità per turno dopo i 30 anni)
    if state["eta"] >= 30 and random.random() < 0.005: 
        death_reasons = [
            "sei morto in un bizzarro incidente domestico.",
            "sei morto in un incidente stradale.",
            "sei morto a causa di un'improvvisa malattia.",
            "sei morto per un attacco di cuore inaspettato."
        ]
        return True, random.choice(death_reasons)
        
    return False, None


def get_next_study_level(current_level):
    try:
        current_index = EDUCATION_LEVELS.index(current_level)
        if current_index < len(EDUCATION_LEVELS) - 1:
            return EDUCATION_LEVELS[current_index + 1]
        return current_level # Already at max level
    except ValueError:
        return "nessuno" # Fallback
    
def get_job_opportunities(current_education_level):
    """Restituisce i lavori disponibili in base al livello di istruzione."""
    available_jobs = []
    for job_title, details in JOBS.items():
        if job_title == "disoccupato":
            continue
        req_index = EDUCATION_LEVELS.index(details["requirements"])
        current_index = EDUCATION_LEVELS.index(current_education_level)
        if current_index >= req_index:
            available_jobs.append(job_title)
    return available_jobs