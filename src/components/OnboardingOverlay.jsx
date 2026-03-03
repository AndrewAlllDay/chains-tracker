import React from 'react';

export default function OnboardingOverlay({ isLeagueMode, onDismiss }) {
    return (
        <div
            className="onboarding-overlay"
            onClick={onDismiss}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 5000,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none'
            }}
        >
            <div
                className="coach-content-wrapper"
                style={{
                    /* HAPPY MEDIUM: Nudged to 100px to balance the header and the buttons */
                    top: '100px',
                    padding: '0 30px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pointerEvents: 'auto'
                }}
            >
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '900',
                    marginBottom: '8px',
                    lineHeight: '1.2',
                    textAlign: 'center'
                }}>
                    Welcome to Putting Practice!
                </h2>
                <p style={{
                    fontSize: '1.1rem',
                    opacity: 0.9,
                    lineHeight: '1.5',
                    margin: 0,
                    textAlign: 'center'
                }}>
                    {isLeagueMode
                        ? "Select a mode below to start your official league night or solo practice session."
                        : "Start your first practice session below to begin tracking your stats and trends."}
                </p>

            </div>
        </div>
    );
}