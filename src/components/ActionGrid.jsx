import React from 'react';
import { Trophy, Target } from 'lucide-react';

export default function ActionGrid({ isLeagueMode, userRole, showOnboarding, onStartSession }) {
    const gridStyle = isLeagueMode
        ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', marginBottom: '20px' }
        : { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '20px' };

    return (
        <div
            className={`dashboard-action-grid ${showOnboarding ? 'onboarding-active' : ''}`}
            style={{
                ...gridStyle,
                position: showOnboarding ? 'relative' : 'static',
                zIndex: showOnboarding ? 3100 : 'auto',
                pointerEvents: 'auto'
            }}
        >
            {isLeagueMode && (
                <button
                    className="action-card league action-btn-league"
                    onClick={() => onStartSession('LEAGUE')}
                    style={{
                        width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '12px'
                    }}
                >
                    <Trophy size={24} color="#ffffff" strokeWidth={2} />
                    <div className="action-btn-text" style={{ textAlign: 'left' }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>Start League</strong>
                        <div className="action-btn-sub" style={{ fontSize: '0.7rem', opacity: 0.9 }}>League Night</div>
                    </div>
                </button>
            )}

            <button
                className="action-card secondary action-btn-practice"
                onClick={() => onStartSession('PRACTICE')}
                style={{
                    width: userRole === 'practice' ? '65%' : '100%',
                    minWidth: userRole === 'practice' ? '220px' : '0',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '12px'
                }}
            >
                <Target size={24} color="#000000" strokeWidth={2} />
                <div className="action-btn-text" style={{ textAlign: 'left' }}>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Start Practice</strong>
                    <div className="action-btn-sub" style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                        {isLeagueMode ? 'On Your Own' : 'Free Play'}
                    </div>
                </div>
            </button>
        </div>
    );
}