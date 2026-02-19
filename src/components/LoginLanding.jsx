import React from 'react';
import logoIcon from '../assets/Dialed.svg';

export default function LoginLanding({ onLogin }) {
    return (
        <div className="login-container" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: '#f9fafb'
        }}>
            <div className="login-content" style={{
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>

                {/* BIG HERO LOGO */}
                <div className="login-logo-wrapper" style={{ marginBottom: '30px', width: '100%' }}>
                    <img src={logoIcon} alt="DIALED" style={{ width: '100%', height: 'auto', maxWidth: '320px' }} />
                </div>

                {/* HYPE TEXT */}
                <h1 className="login-title" style={{
                    fontSize: '2.2rem',
                    fontWeight: '900',
                    color: '#ea580c',
                    marginBottom: '15px',
                    lineHeight: '1.1'
                }}>
                    Dial In Your Game.
                </h1>

                <p className="login-subtitle" style={{
                    fontSize: '1rem',
                    color: '#4b5563',
                    marginBottom: '30px',
                    lineHeight: '1.5'
                }}>
                    Track your putting stats, compete in leagues, and visualize your progress over time.
                </p>

                {/* MAIN ACTION BUTTON */}
                <button
                    className="google-signin-btn"
                    onClick={onLogin}
                    style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#111827',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" style={{ width: '20px' }} />
                    Sign In with Google
                </button>

                {/* PRIVACY NOTE */}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '20px', lineHeight: '1.4' }}>
                    We only use your email to save your stats. <br /> No spam. No emails. Ever.
                </p>


            </div>
        </div>
    );
}