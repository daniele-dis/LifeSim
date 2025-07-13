// src/ThemeContext.js
import React, { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // --- Gestione della Modalità Scuro/Chiaro ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem("lifeSimDarkMode");
      return savedMode !== null ? JSON.parse(savedMode) : true; // Default a true (modalità scura)
    } catch (error) {
      console.error("Errore nel leggere il tema da localStorage:", error);
      return true; // Fallback a dark mode in caso di errore
    }
  });

  // --- NUOVO STATO: Gestione del Colore Secondario ---
  const [secondaryColor, setSecondaryColor] = useState(() => {
    try {
      const savedColor = localStorage.getItem("lifeSimSecondaryColor"); // Nuovo key per localStorage
      return savedColor ? savedColor : 'purple'; // Default al viola se non salvato
    } catch (error) {
      console.error("Errore nel leggere il colore secondario da localStorage:", error);
      return 'purple'; // Fallback a purple in caso di errore
    }
  });

  // Effetto per applicare la classe 'light-mode'/'dark-mode' e salvare la preferenza
  useEffect(() => {
    const targetElement = document.getElementById('root'); 
    
    if (targetElement) {
      // Rimuovi entrambe le classi prima di aggiungere quella corretta per evitare conflitti
      targetElement.classList.remove('light-mode', 'dark-mode'); 
      if (isDarkMode) {
        targetElement.classList.add('dark-mode'); 
      } else {
        targetElement.classList.add('light-mode');
      }
    }

    try {
      localStorage.setItem("lifeSimDarkMode", JSON.stringify(isDarkMode));
    } catch (error) {
      console.error("Errore nel salvare il tema in localStorage:", error);
    }
  }, [isDarkMode]);

  // --- NUOVO EFFETTO: Applica la classe del colore secondario e salva la preferenza ---
  useEffect(() => {
    const targetElement = document.getElementById('root');

    if (targetElement) {
      // Rimuovi tutte le classi di colore secondario prima di aggiungerne una nuova
      // Assicurati che questa lista includa tutti i possibili colori secondari che supporti
      targetElement.classList.remove('purple-theme', 'blue-theme', 'red-theme', 'pink-theme', 'green-theme'); 
      
      // Aggiungi la classe corrispondente al colore secondario corrente
      targetElement.classList.add(`${secondaryColor}-theme`);
    }

    try {
      localStorage.setItem("lifeSimSecondaryColor", secondaryColor);
    } catch (error) {
      console.error("Errore nel salvare il colore secondario in localStorage:", error);
    }
  }, [secondaryColor]); // Questo useEffect si esegue ogni volta che secondaryColor cambia

  // Funzione per invertire il tema (dark/light)
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // --- NUOVA FUNZIONE: Per cambiare il colore secondario ---
  const changeSecondaryColor = (color) => {
    setSecondaryColor(color);
  };

  // Fornisce tutti gli stati e le funzioni ai componenti figli
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, secondaryColor, changeSecondaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;