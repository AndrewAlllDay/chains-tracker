import React from 'react';
import './AppGuide.css';

const AppGuide = ({ isOpen, onClose, userRole }) => {
    if (!isOpen) return null;

    const sections = [
        {
            title: "League Scoring",
            icon: "🏆",
            color: "var(--league)",
            role: "league",
            content: "League sessions use a weighted system (1-5 pts). Station 1-3 is Circle 1; Station 4-5 is Circle 2. Every make adds points based on the station value."
        },
        {
            title: "Standard Practice",
            icon: "🎯",
            color: "var(--primary)",
            role: "any",
            content: "The fundamental way to train. Log 5 putts per round at any distance to track your accuracy and build consistency over time."
        },
        {
            title: "Around the World",
            icon: "🌍",
            color: "#3b82f6",
            role: "any",
            content: "A dynamic practice mode. Perform well to advance further; struggle and you'll be pushed back. Clear the 33ft station to unlock 'The Challenge'."
        },
        {
            title: "Practice Streaks",
            icon: "🔥",
            color: "#f59e0b",
            role: "any",
            content: "Build a habit. Streaks ignite after 2 consecutive days of any practice mode. Keep the flame alive by logging at least one session every 24 hours."
        },
        {
            title: "Perfect Rounds",
            icon: "✨",
            color: "var(--primary-dark)",
            role: "any",
            content: "Any practice distance where you go 5-for-5 is marked as a Perfect Round in your history (excluding the 10ft buy-in for World mode)."
        }
    ];

    const visibleSections = sections.filter(s => s.role === 'any' || s.role === userRole);

    return (
        <>
            <button className="modal-close-btn" onClick={onClose}>✕</button>

            <div
                className="modal-overlay"
                onClick={onClose}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 2000 }}
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
                        marginTop: '25px',
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
                            {/* LEAGUE SECTION */}
                            {userRole === 'league' && (
                                <div className="guide-instruction-block" style={{ marginBottom: '25px', width: '100%', textAlign: 'center' }}>
                                    <p className="guide-instruction-text" style={{ textAlign: 'left' }}>
                                        Click on <strong>Start League</strong> to begin your formal weighted scoring.
                                    </p>
                                    <div className="guide-role-badge league" style={{ width: '65%', margin: '0 auto', justifyContent: 'center', boxSizing: 'border-box' }}>
                                        <span style={{ fontSize: '1rem' }}>🏆</span>
                                        <strong style={{ fontSize: '0.7rem' }}>League</strong>
                                    </div>
                                </div>
                            )}

                            {/* PRACTICE SECTION */}
                            <div className="guide-instruction-block" style={{ width: '100%', textAlign: 'center' }}>
                                <p className="guide-instruction-text" style={{ textAlign: 'left' }}>
                                    Click on <strong>Practice</strong> to choose your session type:
                                </p>

                                <div style={{ width: '65%', margin: '0 auto', boxSizing: 'border-box' }}>
                                    <div className="guide-role-badge practice" style={{ width: '100%', justifyContent: 'center', marginBottom: '8px', boxSizing: 'border-box' }}>
                                        <span style={{ fontSize: '1rem' }}>🎯</span>
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

                                {/* Mode Descriptions using the correct class for full-width matching */}
                                <div className="guide-instruction-text" style={{ textAlign: 'left', marginTop: '10px' }}>
                                    <p style={{ marginBottom: '4px' }}><strong>Standard:</strong> Focused reps at a fixed distance.</p>
                                    <p><strong>World:</strong> A progressive distance-based challenge.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="modal-section-title">Core Features</h3>
                    {visibleSections.map((s, i) => (
                        <div key={i} className="feature-card">
                            <div className="feature-card-indicator" style={{ background: s.color }} />
                            <div className="feature-card-header">
                                <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                                <h4>{s.title}</h4>
                            </div>
                            <p>{s.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default AppGuide;