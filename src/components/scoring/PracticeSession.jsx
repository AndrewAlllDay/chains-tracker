import React, { useState } from 'react';

// Define the "Around the World" difficulty logic
const WORLD_RULES = {
    10: { pass: 5, push: 4, label: "5/5 to Advance" },
    15: { pass: 4, push: 3, label: "4/5 to Advance" },
    20: { pass: 4, push: 3, label: "4/5 to Advance" },
    25: { pass: 3, push: 2, label: "3/5 to Advance" },
    30: { pass: 3, push: 2, label: "3/5 to Advance" },
    33: { pass: 3, push: 0, label: "3/5 to Advance" },
    40: { pass: 2, push: 0, label: "2/5 to Advance" },
    50: { pass: 1, push: 0, label: "1/5 to Finish" }
};

export default function PracticeSession({ onSave, onCancel, initialMode = 'STANDARD' }) {
    const [mode] = useState(initialMode);
    const [distance, setDistance] = useState(initialMode === 'WORLD' ? 10 : 20);
    const [made, setMade] = useState(0);
    const [attempts] = useState(5);
    const [sessionRounds, setSessionRounds] = useState([]);
    const [showChallengeAlert, setShowChallengeAlert] = useState(false);
    const [showVictoryAlert, setShowVictoryAlert] = useState(false);

    const allStations = [10, 15, 20, 25, 30, 33, 40, 50];

    const visibleStations = allStations.filter(s => {
        if (s <= 33) return true;
        return distance >= s;
    });

    const currentStationIndex = allStations.indexOf(distance);

    const handleLogRound = (e) => {
        if (e) e.preventDefault();
        const newRound = {
            id: Date.now(),
            distance,
            made,
            attempts
        };

        const updatedRounds = [newRound, ...sessionRounds];
        setSessionRounds(updatedRounds);
        setMade(0);

        if (mode === 'WORLD') {
            const rules = WORLD_RULES[distance];

            if (made >= rules.pass) {
                if (distance === 33) {
                    setShowChallengeAlert(true);
                    setTimeout(() => setShowChallengeAlert(false), 2500);
                    setDistance(40);
                } else if (currentStationIndex < allStations.length - 1) {
                    setDistance(allStations[currentStationIndex + 1]);
                } else {
                    setShowVictoryAlert(true);
                }
            } else if (rules.push > 0 && made < rules.push) {
                if (currentStationIndex > 0) {
                    setDistance(allStations[currentStationIndex - 1]);
                }
            }
        }
    };

    const handleFinishSession = () => {
        onSave(sessionRounds);
    };

    return (
        <div className="container practice-session-view" style={{ position: 'relative' }}>

            {/* THE CHALLENGE OVERLAY */}
            {showChallengeAlert && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(59, 131, 246, 0.95)', zIndex: 100,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    alignItems: 'center', color: 'white', borderRadius: '16px',
                    animation: 'fadeIn 0.3s ease', textAlign: 'center', padding: '20px'
                }}>
                    <div style={{ fontSize: '3.5rem' }}>🚀</div>
                    <h2 style={{ fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0' }}>Circle 1 Clear</h2>
                    <p style={{ fontWeight: '600', opacity: 0.9 }}>Entering "The Challenge"</p>
                    <div style={{ marginTop: '20px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid white', padding: '8px 16px', borderRadius: '20px' }}>
                        NEW STATIONS UNLOCKED
                    </div>
                </div>
            )}

            {/* THE VICTORY OVERLAY */}
            {showVictoryAlert && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(59, 131, 246, 0.98)', zIndex: 101,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    alignItems: 'center', color: 'white', borderRadius: '16px',
                    animation: 'fadeIn 0.4s ease', textAlign: 'center', padding: '20px'
                }}>
                    <div style={{ fontSize: '4.5rem' }}>🏆</div>
                    <h2 style={{ fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '0' }}>World Conquered</h2>
                    <p style={{ fontWeight: '600', opacity: 0.9 }}>You completed the full journey!</p>
                    <button
                        onClick={handleFinishSession}
                        style={{
                            marginTop: '30px', backgroundColor: '#10b981', color: 'white',
                            border: 'none', padding: '14px 28px', borderRadius: '14px',
                            fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', letterSpacing: '1px'
                        }}
                    >
                        Save Victory & Exit
                    </button>
                </div>
            )}

            <div className="session-nav" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px', minHeight: '40px' }}>
                <button className="back-link" onClick={onCancel} style={{ position: 'absolute', left: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    ← Exit
                </button>
                <div style={{ fontWeight: '900', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {mode === 'WORLD' ? 'Around the World' : 'Practice Session'}
                </div>
            </div>

            <div className="card input-card" style={{ paddingTop: mode === 'WORLD' ? '10px' : '20px' }}>
                {mode === 'WORLD' && (
                    <div className="world-map-container" style={{ textAlign: 'center', marginBottom: '10px', padding: '10px 0' }}>
                        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '220px', overflow: 'visible' }}>
                            {[25, 45, 65, 85].map((r, i) => (
                                <circle key={i} cx="100" cy="100" r={r} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                            ))}
                            <g transform="translate(100, 100)">
                                <circle r="15" fill="var(--primary)" opacity="0.1" />
                                <text y="6" textAnchor="middle" fontSize="18">🗑️</text>
                            </g>
                            {visibleStations.map((dist, i) => {
                                const radius = 30 + (i * 12);
                                const angle = (i * 0.6) - 1.5;
                                const x = 100 + Math.cos(angle) * radius;
                                const y = 100 + Math.sin(angle) * radius;
                                const isActive = distance === dist;
                                const isCompleted = distance > dist;
                                const isChallenge = dist > 33;
                                return (
                                    <g key={dist} style={{ transition: 'all 0.5s ease' }}>
                                        {i > 0 && (
                                            <line
                                                x1={100 + Math.cos(((i - 1) * 0.6) - 1.5) * (30 + ((i - 1) * 12))}
                                                y1={100 + Math.sin(((i - 1) * 0.6) - 1.5) * (30 + ((i - 1) * 12))}
                                                x2={x} y2={y}
                                                stroke={isCompleted ? "#10b981" : "#eee"} strokeWidth="2"
                                            />
                                        )}
                                        <circle cx={x} cy={y} r={isActive ? "8" : "5"} fill={isActive ? (isChallenge ? "#3b82f6" : "var(--primary)") : isCompleted ? "#10b981" : "#ddd"} />
                                        {isActive && (
                                            <circle cx={x} cy={y} r="14" fill={isChallenge ? "#3b82f6" : "var(--primary)"} opacity="0.2">
                                                <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
                                            </circle>
                                        )}
                                        <text x={x} y={y - 12} fontSize="10" textAnchor="middle" fontWeight="900" fill={isActive ? "var(--text)" : "#bbb"}>{dist}'</text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                )}

                {mode === 'STANDARD' ? (
                    <div className="form-group">
                        <label>Distance</label>
                        <select value={distance} onChange={(e) => setDistance(parseInt(e.target.value))}>
                            {allStations.map(d => (
                                <option key={d} value={d}>{d} ft {d === 33 ? '(C1 Edge)' : d === 40 ? '(C2)' : ''}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {distance > 33 ? "🏆 The Challenge" : "Current Station"}
                        </span>
                        <div style={{ fontSize: '2rem', fontWeight: '900', color: distance > 33 ? '#3b82f6' : 'var(--primary)', lineHeight: '1.2' }}>{distance} Feet</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>
                            Goal: {WORLD_RULES[distance]?.label.replace(" to Advance", "").replace(" to Finish", "")}
                        </div>
                    </div>
                )}

                <div className="stepper-container">
                    <label style={{ textAlign: 'center', display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '0.9rem', color: '#666' }}>PUTTS MADE</label>
                    <div className="stepper-controls" style={{ paddingBottom: '50px', paddingTop: '50px' }}>
                        <button type="button" className="step-btn minus" onClick={() => setMade(Math.max(0, made - 1))}>−</button>
                        <div className="step-display">{made}</div>
                        <button type="button" className="step-btn plus" onClick={() => setMade(Math.min(attempts, made + 1))}>+</button>
                    </div>
                </div>

                <button type="button" className="save-btn" onClick={handleLogRound} style={{ backgroundColor: distance > 33 ? '#3b82f6' : 'var(--primary)' }}>
                    {mode === 'WORLD' ? 'Log & Move' : 'Log Round'}
                </button>
            </div>

            {/* RESTORED HISTORY LIST FOR STANDARD MODE */}
            {sessionRounds.length > 0 && mode === 'STANDARD' && (
                <div style={{ marginTop: '20px' }}>
                    <div style={{ padding: '0 5px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Session Progress</h4>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{sessionRounds.length} Rounds</span>
                    </div>
                    <ul className="history-list" style={{ marginTop: '10px' }}>
                        {sessionRounds.map((r, i) => (
                            <li key={r.id} className={`history-item session-item ${r.made === r.attempts ? 'perfect-round' : ''}`}>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#ccc', fontWeight: '900', fontSize: '0.8rem' }}>{sessionRounds.length - i}</span>
                                        {r.made === r.attempts && <span style={{ fontSize: '1rem' }}>🔥</span>}
                                        <span style={{ fontWeight: 'bold' }}>{r.distance}ft</span>
                                    </div>
                                    <strong style={{ fontSize: '1.2rem' }}>{r.made}/{r.attempts}</strong>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {sessionRounds.length > 0 && (
                <button
                    className="finish-btn"
                    onClick={handleFinishSession}
                    style={{
                        marginTop: '20px', backgroundColor: '#111827', color: '#ffffff',
                        padding: '18px', borderRadius: '16px', fontSize: '1.1rem',
                        fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px',
                        width: '100%', border: 'none', cursor: 'pointer'
                    }}
                >
                    {mode === 'WORLD' ? 'Finish & Save Journey' : 'Finish & Save Session'}
                </button>
            )}
        </div>
    );
}