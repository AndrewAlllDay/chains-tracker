import React, { useState, useMemo } from 'react';
import { useLeagueTrends } from '../hooks/useLeagueTrends';
import { usePracticeTrends } from '../hooks/usePracticeTrends';
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
                    {/* ... (Existing League UI remains unchanged) */}
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
                                <div className="scoring-label">Most Dialed Dist.</div>
                            </div>
                        </div>
                    </div>

                    {/* --- WORLD STATS CARD --- */}
                    {worldStats && (
                        <div className="stat-card trends-stat-card" style={{ marginBottom: '15px', borderLeft: '4px solid #f59e0b' }}>
                            <h3 className="trends-stat-title" style={{ marginBottom: '12px' }}>Around the World Highlights</h3>
                            <div className="scoring-flex-row">
                                <div style={{ textAlign: 'center' }}>
                                    <div className="scoring-val" style={{ fontSize: '1.4rem' }}>{worldStats.accuracy}%</div>
                                    <div className="scoring-label">Mode Avg</div>
                                </div>
                                <div className="scoring-divider"></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div className="scoring-val highlight-practice" style={{ fontSize: '1.4rem' }}>{worldStats.peakDistance}'</div>
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