import React from 'react';
import './ActivityList.css';

const ActivityList = ({ displayedHistory, expandedSession, toggleSession, deleteHistorySession }) => {
    return (
        <ul className="history-list">
            {displayedHistory.map(session => {
                const isExpanded = expandedSession === session.id;
                const isLeague = session.type === 'LEAGUE';
                const isWorld = session.subType === 'WORLD';
                const isLegacy = session.isLegacy === true;

                // Calculate Perfect Rounds (Excluding mandatory 10ft buy-in for World)
                let perfectRounds = 0;
                if (!isLeague && session.rounds) {
                    perfectRounds = session.rounds.filter((r) => {
                        if (isWorld && (r.distance === 10 || r.distance === '10')) return false;
                        return r.made === r.attempts && r.attempts > 0;
                    }).length;
                }

                // This line is key for the CSS above to work
                const cardClass = `activity-card ${isLeague ? 'league' : ''} ${isWorld ? 'world' : ''}`;

                let scoreDisplay, subtextDisplay;
                if (isLeague) {
                    scoreDisplay = isLegacy ? session.totalScore : (session.score || 0);
                    subtextDisplay = 'Total Score';
                } else {
                    const pct = Math.round((session.summary?.made / session.summary?.attempts) * 100) || 0;
                    scoreDisplay = `${pct}%`;
                    subtextDisplay = `${session.summary?.made || 0}/${session.summary?.attempts || 0}`;
                }

                return (
                    <li
                        key={session.id}
                        onClick={() => toggleSession(session.id)}
                        className={cardClass}
                        style={{
                            boxShadow: isExpanded ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
                            transform: isExpanded ? 'scale(1.01)' : 'scale(1)'
                        }}
                    >
                        {/* HEADER SECTION */}
                        <div className="activity-header">
                            <div>
                                <div className="activity-date">{session.date}</div>
                                <div className="activity-badges">
                                    <div className="badge-mode">
                                        {isLeague ? 'LEAGUE' : (isWorld ? 'AROUND THE WORLD' : 'PRACTICE')}
                                    </div>
                                    {isLegacy && <div className="badge-legacy">LEGACY</div>}
                                    {perfectRounds > 0 && (
                                        <div className={`badge-perfect ${isWorld ? 'world' : ''}`}>
                                            🔥 {perfectRounds} PERFECT
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="activity-score-group">
                                <div>
                                    <div className="activity-score-val">{scoreDisplay}</div>
                                    <div className="activity-score-sub">{subtextDisplay}</div>
                                </div>
                                <span className="activity-toggle" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                                    ▼
                                </span>
                            </div>
                        </div>

                        {/* EXPANDED CONTENT */}
                        {isExpanded && (
                            <div className="activity-expanded">
                                {isLeague ? (
                                    /* LEAGUE SECTION */
                                    <div style={{ marginBottom: '10px' }}>
                                        {isLegacy ? (
                                            <div className="legacy-msg-box">
                                                <p>This session was imported as a final score. <br /><strong>No granular breakdown available.</strong></p>
                                            </div>
                                        ) : (
                                            <>
                                                <h4 className="activity-section-title">Performance Breakdown</h4>
                                                <div className="perf-grid">
                                                    {[1, 2, 3].map(roundNum => {
                                                        const rScore = (() => {
                                                            if (session.roundScores && session.roundScores[roundNum - 1] !== undefined) return session.roundScores[roundNum - 1];
                                                            if (session.details && session.details[roundNum]) {
                                                                return Object.entries(session.details[roundNum]).reduce((acc, [st, m]) => acc + (m * parseInt(st)), 0);
                                                            }
                                                            return 0;
                                                        })();
                                                        return (
                                                            <div key={roundNum} className="perf-box">
                                                                <div className="perf-box-label">Rd {roundNum}</div>
                                                                <div className="perf-box-val">{rScore}</div>
                                                            </div>
                                                        );
                                                    })}
                                                    <div className="perf-box total">
                                                        <div className="perf-box-label">Total</div>
                                                        <div className="perf-box-val">{session.score}</div>
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: '20px' }}>
                                                    <h4 className="activity-section-title">Station Accuracy (Total Made / 15)</h4>
                                                    {(() => {
                                                        const stationTotals = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                                                        [1, 2, 3].forEach(round => {
                                                            if (session.details?.[round]) {
                                                                Object.entries(session.details[round]).forEach(([station, made]) => {
                                                                    stationTotals[station] += (made || 0);
                                                                });
                                                            }
                                                        });
                                                        return Object.entries(stationTotals).map(([station, made]) => {
                                                            const pct = (made / 15) * 100;
                                                            const isLow = made <= 6;
                                                            return (
                                                                <div key={station} className="station-row">
                                                                    <div className="station-labels">
                                                                        <span className="station-name">{station} pt Station</span>
                                                                        <span className="station-frac">
                                                                            <span style={{ color: isLow ? '#ef4444' : 'var(--league)', fontWeight: '900' }}>{made}</span> / 15
                                                                        </span>
                                                                    </div>
                                                                    <div className="progress-track">
                                                                        <div style={{ height: '100%', width: `${pct}%`, background: isLow ? '#ef4444' : 'linear-gradient(90deg, #34d399, var(--league))', borderRadius: '3px' }} />
                                                                    </div>
                                                                </div>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    /* PRACTICE & WORLD SECTION */
                                    <>
                                        {isWorld ? (
                                            /* ORBITAL PATH LAYOUT */
                                            <div style={{ marginBottom: '25px' }}>
                                                <h4 className="activity-section-title">Orbital Progress</h4>
                                                <div className="orbit-path-container">
                                                    <div className="orbit-nodes">
                                                        {(() => {
                                                            const rangeStats = {};
                                                            session.rounds?.forEach(r => {
                                                                if (!rangeStats[r.distance]) rangeStats[r.distance] = { m: 0, a: 0 };
                                                                rangeStats[r.distance].m += r.made;
                                                                rangeStats[r.distance].a += r.attempts;
                                                            });
                                                            const sorted = Object.entries(rangeStats).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
                                                            return sorted.map(([dist, stats], idx) => {
                                                                const isCleared = stats.m === stats.a && stats.a > 0;
                                                                const isPeak = idx === sorted.length - 1 && !isCleared;
                                                                return (
                                                                    <div key={dist} className="orbit-node">
                                                                        <div className={`node-circle ${isCleared ? 'cleared' : ''} ${isPeak ? 'peak' : ''}`}>
                                                                            {isCleared ? '✓' : stats.m}
                                                                        </div>
                                                                        <span className="node-label">{dist}'</span>
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="activity-section-title" style={{ textAlign: 'center', marginTop: '-10px' }}>
                                                    Peak Orbit: <strong>{Math.max(...session.rounds.map(r => r.distance))}'</strong>
                                                </div>
                                            </div>
                                        ) : (
                                            /* STANDARD DISTANCE BARS */
                                            <div style={{ marginBottom: '25px' }}>
                                                <h4 className="activity-section-title">Distance Breakdown</h4>
                                                {(() => {
                                                    const rangeStats = {};
                                                    session.rounds?.forEach(r => {
                                                        if (!rangeStats[r.distance]) rangeStats[r.distance] = { m: 0, a: 0 };
                                                        rangeStats[r.distance].m += r.made;
                                                        rangeStats[r.distance].a += r.attempts;
                                                    });
                                                    return Object.entries(rangeStats).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([dist, stats]) => {
                                                        const pct = (stats.m / stats.a) * 100;
                                                        return (
                                                            <div key={dist} className="dist-row">
                                                                <div className="dist-labels">
                                                                    <span className="dist-name">{dist}' Range</span>
                                                                    <span className="dist-frac"><span className="dist-frac-hi">{stats.m}</span> / {stats.a}</span>
                                                                </div>
                                                                <div className="progress-track">
                                                                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px' }} />
                                                                </div>
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        )}

                                        {!isWorld && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <h4 className="activity-section-title">Round Sequence</h4>
                                                <div className="seq-container">
                                                    {session.rounds?.map((r, i) => {
                                                        const isPerfect = r.made === r.attempts;
                                                        const isGood = r.made / r.attempts >= 0.5;
                                                        let dotBg = 'var(--bg)';
                                                        if (isPerfect) dotBg = 'var(--league)';
                                                        else if (isGood) dotBg = '#fed7aa';
                                                        return <div key={i} className="seq-dot" style={{ background: dotBg }} title={`${r.made}/${r.attempts} at ${r.distance}ft`} />;
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div className="activity-actions">
                                    <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteHistorySession(session.id); }}>
                                        🗑️ Delete Session
                                    </button>
                                </div>
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};

export default ActivityList;