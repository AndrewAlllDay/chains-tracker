import React, { useState, useMemo } from 'react';
import { useLeagueTrends } from '../hooks/useLeagueTrends';
import { usePracticeTrends } from '../hooks/usePracticeTrends';
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
    const [activeTab, setActiveTab] = useState('practice');
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

    // --- DAILY STREAK CALCULATION ---
    const longestDayStreak = useMemo(() => {
        const practiceSessions = history.filter(s => s.type === 'PRACTICE' || s.subType === 'WORLD');
        if (practiceSessions.length === 0) return 0;

        const rawDates = practiceSessions.map(s => {
            const dateObj = (s.id && typeof s.id === 'number') ? new Date(s.id) : new Date(s.date);
            if (isNaN(dateObj.getTime())) return null;
            return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        }).filter(Boolean);

        const uniqueDates = [...new Set(rawDates)].sort();
        if (uniqueDates.length === 0) return 0;

        let maxStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = new Date(uniqueDates[i - 1]);
            const currDate = new Date(uniqueDates[i]);
            const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else if (diffDays > 1) {
                currentStreak = 1;
            }
        }
        return maxStreak;
    }, [history]);

    // --- MONTHLY PERFORMANCE ---
    const monthlyStats = useMemo(() => {
        const practiceSessions = history.filter(s => s.type === 'PRACTICE' || s.subType === 'WORLD');
        if (practiceSessions.length === 0) return null;

        const monthlyData = {};
        practiceSessions.forEach(s => {
            const dateObj = (s.id && typeof s.id === 'number') ? new Date(s.id) : new Date(s.date);
            if (isNaN(dateObj.getTime())) return;

            const monthKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    sortKey: dateObj.getFullYear() * 100 + dateObj.getMonth(),
                    label: dateObj.toLocaleString('default', { month: 'short' }),
                    made: 0,
                    attempts: 0
                };
            }
            monthlyData[monthKey].made += (s.summary?.made || 0);
            monthlyData[monthKey].attempts += (s.summary?.attempts || 0);
        });

        return Object.values(monthlyData)
            .sort((a, b) => b.sortKey - a.sortKey)
            .slice(0, 5)
            .map(m => ({
                label: m.label,
                pct: m.attempts > 0 ? Math.round((m.made / m.attempts) * 100) : 0
            }));
    }, [history]);

    // --- ADVANCED PRO STATS ---
    const proStats = useMemo(() => {
        let totalColdStarts = 0;
        let madeColdStarts = 0;
        let posMakes = [0, 0, 0, 0, 0];
        let posAtts = [0, 0, 0, 0, 0];
        let hasData = false;

        history.forEach(session => {
            if (session.type === 'PRACTICE' && session.rounds) {
                session.rounds.forEach(round => {
                    if (round.puttSequence?.length === 5) {
                        hasData = true;
                        totalColdStarts++;
                        if (round.firstPuttMade) madeColdStarts++;
                        round.puttSequence.forEach((made, idx) => {
                            posAtts[idx]++;
                            if (made) posMakes[idx]++;
                        });
                    }
                });
            }
        });

        if (!hasData) return null;

        return {
            coldStartPct: totalColdStarts > 0 ? Math.round((madeColdStarts / totalColdStarts) * 100) : 0,
            positionPcts: posAtts.map((att, i) => att > 0 ? Math.round((posMakes[i] / att) * 100) : 0),
            totalColdStarts
        };
    }, [history]);

    const renderPracticeGraph = () => {
        if (!practiceData || practiceData.sessionTrend.length < 2) return null;
        const trend = practiceData.sessionTrend;
        const maxPct = Math.max(...trend, 1);
        const minPct = Math.min(...trend);
        const range = maxPct - minPct || 1;
        const points = trend.map((pct, i) => {
            const x = (i / (trend.length - 1)) * 300;
            const normalizedY = (pct - minPct) / range;
            const y = 100 - (normalizedY * 80 + 10);
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="stat-card trends-stat-card">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h3 className="trends-stat-title compact">Performance Trend</h3>
                    <span className="trend-subtitle">Last {trend.length} Sessions</span>
                </div>
                <div className="trend-graph-flex">
                    <div className="trend-y-axis"><span>{maxPct}%</span><span>{minPct}%</span></div>
                    <div className="trend-chart-area">
                        <svg viewBox="0 0 300 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            <polyline fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
                            {trend.map((pct, i) => {
                                const x = (i / (trend.length - 1)) * 300;
                                const normalizedY = (pct - minPct) / range;
                                const y = 100 - (normalizedY * 80 + 10);
                                return <circle key={i} cx={x} cy={y} r="4" fill="var(--primary)" stroke="white" strokeWidth="2" />;
                            })}
                        </svg>
                    </div>
                </div>
            </div>
        );
    };

    if (!leagueData && !practiceData) return null;

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

                    {/* STATION BREAKDOWN SECTION */}
                    <div className="stat-card trends-stat-card" style={{ opacity: leagueData.hasGranular ? 1 : 0.5 }}>
                        <h3 className="trends-stat-title">Station Breakdown</h3>
                        {leagueData.hasGranular && leagueData.stationStats ? (
                            <div style={{ marginTop: '10px' }}>
                                {leagueData.stationStats.map(s => (
                                    <div key={s.id} className="dist-trend-row">
                                        <div className="dist-trend-label">Station {s.id} ({s.dist}')</div>
                                        <div className="dist-trend-track">
                                            <div className="dist-trend-fill" style={{ width: `${s.pct}%`, backgroundColor: 'var(--league)' }}></div>
                                        </div>
                                        <div className="dist-trend-info">
                                            <div className="dist-trend-pct">{s.pct}%</div>
                                            <div className="dist-trend-fraction">{s.made}/{s.attempts}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state-msg">Requires app-tracked data</div>
                        )}
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

                    <div className="scoring-potential-card">
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
                            <div>
                                <div className="scoring-val highlight-streak">
                                    <Flame size={18} fill="#ef4444" strokeWidth={2.5} /> {longestDayStreak}
                                </div>
                                <div className="scoring-label">Day Streak</div>
                            </div>
                        </div>
                    </div>

                    {monthlyStats && monthlyStats.length > 0 && (
                        <div className="stat-card trends-stat-card">
                            <h3 className="trends-stat-title">Monthly Averages</h3>
                            <div className="chart-bar-container">
                                {[...monthlyStats].reverse().map((month, idx) => {
                                    const barHeight = Math.max((month.pct / 100) * 80, 4);
                                    const isCurrent = idx === monthlyStats.length - 1;
                                    return (
                                        <div key={idx} className="chart-bar-col">
                                            <span className="chart-bar-val">{month.pct}%</span>
                                            <div className="chart-bar-fill" style={{ backgroundColor: isCurrent ? 'var(--primary)' : '#cbd5e1', height: `${barHeight}px` }} />
                                            <span className="chart-bar-label">{month.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {proStats && (
                        <div className="stat-card trends-stat-card pro">
                            <div className="pro-insights-header">
                                <h3 className="trends-stat-title">Pro Insights</h3>
                                <span className="pro-insights-badge">{proStats.totalColdStarts} RNDS</span>
                            </div>
                            <div className="scoring-flex-row centered">
                                <div>
                                    <div className="scoring-val highlight-pro">{proStats.coldStartPct}%</div>
                                    <div className="scoring-label">Cold Start Make Rate</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', margin: '15px 0' }}>
                                <h4 className="trend-subtitle">The Rhythm Curve</h4>
                            </div>
                            <div className="chart-bar-container">
                                {proStats.positionPcts.map((pct, idx) => {
                                    const barHeight = Math.max((pct / 100) * 80, 4);
                                    return (
                                        <div key={idx} className="chart-bar-col">
                                            <span className="chart-bar-val">{pct}%</span>
                                            <div className="chart-bar-fill" style={{ backgroundColor: idx === 0 ? '#f59e0b' : 'var(--primary)', height: `${barHeight}px` }} />
                                            <span className="chart-bar-label">#{idx + 1}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {worldStats && (
                        <div className="stat-card trends-stat-card world">
                            <h3 className="trends-stat-title">Around the World</h3>
                            <div className="scoring-flex-row">
                                <div>
                                    <div className="scoring-val medium">{worldStats.accuracy}%</div>
                                    <div className="scoring-label">Mode Avg</div>
                                </div>
                                <div className="scoring-divider"></div>
                                <div>
                                    <div className="scoring-val medium highlight-world">{worldStats.peakDistance}'</div>
                                    <div className="scoring-label">Longest Run</div>
                                </div>
                                <div className="scoring-divider"></div>
                                <div>
                                    <div className="scoring-val medium">{worldStats.sessionCount}</div>
                                    <div className="scoring-label">Total Runs</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="stat-card trends-stat-card">
                        <h3 className="trends-stat-title">Accuracy by Distance</h3>
                        {practiceData.distances.length > 0 ? (
                            <div>
                                {practiceData.distances.map(d => (
                                    <div key={d.distance} className="dist-trend-row">
                                        <div className="dist-trend-label">{d.distance}'</div>
                                        <div className="dist-trend-track"><div className="dist-trend-fill" style={{ width: `${d.pct}%` }}></div></div>
                                        <div className="dist-trend-info">
                                            <div className="dist-trend-pct">{d.pct}%</div>
                                            <div className="dist-trend-fraction">{d.made}/{d.attempts}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <div className="empty-state-msg">No distance data available yet.</div>}
                    </div>
                </>
            )}
        </div>
    );
};

export default Trends;