import React, { useState, useEffect, useMemo } from 'react';
import StreakModal from "./StreakModal";
import SettingsModal from "./SettingsModal";
import ActivityList from './ActivityList';
import Trends from './Trends';
import OnboardingOverlay from './OnboardingOverlay';
import PostSessionCoachOverlay from './PostSessionCoachOverlay';
import StreakPill from './StreakPill';
import ActionGrid from './ActionGrid';
import { useStreak } from '../hooks/useStreak';
import { useOnboarding } from '../hooks/useOnboarding';
import './Dashboard.css';
import { Settings } from 'lucide-react';

export default function Dashboard({
    user, userRole, history, startSingleSession, startLeagueSession, deleteHistorySession,
    onManualMerge, handleLogout, userSettings, updateSettings, showSettings, setShowSettings, handleRoleSelect,
    setShowGuideModal, logoIcon, showGuideModal // Assuming showGuideModal is passed or managed
}) {
    const [expandedSession, setExpandedSession] = useState(null);
    const [showStats, setShowStats] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState('ALL');

    const { streak, streakMilestone } = useStreak(history);
    const { showOnboarding, showFirstSessionOverlay, completeOnboarding, completePostSessionCoach } = useOnboarding(userSettings, updateSettings, history);

    const [tourStepIndex, setTourStepIndex] = useState(0);

    const activeHighlight = useMemo(() => {
        if (!showFirstSessionOverlay) return "none";
        const steps = ["activity", "trends", "streak", "guide", "settings"];
        return steps[tourStepIndex] || "none";
    }, [showFirstSessionOverlay, tourStepIndex]);

    // Robust Scroll Lock for all modals and overlays
    useEffect(() => {
        const isOverlayActive =
            showOnboarding ||
            showFirstSessionOverlay ||
            showSettings ||
            showStreakModal ||
            showGuideModal;

        const body = document.body;

        if (isOverlayActive) {
            const scrollY = window.scrollY;
            body.style.position = 'fixed';
            body.style.top = `-${scrollY}px`;
            body.style.width = '100%';
            body.classList.add('no-scroll');
        } else {
            const scrollY = body.style.top;
            body.style.position = '';
            body.style.top = '';
            body.style.width = '';
            body.classList.remove('no-scroll');
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }

        return () => {
            body.style.position = '';
            body.style.top = '';
            body.style.width = '';
            body.classList.remove('no-scroll');
        };
    }, [showOnboarding, showFirstSessionOverlay, showSettings, showStreakModal, showGuideModal]);

    const toggleSession = (id) => setExpandedSession(expandedSession === id ? null : id);
    const safeHistory = Array.isArray(history) ? history : [];
    const hasHistoryData = safeHistory.length > 0;
    const isDataLoaded = user && userSettings && history !== undefined;

    const handleStartSession = (type) => {
        if (showOnboarding) { completeOnboarding(); if (type === 'DISMISS') return; }
        type === 'LEAGUE' ? startLeagueSession() : startSingleSession();
    };

    const filteredHistory = safeHistory.filter(session => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'LEAGUE') return session.type === 'LEAGUE';
        if (activeFilter === 'WORLD') return session.subType === 'WORLD';
        return session.type === 'PRACTICE' && session.subType !== 'WORLD';
    });

    const displayedHistory = showAllHistory ? filteredHistory : filteredHistory.slice(0, 5);

    if (!isDataLoaded) return <div className="dashboard-loading">Loading...</div>;

    return (
        <div className="dashboard container" style={{ position: 'relative', minHeight: '100vh' }}>

            {showOnboarding && <OnboardingOverlay isLeagueMode={userRole === 'league'} onDismiss={() => handleStartSession('DISMISS')} />}

            {showFirstSessionOverlay && (
                <PostSessionCoachOverlay
                    onDismiss={completePostSessionCoach}
                    userRole={userRole}
                    currentStepIndex={tourStepIndex}
                    setCurrentStepIndex={setTourStepIndex}
                />
            )}

            <header className="dashboard-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' }}>

                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative', padding: '20px 0', marginBottom: '10px' }}>

                    <div style={{ position: 'absolute', left: '0', top: '-10px', zIndex: activeHighlight === 'guide' ? 6005 : 2 }}>
                        <div className={activeHighlight === 'guide' ? 'tour-highlight-active' : ''} style={{ borderRadius: '8px', display: 'inline-flex' }}>
                            <button onClick={() => !showFirstSessionOverlay && setShowGuideModal(true)} className="secondary-btn" style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'transparent', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', margin: 0 }}>
                                Guide
                            </button>
                        </div>
                    </div>

                    <div style={{ width: '150px', zIndex: 1 }}>
                        <img src={logoIcon} alt="DIALED Logo" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>

                    <div style={{ position: 'absolute', right: '0', top: '-10px', zIndex: activeHighlight === 'settings' ? 6005 : 2 }}>
                        <div className={activeHighlight === 'settings' ? 'tour-highlight-active' : ''} style={{ borderRadius: '50%', display: 'inline-flex' }}>
                            <button onClick={() => !showFirstSessionOverlay && setShowSettings(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', opacity: 0.6, margin: 0 }}>
                                <Settings size={24} strokeWidth={2.5} color="#6b7280" />
                            </button>
                        </div>
                    </div>

                </div>

                <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0 }}>Welcome, {user?.displayName?.split(' ')[0] || 'Golfer'}</h2>
                    <div className={activeHighlight === 'streak' ? 'tour-highlight-active' : ''} style={{ display: 'inline-block', borderRadius: '50px' }}>
                        <StreakPill streak={streak} milestone={streakMilestone} onClick={() => !showFirstSessionOverlay && setShowStreakModal(true)} />
                    </div>
                </div>

                {streakMilestone && (
                    <div className="streak-milestone-banner">
                        <p>{streakMilestone.msg}</p>
                    </div>
                )}

            </header>

            <ActionGrid
                isLeagueMode={userRole === 'league'}
                userRole={userRole}
                showOnboarding={showOnboarding}
                onStartSession={handleStartSession}
            />

            {hasHistoryData && (
                <>
                    <div className="trends-toggle-container">
                        <button className={`trends-toggle-btn ${activeHighlight === 'trends' ? 'tour-highlight-active' : ''}`} onClick={() => setShowStats(!showStats)} style={{ borderRadius: '50px', padding: '10px 25px' }}>
                            {showStats ? 'Hide Trends ▲' : 'View Trends ▼'}
                        </button>
                    </div>
                    {showStats && <Trends history={history} userRole={userRole} />}

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <h3 className={`section-title ${activeHighlight === 'activity' ? 'tour-highlight-active' : ''}`} style={{ textAlign: 'center', width: 'fit-content', padding: '10px 25px' }}>
                            Recent Activity
                        </h3>
                    </div>

                    <div className="activity-filters-container">
                        <div className={`activity-filters ${activeHighlight === 'activity' ? 'tour-highlight-active' : ''}`} style={{ width: 'fit-content', margin: '0 auto' }}>
                            {['ALL', 'PRACTICE', 'WORLD', 'LEAGUE'].map(f => (
                                <button key={f} className={`filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => !showFirstSessionOverlay && setActiveFilter(f)}>{f}</button>
                            ))}
                        </div>
                    </div>

                    <ActivityList displayedHistory={displayedHistory} expandedSession={expandedSession} toggleSession={toggleSession} deleteHistorySession={deleteHistorySession} onManualMerge={onManualMerge} tourActive={activeHighlight === 'activity'} />

                    <div className="history-footer">
                        {filteredHistory.length > 5 && (
                            <button className="secondary-btn-full" onClick={() => setShowAllHistory(!showAllHistory)}>
                                {showAllHistory ? 'Collapse History ▲' : `View All History (${filteredHistory.length}) ▼`}
                            </button>
                        )}
                    </div>
                </>
            )}

            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} isLeagueMode={userRole === 'league'} isProMode={userSettings?.scoringStyle === 'PRO'} handleRoleSelect={handleRoleSelect} updateSettings={updateSettings} handleLogout={handleLogout} />
            <StreakModal isOpen={showStreakModal} onClose={() => setShowStreakModal(false)} streak={streak} milestone={streakMilestone} history={history} />
        </div>
    );
}