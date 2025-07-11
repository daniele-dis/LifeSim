import React from 'react';
import '../css/index.css';
import '../css/MainGameScreen.css';

function MainGameScreen({ gameState, doAction, onBack, isDarkMode, aiSuggestion, onAcceptSuggestion, onRejectSuggestion, message }) {
    if (!gameState) {
        return (
            <div className={`loading-screen ${isDarkMode ? 'dark' : 'light'}`}>
                <p className="loading-text">Caricamento stato del gioco...</p>
            </div>
        );
    }

    const relationshipStatus = gameState.relazione.stato;
    const hasPartner = relationshipStatus === "fidanzato" || relationshipStatus === "sposato";
    const hasChildren = gameState.figli && gameState.figli.length > 0;

    const formatName = (name) => {
        if (!name) return '';
        return name.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className={`main-game-screen ${isDarkMode ? 'dark' : 'light'} ${gameState.is_game_over ? 'game-over-bg' : ''}`}>
            <button className="back-button" onClick={onBack}>
                &larr; Indietro
            </button>

            {gameState.is_game_over && (
                <div className="game-over-overlay">
                    <div className="game-over-content">
                        <h2>GAME OVER!</h2>
                        <p className="game-over-reason">{gameState.death_reason || "La tua vita è giunta al termine."}</p>
                        <p className="final-stats">Hai vissuto fino all'età di {gameState.eta} anni.</p>
                        <p className="final-stats">Hai lasciato {gameState.soldi} soldi.</p>
                        <button onClick={onBack} className="game-over-restart-btn">Torna alla selezione partita</button>
                    </div>
                </div>
            )}

            {!gameState.is_game_over && (
                <>
                    <h1 className="main-game-screen__title">
                        Benvenuto, <span className="highlight">{gameState.nome}!</span>
                    </h1>

                    <div className="main-game-screen__stats">
                        {[
                            //blocco stats //
                            
                            { icon: '🎂', label: 'Età', value: gameState.eta },
                            { icon: '😄', label: 'Felicità', value: gameState.felicita },
                            { icon: '💰', label: 'Soldi', value: new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(gameState.soldi) },
                            { icon: '⚡', label: 'Energia', value: gameState.energia }
                        ].map((stat, index) => (
                            <div key={index} className="stat-box">
                                <p className="game-stat"><span className="icon">{stat.icon}</span> {stat.label}: <span className="stat-value">{stat.value}</span></p>
                            </div>
                        ))}

                        <div className="stat-box">
                            <p className="game-stat"><span className="icon education-icon">🎓</span> Titolo di Studio:</p>
                            <p className="game-stat-value">
                                {formatName(gameState.titolo_studio)}
                                {gameState.titolo_studio !== "master" && (
                                    <span className="stat-detail">
                                        ({gameState.giorni_per_prossimo_livello_studio > 0 ? `${gameState.giorni_per_prossimo_livello_studio} giorni al prossimo` : 'Completato'})
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="stat-box">
                            <p className="game-stat"><span className="icon job-icon">💼</span> Lavoro:</p>
                            <p className="game-stat-value">
                                {formatName(gameState.lavoro_attuale)}
                                {gameState.lavoro_attuale !== "disoccupato" && (
                                    <span className="stat-detail">
                                        (Stipendio: {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(gameState.stipendio)})
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="stat-box">
                            <p className="game-stat"><span className="icon relationship-icon">❤️</span> Relazione:</p>
                            <p className="game-stat-value">
                                {formatName(relationshipStatus)}
                                {hasPartner && (
                                    <span className="stat-detail">
                                        con {gameState.relazione.partner_nome} ({gameState.relazione.felicita_relazione}% felicità)
                                    </span>
                                )}
                                {relationshipStatus === "divorziato" && <span className="stat-detail" style={{ color: 'var(--color-button-danger)' }}> (Ex)</span>}
                            </p>
                            {hasPartner && (
                                <div className="relationship-bar-container">
                                    <div className="relationship-bar" style={{ width: `${gameState.relazione.felicita_relazione}%`, backgroundColor: gameState.relazione.felicita_relazione > 50 ? 'var(--color-highlight-secondary)' : 'var(--color-button-danger)' }}></div>
                                </div>
                            )}
                        </div>

                        <div className="stat-box">
                            <p className="game-stat"><span className="icon children-icon">👨‍👩‍👧‍👦</span> Figli:</p>
                            <p className="game-stat-value">
                                {hasChildren ? gameState.figli.map(f => f.nome).join(', ') : "Nessuno"}
                            </p>
                        </div>
                    </div>

                    {message && (
                        <div className="game-message">
                            <p>{message}</p>
                        </div>
                    )}

                    {aiSuggestion && (
                        //blocco per i suggerimenti AI
                    <div className={`main-game-screen__ai-suggestion ${isDarkMode ? 'dark' : 'light'}`}>
                        <p className="ai-suggestion__text">
                            <strong className="lightblue-text">Suggerimento IA:</strong> {aiSuggestion.text}
                        </p>
                        <div className="ai-suggestion__actions">
                            <button onClick={() => onAcceptSuggestion(aiSuggestion.action)} className="ai-suggestion__btn ai-suggestion__btn--accept">
                                Accetta: {formatName(aiSuggestion.action)}
                            </button>
                            <button onClick={onRejectSuggestion} className="ai-suggestion__btn ai-suggestion__btn--reject">
                                Rifiuta
                            </button>
                        </div>
                    </div>
                )}


                        
                    <div className="main-game-screen__actions">
                        {gameState.lavoro_attuale !== "disoccupato" && (

                            //blocco pulsanti //

                            <button onClick={() => doAction('lavoro')} className="main-game-screen__action-btn">Vai a Lavorare</button>
                        )}
                        {gameState.lavoro_attuale === "disoccupato" && (
                            <button onClick={() => doAction('cerca_lavoro')} className="main-game-screen__action-btn">Cerca Lavoro</button>
                        )}
                        <button onClick={() => doAction('dormi')} className="main-game-screen__action-btn">Dormi</button>
                        <button onClick={() => doAction('divertiti')} className="main-game-screen__action-btn">Divertiti</button>
                        {gameState.titolo_studio !== "master" && (
                            <button onClick={() => doAction('studia')} className="main-game-screen__action-btn">Studia/Formati</button>
                        )}
                        {relationshipStatus === "single" && gameState.eta >= 18 && gameState.eta < 30 && (
                            <button onClick={() => doAction('cerca_partner')} className="main-game-screen__action-btn">Cerca un Partner</button>
                        )}
                        {hasPartner && (
                            <>
                                <button onClick={() => doAction('esci_con_partner')} className="main-game-screen__action-btn">Esci con {gameState.relazione.partner_nome}</button>
                                <button onClick={() => doAction('parla_con_partner')} className="main-game-screen__action-btn">Parla con {gameState.relazione.partner_nome}</button>
                            </>
                        )}
                        {relationshipStatus === "fidanzato" && gameState.relazione.felicita_relazione >= 70 && gameState.eta >= 20 && (
                            <button onClick={() => doAction('proponi_matrimonio')} className="main-game-screen__action-btn">Proponi Matrimonio</button>
                        )}
                        {relationshipStatus === "fidanzato" && (
                            <button onClick={() => doAction('lascia_partner')} className="main-game-screen__action-btn main-game-screen__action-btn--danger">Lascia il Partner</button>
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
                        <button onClick={() => doAction('viaggia')} className="main-game-screen__action-btn">Viaggia</button>
                        <button onClick={() => doAction('investi')} className="main-game-screen__action-btn">Investi Soldi</button>
                    </div>

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