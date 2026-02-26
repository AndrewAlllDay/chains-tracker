import React, { useState } from 'react';

// Haptic feedback helper
const triggerHaptic = (pattern) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

export default function LeagueSession({ onSave, onCancel }) {
    const [currentRound, setCurrentRound] = useState(1);
    const [activeStation, setActiveStation] = useState(null);
    const [tempMade, setTempMade] = useState(0);

    const [sessionData, setSessionData] = useState({
        1: {}, 2: {}, 3: {}
    });

    const calculateTotalScore = () => {
        let total = 0;
        Object.values(sessionData).forEach((stations) => {
            Object.entries(stations).forEach(([station, made]) => {
                total += (made * parseInt(station));
            });
        });
        return total;
    };

    const calculateRoundScore = (round) => {
        return Object.entries(sessionData[round] || {}).reduce((acc, [st, m]) => acc + (m * st), 0);
    };

    const openStation = (st) => {
        setTempMade(sessionData[currentRound][st] || 0);
        setActiveStation(st);
    };

    const saveStationScore = () => {
        // Trigger the "Success" haptic pattern
        triggerHaptic([50, 50, 50]);

        setSessionData(prev => ({
            ...prev,
            [currentRound]: { ...prev[currentRound], [activeStation]: tempMade }
        }));
        setActiveStation(null);
    };

    const isLastRound = currentRound === 3;

    return (
        <div className="container league-session-view">
            {/* Nav Header */}
            <div className="session-nav" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px', minHeight: '40px' }}>
                <button
                    className="back-link"
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        left: 0,
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    {/* Consistent SVG Back Arrow */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Exit
                </button>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--league-dark)' }}>
                    Round {currentRound} / 3
                </div>
            </div>

            <div className="card">
                {/* Score Box */}
                <div className="league-score-box" style={{ border: 'none' }}>
                    <div className="score-item">
                        <span className="league-label">Round {currentRound}</span>
                        <div className="league-total">{calculateRoundScore(currentRound)}</div>
                    </div>

                    <div className="score-divider" style={{ width: '1px', height: '40px', backgroundColor: 'var(--border)', margin: '0 15px' }}></div>

                    <div className="score-item">
                        <span className="league-label">Total</span>
                        <div className="league-total">{calculateTotalScore()}</div>
                    </div>
                </div>

                {/* Station Grid */}
                <div className="station-grid">
                    {[1, 2, 3, 4, 5].map(st => {
                        const val = sessionData[currentRound][st];
                        const hasScore = val !== undefined;
                        return (
                            <button
                                key={st}
                                className={`station-btn ${hasScore ? 'done' : ''}`}
                                onClick={() => openStation(st)}
                                style={{ outline: 'none' }}
                            >
                                <div className="station-num">Station {st}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{st} pts/make</div>
                                {hasScore && <div className="station-result">{val}/5</div>}
                            </button>
                        );
                    })}
                </div>

                {/* Navigation Actions */}
                <div className="league-actions" style={{
                    marginTop: '25px',
                    display: 'grid',
                    gridTemplateColumns: currentRound > 1 ? '1fr 2fr' : '1fr',
                    gap: '10px'
                }}>

                    {/* BACK BUTTON (ROUND NAVIGATION) */}
                    {currentRound > 1 && (
                        <button
                            className="secondary-btn"
                            onClick={() => { window.scrollTo(0, 0); setCurrentRound(currentRound - 1); }}
                            style={{
                                padding: '18px',
                                borderRadius: '16px',
                                backgroundColor: '#e5e7eb',
                                color: '#4b5563',
                                border: 'none',
                                outline: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {/* Consistent SVG for the big back button */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                    )}

                    {/* PRIMARY ACTION */}
                    {!isLastRound ? (
                        <button
                            className="save-btn league-btn"
                            style={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                fontSize: currentRound > 1 ? '1.1rem' : '1.3rem'
                            }}
                            onClick={() => { window.scrollTo(0, 0); setCurrentRound(currentRound + 1); }}
                        >
                            Start Round {currentRound + 1}
                        </button>
                    ) : (
                        <button
                            className="finish-btn"
                            style={{
                                width: '100%',
                                padding: '18px',
                                borderRadius: '16px',
                                fontSize: currentRound > 1 ? '1rem' : '1.2rem',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                backgroundColor: '#111827',
                                color: '#ffffff',
                                border: 'none',
                                outline: 'none',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                            }}
                            onClick={() => onSave(sessionData, calculateTotalScore())}
                        >
                            Finish League Night
                        </button>
                    )}
                </div>
            </div>

            {/* Modal */}
            {activeStation && (
                <div className="modal-overlay" onClick={() => setActiveStation(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Station {activeStation}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{activeStation} pts per make</p>

                        <div className="stepper-controls">
                            <button className="step-btn minus" style={{ border: 'none', outline: 'none' }} onClick={() => setTempMade(Math.max(0, tempMade - 1))}>−</button>
                            <div className="step-display">{tempMade}</div>
                            <button className="step-btn plus" style={{ border: 'none', outline: 'none' }} onClick={() => setTempMade(Math.min(5, tempMade + 1))}>+</button>
                        </div>

                        <button
                            className="save-btn league-btn"
                            style={{ marginTop: '25px', border: 'none', outline: 'none' }}
                            onClick={saveStationScore}
                        >
                            Save Station
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}