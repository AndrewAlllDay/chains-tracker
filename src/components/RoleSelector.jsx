import React from 'react';
import { Target, Trophy, Info } from 'lucide-react';

export default function RoleSelector({ onSelect }) {
    return (
        <div className="selector-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh'
        }}>
            <div className="login-content" style={{ maxWidth: '400px', width: '100%' }}>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 className="login-title" style={{ fontSize: '1.8rem', margin: '0 0 10px 0' }}>Tailor Your Experience</h1>
                    <p className="login-subtitle" style={{ margin: 0 }}>How do you plan to use DIALED?</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    {/* PERSONAL GRINDER */}
                    <button
                        className="action-card secondary"
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '20px',
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                        }}
                        onClick={() => onSelect('practice')}
                    >
                        <Target size={32} color="#000000" strokeWidth={2.5} />
                        <div>
                            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#111827' }}>Personal Grinder</strong>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>Solo practice and streaks.</div>
                        </div>
                    </button>

                    {/* LEAGUE PLAYER */}
                    <button
                        className="action-card league"
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            backgroundColor: 'var(--league-green, #10b981)',
                            border: 'none',
                            borderRadius: '16px',
                            position: 'relative'
                        }}
                        onClick={() => onSelect('league')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Trophy size={32} color="#fff" strokeWidth={2.5} />
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <strong style={{ fontSize: '1.1rem', color: '#fff' }}>League Player</strong>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        background: 'rgba(255,255,255,0.2)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        fontWeight: '800',
                                        textTransform: 'uppercase'
                                    }}>Full Access</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#fff', opacity: 0.9, marginTop: '4px' }}>
                                    Official league scoring + solo practice modes.
                                </div>
                            </div>
                        </div>

                        {/* LEAGUE EXPLAINER BOX */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'start',
                            gap: '8px',
                            padding: '10px',
                            backgroundColor: 'rgba(0, 0, 0, 0.15)',
                            borderRadius: '8px'
                        }}>
                            <Info size={14} color="#fff" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <p style={{ fontSize: '0.72rem', color: '#fff', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>
                                <strong>Note:</strong> League mode is currently configured for the putting league at <strong>Johnson United Methodist Church</strong>.
                            </p>
                        </div>
                    </button>
                </div>

                <p style={{
                    textAlign: 'center',
                    marginTop: '30px',
                    fontSize: '0.8rem',
                    color: '#9ca3af',
                    fontWeight: '500'
                }}>
                    Don't worry, you can always change this later in your settings.
                </p>
            </div>
        </div>
    );
}