import React, { useState, useContext } from "react";
import ThemeContext from "../ThemeContext"; 
import '../css/index.css';
import '../css/StartScreen.css';

// --- Componente Popup "Contattaci" ---
const ContactPopup = ({ onClose }) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h2>Contattaci</h2>
        <p>
          Per qualsiasi domanda o supporto, puoi scriverci ai nostri indirizzi:
        </p>
        <p>
          <strong>Daniele Di Sarno:</strong> <a href="mailto:danieledisarno35@gmail.com" className="contact-email-text">danieledisarno35@gmail.com</a>
        </p>
        <p>
          <strong>Ciro La Rocca:</strong> <a href="mailto:ciro.larocca@email.com" className="contact-email-text">ciro.larocca@email.com</a>
        </p>
        <br />
        <button type="button" className="button_chiudi" onClick={onClose}>
          Chiudi
        </button>
      </div>
    </div>
  );
};

// --- Componente Popup "Come Giocare" ---
const HowToPlayPopup = ({ onClose }) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h2>Come Giocare</h2>
        <p>
          Benvenuti in LifeSim! Ecco un'idea di come funziona il gioco.
        </p>
        <p>
          <strong>1. Inizia una Nuova Partita:</strong> Prendi decisioni cruciali
          che influenzeranno il percorso della tua vita simulata.
        </p>
        <p>
          <strong>2. Gestisci le Risorse:</strong> Bilancia aspetti come finanze,
          salute e relazioni.
        </p>
        <p>
          <strong>3. Eventi Casuali:</strong> Preparati a sfide inaspettate
          che metteranno alla prova le tue abilità decisionali.
        </p>
        <p>
          <strong>4. Obiettivi e Scopi:</strong> Punta a raggiungere vari traguardi
          per sbloccare nuove possibilità.
        </p>
        <p>
          <strong>5. Esplora le Carriere:</strong> Scegli il tuo percorso professionale e
          osserva come influisce sulla tua vita.
        </p>
        <br />
        <button type="button" className="button_chiudi" onClick={onClose}>
          Chiudi
        </button>
      </div>
    </div>
  );
};

// --- Componente Popup "Impostazioni" ---
// Il componente SettingsPopup riceve isDarkMode, toggleDarkMode, secondaryColor e changeSecondaryColor come props
const SettingsPopup = ({ onClose, isDarkMode, toggleDarkMode, secondaryColor, changeSecondaryColor }) => {

  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

  const ToggleSwitch = ({ isOn, handleToggle }) => (
    <>
      <input
        checked={isOn}
        onChange={handleToggle}
        className="react-switch-checkbox"
        id={`react-switch-new`}
        type="checkbox"
      />
      <label
        className="react-switch-label"
        htmlFor={`react-switch-new`}
      >
        <span className={`react-switch-button`} />
      </label>
    </>
  );

  const colorOptions = [
    { name: 'purple', label: 'Viola', colorCode: '#ae7fff' },
    { name: 'blue', label: 'Blu', colorCode: '#3498db' },
    { name: 'red', label: 'Rosso', colorCode: '#e74c3c' },
    { name: 'pink', label: 'Rosa', colorCode: '#ff69b4' },
    { name: 'green', label: 'Verde', colorCode: '#16ff5cb5'},
  ];

  const currentSelectedColorLabel = colorOptions.find(
    (option) => option.name === secondaryColor
  )?.label || 'Seleziona';

  const handleColorChange = (colorName) => {
    changeSecondaryColor(colorName);
    setIsColorDropdownOpen(false);
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h2>Impostazioni</h2>
        <div className="settings-option">
          <p>Modalità Scuro:</p>
          {/* Usa le props isDarkMode e toggleDarkMode ricevute */}
          <ToggleSwitch isOn={isDarkMode} handleToggle={toggleDarkMode} /> 
        </div>

        {/* Sezione per il menu a tendina del colore secondario */}
        <div className="settings-option">
          <p>Colore Secondario:</p>
          <div className="custom-dropdown">
            <button
              className="dropdown-toggle"
              onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
            >
              {currentSelectedColorLabel}
              <span className="dropdown-arrow">▼</span>
            </button>
            {isColorDropdownOpen && (
              <div className="dropdown-menu">
                {colorOptions.map((option) => (
                  <button
                    key={option.name}
                    className={`dropdown-item ${secondaryColor === option.name ? 'active' : ''}`}
                    onClick={() => handleColorChange(option.name)}
                    style={{ '--item-color': option.colorCode }}
                  >
                    <span className="color-preview" style={{ backgroundColor: option.colorCode }}></span>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <br />
        <button type="button" className="button_chiudi" onClick={onClose}>Chiudi</button>
      </div>
    </div>
  );
};

// --- Componente Principale StartScreen ---
function StartScreen({ onStart }) {
  // Ottieni isDarkMode, toggleDarkMode, secondaryColor e changeSecondaryColor direttamente dal contesto
  // Qui li estrai perché DEVI passarli come props a SettingsPopup
  const { isDarkMode, toggleDarkMode, secondaryColor, changeSecondaryColor } = useContext(ThemeContext); 

  const [menuOpen, setMenuOpen] = useState(false);
  const [contactPopupOpen, setContactPopupOpen] = useState(false);
  const [howToPlayPopupOpen, setHowToPlayPopupOpen] = useState(false);
  const [settingsPopupOpen, setSettingsPopupOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const openContactPopup = () => {
    setContactPopupOpen(true);
    closeMenu();
  };
  const closeContactPopup = () => setContactPopupOpen(false);

  const openHowToPlayPopup = () => {
    setHowToPlayPopupOpen(true);
    closeMenu();
  };
  const closeHowToPlayPopup = () => setHowToPlayPopupOpen(false);

  const openSettingsPopup = () => {
    setSettingsPopupOpen(true);
    closeMenu();
  };
  const closeSettingsPopup = () => setSettingsPopupOpen(false);

  return (
    <div className="container">
      {/* Pulsante menu */}
      <div className="menu-container">
        <div className="menu-toggle" onClick={toggleMenu}>
          ☰
        </div>
      </div>

      {/* Overlay menu */}
      {menuOpen && (
        <div className="overlay" onClick={closeMenu}>
          <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="menu-item" onClick={openContactPopup}>
              Contattaci
            </div>
            <div className="menu-item" onClick={openHowToPlayPopup}>
              Come Giocare
            </div>
            <div className="menu-item" onClick={openSettingsPopup}>
              Impostazioni
            </div>
          </div>
        </div>
      )}

      {/* Renderizzazione condizionale dei Popup */}
      {contactPopupOpen && <ContactPopup onClose={closeContactPopup} />}
      {howToPlayPopupOpen && <HowToPlayPopup onClose={closeHowToPlayPopup} />}
      {settingsPopupOpen && (
        <SettingsPopup
          onClose={closeSettingsPopup}
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode}
          secondaryColor={secondaryColor} // Passa il colore secondario
          changeSecondaryColor={changeSecondaryColor} // Passa la funzione per cambiarlo
        />
      )}

      {/* Contenuto principale della StartScreen */}
      <h1 className="title">Benvenuti in LifeSim!</h1>
      <p className="subtitle">Vivi la tua vita simulata e divertiti!</p>
      <button className="button" onClick={onStart}>
        Gioca
      </button>

      {/* Footer della StartScreen */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} LifeSim. Tutti i diritti riservati.</p>
        <p>Sviluppato da Daniele Di Sarno & Ciro La Rocca</p>
      </footer>
    </div>
  );
}

export default StartScreen;