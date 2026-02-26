import React, { useState } from 'react';
import { ArrowLeft, Flame } from 'lucide-react'; // Added for consistency
import StandardMode from './StandardMode';
import AroundTheWorld from './AroundTheWorld';

export default function PracticeSession({ onSave, onCancel, initialMode = 'STANDARD', scoringStyle = 'PRO' }) {
    const [mode] = useState(initialMode);
    const [sessionRounds, setSessionRounds] = useState([]);

    const handleLogRound = (newRound) => {
        setSessionRounds(prev => [newRound, ...prev]);
    };

    const handleFinishSession = () => {
        onSave(sessionRounds);
    };

    return (
        <div className="container practice-session-view" style={{ position: 'relative', paddingBottom: '20px' }}>

            {/* SYNCED NAV HEADER */}
            <div className="session-nav" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px', minHeight: '40px' }}>
                <button
                    className="back-link"
                    onClick={onCancel}
                    style={{
                        position: 'absolute', left: 0, background: 'none', border: 'none', outline: 'none',
                        cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center',
                        gap: '4px', fontSize: '1rem', fontWeight: '600'
                    }}
                >
                    {/* Lucide replacement for consistent stroke weight */}
                    <ArrowLeft size={18} strokeWidth={2.5} />
                    Exit
                </button>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text)' }}>
                    {mode === 'WORLD' ? 'Around the World' : 'Practice Session'}
                </div>
            </div>

            {/* ROUTE TO THE CORRECT GAME MODE */}
            {mode === 'WORLD' ? (
                <AroundTheWorld
                    // FORCED: Always use SIMPLE scoring for Around the World
                    scoringStyle="SIMPLE"
                    onLogRound={handleLogRound}
                />
            ) : (
                <StandardMode
                    scoringStyle={scoringStyle}
                    onLogRound={handleLogRound}
                />
            )}

            {/* PROGRESS LIST (ONLY FOR STANDARD MODE) */}
            {sessionRounds.length > 0 && mode === 'STANDARD' && (
                <div style={{ marginTop: '15px' }}>
                    <ul className="history-list">
                        {sessionRounds.slice(0, 3).map((r) => {
                            const isPerfectRound = r.made === r.attempts;
                            return (
                                <li key={r.id} className={`history-item session-item ${isPerfectRound ? 'perfect-round' : ''}`}>
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: 'bold' }}>{r.distance}ft</span>
                                            {r.firstPuttMade && <span style={{ fontSize: '0.6rem', background: '#fef3c7', color: '#d97706', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>CLUTCH</span>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {/* Lucide Flame icon to match the Dashboard */}
                                            {isPerfectRound && <Flame size={16} color="#f97316" fill="#f97316" />}
                                            <strong style={{ fontSize: '1.1rem' }}>{r.made}/{r.attempts}</strong>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* FINISH BUTTON */}
            {sessionRounds.length > 0 && (
                <button
                    className="finish-btn"
                    onClick={handleFinishSession}
                    style={{
                        marginTop: '15px', backgroundColor: '#111827', color: '#ffffff',
                        padding: '20px', borderRadius: '16px', fontSize: '1.1rem',
                        fontWeight: '800', textTransform: 'uppercase', width: '100%', border: 'none', outline: 'none'
                    }}
                >
                    FINISH SESSION
                </button>
            )}
        </div>
    );
}