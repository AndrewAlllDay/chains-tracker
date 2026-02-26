import React from 'react';

export default function WhatsNewModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
            <div className="modal-content" style={{ textAlign: 'center', maxWidth: '400px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚡</div>
                <h2 style={{ marginBottom: '10px', fontWeight: '900' }}>Pro Scoring <br /> Unlocked!</h2>

                <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '20px' }}>
                    Take your practice to the next level with <strong>Pro Scoring Mode</strong>—a completely redesigned way to track your sessions.
                </p>

                <ul style={{ textAlign: 'left', fontSize: '0.9rem', marginBottom: '25px', color: '#4b5563', listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                        <span>🎯</span>
                        <span><strong>Vertical Logging:</strong> Track every putt in sequence with massive, thumb-friendly hit areas.</span>
                    </li>
                    <li style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                        <span>❄️</span>
                        <span><strong>Cold Start Focus:</strong> Dedicated visual tracking for that crucial first putt of every station.</span>
                    </li>
                    <li style={{ display: 'flex', gap: '8px' }}>
                        <span>⚙️</span>
                        <span><strong>Customizable:</strong> Toggle between Pro and Simple scoring in your new Dashboard Settings.</span>
                    </li>
                </ul>

                <button
                    className="save-btn"
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: 'none',
                        outline: 'none',
                        fontSize: '1.1rem'
                    }}
                >
                    Let's Go!
                </button>
            </div>
        </div>
    );
}