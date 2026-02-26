import React from 'react';
import { useStreakStats } from '../hooks/useStreakStats';
import { Trophy, Zap, Snowflake, Target, Flame } from 'lucide-react'; // Added Flame here
import './StreakModal.css';

const StreakModal = ({ isOpen, onClose, streak, milestone, history }) => {
    // 1. Fetch all the math from our custom hook
    const streakStats = useStreakStats(history, streak);

    // 2. Handle early return if closed
    if (!isOpen || !streakStats) return null;

    // 3. Graph UI Logic
    const chartHeight = 100;
    const chartWidth = 300;
    const padding = 10;
    const dailyTrend = streakStats.dailyTrend || [];
    const maxPct = Math.max(...dailyTrend, 1);
    const minPct = dailyTrend.length > 0 ? Math.min(...dailyTrend) : 0;
    const range = maxPct - minPct || 1;

    const points = dailyTrend.map((pct, i) => {
        const x = (i / (dailyTrend.length - 1 || 1)) * chartWidth;
        const normalizedY = (pct - minPct) / range;
        const y = chartHeight - (normalizedY * (chartHeight - padding * 2) + padding);
        return `${x},${y}`;
    }).join(' ');

    // 4. Timeline Dates (Safely handled for Cold Starts)
    const involvedDates = streakStats.involvedDates || [];
    const startDate = involvedDates.length > 0 ? involvedDates[involvedDates.length - 1] : 'N/A';
    const todayDate = involvedDates.length > 0 ? involvedDates[0] : 'N/A';

    // 5. Hero Icon Logic (Updated to Lucide)
    let heroIcon = <Target size={65} color="var(--primary)" />;

    if (streak > 0) {
        heroIcon = <Flame size={65} color="#f97316" fill="#f97316" />;
    }

    if (streak >= 7) {
        heroIcon = <Trophy size={65} color="#eab308" fill="#eab308" />;
    } else if (milestone?.title === 'Day One') {
        heroIcon = <Zap size={65} color="#eab308" fill="#eab308" />;
    } else if (streak === 0) {
        heroIcon = <Snowflake size={65} color="#3b82f6" />;
    }

    // 6. Display Days Logic
    const displayDays = milestone?.title === 'Day One' ? 1 : (streakStats.current || 0);

    return (
        <>
            {/* ✕ CLOSE BUTTON */}
            <button className="modal-close-btn" onClick={onClose}>
                ✕
            </button>

            {/* MODAL OVERLAY */}
            <div
                className="modal-overlay"
                onClick={onClose}
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 2000
                }}
            >
                {/* MODAL CONTENT */}
                <div
                    className="modal-content"
                    onClick={e => e.stopPropagation()}
                    style={{
                        maxWidth: '400px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        background: 'var(--card-bg)',
                        marginTop: '25px',
                    }}
                >
                    <div className="streak-hero-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        {heroIcon}
                    </div>
                    <h2 className="modal-title-h2" style={{ marginBottom: '10px' }}>{milestone?.title}</h2>

                    <div className="streak-summary-box">
                        <div className="streak-summary-days">{displayDays} Day</div>
                        <div className="streak-summary-label">Practice Streak</div>
                    </div>

                    {/* --- TIMELINE FEATURE --- */}
                    {involvedDates.length > 0 && (
                        <div className="timeline-container">
                            <div className="timeline-track">
                                <div className="timeline-dot start" />
                                {involvedDates.length > 1 && <div className="timeline-dot end" />}
                                <div className="timeline-progress" style={{ width: involvedDates.length > 1 ? '100%' : '0%' }} />
                            </div>
                            <div className="timeline-labels">
                                <span>{startDate}</span>
                                {involvedDates.length > 1 && <span>{todayDate}</span>}
                            </div>
                        </div>
                    )}

                    {/* Only show stats if they actually have history */}
                    {(streakStats.att > 0 || displayDays > 0) && (
                        <>
                            <div className="stat-grid-mini">
                                <div className="stat-box-mini">
                                    <div className="stat-box-label">Putts</div>
                                    <div className="stat-box-value">
                                        <span style={{ fontWeight: '400' }}>{streakStats.made || 0}</span>/{streakStats.att || 0}
                                    </div>
                                </div>
                                <div className="stat-box-mini">
                                    <div className="stat-box-label">Accuracy</div>
                                    <div className="stat-box-value highlight">{streakStats.pct || 0}%</div>
                                </div>
                            </div>

                            {/* DYNAMIC LINE GRAPH */}
                            {dailyTrend.length > 1 && (
                                <div className="trend-graph-wrapper">
                                    <h4 className="modal-section-title">Streak Accuracy Trend</h4>
                                    <div className="trend-graph-flex">
                                        <div className="trend-y-axis">
                                            <span>{maxPct}%</span>
                                            <span>{minPct}%</span>
                                        </div>
                                        <div className="trend-chart-area">
                                            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                                <polyline fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
                                                {dailyTrend.map((pct, i) => {
                                                    const x = (i / (dailyTrend.length - 1)) * chartWidth;
                                                    const normalizedY = (pct - minPct) / range;
                                                    const y = chartHeight - (normalizedY * (chartHeight - padding * 2) + padding);
                                                    return <circle key={i} cx={x} cy={y} r="4" fill="var(--primary)" stroke="var(--card-bg)" strokeWidth="2" />;
                                                })}
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="range-breakdown-wrapper">
                                <h4 className="modal-section-title">Range Breakdown</h4>
                                {(streakStats.distData || []).map(d => (
                                    <div key={d.distance} className="range-row">
                                        <div className="range-labels">
                                            <span className="range-dist">{d.distance}'</span>
                                            <span className="range-stats">{d.made}/{d.attempts} <span className="range-pct">{d.pct}%</span></span>
                                        </div>
                                        <div className="range-track">
                                            <div className="range-fill" style={{ width: `${d.pct}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <p className="milestone-msg">{milestone?.msg}</p>
                </div>
            </div>
        </>
    );
};

export default StreakModal;