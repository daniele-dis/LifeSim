// components/MainGameScreen.js
import React from 'react';

function MainGameScreen({ gameState, doAction, onBack, isDarkMode }) {
    if (!gameState) {
        return (
            <div className={`loading-screen ${isDarkMode ? 'dark' : 'light'}`}>
                <p className="loading-text">Caricamento stato del gioco...</p>
            </div>
        );
    }

    return (
        <div className={`main-game-screen ${isDarkMode ? 'dark' : 'light'}`}>
            {/* Back Button */}
            <button
                onClick={onBack}
                className="main-game-screen__back-btn"
                aria-label="Indietro"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>

            {/* Game Title */}
            <h1 className="main-game-screen__title">
                Benvenuto, <span className="highlight">{gameState.nome}!</span>
            </h1>

            {/* Game Stats Container */}
            <div className="main-game-screen__stats">
                <p className="game-stat">
                    <span className="icon happiness-icon">😄</span> Felicità: <span className="stat-value">{gameState.felicita}</span>
                </p>
                <p className="game-stat">
                    <span className="icon money-icon">💰</span> Soldi: <span className="stat-value">{gameState.soldi}</span>
                </p>
                <p className="game-stat">
                    <span className="icon energy-icon">⚡</span> Energia: <span className="stat-value">{gameState.energia}</span>
                </p>
            </div>


            {/* Action Buttons Container */}
            <div className="main-game-screen__actions">
                <button onClick={() => doAction('lavoro')} className="main-game-screen__action-btn">Vai a Lavorare</button>
                <button onClick={() => doAction('dormi')} className="main-game-screen__action-btn">Dormi</button>
                <button onClick={() => doAction('divertiti')} className="main-game-screen__action-btn">Divertiti</button>
            </div>

            {/* Footer */}
            <footer className="main-game-screen__footer">
                <p>&copy; {new Date().getFullYear()} LifeSim. Tutti i diritti riservati.</p>
                <p>Sviluppato da Daniele Di Sarno & Ciro La Rocca</p>
            </footer>
        </div>
    );
}

export default MainGameScreen;
