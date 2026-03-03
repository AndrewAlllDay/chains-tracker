import React, { useState } from 'react';

const WORLD_RULES = {
    10: { pass: 5, push: 4, label: "5/5 to Advance" },
    15: { pass: 4, push: 3, label: "4/5 to Advance" },
    20: { pass: 4, push: 3, label: "4/5 to Advance" },
    25: { pass: 3, push: 2, label: "3/5 to Advance" },
    30: { pass: 3, push: 2, label: "3/5 to Advance" },
    33: { pass: 3, push: 0, label: "3/5 to Advance" },
    40: { pass: 2, push: 1, label: "2/5 to Advance" },
    50: { pass: 1, push: 1, label: "1/5 to Finish" }
};

// Haptic helper matching your other modes
const triggerHaptic = (pattern) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

export default function AroundTheWorld({ onLogRound, roundCount, onFinish }) {
    const [distance, setDistance] = useState(10);
    const [highestUnlocked, setHighestUnlocked] = useState(10);
    const [activeUnlock, setActiveUnlock] = useState(null);
    const [isGameComplete, setIsGameComplete] = useState(false);
    const [simpleMade, setSimpleMade] = useState(0);

    const allStations = [10, 15, 20, 25, 30, 33, 40, 50];
    const currentStationIndex = allStations.indexOf(distance);
    const currentMadeCount = simpleMade;

    const handleSimpleAdjust = (amount) => {
        setSimpleMade(prev => {
            const newVal = prev + amount;
            if (newVal < 0) return 0;
            if (newVal > 5) return 5;
            return newVal;
        });
    };

    const handleLogClick = (e) => {
        if (e) e.preventDefault();

        triggerHaptic([50, 50, 50]);

        const newRound = {
            id: Date.now(),
            distance,
            made: currentMadeCount,
            attempts: 5,
            puttSequence: [],
            firstPuttMade: false
        };

        onLogRound(newRound);
        setSimpleMade(0);

        const rules = WORLD_RULES[distance];
        let nextDistance = distance;

        if (currentMadeCount >= rules.pass) {
            if (distance === 33) {
                nextDistance = 40;
            } else if (distance === 50) {
                setActiveUnlock('VICTORY');
                setIsGameComplete(true);
                return;
            } else if (currentStationIndex < allStations.length - 1) {
                nextDistance = allStations[currentStationIndex + 1];
            }
        } else if (rules.push > 0 && currentMadeCount < rules.push) {
            if (currentStationIndex > 0) {
                nextDistance = allStations[currentStationIndex - 1];
            }
        }

        if (distance === 33 && nextDistance === 40 && highestUnlocked < 40) {
            setActiveUnlock(40);
        } else if (distance === 40 && nextDistance === 50 && highestUnlocked < 50) {
            setActiveUnlock(50);
        }

        setDistance(nextDistance);
        if (nextDistance > highestUnlocked) {
            setHighestUnlocked(nextDistance);
        }
    };

    return (
        <div className="card input-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px' }}>
            <style>
                {`
                @keyframes atw-pulse {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>

            {activeUnlock && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: activeUnlock === 40 ? '#3b82f6' : activeUnlock === 50 ? '#111827' : '#10b981', zIndex: 9999,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: 'white', padding: '30px', textAlign: 'center',
                    animation: 'fade-in-up 0.4s cubic-bezier(0.215, 0.61, 0.355, 1)'
                }}>
                    <div style={{ fontSize: '5rem', marginBottom: '15px', textShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                        {activeUnlock === 40 ? '🌊' : activeUnlock === 50 ? '🚀' : '🏆'}
                    </div>
                    <h1 style={{
                        fontSize: '3rem', fontWeight: '900', marginBottom: '15px',
                        lineHeight: '1', textTransform: 'uppercase', fontFamily: 'Fugaz One, cursive',
                        textShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}>
                        {activeUnlock === 40 ? 'Deep Water Unlocked' : activeUnlock === 50 ? 'The Final Frontier' : 'World Conquered'}
                    </h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '40px', maxWidth: '300px', fontWeight: '600' }}>
                        {activeUnlock === 40
                            ? "You've conquered the standard putting area. Welcome to the challenge zone."
                            : activeUnlock === 50
                                ? "50 Feet. The edge of the world. Just one make to win it all."
                                : "You completed the Around The World challenge! Legendary putting performance."}
                    </p>
                    <button
                        onClick={() => setActiveUnlock(null)}
                        style={{
                            backgroundColor: 'white', color: activeUnlock === 40 ? '#3b82f6' : activeUnlock === 50 ? '#111827' : '#10b981',
                            padding: '20px 40px', borderRadius: '30px', fontSize: '1.2rem',
                            fontWeight: '900', border: 'none', outline: 'none',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.3)', cursor: 'pointer',
                            textTransform: 'uppercase', letterSpacing: '1px'
                        }}
                    >
                        {activeUnlock === 'VICTORY' ? 'Claim Victory' : activeUnlock === 40 ? 'Bring It On' : 'Finish It'}
                    </button>
                </div>
            )}

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <svg width="100%" height="auto" viewBox="0 0 300 300" style={{ maxWidth: '320px', overflow: 'visible' }}>
                    <text x="150" y="150" fontSize="19" textAnchor="middle" dominantBaseline="middle">🗑️</text>
                    {[20, 33].map(st => {
                        const radius = 35 + ((st - 10) / 40) * 90;
                        return (
                            <circle
                                key={`ring-${st}`}
                                cx="150" cy="150" r={radius}
                                fill="none" stroke="var(--border)" strokeWidth="1"
                                strokeDasharray="4 4" opacity="0.6"
                            />
                        );
                    })}

                    {allStations.map((st, idx) => {
                        if (st === 40 && highestUnlocked < 40) return null;
                        if (st === 50 && highestUnlocked < 50) return null;
                        const isPassed = currentStationIndex > idx;
                        const isActive = currentStationIndex === idx;
                        const radius = 35 + ((st - 10) / 40) * 90;
                        const theta = (idx * (Math.PI * 2) / 8) - (Math.PI / 2);
                        const cx = 150 + radius * Math.cos(theta);
                        const cy = 150 + radius * Math.sin(theta);
                        let fill = 'white';
                        let stroke = 'var(--border)';
                        let strokeWidth = 2;
                        let r = 7;

                        if (isPassed || isGameComplete) {
                            fill = 'var(--league)';
                            stroke = 'var(--league)';
                        } else if (isActive) {
                            fill = '#3b82f6';
                            stroke = '#3b82f6';
                            strokeWidth = 3;
                            r = 10;
                        }

                        return (
                            <g key={`planet-${st}`}>
                                {isActive && !isGameComplete && (
                                    <circle
                                        cx={cx} cy={cy} r={r}
                                        fill="none" stroke="#3b82f6" strokeWidth="4"
                                        style={{
                                            transformOrigin: `${cx}px ${cy}px`,
                                            animation: 'atw-pulse 1.5s infinite'
                                        }}
                                    />
                                )}
                                <circle
                                    cx={cx} cy={cy} r={r}
                                    fill={fill} stroke={stroke} strokeWidth={strokeWidth}
                                    style={{ transition: 'all 0.3s' }}
                                />
                                <text
                                    x={cx}
                                    y={cy - (isActive ? 22 : 16)}
                                    fontSize={isActive ? "13" : "10"}
                                    fontWeight={isActive ? "900" : "700"}
                                    fill={isActive && !isGameComplete ? "#3b82f6" : "var(--text-muted)"}
                                    opacity={isPassed || isActive || isGameComplete ? 1 : 0.5}
                                    textAnchor="middle"
                                >
                                    {st}'
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ fontSize: '3.2rem', fontWeight: '900', color: distance >= 40 ? '#3b82f6' : 'var(--primary)', lineHeight: '1' }}>
                    {distance}<span style={{ fontSize: '1.2rem', marginLeft: '6px', opacity: 0.6 }}>FT</span>
                </div>

                {!isGameComplete && (
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text)' }}>
                            {WORLD_RULES[distance].label}
                        </span>
                        {WORLD_RULES[distance].push > 0 && (
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                                (Make {WORLD_RULES[distance].push} to stay, less to fall back)
                            </span>
                        )}
                    </div>
                )}
            </div>

            {isGameComplete ? (
                <div style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center', padding: '30px 20px', backgroundColor: 'var(--league-light)', borderRadius: '16px', border: '2px solid var(--league)', color: 'var(--league-dark)', width: '100%', marginBottom: '15px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌟</div>
                        <div style={{ fontWeight: '900', fontSize: '1.4rem', marginBottom: '5px' }}>CHALLENGE COMPLETE</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', opacity: 0.8 }}>Session saved. Finish to exit.</div>
                    </div>
                    <button
                        type="button"
                        onClick={onFinish}
                        style={{
                            backgroundColor: '#111827', color: '#ffffff',
                            width: '100%', padding: '20px', borderRadius: '16px', fontSize: '1.1rem',
                            fontWeight: '800', textTransform: 'uppercase', border: 'none', outline: 'none'
                        }}
                    >
                        FINISH SESSION
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '35px', marginTop: '10px' }}>
                        <button
                            onClick={() => handleSimpleAdjust(-1)}
                            style={{
                                width: '70px', height: '70px', flexShrink: 0, padding: 0,
                                borderRadius: '16px', border: 'none',
                                background: '#fee2e2', color: '#dc2626',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                opacity: simpleMade === 0 ? 0.4 : 1, outline: 'none', transition: 'all 0.1s'
                            }}
                            disabled={simpleMade === 0}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <div style={{ fontSize: '4.5rem', fontWeight: '900', width: '80px', textAlign: 'center', color: 'var(--text)', transition: 'color 0.2s' }}>
                            {simpleMade}
                        </div>
                        <button
                            onClick={() => handleSimpleAdjust(1)}
                            style={{
                                width: '70px', height: '70px', flexShrink: 0, padding: 0,
                                borderRadius: '16px', border: 'none',
                                background: '#dcfce7', color: '#16a34a',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                opacity: simpleMade === 5 ? 0.4 : 1,
                                outline: 'none', transition: 'all 0.1s'
                            }}
                            disabled={simpleMade === 5}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>

                    <div style={{ marginBottom: '15px', fontWeight: '900', fontSize: '1.1rem', width: '100%', display: 'flex', justifyContent: 'space-between' }}>


                    </div>

                    <div style={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: roundCount > 0 ? '1fr 1fr' : '1fr',
                        gap: '10px'
                    }}>
                        <button
                            type="button"
                            className="save-btn"
                            onClick={handleLogClick}
                            style={{
                                backgroundColor: distance >= 40 ? '#3b82f6' : 'var(--primary)',
                                width: '100%', padding: '20px', fontSize: '1.2rem', outline: 'none', border: 'none'
                            }}
                        >
                            LOG
                        </button>

                        {roundCount > 0 && (
                            <button
                                type="button"
                                onClick={onFinish}
                                style={{
                                    backgroundColor: '#111827', color: '#ffffff',
                                    width: '100%', padding: '20px', borderRadius: '16px', fontSize: '1.1rem',
                                    fontWeight: '800', textTransform: 'uppercase', border: 'none', outline: 'none'
                                }}
                            >
                                FINISH
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}