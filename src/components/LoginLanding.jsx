import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import logoIcon from '../assets/Dialed.svg';

export default function LoginLanding({ onLogin }) {
    const [tapCount, setTapCount] = useState(0);
    const [showSecretAuth, setShowSecretAuth] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSecretTrigger = () => {
        const newCount = tapCount + 1;
        setTapCount(newCount);
        // Toggle the secret form after 5 taps on the title
        if (newCount === 5) {
            setShowSecretAuth(true);
        }
    };

    const handleSecretLogin = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // App will automatically redirect via your main Auth listener
        } catch (err) {
            setError('Invalid credentials.');
            console.error(err.message);
        }
    };

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

                {/* HYPE TEXT - Secret Trigger attached here */}
                <h1
                    className="login-title"
                    onClick={handleSecretTrigger}
                    style={{
                        fontSize: '2.2rem',
                        fontWeight: '900',
                        color: '#ea580c',
                        marginBottom: '15px',
                        lineHeight: '1.1',
                        cursor: 'default',
                        userSelect: 'none' // Prevents text selection while tapping
                    }}
                >
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

                {!showSecretAuth ? (
                    /* MAIN ACTION BUTTON */
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
                ) : (
                    /* SECRET TESTER LOGIN FORM */
                    <form onSubmit={handleSecretLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            type="email"
                            placeholder="Test Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                            required
                        />
                        {error && <p style={{ color: 'red', fontSize: '0.8rem', margin: 0 }}>{error}</p>}
                        <button
                            type="submit"
                            style={{
                                padding: '14px',
                                backgroundColor: '#111827',
                                color: 'white',
                                borderRadius: '12px',
                                fontWeight: '700',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Tester Login
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowSecretAuth(false)}
                            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </form>
                )}

                {/* PRIVACY NOTE */}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '20px', lineHeight: '1.4' }}>
                    We only use your email to save your stats. <br /> No spam. No emails. Ever.
                </p>
            </div>
        </div>
    );
}