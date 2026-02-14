import React from 'react';

export default function RoleSelector({ onSelect }) {
    return (
        <div className="selector-container" style={{
            opacity: 0, // Start invisible so it doesn't "snap" in before the delay
            animation: 'fadeIn 0.8s ease-out 0.3s forwards', // 0.3s delay added
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh'
        }}>
            <div className="login-content" style={{ maxWidth: '400px', width: '100%' }}>

                {/* TEXT HEADER - Centered */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 className="login-title" style={{ fontSize: '1.8rem', margin: '0 0 10px 0' }}>Tailor Your Experience</h1>
                    <p className="login-subtitle" style={{ margin: 0 }}>How do you plan to use DIALED?</p>
                </div>

                {/* ROLE OPTIONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button
                        className="action-card secondary"
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '20px',
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            cursor: 'pointer'
                        }}
                        onClick={() => onSelect('practice')}
                    >
                        <span style={{ fontSize: '1.8rem' }}>🎯</span>
                        <div>
                            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#111827' }}>Personal Grinder</strong>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>Solo practice and streaks.</div>
                        </div>
                    </button>

                    <button
                        className="action-card primary"
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '20px',
                            cursor: 'pointer'
                        }}
                        onClick={() => onSelect('league')}
                    >
                        <span style={{ fontSize: '1.8rem' }}>🏆</span>
                        <div>
                            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#fff' }}>League Player</strong>
                            <div style={{ fontSize: '0.85rem', color: '#fff', opacity: 0.9, marginTop: '4px' }}>Johnson Putting League Scoring</div>
                        </div>
                    </button>
                </div>


            </div>
        </div>
    );
}