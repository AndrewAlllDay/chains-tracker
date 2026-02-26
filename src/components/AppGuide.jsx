import React from 'react';
import {
    Trophy,
    Target,
    Globe,
    Flame,
    Sparkles,
    ListChecks
} from 'lucide-react';
import './AppGuide.css';

const AppGuide = ({ isOpen, onClose, userRole }) => {
    if (!isOpen) return null;

    const sections = [
        {
            title: "League Scoring",
            // UPDATED: Green outline to match League button
            icon: <Trophy size={18} color="var(--league)" strokeWidth={2.5} />,
            color: "var(--league)",
            role: "league",
            content: "League sessions use a weighted system (1-5 pts). Station 1-3 is Circle 1; Station 4-5 is Circle 2. Every make adds points based on the station value."
        },
        {
            title: "Standard Practice",
            // UPDATED: Black outline to match Practice button
            icon: <Target size={18} color="#000000" strokeWidth={2.5} />,
            color: "var(--primary)",
            role: "any",
            content: "The fundamental way to train. Log 5 putts per round at any distance to track your accuracy and build consistency over time."
        },
        {
            title: "Around the World",
            icon: <Globe size={18} color="#3b82f6" strokeWidth={2.5} />,
            color: "#3b82f6",
            role: "any",
            content: "A dynamic practice mode. Perform well to advance further; struggle and you'll be pushed back. Clear the 33ft station to unlock 'The Challenge'."
        },
        {
            title: "Practice Streaks",
            icon: <Flame size={18} color="#f97316" fill="#f97316" />,
            color: "#f59e0b",
            role: "any",
            content: "Build a habit. Streaks ignite after 2 consecutive days of any practice mode. Keep the flame alive by logging at least one session every 24 hours."
        },
        {
            title: "Perfect Rounds",
            icon: <Sparkles size={18} color="#eab308" fill="#eab308" />,
            color: "var(--primary-dark)",
            role: "any",
            content: "Any practice distance where you go 5-for-5 is marked as a Perfect Round in your history (excluding the 10ft buy-in for World mode)."
        },
        {
            title: "Round Sequence Dots",
            icon: <ListChecks size={18} color="#6b7280" strokeWidth={2.5} />,
            color: "#6b7280",
            role: "any",
            content: (
                <div className="guide-seq-explainer">
                    <div style={{ marginBottom: '12px' }}>In your standard practice history, colored dots represent your round-by-round accuracy:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px', paddingLeft: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--league)', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.9rem' }}><strong>Perfect Round</strong> (100%)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fed7aa', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.9rem' }}><strong>Good Round</strong> (50%+)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid #d1d5db', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.9rem' }}><strong>Standard</strong> (&lt; 50%)</span>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>
                        Tap the dots in your activity list to reveal the exact stats for each round!
                    </div>
                </div>
            )
        }
    ];

    const visibleSections = sections.filter(s => s.role === 'any' || s.role === userRole);

    return (
        <div style={{ position: 'relative' }}>
            <button className="modal-close-btn" onClick={onClose} style={{ zIndex: 2100 }}>✕</button>

            <div
                className="modal-overlay"
                onClick={onClose}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 2000, position: 'fixed', inset: 0 }}
            >
                <div
                    className="modal-content"
                    onClick={e => e.stopPropagation()}
                    style={{
                        maxWidth: '450px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        textAlign: 'left',
                        background: 'var(--card-bg)',
                        margin: '25px auto',
                        padding: '20px',
                        borderRadius: '12px',
                        position: 'relative'
                    }}
                >
                    <div className="guide-header">
                        <h2 className="modal-title-h2">Guide</h2>
                    </div>

                    <div className="guide-about">
                        <h3>About DIALED</h3>
                        <p>
                            DIALED is a performance tracking tool designed to help disc golfers build consistency on the putting green.
                        </p>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <h3 className="modal-section-title">Getting Started</h3>

                        <div className="guide-started-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {userRole === 'league' && (
                                <div className="guide-instruction-block" style={{ marginBottom: '25px', width: '100%', textAlign: 'center' }}>
                                    <p className="guide-instruction-text" style={{ textAlign: 'left' }}>
                                        Click on <strong>Start League</strong> to begin your formal weighted scoring.
                                    </p>
                                    <div className="guide-role-badge league" style={{ width: '65%', margin: '0 auto', justifyContent: 'center', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Trophy size={16} color="currentColor" strokeWidth={2.5} />
                                        <strong style={{ fontSize: '0.7rem' }}>League</strong>
                                    </div>
                                </div>
                            )}

                            <div className="guide-instruction-block" style={{ width: '100%', textAlign: 'center' }}>
                                <p className="guide-instruction-text" style={{ textAlign: 'left' }}>
                                    Click on <strong>Start Practice</strong> to choose your session type:
                                </p>

                                <div style={{ width: '65%', margin: '0 auto', boxSizing: 'border-box' }}>
                                    <div className="guide-role-badge practice" style={{ width: '100%', justifyContent: 'center', marginBottom: '8px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Target size={16} color="currentColor" strokeWidth={2.5} />
                                        <strong style={{ fontSize: '0.7rem' }}>Practice</strong>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '15px' }}>
                                        <div className="guide-role-badge" style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)', flex: '1 1 0%', justifyContent: 'center', padding: '10px 0px', boxSizing: 'border-box' }}>
                                            <strong style={{ fontSize: '0.65rem' }}>Standard</strong>
                                        </div>
                                        <div className="guide-role-badge" style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)', flex: '1 1 0%', justifyContent: 'center', padding: '10px 0px', boxSizing: 'border-box' }}>
                                            <strong style={{ fontSize: '0.65rem' }}>World</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="guide-instruction-text" style={{ textAlign: 'left', marginTop: '10px' }}>
                                    <p style={{ marginBottom: '4px' }}><strong>Standard:</strong> Focused reps at a fixed distance.</p>
                                    <p><strong>World:</strong> A progressive distance-based challenge.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="modal-section-title">Core Features</h3>
                    {visibleSections.map((s, i) => (
                        <div key={i} className="feature-card" style={{ marginBottom: '15px' }}>
                            <div className="feature-card-indicator" style={{ background: s.color }} />
                            <div className="feature-card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                {s.icon}
                                <h4 style={{ margin: 0 }}>{s.title}</h4>
                            </div>
                            <div style={{ lineHeight: '1.5', color: '#4b5563', fontSize: '0.95rem' }}>
                                {s.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AppGuide;