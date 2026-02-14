import React, { useState, useMemo } from 'react';

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

    // NEW: State to toggle the streak details modal
    const [showStreakDetails, setShowStreakDetails] = useState(false);

    // --- STREAK CALCULATION ENGINE ---
    const streakStats = useMemo(() => {
        if (!history || !Array.isArray(history) || history.length === 0) return { current: 0, involvedDates: [] };

        // 1. Map dates to total attempts
        const dateMap = history.reduce((acc, sess) => {
            const attempts = sess.summary?.attempts || 0;
            const sessionTotal = sess.type === 'LEAGUE' ? 75 : attempts;
            acc[sess.date] = (acc[sess.date] || 0) + sessionTotal;
            return acc;
        }, {});

        // 2. Filter for valid dates (>= 25 putts)
        const validDates = Object.keys(dateMap)
            .filter(date => dateMap[date] >= 25)
            .sort((a, b) => new Date(b) - new Date(a)); // Newest first

        const isConsecutive = (dateStr1, dateStr2) => {
            const d1 = new Date(dateStr1);
            const d2 = new Date(dateStr2);
            const diffDays = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
            return diffDays === 1;
        };

        const isTodayOrYesterday = (dateStr) => {
            const d = new Date(dateStr);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return d.toDateString() === today.toDateString() || d.toDateString() === yesterday.toDateString();
        };

        let count = 0;
        let streakDates = [];

        if (validDates.length > 0 && isTodayOrYesterday(validDates[0])) {
            count = 1;
            streakDates.push(validDates[0]);

            for (let i = 0; i < validDates.length - 1; i++) {
                if (isConsecutive(validDates[i], validDates[i + 1])) {
                    count++;
                    streakDates.push(validDates[i + 1]);
                } else {
                    break;
                }
            }
        }

        return {
            current: count >= 2 ? count : 0,
            involvedDates: count >= 2 ? streakDates : []
        };
    }, [history]);

    // --- NEW: CALCULATE DETAILED STATS FOR THE ACTIVE STREAK ---
    const streakDetails = useMemo(() => {
        if (!streakStats.current || streakStats.involvedDates.length === 0) return null;

        const sessionsInStreak = history.filter(s => streakStats.involvedDates.includes(s.date));

        let totalMade = 0;
        let totalAttempts = 0;
        let practiceCount = 0;
        let leagueCount = 0;

        // Distance Breakdown (Practice)
        const distanceStats = {};

        // Station Breakdown (League)
        const stationStats = { 1: { made: 0, att: 0 }, 2: { made: 0, att: 0 }, 3: { made: 0, att: 0 }, 4: { made: 0, att: 0 }, 5: { made: 0, att: 0 } };

        sessionsInStreak.forEach(sess => {
            if (sess.type === 'LEAGUE') {
                leagueCount++;
                // League logic: 3 rounds * 5 stations = 15 shots per station total
                // Each station has 5 attempts per round
                [1, 2, 3].forEach(round => {
                    [1, 2, 3, 4, 5].forEach(station => {
                        const made = sess.details?.[round]?.[station] || 0;
                        stationStats[station].made += made;
                        stationStats[station].att += 5; // 5 putts per station per round
                        totalMade += made;
                        totalAttempts += 5;
                    });
                });
            } else {
                practiceCount++;
                totalMade += (sess.summary?.made || 0);
                totalAttempts += (sess.summary?.attempts || 0);

                // Aggregate distances
                if (sess.rounds) {
                    sess.rounds.forEach(r => {
                        const d = r.distance;
                        if (!distanceStats[d]) distanceStats[d] = { made: 0, att: 0 };
                        distanceStats[d].made += r.made;
                        distanceStats[d].att += r.attempts;
                    });
                }
            }
        });

        const accuracy = totalAttempts > 0 ? Math.round((totalMade / totalAttempts) * 100) : 0;

        return {
            totalMade,
            totalAttempts,
            accuracy,
            practiceCount,
            leagueCount,
            distanceStats,
            stationStats
        };
    }, [history, streakStats]);


    // --- LEAGUE TRENDS ---
    const calculateLeagueTrends = () => {
        if (!history || !Array.isArray(history) || history.length === 0) return null;
        const leagueSessions = history.filter(s => s.type === 'LEAGUE');
        if (leagueSessions.length === 0) return null;

        const roundSums = { 1: 0, 2: 0, 3: 0 };
        leagueSessions.forEach(session => {
            [1, 2, 3].forEach(rNum => {
                const rData = session.details ? session.details[rNum] : {};
                const rScore = Object.entries(rData).reduce((acc, [st, m]) => acc + (m * parseInt(st)), 0);
                roundSums[rNum] += rScore;
            });
        });
        const averages = {
            1: Math.round(roundSums[1] / leagueSessions.length),
            2: Math.round(roundSums[2] / leagueSessions.length),
            3: Math.round(roundSums[3] / leagueSessions.length)
        };
        const maxAvg = Math.max(averages[1], averages[2], averages[3]);
        return { averages, maxAvg, count: leagueSessions.length };
    };

    const calculateCircleStats = () => {
        if (!history || !Array.isArray(history) || history.length === 0) return null;
        const leagueSessions = history.filter(s => s.type === 'LEAGUE');
        if (leagueSessions.length === 0) return null;

        let c1Made = 0, c1Att = 0, c2Made = 0, c2Att = 0;
        leagueSessions.forEach(session => {
            if (!session.details) return;
            [1, 2, 3].forEach(r => {
                [1, 2, 3].forEach(st => { c1Made += (session.details[r]?.[st] || 0); c1Att += 5; });
                [4, 5].forEach(st => { c2Made += (session.details[r]?.[st] || 0); c2Att += 5; });
            });
        });
        return {
            c1: { made: c1Made, att: c1Att, pct: c1Att > 0 ? Math.round((c1Made / c1Att) * 100) : 0 },
            c2: { made: c2Made, att: c2Att, pct: c2Att > 0 ? Math.round((c2Made / c2Att) * 100) : 0 }
        };
    };

    const leagueTrends = calculateLeagueTrends();
    const circleStats = calculateCircleStats();
    const safeHistory = Array.isArray(history) ? history : [];
    const displayedHistory = showAllHistory ? safeHistory : safeHistory.slice(0, 5);

    const getMilestoneMessage = (count) => {
        if (count === 30) return "🏆 Monthly Master!";
        if (count === 14) return "🔥 Two Weeks Strong!";
        if (count === 7) return "⚡ Week Warrior!";
        if (count === 2) return "🚀 Heating Up!";
        return null;
    };

    const milestoneMessage = getMilestoneMessage(streakStats.current);

    const injectMockData = () => {
        const mockSessions = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US');
            mockSessions.push({
                id: Date.now() - (i * 100000),
                type: 'PRACTICE',
                date: dateStr,
                summary: { made: 20, attempts: 25 },
                rounds: [{ id: Date.now() + i, distance: 20, attempts: 25, made: 20 }]
            });
        }
        if (saveSession) {
            mockSessions.forEach(session => saveSession(session));
            alert("✅ 30 Test Sessions Added!");
        }
    };

    return (
        <div className="dashboard">
            <div className="hero-section">
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '5px', marginTop: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        Welcome back, {user ? user.displayName.split(' ')[0] : 'Golfer'}
                        {streakStats.current > 0 && (
                            <span
                                onClick={() => setShowStreakDetails(true)}
                                style={{
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    background: '#fff7ed',
                                    color: '#ea580c',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    border: '1px solid #fed7aa',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                🔥 {streakStats.current}
                            </span>
                        )}
                    </h2>
                    <p style={{ color: '#666', margin: '0', fontSize: '0.9rem' }}>Ready to drain some putts?</p>
                </div>

                {milestoneMessage && (
                    <div style={{ background: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: '600', boxShadow: '0 2px 5px rgba(234, 88, 12, 0.1)' }}>
                        <span style={{ fontSize: '1.2rem' }}>🎉</span>
                        <span><strong>{streakStats.current} Day Streak!</strong> {milestoneMessage}</span>
                    </div>
                )}

                {/* ACTION GRID */}
                <div
                    className="action-grid"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    {userRole === 'league' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
                            <button className="action-card primary" onClick={startLeagueSession}>
                                <span style={{ fontSize: '1.5rem' }}>🏆</span>
                                <div><strong>Start League</strong><div style={{ fontSize: '0.8rem', opacity: 0.8 }}>League Night</div></div>
                            </button>
                            <button className="action-card secondary" onClick={startSingleSession}>
                                <span style={{ fontSize: '1.5rem' }}>🎯</span>
                                <div style={{ textAlign: 'left' }}><strong>Start Practice</strong><div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Free Play</div></div>
                            </button>
                        </div>
                    )}

                    {userRole === 'practice' && (
                        <button
                            className="action-card secondary"
                            onClick={startSingleSession}
                            style={{
                                width: '50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>🎯</span>
                            <div style={{ textAlign: 'left' }}><strong>Start Practice</strong><div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Free Play</div></div>
                        </button>
                    )}
                </div>
            </div>

            {/* --- MODAL: STREAK STATS --- */}
            {showStreakDetails && streakDetails && (
                <div className="modal-overlay" onClick={() => setShowStreakDetails(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h2 className="modal-title" style={{ margin: 0 }}>🔥 Streak Stats</h2>
                            <button className="delete-btn" style={{ fontSize: '1.2rem' }} onClick={() => setShowStreakDetails(false)}>✕</button>
                        </div>

                        <div style={{ background: '#fff7ed', padding: '15px', borderRadius: '8px', border: '1px solid #fed7aa', marginBottom: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ea580c' }}>{streakStats.current} Days</div>
                            <div style={{ color: '#9a3412', fontSize: '0.9rem' }}>Active Streak</div>
                        </div>

                        <div className="stats-container" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={{ background: '#f9fafb', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                {/* UPDATED LINE HERE */}
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{streakDetails.totalMade} / {streakDetails.totalAttempts}</div>
                                <div style={{ fontSize: '0.75rem', color: '#666' }}>Made / Attempts</div>
                            </div>
                            <div style={{ background: '#f9fafb', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: streakDetails.accuracy >= 80 ? '#10b981' : '#f59e0b' }}>
                                    {streakDetails.accuracy}%
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#666' }}>Accuracy</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '15px', fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
                            Sessions: <strong>{streakDetails.practiceCount}</strong> Practice • <strong>{streakDetails.leagueCount}</strong> League
                        </div>

                        {/* Practice Breakdown */}
                        {streakDetails.practiceCount > 0 && Object.keys(streakDetails.distanceStats).length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px' }}>Practice Breakdown</h4>
                                {Object.entries(streakDetails.distanceStats)
                                    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                                    .map(([dist, stats]) => {
                                        const pct = Math.round((stats.made / stats.att) * 100);
                                        return (
                                            <div key={dist} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', marginBottom: '8px' }}>
                                                <div style={{ width: '40px', fontWeight: 'bold', color: '#4b5563', textAlign: 'right' }}>{dist}'</div>
                                                <div style={{ flex: 1, position: 'relative' }}>
                                                    <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct >= 80 ? '#10b981' : (pct > 50 ? '#f59e0b' : '#ef4444') }}></div>
                                                    </div>
                                                </div>
                                                <div style={{ width: '50px', textAlign: 'right', fontSize: '0.75rem' }}>{pct}%</div>
                                            </div>
                                        )
                                    })}
                            </div>
                        )}

                        {/* League Breakdown */}
                        {streakDetails.leagueCount > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px' }}>League Breakdown</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    {[1, 2, 3, 4, 5].map(st => {
                                        const stData = streakDetails.stationStats[st];
                                        const pct = stData.att > 0 ? Math.round((stData.made / stData.att) * 100) : 0;
                                        return (
                                            <div key={st} style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '2px' }}>St {st}</div>
                                                <div style={{ fontWeight: 'bold', color: pct >= 70 ? '#10b981' : '#666' }}>{pct}%</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        <button className="close-modal-btn" style={{ marginTop: '20px' }} onClick={() => setShowStreakDetails(false)}>Close</button>
                    </div>
                </div>
            )}

            {userRole === 'league' && leagueTrends && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setShowStats(!showStats)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 16px', borderRadius: '20px', backgroundColor: '#f3f4f6' }}>
                        <span>{showStats ? 'Hide League Trends & Stats' : 'View League Trends & Stats'}</span>
                        <span>{showStats ? '▲' : '▼'}</span>
                    </button>
                </div>
            )}

            {showStats && userRole === 'league' && (
                <div className="stats-container">
                    {leagueTrends && (
                        <div className="stat-card">
                            <h3>League Round Averages</h3>
                            <div className="trend-bars">
                                {[1, 2, 3].map(rNum => {
                                    const avg = leagueTrends.averages[rNum];
                                    const heightPct = leagueTrends.maxAvg > 0 ? Math.max((avg / leagueTrends.maxAvg) * 100, 15) : 15;
                                    let barColor = avg === Math.max(...Object.values(leagueTrends.averages)) ? '#10b981' : (avg === Math.min(...Object.values(leagueTrends.averages)) ? '#f59e0b' : 'var(--primary)');
                                    return (
                                        <div key={rNum} className="bar-group">
                                            <span className="bar-val">{avg}</span>
                                            <div style={{ height: `${heightPct}%`, backgroundColor: barColor }} className="bar"></div>
                                            <span className="bar-label">R{rNum}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                    {circleStats && (
                        <div className="stat-card circles-card">
                            <div className="circle-stat"><div className="circle-label">Circle 1</div><div className="circle-val green">{circleStats.c1.pct}%</div><div className="circle-sub">{circleStats.c1.made}/{circleStats.c1.att}</div></div>
                            <div className="divider"></div>
                            <div className="circle-stat"><div className="circle-label">Circle 2</div><div className="circle-val orange">{circleStats.c2.pct}%</div><div className="circle-sub">{circleStats.c2.made}/{circleStats.c2.att}</div></div>
                        </div>
                    )}
                </div>
            )}

            <h3 className="section-title">Recent Activity</h3>
            {safeHistory.length === 0 ? (
                <div className="empty-state">No sessions yet. Go practice!</div>
            ) : (
                <ul className="history-list">
                    {displayedHistory.map(session => {
                        const isExpanded = expandedSession === session.id;
                        if (session.type === 'LEAGUE') {
                            const getRoundTotal = (rNum) => {
                                const rData = session.details ? session.details[rNum] : {};
                                return Object.entries(rData).reduce((acc, [st, m]) => acc + (m * parseInt(st)), 0);
                            };
                            let totalPuttsMade = 0;
                            const stationStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                            if (session.details) {
                                [1, 2, 3].forEach(r => {
                                    [1, 2, 3, 4, 5].forEach(st => {
                                        const madeAtSt = session.details[r]?.[st] || 0;
                                        stationStats[st] += madeAtSt;
                                        totalPuttsMade += madeAtSt;
                                    });
                                });
                            }
                            return (
                                <li key={session.id} className="history-item session-item">
                                    <div style={{ width: '100%' }}>
                                        <div className="session-header">
                                            <span className="session-date">{session.date}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className="session-badge league-badge">League</span>
                                                <button className="delete-btn" style={{ margin: 0 }} onClick={(e) => { e.stopPropagation(); deleteHistorySession(session.id); }}>✕</button>
                                            </div>
                                        </div>
                                        <div className="league-mini-grid">
                                            <div><small>R1</small> <strong>{getRoundTotal(1)}</strong></div>
                                            <div><small>R2</small> <strong>{getRoundTotal(2)}</strong></div>
                                            <div><small>R3</small> <strong>{getRoundTotal(3)}</strong></div>
                                            <div className="total-cell"><small>Total</small> <strong>{session.score}</strong></div>
                                        </div>
                                        <button className="expand-btn" onClick={() => setExpandedSession(isExpanded ? null : session.id)}>
                                            📊 {isExpanded ? 'Hide Stats' : 'Show Stats'}
                                        </button>
                                        {isExpanded && (
                                            <div style={{ marginTop: '15px', borderTop: '1px dashed #ddd', paddingTop: '15px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#555' }}>Total Accuracy</span>
                                                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{totalPuttsMade}/75 ({Math.round((totalPuttsMade / 75) * 100)}%)</span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', rowGap: '15px' }}>
                                                    {[1, 2, 3, 4, 5].map(st => {
                                                        const stPct = Math.round((stationStats[st] / 15) * 100);
                                                        return (
                                                            <div key={st} style={{ fontSize: '0.85rem' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                                    <span>Station {st}</span>
                                                                    <span style={{ fontWeight: '500' }}>{stPct}%</span>
                                                                </div>
                                                                <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                                                                    <div style={{ width: `${stPct}%`, height: '100%', background: stPct >= 80 ? '#10b981' : (stPct >= 50 ? '#f59e0b' : '#ef4444') }}></div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            )
                        }

                        const sessPct = Math.round((session.summary.made / session.summary.attempts) * 100);
                        const distanceStats = {};
                        const roundsData = session.rounds || [];
                        let perfectRoundsCount = 0;
                        roundsData.forEach(round => {
                            if (round.made === round.attempts) perfectRoundsCount++;
                            if (!distanceStats[round.distance]) distanceStats[round.distance] = { made: 0, total: 0 };
                            distanceStats[round.distance].made += round.made;
                            distanceStats[round.distance].total += round.attempts;
                        });

                        return (
                            <li key={session.id} className="history-item session-item">
                                <div style={{ width: '100%' }}>
                                    <div className="session-header">
                                        <span className="session-date">{session.date}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="session-badge" style={{ backgroundColor: '#6b7280' }}>Practice</span>
                                            <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteHistorySession(session.id); }}>✕</button>
                                        </div>
                                    </div>
                                    <div className="session-details">
                                        <div><strong style={{ color: sessPct >= 80 ? '#10b981' : (sessPct > 50 ? '#d97706' : '#ef4444'), fontSize: '1.3em' }}>{sessPct}%</strong> Accuracy</div>
                                        {perfectRoundsCount > 0 && (
                                            <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#ecfdf5', color: '#065f46', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #a7f3d0' }}>🔥 {perfectRoundsCount} Perfect Round{perfectRoundsCount === 1 ? '' : 's'}</div>
                                        )}
                                    </div>
                                    <button className="expand-btn" onClick={() => setExpandedSession(isExpanded ? null : session.id)}>📊 {isExpanded ? 'Hide Details' : 'Show Details'}</button>

                                    {isExpanded && (
                                        <div style={{ marginTop: '15px', borderTop: '1px dashed #ddd', paddingTop: '15px' }}>
                                            <div style={{ marginBottom: '20px' }}>
                                                <div style={{ display: 'flex', height: '24px', width: '100%', backgroundColor: '#fee2e2', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px' }}>
                                                    <div style={{ width: `${sessPct}%`, height: '100%', backgroundColor: '#10b981' }}></div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '500', color: '#666' }}>
                                                    <span style={{ color: '#059669' }}>{session.summary.made} Makes</span>
                                                    <span style={{ color: '#dc2626' }}>{session.summary.attempts - session.summary.made} Misses</span>
                                                </div>
                                            </div>
                                            {Object.keys(distanceStats).length > 0 && (
                                                <div>
                                                    <h4 style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>Breakdown by Distance</h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        {Object.entries(distanceStats).map(([dist, stats]) => {
                                                            const dPct = Math.round((stats.made / stats.total) * 100);
                                                            return (
                                                                <div key={dist} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                                                                    <div style={{ width: '40px', fontWeight: 'bold', color: '#4b5563', textAlign: 'right' }}>{dist}'</div>
                                                                    <div style={{ flex: 1, position: 'relative' }}>
                                                                        <div style={{ width: '100%', height: '8px', backgroundColor: '#fee2e2', borderRadius: '4px', overflow: 'hidden' }}>
                                                                            <div style={{ width: `${dPct}%`, height: '100%', backgroundColor: dPct >= 80 ? '#10b981' : (dPct > 50 ? '#f59e0b' : '#ef4444') }}></div>
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ width: '50px', textAlign: 'right', fontSize: '0.75rem', color: '#6b7280' }}>{stats.made}/{stats.total}</div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}

            {safeHistory.length > 5 && (
                <button onClick={() => setShowAllHistory(!showAllHistory)} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}>
                    {showAllHistory ? 'Show Less' : `View All History (${safeHistory.length})`}
                </button>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '30px' }}>
                <button className="reset-link" onClick={clearAllHistory}>{user ? 'Clear Cloud Data' : 'Reset Local Data'}</button>
                {(user?.uid === "m5Ucca1lyUYv8JsCOsKlKVEdstJ3" || !user) && (
                    <button className="reset-link" onClick={injectMockData} style={{ color: '#ea580c', opacity: 0.3, fontSize: '0.7rem' }}>+ Add Test Data</button>
                )}
            </div>
            <div className='version'>Version 2.9</div>
        </div>
    );
}