import React, { useState } from 'react';
import {
    Flame,
    Check,
    ChevronDown,
    Link as LinkIcon,
    Trash2,
    Target,
    Trophy,
    Globe
} from 'lucide-react';
import './ActivityList.css';

const ActivityList = ({ displayedHistory, expandedSession, toggleSession, deleteHistorySession, onManualMerge }) => {
    // State to track which standard practice session has its sequence details expanded
    const [expandedSeqId, setExpandedSeqId] = useState(null);

    return (
        <ul className="history-list">
            {displayedHistory.map(session => {
                const isExpanded = expandedSession === session.id;
                const isLeague = session.type === 'LEAGUE';
                const isWorld = session.subType === 'WORLD';
                const isLegacy = session.isLegacy === true;

                // Calculate Perfect Rounds
                let perfectRounds = 0;
                if (!isLeague && session.rounds) {
                    perfectRounds = session.rounds.filter((r) => {
                        if (isWorld && (r.distance === 10 || r.distance === '10')) return false;
                        return r.made === r.attempts && r.attempts > 0;
                    }).length;
                }

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

                const duplicateSession = !isLeague && !isWorld && !isLegacy && displayedHistory.find(s =>
                    s.date === session.date &&
                    s.id !== session.id &&
                    s.type === 'PRACTICE' &&
                    !s.subType &&
                    !s.isLegacy
                );

                return (
                    <li
                        key={session.id}
                        onClick={() => {
                            toggleSession(session.id);
                            if (expandedSession === session.id) setExpandedSeqId(null);
                        }}
                        className={cardClass}
                        style={{
                            boxShadow: isExpanded ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
                            transform: isExpanded ? 'scale(1.01)' : 'scale(1)'
                        }}
                    >
                        <div className="activity-header">
                            <div>
                                <div className="activity-date">{session.date}</div>
                                <div className="activity-badges" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {/* RESTORED: Icons inside the badges */}
                                    <div className="badge-mode" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {isLeague ? <Trophy size={10} /> : (isWorld ? <Globe size={10} /> : <Target size={10} />)}
                                        <span style={{ paddingTop: '1px' }}>
                                            {isLeague ? 'LEAGUE' : (isWorld ? 'AROUND THE WORLD' : 'PRACTICE')}
                                        </span>
                                    </div>
                                    {isLegacy && <div className="badge-legacy">LEGACY</div>}
                                    {perfectRounds > 0 && (
                                        <div className={`badge-perfect ${isWorld ? 'world' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', paddingLeft: '4px', marginLeft: '6px', fontWeight: '600' }}>
                                            <Flame size={12} fill="currentColor" /> x {perfectRounds}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="activity-score-group">
                                <div>
                                    <div className="activity-score-val">{scoreDisplay}</div>
                                    <div className="activity-score-sub">{subtextDisplay}</div>
                                </div>
                                <span className="activity-toggle" style={{
                                    transform: isExpanded ? 'rotate(180deg)' : 'none',
                                    transition: 'transform 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <ChevronDown size={18} />
                                </span>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="activity-expanded">
                                {isLeague ? (
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
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {isWorld ? (
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
                                                                        {/* RESTORED: Lucide Check icon inside the cleared nodes */}
                                                                        <div className={`node-circle ${isCleared ? 'cleared' : ''} ${isPeak ? 'peak' : ''}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                            {isCleared ? <Check size={12} strokeWidth={4} /> : stats.m}
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
                                                                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: '3px' }} />
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
                                                <div
                                                    className="seq-container"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpandedSeqId(expandedSeqId === session.id ? null : session.id);
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {session.rounds?.map((r, i) => {
                                                        const isPerfect = r.made === r.attempts;
                                                        const isGood = r.made / r.attempts >= 0.5;
                                                        let dotBg = 'var(--bg)';
                                                        if (isPerfect) dotBg = 'var(--league)';
                                                        else if (isGood) dotBg = '#fed7aa';
                                                        return <div key={i} className="seq-dot" style={{ background: dotBg }} title={`${r.made}/${r.attempts} at ${r.distance}ft`} />;
                                                    })}
                                                </div>

                                                {expandedSeqId === session.id && (
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fill, minmax(55px, 1fr))',
                                                        gap: '10px',
                                                        marginTop: '12px',
                                                        backgroundColor: '#f9fafb',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e7eb',
                                                        maxHeight: '160px',
                                                        overflowY: 'auto'
                                                    }}>
                                                        {session.rounds?.map((r, i) => (
                                                            <div key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 0' }}>
                                                                <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: '800', textTransform: 'uppercase' }}>Rd {i + 1}</span>
                                                                <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#1f2937' }}>
                                                                    {r.made}<span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600' }}>/{r.attempts}</span>
                                                                </span>
                                                                <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>{r.distance}'</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="activity-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {duplicateSession && onManualMerge && (
                                        <button
                                            className="secondary-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onManualMerge(duplicateSession, session);
                                            }}
                                            style={{
                                                width: '100%', background: '#eff6ff', color: '#3b82f6',
                                                border: '1px solid #dbeafe', padding: '12px', borderRadius: '10px', fontWeight: 'bold',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                            }}
                                        >
                                            <LinkIcon size={16} /> Merge Duplicate Sessions
                                        </button>
                                    )}
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => { e.stopPropagation(); deleteHistorySession(session.id); }}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        <Trash2 size={16} /> Delete Session
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