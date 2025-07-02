// src/ThemeContext.js
import React, { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      // Leggi il tema salvato da localStorage all'avvio
      const saved = localStorage.getItem("lifeSimDarkMode");
      // Se c'è un valore salvato, usalo; altrimenti, imposta dark mode come default
      return saved !== null ? JSON.parse(saved) : true;
    } catch (error) {
      // In caso di errore (es. localStorage non disponibile), imposta dark mode
      console.error("Errore nel leggere il tema da localStorage:", error);
      return true;
    }
  });

  useEffect(() => {
    // Il targetElement è l'elemento HTML effettivo a cui applicheremo le classi CSS.
    // Usiamo #root perché è il contenitore principale della tua app React
    // e il tuo index.css è configurato per ascoltare le classi su #root.
    const targetElement = document.getElementById('root'); 
    
    // Controlla che l'elemento #root esista prima di provare a manipolarlo
    if (targetElement) {
      if (isDarkMode) {
        // Se è dark mode, rimuovi light-mode e aggiungi dark-mode
        targetElement.classList.remove('light-mode');
        // Aggiungiamo esplicitamente 'dark-mode' se vuoi una classe specifica
        // Altrimenti, basterebbe solo rimuovere 'light-mode' se dark è il default senza classe.
        // Per chiarezza, le mettiamo entrambe.
        targetElement.classList.add('dark-mode'); 
      } else {
        // Se è light mode, rimuovi dark-mode e aggiungi light-mode
        targetElement.classList.remove('dark-mode');
        targetElement.classList.add('light-mode');
      }
    }

    // Salva la preferenza del tema in localStorage ogni volta che isDarkMode cambia
    try {
      localStorage.setItem("lifeSimDarkMode", JSON.stringify(isDarkMode));
    } catch (error) {
      console.error("Errore nel salvare il tema in localStorage:", error);
    }
  }, [isDarkMode]); // Questo useEffect si esegue ogni volta che isDarkMode cambia

  // Funzione per invertire il tema
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Fornisce isDarkMode e toggleDarkMode a tutti i componenti figli
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;