import React, { useState } from 'react';
import { ArrowLeft, Flame } from 'lucide-react';
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
                    scoringStyle="SIMPLE"
                    onLogRound={handleLogRound}
                />
            ) : (
                <StandardMode
                    scoringStyle={scoringStyle}
                    onLogRound={handleLogRound}
                    roundCount={sessionRounds.length}
                    onFinish={handleFinishSession}
                />
            )}

            {/* PROGRESS LIST (SHOWING ALL ROUNDS) */}
            {sessionRounds.length > 0 && mode === 'STANDARD' && (
                <div style={{ marginTop: '15px' }}>
                    <ul className="history-list">
                        {sessionRounds.map((r) => {
                            const isPerfectRound = r.made === r.attempts;
                            return (
                                <li key={r.id} className={`history-item session-item ${isPerfectRound ? 'perfect-round' : ''}`}>
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: 'bold' }}>{r.distance}ft</span>
                                            {r.firstPuttMade && <span style={{ fontSize: '0.6rem', background: '#fef3c7', color: '#d97706', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>CLUTCH</span>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
        </div>
    );
}