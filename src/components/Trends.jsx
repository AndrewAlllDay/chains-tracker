import React, { useState } from 'react';
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
            <div className="donut-inner">{pct}%</div>
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

    // ... (Keep worldStats, longestDayStreak, monthlyStats, proStats, and renderPracticeGraph from your previous version)

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

                    {/* NEW: STATION BREAKDOWN SECTION */}
                    <div className="stat-card trends-stat-card" style={{ opacity: leagueData.hasGranular ? 1 : 0.5 }}>
                        <h3 className="trends-stat-title">Station Breakdown</h3>
                        {leagueData.hasGranular ? (
                            <div style={{ marginTop: '10px' }}>
                                {leagueData.stationStats.map(s => (
                                    <div key={s.id} className="dist-trend-row">
                                        <div className="dist-trend-label">Station {s.id} ({s.dist}')</div>
                                        <div className="dist-trend-track">
                                            <div
                                                className="dist-trend-fill"
                                                style={{
                                                    width: `${s.pct}%`,
                                                    backgroundColor: 'var(--league)'
                                                }}
                                            ></div>
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
                            <div className="scoring-item">
                                <div className="scoring-val">{leagueData.seasonAvg}</div>
                                <div className="scoring-label">Season Avg</div>
                            </div>
                            <div className="scoring-divider"></div>
                            <div className="scoring-item">
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

            {/* ... (Keep Practice Tab logic from previous version) */}
        </div>
    );
};

export default Trends;