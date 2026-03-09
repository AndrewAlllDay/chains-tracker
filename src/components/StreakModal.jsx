import React from 'react';
import { useStreakStats } from '../hooks/useStreakStats';
import { Snowflake, Target, Flame, X } from 'lucide-react';
import './StreakModal.css';

const StreakModal = ({ isOpen, onClose, streak, milestone, history }) => {
    const streakStats = useStreakStats(history, streak);

    if (!isOpen || !streakStats) return null;

    const chartHeight = 100;
    const chartWidth = 300;
    const padding = 10;

    // Combine both trends to find the overall min/max for scale consistency
    const allPcts = [...streakStats.practiceTrend, ...streakStats.leagueTrend].filter(v => v !== null);
    const maxPct = allPcts.length > 0 ? Math.max(...allPcts) : 100;
    const minPct = allPcts.length > 0 ? Math.min(...allPcts) : 0;
    const range = (maxPct - minPct) || 1;

    const getPoints = (trend) => {
        return trend
            .map((pct, i) => {
                if (pct === null) return null;
                const x = (i / (trend.length - 1 || 1)) * chartWidth;
                const normalizedY = (pct - minPct) / range;
                const y = chartHeight - (normalizedY * (chartHeight - padding * 2) + padding);
                return `${x},${y}`;
            })
            .filter(p => p !== null)
            .join(' ');
    };

    const practicePoints = getPoints(streakStats.practiceTrend);
    const leaguePoints = getPoints(streakStats.leagueTrend);

    const involvedDates = streakStats.involvedDates || [];
    const startDate = involvedDates.length > 0 ? involvedDates[involvedDates.length - 1] : 'N/A';
    const todayDate = involvedDates.length > 0 ? involvedDates[0] : 'N/A';

    let heroIcon = <Target size={65} color="var(--primary)" />;
    if (streak > 0 || milestone?.title === 'Day One') {
        heroIcon = <Flame size={65} color="#f97316" fill="#f97316" />;
    } else if (streak === 0) {
        heroIcon = <Snowflake size={65} color="#3b82f6" />;
    }

    const displayDays = milestone?.title === 'Day One' ? 1 : (streakStats.current || 0);

    return (
        <div className="modal-overlay" onClick={onClose} style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 2000 }}>
            <div className="modal-content streak-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%', maxHeight: '80vh', overflowY: 'auto', background: 'var(--card-bg)', position: 'relative', borderRadius: '28px', padding: '20px' }}>
                <div className="streak-header">
                    <button className="streak-close-btn" onClick={onClose}><X size={24} color="#44474e" /></button>
                </div>

                <div className="streak-hero-icon" style={{ display: 'flex', justifyContent: 'center' }}>{heroIcon}</div>

                {milestone?.title && <h2 className="modal-title-h2" style={{ marginBottom: '10px' }}>{milestone.title}</h2>}

                <div className="streak-summary-box">
                    <div className="streak-summary-days">{displayDays} Day</div>
                    <div className="streak-summary-label">Practice Streak</div>
                </div>

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

                {(streakStats.att > 0 || displayDays > 0) && (
                    <>
                        <div className="stat-grid-mini">
                            <div className="stat-box-mini">
                                <div className="stat-box-label">Putts</div>
                                <div className="stat-box-value"><span style={{ fontWeight: '400' }}>{streakStats.made || 0}</span>/{streakStats.att || 0}</div>
                            </div>
                            <div className="stat-box-mini">
                                <div className="stat-box-label">Accuracy</div>
                                <div className="stat-box-value highlight">{streakStats.pct || 0}%</div>
                            </div>
                        </div>

                        {/* UPDATED DUAL LINE GRAPH */}
                        {(streakStats.practiceTrend.filter(v => v !== null).length > 0 || streakStats.leagueTrend.filter(v => v !== null).length > 0) && (
                            <div className="trend-graph-wrapper">
                                <h4 className="modal-section-title">Accuracy Trend</h4>
                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} /> Practice
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> League
                                    </div>
                                </div>
                                <div className="trend-graph-flex">
                                    <div className="trend-y-axis">
                                        <span>{maxPct}%</span>
                                        <span>{minPct}%</span>
                                    </div>
                                    <div className="trend-chart-area">
                                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                            {/* Practice Line */}
                                            {streakStats.practiceTrend.filter(v => v !== null).length > 1 && (
                                                <polyline fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={practicePoints} />
                                            )}
                                            {/* Practice Dots */}
                                            {streakStats.practiceTrend.map((pct, i) => {
                                                if (pct === null) return null;
                                                const x = (i / (streakStats.practiceTrend.length - 1 || 1)) * chartWidth;
                                                const normalizedY = (pct - minPct) / range;
                                                const y = chartHeight - (normalizedY * (chartHeight - padding * 2) + padding);
                                                return <circle key={`p-${i}`} cx={x} cy={y} r="4" fill="var(--primary)" stroke="var(--card-bg)" strokeWidth="2" />;
                                            })}

                                            {/* League Line */}
                                            {streakStats.leagueTrend.filter(v => v !== null).length > 1 && (
                                                <polyline fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={leaguePoints} />
                                            )}
                                            {/* League Dots (Green) */}
                                            {streakStats.leagueTrend.map((pct, i) => {
                                                if (pct === null) return null;
                                                const x = (i / (streakStats.leagueTrend.length - 1 || 1)) * chartWidth;
                                                const normalizedY = (pct - minPct) / range;
                                                const y = chartHeight - (normalizedY * (chartHeight - padding * 2) + padding);
                                                return <circle key={`l-${i}`} cx={x} cy={y} r="4" fill="#10b981" stroke="var(--card-bg)" strokeWidth="2" />;
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
                                        <span className="range-dist">{d.distance}' {d.stations && d.stations.length > 0 && <span style={{ fontWeight: '400', opacity: 0.6, fontSize: '0.7rem', marginLeft: '6px' }}>(S{d.stations.sort().join(', S')})</span>}</span>
                                        <span className="range-stats">{d.made}/{d.attempts} <span className="range-pct">{d.pct}%</span></span>
                                    </div>
                                    <div className="range-track"><div className="range-fill" style={{ width: `${d.pct}%` }}></div></div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {milestone?.msg && <p className="milestone-msg">{milestone.msg}</p>}
            </div>
        </div>
    );
};

export default StreakModal;