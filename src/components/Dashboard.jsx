import React, { useState } from 'react';
import { Trophy, Target, Flame, Zap, Snowflake } from 'lucide-react';
import StreakModal from "./StreakModal";
import SettingsModal from "./SettingsModal";
import ActivityList from './ActivityList';
import Trends from './Trends';
import { useStreak } from '../hooks/useStreak';
import './Dashboard.css';

export default function Dashboard({
    user,
    userRole,
    history,
    startSingleSession,
    startLeagueSession,
    deleteHistorySession,
    onManualMerge,
    handleLogout,
    userSettings,
    updateSettings,
    showSettings,
    setShowSettings,
    handleRoleSelect
}) {
    const [expandedSession, setExpandedSession] = useState(null);
    const [showStats, setShowStats] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [localDismiss, setLocalDismiss] = useState(false);

    const toggleSession = (id) => setExpandedSession(expandedSession === id ? null : id);
    const { streak, streakMilestone } = useStreak(history);

    const safeHistory = Array.isArray(history) ? history : [];
    const hasHistoryData = safeHistory.length > 0;
    const isDataLoaded = user && userSettings && history !== undefined;

    const showOnboarding = isDataLoaded && userSettings?.hasCompletedOnboarding === false && !localDismiss;

    const handleStartSession = (type) => {
        if (showOnboarding) {
            setLocalDismiss(true);
            if (updateSettings) updateSettings({ ...userSettings, hasCompletedOnboarding: true });
            return;
        }
        if (type === 'LEAGUE') startLeagueSession();
        else startSingleSession();
    };

    const filteredHistory = safeHistory.filter(session => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'LEAGUE') return session.type === 'LEAGUE';
        if (activeFilter === 'WORLD') return session.subType === 'WORLD';
        if (activeFilter === 'PRACTICE') return session.type === 'PRACTICE' && session.subType !== 'WORLD';
        return true;
    });

    const displayedHistory = showAllHistory ? filteredHistory : filteredHistory.slice(0, 5);

    const isProMode = userSettings?.scoringStyle === 'PRO';
    const isLeagueMode = userRole === 'league';

    if (!isDataLoaded) return <div className="dashboard-loading">Loading Dashboard...</div>;

    return (
        <div className="dashboard container" style={{ position: 'relative', minHeight: '100vh' }}>

            {showOnboarding && (
                <div className="onboarding-overlay" onClick={() => handleStartSession('DISMISS')}>
                    <div className="coach-content-wrapper">
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '10px' }}>
                            {isLeagueMode ? "Welcome to Putting Practice!" : "Welcome to Putting Practice?"}
                        </h2>
                        <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: '1.6' }}>
                            {isLeagueMode
                                ? "Select a mode below to start your official league night or solo practice session."
                                : "Start your first practice session below to begin tracking your stats and trends."}
                        </p>
                        {/* Pointer removed - the pulse handles the focus now */}
                    </div>
                </div>
            )}

            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontWeight: '900' }}>Welcome, {user ? user.displayName.split(' ')[0] : 'Golfer'}</h2>
                    <div
                        className={`streak-pill ${streak > 0 ? 'active' : 'inactive'}`}
                        onClick={() => setShowStreakModal(true)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        {/* UPDATED: removed margin-top: 5px */}
                        <span className="streak-pill-icon" style={{ display: 'flex' }}>
                            {streak > 0 ? (
                                <Flame size={16} color="#f97316" fill="#f97316" />
                            ) : (
                                streakMilestone?.title === 'Day One' ? <Zap size={16} color="#eab308" fill="#eab308" /> : <Snowflake size={16} color="#3b82f6" />
                            )}
                        </span>
                        <span className="streak-pill-val" style={{ fontWeight: '800', paddingTop: '2px' }}>{streak}</span>
                    </div>
                </div>
            </header>

            <div className="streak-milestone-banner" style={{ width: '100%', marginBottom: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic', fontWeight: '500' }}>
                    {streakMilestone?.msg}
                </p>
            </div>

            {/* UPDATE THIS SECTION IN Dashboard.jsx */}
            <div
                /* ADD THIS DYNAMIC CLASS NAME HERE */
                className={`dashboard-action-grid ${showOnboarding ? 'onboarding-active' : ''}`}
                style={{
                    ...(isLeagueMode
                        ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', marginBottom: '20px' }
                        : { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '20px' }
                    ),
                    position: showOnboarding ? 'relative' : 'static',
                    zIndex: showOnboarding ? 3100 : 'auto',
                    /* CHANGE THIS TO 'auto' so clicks work through the overlay holes */
                    pointerEvents: 'auto'
                }}
            >
                {isLeagueMode && (
                    <button className="action-card league action-btn-league" onClick={() => handleStartSession('LEAGUE')} style={{
                        width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '12px'
                    }}>
                        <Trophy size={24} color="#ffffff" strokeWidth={2} />
                        <div className="action-btn-text" style={{ textAlign: 'left' }}>
                            <strong style={{ display: 'block', fontSize: '0.9rem' }}>Start League</strong>
                            <div className="action-btn-sub" style={{ fontSize: '0.7rem', opacity: 0.9 }}>League Night</div>
                        </div>
                    </button>
                )}

                <button className="action-card secondary action-btn-practice" onClick={() => handleStartSession('PRACTICE')}
                    style={{
                        width: userRole === 'practice' ? '65%' : '100%',
                        minWidth: userRole === 'practice' ? '220px' : '0',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '12px'
                    }}>
                    <Target size={24} color="#000000" strokeWidth={2} />
                    <div className="action-btn-text" style={{ textAlign: 'left' }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>Start Practice</strong>
                        <div className="action-btn-sub" style={{ fontSize: '0.7rem', opacity: 0.9 }}>{isLeagueMode ? 'On Your Own' : 'Free Play'}</div>
                    </div>
                </button>
            </div>

            {hasHistoryData && (
                <>
                    <div className="trends-toggle-container" style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '20px' }}>
                        <button className="trends-toggle-btn" onClick={() => setShowStats(!showStats)}>
                            {showStats ? 'Hide Trends ▲' : 'View Trends ▼'}
                        </button>
                    </div>
                    {showStats && <Trends history={history} userRole={userRole} />}

                    <h3 className="section-title">Recent Activity</h3>

                    <div className="activity-filters" style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '15px', paddingBottom: '5px', scrollbarWidth: 'none' }}>
                        {['ALL', 'PRACTICE', 'WORLD', 'LEAGUE'].map(f => (
                            <button
                                key={f}
                                onClick={() => { setActiveFilter(f); setShowAllHistory(false); }}
                                style={{
                                    padding: '6px 14px', borderRadius: '20px', border: 'none',
                                    background: activeFilter === f ? 'var(--primary, #3b82f6)' : '#f3f4f6',
                                    color: activeFilter === f ? '#ffffff' : '#6b7280',
                                    fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap'
                                }}
                            >
                                {f === 'WORLD' ? 'AROUND THE WORLD' : f}
                            </button>
                        ))}
                    </div>

                    <ActivityList
                        displayedHistory={displayedHistory}
                        expandedSession={expandedSession}
                        toggleSession={toggleSession}
                        deleteHistorySession={deleteHistorySession}
                        onManualMerge={onManualMerge}
                    />

                    {/* UPDATED: 65% width, centered, no border */}
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {filteredHistory.length > 5 && (
                            <button
                                className="secondary-btn"
                                onClick={() => setShowAllHistory(!showAllHistory)}
                                style={{
                                    width: '65%',
                                    marginTop: '15px',
                                    padding: '15px',
                                    background: '#f3f4f6',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#6b7280',
                                    fontWeight: '800',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {showAllHistory ? 'Collapse History ▲' : `View All History (${filteredHistory.length}) ▼`}
                            </button>
                        )}
                    </div>
                </>
            )}

            {!hasHistoryData && (
                <div style={{ textAlign: 'center', marginTop: '40px', opacity: 0.4, padding: '0 20px' }}>
                    <p style={{ fontSize: '0.9rem' }}>Log your first session to unlock trends and history tracking.</p>
                </div>
            )}



            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                isLeagueMode={isLeagueMode}
                isProMode={isProMode}
                handleRoleSelect={handleRoleSelect}
                updateSettings={updateSettings}
                handleLogout={handleLogout}
            />

            <StreakModal
                isOpen={showStreakModal}
                onClose={() => setShowStreakModal(false)}
                streak={streak}
                milestone={streakMilestone}
                history={history}
            />
        </div>
    );
}