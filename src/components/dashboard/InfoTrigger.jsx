import React, { useState } from 'react';

const InfoTrigger = ({ title, content }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                style={{
                    background: '#f1f5f9', border: 'none', color: '#94a3b8',
                    cursor: 'pointer', fontSize: '0.75rem', marginLeft: '8px',
                    width: '18px', height: '18px', borderRadius: '50%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', verticalAlign: 'middle'
                }}
            >
                i
            </button>

            {isOpen && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)} style={{ zIndex: 3000 }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '300px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔥</div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '10px', color: '#111827' }}>{title}</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: '0 0 20px 0' }}>{content}</p>
                        <button onClick={() => setIsOpen(false)} className="save-btn" style={{ width: '100%', border: 'none' }}>
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default InfoTrigger;