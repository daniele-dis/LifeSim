import React from 'react';

function MainGameScreen({ gameState, doAction, onBack, isDarkMode, aiSuggestion, onAcceptSuggestion, onRejectSuggestion, message }) {
    if (!gameState) {
        return (
            <div className={`loading-screen ${isDarkMode ? 'dark' : 'light'}`}>
                <p className="loading-text">Caricamento stato del gioco...</p>
            </div>
        );
    }

    // Determine current relationship status for display and action availability
    const relationshipStatus = gameState.relazione.stato;
    const hasPartner = relationshipStatus === "fidanzato" || relationshipStatus === "sposato";
    const hasChildren = gameState.figli && gameState.figli.length > 0;

    return (
        <div className={`main-game-screen ${isDarkMode ? 'dark' : 'light'} ${gameState.is_game_over ? 'game-over-bg' : ''}`}>
            {/* Back Button - Conditionally render or style for Game Over */}
            <button
                onClick={onBack}
                className="main-game-screen__back-btn"
                aria-label="Indietro"
                disabled={gameState.is_game_over} // Disable back button if game is over
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>

            {/* Game Over Overlay */}
            {gameState.is_game_over && (
                <div className="game-over-overlay">
                    <div className="game-over-content">
                        <h2>GAME OVER!</h2>
                        <p className="game-over-reason">{gameState.death_reason || "La tua vita è giunta al termine."}</p>
                        <p className="final-stats">Hai vissuto fino all'età di **{gameState.eta}** anni.</p>
                        <p className="final-stats">Hai lasciato **{gameState.soldi}** soldi.</p>
                        <button onClick={onBack} className="game-over-restart-btn">Torna alla selezione partita</button>
                    </div>
                </div>
            )}

            {/* Main Game Content (hidden when game over) */}
            {!gameState.is_game_over && (
                <>
                    {/* Game Title */}
                    <h1 className="main-game-screen__title">
                        Benvenuto, <span className="highlight">{gameState.nome}!</span>
                    </h1>

                    {/* Game Stats Container */}
                    <div className="main-game-screen__stats">
                        <p className="game-stat">
                            <span className="icon age-icon">🎂</span> Età: <span className="stat-value">{gameState.eta}</span>
                        </p>

                        <p className="game-stat">
                            <span className="icon happiness-icon">😄</span> Felicità: <span className="stat-value">{gameState.felicita}</span>
                        </p>

                        <p className="game-stat">
                            <span className="icon money-icon">💰</span> Soldi: <span className="stat-value">{new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(gameState.soldi)}</span>
                        </p>

                        <p className="game-stat">
                            <span className="icon energy-icon">⚡</span> Energia: <span className="stat-value">{gameState.energia}</span>
                        </p>

                        {/* Relationship Status */}
                        <p className="game-stat">
                            <span className="icon relationship-icon">❤️</span> Relazione: <span className="stat-value">{relationshipStatus.charAt(0).toUpperCase() + relationshipStatus.slice(1)}</span>
                            {hasPartner && (
                                <>
                                    {` con ${gameState.relazione.partner_nome}`}
                                    <span className="stat-value" style={{ marginLeft: '5px' }}>
                                        ({gameState.relazione.felicita_relazione}%)
                                    </span>
                                    {/* Aggiungi una barra di progresso per la relazione */}
                                    <div className="relationship-bar-container" style={{ width: '100px', height: '10px', backgroundColor: '#333', borderRadius: '5px', overflow: 'hidden', marginLeft: '10px' }}>
                                        <div className="relationship-bar" style={{ width: `${gameState.relazione.felicita_relazione}%`, height: '100%', backgroundColor: gameState.relazione.felicita_relazione > 50 ? 'var(--color-highlight-secondary)' : 'var(--color-button-danger)', transition: 'width 0.5s ease' }}></div>
                                    </div>
                                </>
                            )}
                            {relationshipStatus === "divorziato" && <span className="stat-value" style={{ color: 'var(--color-button-danger)' }}> (Ex)</span>}
                            {/* Aggiungi altri stati se necessario, es. "rottura" */}
                        </p>

                        {/* Children List */}
                        {hasChildren && (
                            <p className="game-stat">
                                <span className="icon children-icon">👨‍👩‍👧‍👦</span> Figli: <span className="stat-value">{gameState.figli.map(f => f.nome).join(', ')}</span>
                            </p>
                        )}
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div className="game-message">
                            <p>{message}</p>
                        </div>
                    )}

                    {/* AI Suggestion Section */}
                    {aiSuggestion && (
                        <div className="main-game-screen__ai-suggestion">
                            <p className="ai-suggestion__text">**Suggerimento IA:** {aiSuggestion.text}</p>
                            <div className="ai-suggestion__actions">
                                <button onClick={() => onAcceptSuggestion(aiSuggestion.action)} className="ai-suggestion__btn ai-suggestion__btn--accept">Accetta ({aiSuggestion.action})</button>
                                <button onClick={onRejectSuggestion} className="ai-suggestion__btn ai-suggestion__btn--reject">Rifiuta</button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons Container */}
                    <div className="main-game-screen__actions">
                        {/* Core Actions */}
                        <button onClick={() => doAction('lavoro')} className="main-game-screen__action-btn">Vai a Lavorare</button>
                        <button onClick={() => doAction('dormi')} className="main-game-screen__action-btn">Dormi</button>
                        <button onClick={() => doAction('divertiti')} className="main-game-screen__action-btn">Divertiti</button>

                        {/* Relationship Actions */}
                        {relationshipStatus === "single" && gameState.eta >= 18 && gameState.eta < 30 && (
                            <button onClick={() => doAction('cerca_partner')} className="main-game-screen__action-btn">Cerca un Partner</button>
                        )}
                        {hasPartner && (
                            <button onClick={() => doAction('esci_con_partner')} className="main-game-screen__action-btn">Esci con {gameState.relazione.partner_nome}</button>
                        )}
                        {relationshipStatus === "fidanzato" && gameState.relazione.felicita_relazione >= 70 && gameState.eta >= 20 && (
                            <button onClick={() => doAction('proponi_matrimonio')} className="main-game-screen__action-btn">Proponi Matrimonio</button>
                        )}
                        {relationshipStatus === "sposato" && gameState.eta >= 20 && gameState.eta < 45 && (
                            <button onClick={() => doAction('cerca_figli')} className="main-game-screen__action-btn">Cerca di avere Figli</button>
                        )}
                        {hasChildren && (
                            <button onClick={() => doAction('passa_tempo_figli')} className="main-game-screen__action-btn">Passa Tempo con i Figli</button>
                        )}
                        {relationshipStatus === "sposato" && (
                            <button onClick={() => doAction('divorzia')} className="main-game-screen__action-btn main-game-screen__action-btn--danger">Divorzia</button>
                        )}

                        {/* Other Advanced Actions */}
                        <button onClick={() => doAction('studia')} className="main-game-screen__action-btn">Studia/Formati</button>
                        <button onClick={() => doAction('viaggia')} className="main-game-screen__action-btn">Viaggia</button>
                        <button onClick={() => doAction('investi')} className="main-game-screen__action-btn">Investi Soldi</button>
                    </div>

                    {/* Footer */}
                    <footer className="main-game-screen__footer">
                        <p>&copy; {new Date().getFullYear()} LifeSim. Tutti i diritti riservati.</p>
                        <p>Sviluppato da Daniele Di Sarno & Ciro La Rocca</p>
                    </footer>
                </>
            )}
        </div>
    );
}

export default MainGameScreen;