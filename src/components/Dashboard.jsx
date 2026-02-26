import React, { useState } from 'react';
import StreakModal from "./StreakModal";
import SettingsModal from "./SettingsModal";
import ActivityList from './ActivityList';
import Trends from './Trends';
import OnboardingOverlay from './OnboardingOverlay';
import StreakPill from './StreakPill';
import ActionGrid from './ActionGrid';
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
                <OnboardingOverlay
                    isLeagueMode={isLeagueMode}
                    onDismiss={() => handleStartSession('DISMISS')}
                />
            )}

            <header className="dashboard-header">
                <div className="header-left">
                    <h2>Welcome, {user ? user.displayName.split(' ')[0] : 'Golfer'}</h2>
                    <StreakPill
                        streak={streak}
                        milestone={streakMilestone}
                        onClick={() => setShowStreakModal(true)}
                    />
                </div>
            </header>

            <div className="streak-milestone-banner">
                <p>{streakMilestone?.msg}</p>
            </div>

            <ActionGrid
                isLeagueMode={isLeagueMode}
                userRole={userRole}
                showOnboarding={showOnboarding}
                onStartSession={handleStartSession}
            />

            {/* TRENDS TOGGLE - Restoring explicit center */}
            {hasHistoryData && (
                <>
                    <div className="trends-toggle-container" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        marginBottom: '20px'
                    }}>
                        <button className="trends-toggle-btn" onClick={() => setShowStats(!showStats)}>
                            {showStats ? 'Hide Trends ▲' : 'View Trends ▼'}
                        </button>
                    </div>

                    {showStats && <Trends history={history} userRole={userRole} />}

                    <h3 className="section-title">Recent Activity</h3>

                    <div className="activity-filters-wrapper" style={{
                        width: '100%',
                        overflow: 'hidden',
                        marginBottom: '15px'
                    }}>
                        <div className="activity-filters" style={{
                            display: 'flex',
                            justifyContent: 'flex-start', // Anchors to the left so scrolling works
                            gap: '12px',
                            overflowX: 'auto',
                            padding: '10px 20px', // Adds "breathing room" on both sides
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch' // Smooth scroll for iOS
                        }}>
                            {['ALL', 'PRACTICE', 'WORLD', 'LEAGUE'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => { setActiveFilter(f); setShowAllHistory(false); }}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: '20px',
                                        border: 'none',
                                        background: activeFilter === f ? 'var(--primary, #3b82f6)' : '#f3f4f6',
                                        color: activeFilter === f ? '#ffffff' : '#6b7280',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0, // CRITICAL: prevents the pills from squishing
                                        boxShadow: activeFilter === f ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                                    }}
                                >
                                    {f === 'WORLD' ? 'AROUND THE WORLD' : f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ActivityList
                        displayedHistory={displayedHistory}
                        expandedSession={expandedSession}
                        toggleSession={toggleSession}
                        deleteHistorySession={deleteHistorySession}
                        onManualMerge={onManualMerge}
                    />

                    {/* VIEW ALL HISTORY - Restoring 65% width and styling */}
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '15px' }}>
                        {filteredHistory.length > 5 && (
                            <button
                                className="secondary-btn"
                                onClick={() => setShowAllHistory(!showAllHistory)}
                                style={{
                                    width: '65%',
                                    padding: '15px',
                                    background: '#f3f4f6', // Muted gray background
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#6b7280', // Text color matching your theme
                                    fontWeight: '800',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {showAllHistory ? 'Collapse History ▲' : `View All History (${filteredHistory.length}) ▼`}
                            </button>
                        )}
                    </div>
                </>
            )}

            {!hasHistoryData && (
                <div className="empty-history">
                    <p>Log your first session to unlock trends and history tracking.</p>
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