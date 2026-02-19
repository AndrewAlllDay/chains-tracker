import React, { useState } from 'react';
import StreakModal from "./StreakModal";
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
    clearAllHistory,
    saveSession
}) {
    const [expandedSession, setExpandedSession] = useState(null);
    const [showStats, setShowStats] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [showStreakModal, setShowStreakModal] = useState(false);

    const toggleSession = (id) => setExpandedSession(expandedSession === id ? null : id);

    // --- CUSTOM HOOK ---
    const { streak, streakMilestone } = useStreak(history); //

    // --- MOCK DATA GENERATOR ---
    const injectMockData = () => {
        const today = new Date();
        const mockSessions = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            return {
                id: `mock-${Date.now()}-${i}`,
                type: 'PRACTICE',
                date: date.toLocaleDateString('en-US'),
                summary: { made: 20, attempts: 25 },
                rounds: [{ id: Date.now() + i, distance: 20, attempts: 25, made: 20 }]
            };
        });
        if (saveSession) {
            mockSessions.forEach(s => saveSession(s));
            alert("✅ 30 Test Sessions Added!");
        }
    };

    const safeHistory = Array.isArray(history) ? history : [];
    const hasHistoryData = safeHistory.length > 0;
    const displayedHistory = showAllHistory ? safeHistory : safeHistory.slice(0, 5);

    return (
        <div className="dashboard container">
            <div className="dashboard-header" style={{ marginBottom: '10px' }}>
                <h2>Welcome back, {user ? user.displayName.split(' ')[0] : 'Golfer'}</h2>
                <div
                    className={`streak-pill ${streak > 0 ? 'active' : 'inactive'}`}
                    onClick={() => setShowStreakModal(true)}
                >
                    <span className="streak-pill-icon">{streak > 0 ? '🔥' : '❄️'}</span>
                    <span className={`streak-pill-val ${streak > 0 ? 'active' : 'inactive'}`}>{streak}</span>
                </div>
            </div>

            {/* --- UPDATED CENTERED MILESTONE DIV --- */}
            <div className="streak-milestone-banner" style={{
                width: '100%',
                marginBottom: '20px',
                padding: '0 10px',
                textAlign: 'center' // ✅ Centers the text within the div
            }}>
                <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: '#6b7280',
                    fontStyle: 'italic',
                    fontWeight: '500',
                    lineHeight: '1.4',
                    display: 'inline-block', // Helps ensure centering logic is robust
                    maxWidth: '80%'        // Prevents the text from hitting the edges on small screens
                }}>
                    {streakMilestone?.msg}
                </p>
            </div>

            {/* ACTION GRID - Role-Specific Layout Isolation */}
            <div style={
                userRole === 'league'
                    ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', marginBottom: '20px' }
                    : { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '20px' }
            }>
                {userRole === 'league' && (
                    <button
                        className="action-card league action-btn-league"
                        onClick={startLeagueSession}
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            padding: '12px 10px'
                        }}
                    >
                        <span className="action-btn-icon" style={{ fontSize: '1.4rem' }}>🏆</span>
                        <div className="action-btn-text" style={{ textAlign: 'left' }}>
                            <strong style={{ display: 'block', fontSize: '0.95rem' }}>Start League</strong>
                            <div className="action-btn-sub" style={{ fontSize: '0.75rem', opacity: 0.9 }}>League Night</div>
                        </div>
                    </button>
                )}

                <button
                    className="action-card secondary action-btn-practice"
                    onClick={startSingleSession}
                    style={{
                        // 65% width only when in practice role, otherwise 100% to fill its grid cell
                        width: userRole === 'practice' ? '65%' : '100%',
                        minWidth: userRole === 'practice' ? '220px' : '0',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        height: 'auto',
                        padding: '12px 10px'
                    }}
                >
                    <span className="action-btn-icon" style={{ fontSize: '1.4rem' }}>🎯</span>
                    <div className="action-btn-text" style={{ textAlign: 'left' }}>
                        <strong style={{ display: 'block', fontSize: '0.95rem' }}>Start Practice</strong>
                        <div className="action-btn-sub" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                            {userRole === 'league' ? 'On Your Own' : 'Free Play'}
                        </div>
                    </div>
                </button>
            </div>

            {hasHistoryData && (
                <div className="trends-toggle-container">
                    <button className="trends-toggle-btn" onClick={() => setShowStats(!showStats)}>
                        {showStats ? 'Hide Trends ▲' : 'View Trends ▼'}
                    </button>
                </div>
            )}

            {showStats && (
                <Trends history={history} userRole={userRole} />
            )}

            <h3 className="section-title">Recent Activity</h3>

            <ActivityList
                displayedHistory={displayedHistory}
                expandedSession={expandedSession}
                toggleSession={toggleSession}
                deleteHistorySession={deleteHistorySession}
            />

            {safeHistory.length > 5 && (
                <button className="view-all-history-btn" onClick={() => setShowAllHistory(!showAllHistory)}>
                    {showAllHistory ? 'Show Less' : `View All History (${safeHistory.length})`}
                </button>
            )}

            <div className="dashboard-footer-actions">
                <div className="clear-history-container">
                    <button className="clear-history-btn" onClick={clearAllHistory}>Clear All History</button>
                </div>
                <div className="dev-actions-container">
                    {(user?.uid === "m5Ucca1lyUYv8JsCOsKlKVEdstJ3" || !user) && (
                        <>
                            <button className="add-test-data-btn" onClick={injectMockData}>+ Add Test Data</button>
                        </>
                    )}
                </div>
            </div>

            <div className="app-version">Version 3.2 (Final)</div>

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