import React from 'react';

export default function OnboardingOverlay({ isLeagueMode, onDismiss }) {
    return (
        <div className="onboarding-overlay" onClick={onDismiss}>
            <div className="coach-content-wrapper">
                <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '10px' }}>
                    {isLeagueMode ? "Welcome to Putting Practice!" : "Welcome to Putting Practice?"}
                </h2>
                <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: '1.6' }}>
                    {isLeagueMode
                        ? "Select a mode below to start your official league night or solo practice session."
                        : "Start your first practice session below to begin tracking your stats and trends."}
                </p>
            </div>
        </div>
    );
}