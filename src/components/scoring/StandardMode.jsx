import React, { useState } from 'react';

export default function StandardMode({ scoringStyle, onLogRound }) {
    const [distance, setDistance] = useState(20);
    const [puttSequence, setPuttSequence] = useState([false, false, false, false, false]);
    const [simpleMade, setSimpleMade] = useState(0);

    const isPro = scoringStyle === 'PRO';
    const allStations = [10, 15, 20, 25, 30, 33, 40, 50];

    const currentMadeCount = isPro ? puttSequence.filter(p => p).length : simpleMade;

    const togglePutt = (index) => {
        const newSeq = [...puttSequence];
        newSeq[index] = !newSeq[index];
        setPuttSequence(newSeq);
    };

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

        const newRound = {
            id: Date.now(),
            distance,
            made: currentMadeCount,
            attempts: 5,
            puttSequence: isPro ? [...puttSequence] : [],
            firstPuttMade: isPro ? puttSequence[0] : false
        };

        // Send data up to orchestrator
        onLogRound(newRound);

        // Reset local inputs for the next round
        setPuttSequence([false, false, false, false, false]);
        setSimpleMade(0);
    };

    return (
        <div className="card input-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px' }}>

            {/* HEADER SECTION */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
                    <select
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        style={{
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            backgroundImage: 'none',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '6px 28px 6px 14px',
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            outline: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        {allStations.map(st => (
                            <option key={st} value={st}>DISTANCE: {st} FT</option>
                        ))}
                    </select>
                    <div style={{
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        pointerEvents: 'none', fontSize: '0.6rem', color: 'var(--text-muted)'
                    }}>
                        ▼
                    </div>
                </div>

                {/* MASSIVE DISTANCE NUMBER */}
                <div style={{ fontSize: '3.2rem', fontWeight: '900', color: 'var(--primary)', lineHeight: '1' }}>
                    {distance}<span style={{ fontSize: '1.2rem', marginLeft: '6px', opacity: 0.6 }}>FT</span>
                </div>
            </div>

            {/* DYNAMIC SCORING INPUT */}
            {isPro ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px', width: '100%', alignItems: 'center' }}>
                    {puttSequence.map((isMade, idx) => {
                        const isCold = idx === 0;
                        return (
                            <button
                                key={idx}
                                onClick={() => togglePutt(idx)}
                                style={{
                                    width: '72px', height: '72px', flexShrink: 0, padding: 0,
                                    borderRadius: '50%', border: isMade ? 'none' : '3px solid var(--border)',
                                    backgroundColor: isMade ? (isCold ? '#f59e0b' : 'var(--primary)') : 'rgba(0,0,0,0.02)',
                                    color: isMade ? 'white' : 'var(--text-muted)',
                                    fontSize: '1.5rem', fontWeight: '900', cursor: 'pointer',
                                    transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    transform: isMade ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: isMade ? '0 6px 15px rgba(0,0,0,0.2)' : 'none',
                                    position: 'relative', outline: 'none'
                                }}
                            >
                                {isMade ? '✓' : idx + 1}
                                {isCold && !isMade && (
                                    <span style={{
                                        position: 'absolute', top: '-8px', fontSize: '0.6rem',
                                        background: '#fef3c7', color: '#d97706', padding: '2px 6px',
                                        borderRadius: '4px', border: '1px solid #fde68a', fontWeight: '900'
                                    }}>COLD</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            ) : (
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
            )}

            <div style={{ marginBottom: '15px', fontWeight: '900', fontSize: '1.1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>SCORE: </span>
                <span style={{ color: 'var(--text)' }}>{currentMadeCount} / 5</span>
            </div>

            <button
                type="button"
                className="save-btn"
                onClick={handleLogClick}
                style={{
                    backgroundColor: 'var(--primary)',
                    width: '100%', padding: '20px', fontSize: '1.2rem', outline: 'none', border: 'none'
                }}
            >
                LOG ROUND
            </button>
        </div>
    );
}