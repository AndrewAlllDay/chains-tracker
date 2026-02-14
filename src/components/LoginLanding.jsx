import React from 'react';
import logoIcon from '../assets/Dialed.svg';

export default function LoginLanding({ onLogin }) {
    return (
        <div className="login-container">
            <div className="login-content">

                {/* BIG HERO LOGO */}
                <div className="login-logo-wrapper">
                    <img src={logoIcon} alt="DIALED" />
                </div>

                {/* HYPE TEXT */}
                <h1 className="login-title">Dial In Your Game.</h1>
                <p className="login-subtitle">
                    Track your putting stats, compete in leagues, and visualize your progress over time.
                </p>

                {/* MAIN ACTION BUTTON */}
                <button className="google-signin-btn" onClick={onLogin}>

                    Sign In with Google
                </button>

                {/* PRIVACY NOTE */}
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '15px', maxWidth: '300px', marginInline: 'auto' }}>
                    We only use your email to save your stats. <br /> No spam. No emails. Ever.
                </p>

                <p className="login-footer">
                    Simple. Fast. Professional.
                </p>


            </div>
        </div>
    );
}