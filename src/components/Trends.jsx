import React, { useState, useMemo } from 'react';
import { useLeagueTrends } from '../hooks/useLeagueTrends';
import { usePracticeTrends } from '../hooks/usePracticeTrends';
// Import Flame icon
import { Flame } from 'lucide-react';
import './Trends.css';

const DonutChart = ({ pct, color, label }) => (
    <div className="donut-wrapper">
        <div
            className="donut-outer"
            style={{ background: `conic-gradient(${color} ${pct * 3.6}deg, var(--bg) 0deg)` }}
        >
            <div className="donut-inner">
                {pct}%
            </div>
        </div>
        <div className="donut-text">
            <div className="donut-label">{label}</div>
            <div className="donut-sublabel">Accuracy</div>
        </div>
    </div>
);

const Trends = ({ history, userRole }) => {
    const [activeTab, setActiveTab] = useState(userRole === 'league' ? 'league' : 'practice');
    const displayTab = userRole === 'league' ? activeTab : 'practice';

    const leagueData = useLeagueTrends(history);
    const practiceData = usePracticeTrends(history);

    // --- AROUND THE WORLD SPECIFIC STATS ---
    const worldStats = useMemo(() => {
        const worldSessions = history.filter(s => s.subType === 'WORLD');
        if (worldSessions.length === 0) return null;

        const totalMade = worldSessions.reduce((acc, s) => acc + (s.summary?.made || 0), 0);
        const totalAtt = worldSessions.reduce((acc, s) => acc + (s.summary?.attempts || 0), 0);

        const maxDistances = worldSessions.map(s => {
            const rounds = s.rounds || [];
            return rounds.length > 0 ? Math.max(...rounds.map(r => r.distance)) : 0;
        });

        return {
            accuracy: totalAtt > 0 ? Math.round((totalMade / totalAtt) * 100) : 0,
            peakDistance: Math.max(...maxDistances),
            sessionCount: worldSessions.length
        };
    }, [history]);

    // --- DAILY STREAK CALCULATION (FIXED) ---
    const longestDayStreak = useMemo(() => {
        const practiceSessions = history.filter(s => s.type === 'PRACTICE' || s.subType === 'WORLD');
        if (practiceSessions.length === 0) return 0;

        const rawDates = practiceSessions.map(s => {
            let dateObj;
            if (s.id && typeof s.id === 'number') {
                dateObj = new Date(s.id);
            } else if (s.date) {
                dateObj = new Date(s.date);
            } else {
                return null;
            }

            if (isNaN(dateObj.getTime())) return null;

            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        }).filter(Boolean);

        const uniqueDates = [...new Set(rawDates)].sort();

        if (uniqueDates.length === 0) return 0;

        let maxStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = new Date(`${uniqueDates[i - 1]}T00:00:00`);
            const currDate = new Date(`${uniqueDates[i]}T00:00:00`);

            const diffTime = currDate - prevDate;
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else if (diffDays > 1) {
                currentStreak = 1;
            }
        }

        return maxStreak;
    }, [history]);

    // --- ADVANCED PRO STATS ---
    const proStats = useMemo(() => {
        let totalColdStarts = 0;
        let madeColdStarts = 0;
        let positionMakes = [0, 0, 0, 0, 0];
        let positionAttempts = [0, 0, 0, 0, 0];
        let hasProData = false;

        history.forEach(session => {
            if (session.type === 'PRACTICE' && session.rounds) {
                session.rounds.forEach(round => {
                    if (round.puttSequence && round.puttSequence.length === 5) {
                        hasProData = true;
                        totalColdStarts++;

                        if (round.firstPuttMade) {
                            madeColdStarts++;
                        }

                        round.puttSequence.forEach((made, idx) => {
                            positionAttempts[idx]++;
                            if (made) positionMakes[idx]++;
                        });
                    }
                });
            }
        });

        if (!hasProData) return null;

        const coldStartPct = totalColdStarts > 0 ? Math.round((madeColdStarts / totalColdStarts) * 100) : 0;
        const positionPcts = positionMakes.map((makes, idx) => {
            const att = positionAttempts[idx];
            return att > 0 ? Math.round((makes / att) * 100) : 0;
        });

        return { coldStartPct, positionPcts, totalColdStarts };
    }, [history]);

    if (!leagueData && !practiceData) return null;

    const chartHeight = 100;
    const chartWidth = 300;
    const padding = 10;

    const renderPracticeGraph = () => {
        if (!practiceData || practiceData.sessionTrend.length < 2) return null;

        const trend = practiceData.sessionTrend;
        const maxPct = Math.max(...trend, 1);
        const minPct = Math.min(...trend);
        const range = maxPct - minPct || 1;

        const points = trend.map((pct, i) => {
            const x = (i / (trend.length - 1)) * chartWidth;
            const normalizedY = (pct - minPct) / range;
            const y = chartHeight - (normalizedY * (chartHeight - padding * 2) + padding);
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="stat-card trends-stat-card" style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <h3 className="trends-stat-title" style={{ marginBottom: '4px' }}>Performance Trend</h3>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Last {trend.length} Sessions
                    </span>
                </div>
                <div className="trend-graph-flex">
                    <div className="trend-y-axis">
                        <span>{maxPct}%</span>
                        <span>{minPct}%</span>
                    </div>
                    <div className="trend-chart-area">
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            <polyline fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
                            {trend.map((pct, i) => {
                                const x = (i / (trend.length - 1)) * chartWidth;
                                const normalizedY = (pct - minPct) / range;
                                const y = chartHeight - (normalizedY * (chartHeight - padding * 2) + padding);
                                return <circle key={i} cx={x} cy={y} r="4" fill="var(--primary)" stroke="var(--card-bg)" strokeWidth="2" />;
                            })}
                        </svg>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="trends-wrapper">
            {userRole === 'league' && (
                <div className="trends-tabs">
                    <button className={`trend-tab ${displayTab === 'league' ? 'active' : ''}`} onClick={() => setActiveTab('league')}>League</button>
                    <button className={`trend-tab ${displayTab === 'practice' ? 'active' : ''}`} onClick={() => setActiveTab('practice')}>Practice</button>
                </div>
            )}

            {displayTab === 'league' && leagueData && (
                <>
                    {leagueData.trend && (
                        <div className="weekly-trend-card">
                            <div>
                                <div className="weekly-trend-title">Weekly Performance</div>
                                <div className="weekly-trend-sub">Vs. Last Session</div>
                            </div>
                            <div className="weekly-trend-stats">
                                <div className={`weekly-trend-diff ${leagueData.trend.isPositive ? 'positive' : 'negative'}`}>
                                    {leagueData.trend.isPositive ? '▲' : '▼'} {leagueData.trend.diff}
                                </div>
                                <div className="weekly-trend-totals">
                                    {leagueData.trend.latestTotal} pts vs {leagueData.trend.previousTotal}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="stats-container">
                        <div className="stat-card trends-stat-card" style={{ opacity: leagueData.hasGranular ? 1 : 0.5 }}>
                            <h3 className="trends-stat-title bar-title">Round Averages</h3>
                            <div className="bar-chart-container">
                                {leagueData.hasGranular ? [1, 2, 3].map(r => {
                                    const avg = leagueData.averages[r];
                                    const barHeight = leagueData.maxAvg > 0 ? (avg / leagueData.maxAvg) * 80 : 0;
                                    return (
                                        <div key={r} className="bar-column">
                                            <span className="bar-val">{avg}</span>
                                            <div className={`bar-fill ${avg < 33 ? 'warning' : 'good'}`} style={{ height: `${Math.max(barHeight, 4)}px` }}></div>
                                            <span className="bar-label">R{r}</span>
                                        </div>
                                    );
                                }) : <div className="empty-state-msg padded">Requires app-tracked data</div>}
                            </div>
                        </div>

                        <div className="stat-card trends-stat-card" style={{ opacity: leagueData.hasGranular ? 1 : 0.5 }}>
                            <h3 className="trends-stat-title">Accuracy</h3>
                            <div className="stacked-donut-container">
                                {leagueData.hasGranular ? (
                                    <>
                                        <DonutChart pct={leagueData.c1.pct} color="var(--league)" label="Circle 1" />
                                        <DonutChart pct={leagueData.c2.pct} color="#f59e0b" label="Circle 2" />
                                    </>
                                ) : (
                                    <div className="empty-state-msg">Available for future rounds</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="scoring-potential-card">
                        <h3 className="trends-stat-title">Scoring Potential</h3>
                        <div className="scoring-flex-row">
                            <div>
                                <div className="scoring-val">{leagueData.seasonAvg}</div>
                                <div className="scoring-label">Season Avg</div>
                            </div>
                            <div className="scoring-divider"></div>
                            <div>
                                <div className="scoring-val highlight">{leagueData.personalBest}</div>
                                <div className="scoring-label">Personal Best</div>
                            </div>
                        </div>
                        <div className="scoring-footer">
                            Consistency gap: <strong>{leagueData.personalBest - leagueData.seasonAvg} points</strong>.
                        </div>
                    </div>
                </>
            )}

            {displayTab === 'practice' && practiceData && (
                <>
                    {renderPracticeGraph()}

                    <div className="scoring-potential-card" style={{ marginBottom: '15px' }}>
                        <h3 className="trends-stat-title">Practice Consistency</h3>
                        <div className="scoring-flex-row">
                            <div>
                                <div className="scoring-val">{practiceData.overallPct}%</div>
                                <div className="scoring-label">All-Time Avg</div>
                            </div>
                            <div className="scoring-divider"></div>
                            <div>
                                <div className="scoring-val highlight-practice">
                                    {practiceData.bestDist ? `${practiceData.bestDist.distance}'` : '--'}
                                </div>
                                <div className="scoring-label">Most Dialed</div>
                            </div>
                            <div className="scoring-divider"></div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {/* Flame icon integrated here */}
                                <div className="scoring-val" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Flame size={18} fill="#ef4444" strokeWidth={2.5} /> {longestDayStreak}
                                </div>
                                <div className="scoring-label">Day Streak</div>
                            </div>
                        </div>
                    </div>

                    {proStats && (
                        <div className="stat-card trends-stat-card" style={{ marginBottom: '15px', borderLeft: '4px solid #10b981' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 className="trends-stat-title" style={{ margin: 0 }}>Pro Insights</h3>
                                <span style={{ fontSize: '0.65rem', background: '#d1fae5', color: '#059669', padding: '4px 8px', borderRadius: '8px', fontWeight: '800', letterSpacing: '0.5px' }}>
                                    {proStats.totalColdStarts} RNDS
                                </span>
                            </div>

                            <div className="scoring-flex-row" style={{ marginBottom: '25px', justifyContent: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div className="scoring-val" style={{ fontSize: '1.8rem', color: '#f59e0b' }}>{proStats.coldStartPct}%</div>
                                    <div className="scoring-label" style={{ fontWeight: '800' }}>Cold Start Make Rate</div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                                    The Rhythm Curve
                                </h4>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px', padding: '0 10px', gap: '8px' }}>
                                {proStats.positionPcts.map((pct, idx) => {
                                    const barHeight = Math.max((pct / 100) * 80, 4);
                                    return (
                                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '35px' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', marginBottom: '4px', color: 'var(--text)' }}>{pct}%</span>
                                            <div style={{
                                                width: '100%',
                                                backgroundColor: idx === 0 ? '#f59e0b' : 'var(--primary)',
                                                height: `${barHeight}px`,
                                                borderRadius: '4px 4px 0 0',
                                                transition: 'height 0.3s ease'
                                            }}></div>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 'bold' }}>#{idx + 1}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {worldStats && (
                        <div className="stat-card trends-stat-card" style={{ marginBottom: '15px', borderLeft: '4px solid #3b82f6' }}>
                            <h3 className="trends-stat-title" style={{ marginBottom: '12px' }}>Around the World</h3>
                            <div className="scoring-flex-row">
                                <div style={{ textAlign: 'center' }}>
                                    <div className="scoring-val" style={{ fontSize: '1.4rem' }}>{worldStats.accuracy}%</div>
                                    <div className="scoring-label">Mode Avg</div>
                                </div>
                                <div className="scoring-divider"></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div className="scoring-val" style={{ fontSize: '1.4rem', color: '#3b82f6' }}>{worldStats.peakDistance}'</div>
                                    <div className="scoring-label">Longest Run</div>
                                </div>
                                <div className="scoring-divider"></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div className="scoring-val" style={{ fontSize: '1.4rem' }}>{worldStats.sessionCount}</div>
                                    <div className="scoring-label">Total Runs</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="stat-card trends-stat-card">
                        <h3 className="trends-stat-title" style={{ marginBottom: '15px' }}>Accuracy by Distance</h3>
                        {practiceData.distances.length > 0 ? (
                            <div>
                                {practiceData.distances.map(d => (
                                    <div key={d.distance} className="dist-trend-row">
                                        <div className="dist-trend-label">{d.distance}'</div>
                                        <div className="dist-trend-track">
                                            <div className="dist-trend-fill" style={{ width: `${d.pct}%` }}></div>
                                        </div>
                                        <div className="dist-trend-info">
                                            <div className="dist-trend-pct">{d.pct}%</div>
                                            <div className="dist-trend-fraction">{d.made}/{d.attempts}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state-msg">No distance data available yet.</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Trends;