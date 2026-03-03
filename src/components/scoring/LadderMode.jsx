import React, { useState, useRef } from 'react';
import { X, TrendingUp, ChevronUp, Pause, ChevronDown, Skull, Trophy } from 'lucide-react';

// Custom SVG Ladder perfectly matched to Lucide's style
const CustomLadderIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="7" y1="3" x2="7" y2="21"></line>
        <line x1="17" y1="3" x2="17" y2="21"></line>
        <line x1="7" y1="7" x2="17" y2="7"></line>
        <line x1="7" y1="12" x2="17" y2="12"></line>
        <line x1="7" y1="17" x2="17" y2="17"></line>
    </svg>
);

// Haptic feedback helper matching your app's standard
const triggerHaptic = (pattern) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

export default function LadderMode({ scoringStyle, onLogRound, roundCount, onFinish, showIntro, setShowIntro }) {
    // 1. Ladder specific state
    const [distance, setDistance] = useState(5);
    const [highestUnlocked, setHighestUnlocked] = useState(5);
    const [isGameComplete, setIsGameComplete] = useState(false);

    // 2. Feedback state
    const [feedback, setFeedback] = useState(null);
    const feedbackTimer = useRef(null);

    // 3. 3-Putt specific inputs
    const [puttSequence, setPuttSequence] = useState([false, false, false]); // Only 3 putts!
    const [simpleMade, setSimpleMade] = useState(0);

    const isPro = scoringStyle === 'PRO';
    const LADDER_RUNGS = [5, 10, 15, 20, 25, 30, 35, 40];
    const currentRungIndex = LADDER_RUNGS.indexOf(distance);

    const currentMadeCount = isPro ? puttSequence.filter(p => p).length : simpleMade;

    // Toggle for PRO mode (3 putters)
    const togglePutt = (index) => {
        const newSeq = [...puttSequence];
        newSeq[index] = !newSeq[index];
        setPuttSequence(newSeq);
    };

    // Plus/Minus for SIMPLE mode (Max 3)
    const handleSimpleAdjust = (amount) => {
        setSimpleMade(prev => {
            const newVal = prev + amount;
            if (newVal < 0) return 0;
            if (newVal > 3) return 3; // Max is 3 for the Ladder!
            return newVal;
        });
    };

    const handleLogClick = (e) => {
        if (e) e.preventDefault();

        // 1. Log the round exactly how your app expects it
        const newRound = {
            id: Date.now(),
            distance,
            made: currentMadeCount,
            attempts: 3, // Overriding the standard 5 attempts
            puttSequence: isPro ? [...puttSequence] : [],
            firstPuttMade: isPro ? puttSequence[0] : false
        };

        onLogRound(newRound);

        // Reset inputs for the next round
        setPuttSequence([false, false, false]);
        setSimpleMade(0);

        // 2. LADDER PROGRESSION LOGIC & FEEDBACK
        let nextDistance = distance;
        let fbMsg = "";
        let fbColor = "";

        if (currentMadeCount === 3) {
            fbMsg = "Level Up!";
            fbColor = "#10b981"; // Green
            triggerHaptic([50, 50, 50]); // Triumphant buzz

            if (distance === 40) {
                setIsGameComplete(true);
                return;
            } else {
                nextDistance = LADDER_RUNGS[currentRungIndex + 1];
            }
        } else if (currentMadeCount === 2) {
            fbMsg = "Steady.";
            fbColor = "#f59e0b"; // Yellow
            triggerHaptic([50]); // Standard tap

            nextDistance = distance;
        } else if (currentMadeCount === 1) {
            fbMsg = "Falling Back.";
            fbColor = "#ef4444"; // Red
            triggerHaptic([100]); // Heavy thud

            if (currentRungIndex > 0) {
                nextDistance = LADDER_RUNGS[currentRungIndex - 1];
            }
        } else if (currentMadeCount === 0) {
            fbMsg = "Wipeout!";
            fbColor = "#7f1d1d"; // Dark Red
            triggerHaptic([200, 100, 200]); // Punishing double-thud

            nextDistance = 5;
        }

        // Trigger the inline feedback message
        setFeedback({ msg: fbMsg, color: fbColor });
        if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
        feedbackTimer.current = setTimeout(() => setFeedback(null), 2000);

        // Track highest rung for the UI
        if (nextDistance > highestUnlocked) {
            setHighestUnlocked(nextDistance);
        }

        setDistance(nextDistance);
    };

    return (
        <div className="card input-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px', position: 'relative' }}>

            {/* FULL SCREEN RULES MODAL */}
            {showIntro && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowIntro(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 5000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                        style={{
                            maxWidth: '400px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            background: 'var(--card-bg)',
                            position: 'relative',
                            borderRadius: '28px',
                            padding: '20px',
                            animation: 'fade-in-down 0.3s ease', // UPDATED: Now slides in from the top!
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* HEADER FOR CLOSE BUTTON */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '8px' }}>
                            <button
                                onClick={() => setShowIntro(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={24} color="#44474e" />
                            </button>
                        </div>

                        {/* HERO ICON */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                            <TrendingUp size={56} color="var(--primary)" />
                        </div>

                        {/* TITLE */}
                        <h2 style={{ marginBottom: '10px', textAlign: 'center', fontSize: '1.8rem', fontWeight: '900', color: 'var(--text)' }}>
                            How to Play
                        </h2>

                        {/* SUMMARY BOX */}
                        <div style={{ background: 'var(--bg)', padding: '15px', borderRadius: '12px', border: '1px dashed var(--border)', marginBottom: '25px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                3 <span style={{ fontSize: '1.2rem', color: 'var(--text)' }}>Putters</span>
                            </div>
                            <div style={{ color: 'var(--primary-dark)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                                Per Station
                            </div>
                        </div>

                        {/* RULES BREAKDOWN */}
                        <div style={{ padding: '0 10px', marginBottom: '30px' }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>

                                <li style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '1.05rem', color: 'var(--text)' }}>
                                    <div style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <ChevronUp size={24} color="var(--text)" strokeWidth={3} />
                                    </div>
                                    <span style={{ fontWeight: '800', width: '65px' }}>Make 3:</span>
                                    <span style={{ fontWeight: '700', color: '#10b981' }}>Move Back 5ft</span>
                                </li>

                                <li style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '1.05rem', color: 'var(--text)' }}>
                                    <div style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Pause size={20} color="var(--text)" strokeWidth={2} />
                                    </div>
                                    <span style={{ fontWeight: '800', width: '65px' }}>Make 2:</span>
                                    <span style={{ fontWeight: '700', color: '#f59e0b' }}>Stay Here</span>
                                </li>

                                <li style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '1.05rem', color: 'var(--text)' }}>
                                    <div style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <ChevronDown size={24} color="var(--text)" strokeWidth={3} />
                                    </div>
                                    <span style={{ fontWeight: '800', width: '65px' }}>Make 1:</span>
                                    <span style={{ fontWeight: '700', color: '#ef4444' }}>Move Up 5ft</span>
                                </li>

                                <li style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '1.05rem', color: 'var(--text)' }}>
                                    <div style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Skull size={24} color="var(--text)" strokeWidth={2.5} />
                                    </div>
                                    <span style={{ fontWeight: '800', width: '65px' }}>Make 0:</span>
                                    <span style={{ fontWeight: '700', color: '#7f1d1d' }}>Start Over</span>
                                </li>

                            </ul>
                        </div>

                        <button
                            onClick={() => setShowIntro(false)}
                            style={{
                                backgroundColor: 'var(--primary)', color: 'white', width: '100%',
                                padding: '16px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '800',
                                border: 'none', cursor: 'pointer', outline: 'none'
                            }}
                        >
                            START CLIMBING
                        </button>
                    </div>
                </div>
            )}

            {/* VICTORY OVERLAY */}
            {isGameComplete ? (
                <div style={{ width: '100%', textAlign: 'center', animation: 'fade-in-up 0.4s ease' }}>
                    <div style={{ padding: '30px 20px', backgroundColor: 'var(--league-light)', borderRadius: '16px', border: '2px solid var(--league)', color: 'var(--league-dark)', width: '100%', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            <Trophy size={48} color="#eab308" />
                        </div>
                        <div style={{ fontWeight: '900', fontSize: '1.4rem', marginBottom: '5px' }}>LADDER CONQUERED!</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', opacity: 0.8 }}>You cleared 40ft. Phenomenal putting.</div>
                    </div>
                    <button
                        type="button"
                        onClick={onFinish}
                        style={{
                            backgroundColor: '#111827', color: '#ffffff',
                            width: '100%', padding: '16px', borderRadius: '16px', fontSize: '1rem',
                            fontWeight: '800', textTransform: 'uppercase', border: 'none', outline: 'none', cursor: 'pointer'
                        }}
                    >
                        FINISH SESSION
                    </button>
                </div>
            ) : (
                <>
                    {/* VISUAL LADDER TRACKER */}
                    <div style={{ width: '100%', position: 'relative', marginBottom: '35px', marginTop: '15px' }}>

                        {/* The Track Line (Background) */}
                        <div style={{
                            position: 'absolute', top: '14px', left: '6.25%', right: '6.25%',
                            height: '4px', backgroundColor: 'var(--border)', zIndex: 1, borderRadius: '2px'
                        }} />

                        {/* The Fill Line (Progress - GREEN) */}
                        <div style={{
                            position: 'absolute', top: '14px', left: '6.25%',
                            width: `${(currentRungIndex / (LADDER_RUNGS.length - 1)) * 87.5}%`,
                            height: '4px', backgroundColor: '#10b981', zIndex: 2,
                            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '2px'
                        }} />

                        {/* The Rungs (Nodes) */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 3 }}>
                            {LADDER_RUNGS.map((rung, idx) => {
                                const isActive = distance === rung;
                                const isPassed = currentRungIndex > idx;

                                return (
                                    <div key={rung} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12.5%' }}>
                                        {/* Node Circle */}
                                        <div style={{
                                            width: isActive ? '20px' : '14px',
                                            height: isActive ? '20px' : '14px',
                                            borderRadius: '50%',
                                            backgroundColor: isActive ? '#3b82f6' : isPassed ? '#10b981' : '#ffffff',
                                            border: `3px solid ${isActive ? '#3b82f6' : isPassed ? '#10b981' : 'var(--border)'}`,
                                            marginTop: isActive ? '4px' : '7px',
                                            marginBottom: '8px',
                                            transition: 'all 0.3s ease',
                                            boxShadow: isActive ? '0 0 10px rgba(59, 130, 246, 0.4)' : 'none'
                                        }} />

                                        {/* Distance Label */}
                                        <span style={{
                                            fontSize: '0.65rem',
                                            fontWeight: isActive ? '900' : '700',
                                            color: isActive ? '#3b82f6' : isPassed ? '#10b981' : 'var(--text-muted)'
                                        }}>
                                            {rung}'
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* HEADER SECTION */}
                    <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>

                        <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--primary)', lineHeight: '1' }}>
                            {distance}<span style={{ fontSize: '1.2rem', marginLeft: '6px', opacity: 0.6 }}>FT</span>
                        </div>

                        {/* INLINE FEEDBACK MESSAGE */}
                        <div style={{ marginTop: '8px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {feedback && (
                                <span style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '800',
                                    color: feedback.color,
                                    animation: 'fade-in-up 0.2s ease'
                                }}>
                                    {feedback.msg}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* DYNAMIC SCORING INPUT (3 PUTTERS ONLY) */}
                    {isPro ? (
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', width: '100%', justifyContent: 'center' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '30px', marginTop: '10px' }}>
                            <button
                                onClick={() => handleSimpleAdjust(-1)}
                                style={{
                                    width: '70px', height: '70px', flexShrink: 0, padding: 0,
                                    borderRadius: '16px', border: 'none', background: '#fee2e2', color: '#dc2626',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    opacity: simpleMade === 0 ? 0.4 : 1, outline: 'none', transition: 'all 0.1s'
                                }}
                                disabled={simpleMade === 0}
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                            <div style={{ fontSize: '4.5rem', fontWeight: '900', width: '80px', textAlign: 'center', color: 'var(--text)' }}>
                                {simpleMade}
                            </div>
                            <button
                                onClick={() => handleSimpleAdjust(1)}
                                style={{
                                    width: '70px', height: '70px', flexShrink: 0, padding: 0,
                                    borderRadius: '16px', border: 'none', background: '#dcfce7', color: '#16a34a',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    opacity: simpleMade === 3 ? 0.4 : 1, outline: 'none', transition: 'all 0.1s'
                                }}
                                disabled={simpleMade === 3}
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        </div>
                    )}

                    {/* ACTION BUTTONS GRID */}
                    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: roundCount > 0 ? '1fr 1fr' : '1fr', gap: '10px' }}>
                        <button
                            type="button"
                            className="save-btn"
                            onClick={handleLogClick}
                            style={{ width: '100%', padding: '16px', fontSize: '1rem', outline: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            LOG ROUND
                        </button>

                        {roundCount > 0 && (
                            <button
                                type="button"
                                onClick={onFinish}
                                style={{ backgroundColor: '#111827', color: '#ffffff', padding: '16px', borderRadius: '16px', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', width: '100%', border: 'none', outline: 'none', cursor: 'pointer' }}
                            >
                                FINISH
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* INLINE ANIMATION STYLES */}
            <style>
                {`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
        </div>
    );
}