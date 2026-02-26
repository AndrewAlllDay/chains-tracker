import React, { useState } from 'react';
import {
    Trophy,
    Target,
    Globe,
    Flame,
    Sparkles,
    ListChecks,
    X,
    ChevronDown
} from 'lucide-react';
import './AppGuide.css';

const AppGuide = ({ isOpen, onClose, userRole }) => {
    const [expandedIndex, setExpandedIndex] = useState(null);

    if (!isOpen) return null;

    const practiceModes = [
        {
            title: "League Scoring",
            icon: <Trophy size={18} color="var(--league)" strokeWidth={2.5} />,
            color: "var(--league)",
            role: "league",
            content: "League sessions use a weighted system (1-5 pts). Station 1-3 is Circle 1; Station 4-5 is Circle 2. Every make adds points based on the station value."
        },
        {
            title: "Standard Practice",
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
        }
    ];

    const coreFeatures = [
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
                </div>
            )
        }
    ];

    const toggleAccordion = (id) => {
        setExpandedIndex(expandedIndex === id ? null : id);
    };

    const renderAccordionSection = (data, prefix) => {
        return data
            .filter(s => s.role === 'any' || s.role === userRole)
            .map((s, i) => {
                const id = `${prefix}-${i}`;
                const isExpanded = expandedIndex === id;
                return (
                    <div key={id} className={`accordion-item ${isExpanded ? 'active' : ''}`}>
                        <div className="accordion-indicator" style={{ background: s.color }} />
                        <button className="accordion-header" onClick={() => toggleAccordion(id)}>
                            <div className="accordion-header-left">
                                {s.icon}
                                <span>{s.title}</span>
                            </div>
                            <ChevronDown size={20} className={`chevron-icon ${isExpanded ? 'rotated' : ''}`} />
                        </button>
                        <div className={`accordion-content ${isExpanded ? 'show' : ''}`}>
                            <div className="accordion-content-inner">
                                {s.content}
                            </div>
                        </div>
                    </div>
                );
            });
    };

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 2000, position: 'fixed', inset: 0 }}
        >
            <div
                className="modal-content guide-modal-content"
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '450px',
                    width: '90%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    textAlign: 'left',
                    background: 'var(--card-bg)',
                    margin: '25px auto',
                    position: 'relative'
                }}
            >
                <div className="guide-header">
                    <h2 className="modal-title-h2">DIALED Guide</h2>
                    <button className="guide-close-btn" onClick={onClose}>
                        <X size={24} color="#44474e" />
                    </button>
                </div>

                <div className="guide-about">
                    <p>
                        DIALED is a performance tracking tool designed to help disc golfers build consistency on the putting green.
                    </p>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <h3 className="modal-section-title">Getting Started</h3>
                    <div className="guide-started-box">
                        {userRole === 'league' && (
                            <div className="guide-instruction-block">
                                <p className="guide-instruction-text">
                                    Click on <strong>Start League</strong> to begin your formal weighted scoring.
                                </p>
                                <div className="guide-badge-container">
                                    <div className="guide-role-badge league">
                                        <Trophy size={16} color="currentColor" strokeWidth={2.5} />
                                        <strong style={{ fontSize: '1rem' }}>League</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="guide-instruction-block">
                            <p className="guide-instruction-text">
                                Click on <strong>Start Practice</strong> to choose your session type:
                            </p>
                            <div className="guide-badge-container">
                                <div className="guide-role-badge practice">
                                    <Target size={16} color="currentColor" strokeWidth={2.5} />
                                    <strong style={{ fontSize: '1rem' }}>Practice</strong>
                                </div>
                                <div className="guide-sub-badge-row">
                                    <div className="guide-sub-badge">Standard</div>
                                    <div className="guide-sub-badge">World</div>
                                </div>
                            </div>
                            <div className="guide-instruction-text" style={{ marginTop: '16px' }}>
                                <p style={{ marginBottom: '4px' }}><strong>Standard:</strong> Focused reps at a fixed distance.</p>
                                <p><strong>World:</strong> A progressive distance-based challenge.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <h3 className="modal-section-title">Practice Modes</h3>
                <div className="accordion-container" style={{ marginBottom: '25px' }}>
                    {renderAccordionSection(practiceModes, 'practice')}
                </div>

                <h3 className="modal-section-title">Core Features</h3>
                <div className="accordion-container">
                    {renderAccordionSection(coreFeatures, 'core')}
                </div>
            </div>
        </div>
    );
};

export default AppGuide;