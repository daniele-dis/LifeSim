// src/main.jsx (o src/index.js)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importa il CSS globale che gestisce il tema
import App from './App'; // App includerà MainRouter
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from './ThemeContext'; // Importa il ThemeProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ThemeProvider DEVE avvolgere tutta l'app per fornire il contesto */}
    <ThemeProvider>
      <App /> {/* App è il genitore di MainRouter e tutte le schermate */}
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();