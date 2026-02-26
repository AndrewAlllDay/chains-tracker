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

            {hasHistoryData && (
                <>
                    <div className="trends-toggle-container">
                        <button className="trends-toggle-btn" onClick={() => setShowStats(!showStats)}>
                            {showStats ? 'Hide Trends ▲' : 'View Trends ▼'}
                        </button>
                    </div>

                    {showStats && <Trends history={history} userRole={userRole} />}

                    <h3 className="section-title" style={{ textAlign: 'center', width: '100%', display: 'block' }}>
                        Recent Activity
                    </h3>

                    <div className="activity-filters-container">
                        <div className="activity-filters">
                            {['ALL', 'PRACTICE', 'WORLD', 'LEAGUE'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => { setActiveFilter(f); setShowAllHistory(false); }}
                                    className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
                                    style={{
                                        background: activeFilter === f ? 'var(--primary, #3b82f6)' : '#f3f4f6',
                                        color: activeFilter === f ? '#ffffff' : '#6b7280'
                                    }}
                                >
                                    {f === 'WORLD' ? 'ATW' : f}
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

                    <div className="history-footer">
                        {filteredHistory.length > 5 && (
                            <button
                                className="secondary-btn-full"
                                onClick={() => setShowAllHistory(!showAllHistory)}
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