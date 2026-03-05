import React, { useState } from 'react';
import {
    Flame, ChevronDown, Link as LinkIcon, Trash2, Target, Trophy, Globe, TrendingUp
} from 'lucide-react';
import './ActivityList.css';

const ActivityList = ({ displayedHistory, expandedSession, toggleSession, deleteHistorySession, onManualMerge, tourActive }) => {
    const [showDetailsId, setShowDetailsId] = useState(null);

    const getDotStyle = (made, attempts) => {
        const pct = (made / attempts) * 100;
        if (pct >= 70) return { background: '#10b981', border: 'none' };
        if (pct >= 40) return { background: '#fbbf24', border: 'none' };
        return { background: '#ef4444', border: 'none' };
    };

    return (
        <ul className="history-list" style={{ zIndex: tourActive ? 5001 : 1 }}>
            {displayedHistory.map((session, index) => {
                const isExpanded = expandedSession === session.id;
                const isLeague = session.type === 'LEAGUE';
                const isWorld = session.subType === 'WORLD';
                const isLadder = session.subType === 'LADDER';
                const isLegacy = session.isLegacy === true;
                const isHighlighted = tourActive && index < 2;
                const isDetailsVisible = showDetailsId === session.id;

                let perfectRounds = 0;
                if (!isLegacy && session.rounds) {
                    perfectRounds = session.rounds.filter((r) => {
                        return r.made === r.attempts && r.attempts > 0;
                    }).length;
                }

                const cardClass = `activity-card ${isLeague ? 'league' : ''} ${isWorld ? 'world' : ''} ${isLadder ? 'ladder' : ''} ${isHighlighted ? 'tour-highlight-active' : ''}`;

                let scoreDisplay, subtextDisplay;
                if (isLeague) {
                    scoreDisplay = isLegacy ? session.totalScore : (session.score || 0);
                    subtextDisplay = 'Total Score';
                } else if (isLadder) {
                    scoreDisplay = 'CLIMB';
                    subtextDisplay = `${session.summary?.made || 0} Makes`;
                } else {
                    const pct = Math.round((session.summary?.made / session.summary?.attempts) * 100) || 0;
                    scoreDisplay = `${pct}%`;
                    subtextDisplay = `${session.summary?.made || 0}/${session.summary?.attempts || 0}`;
                }

                const duplicateSession = !isLeague && !isWorld && !isLadder && !isLegacy && displayedHistory.find(s =>
                    s.date === session.date && s.id !== session.id && s.type === 'PRACTICE' && !s.subType && !s.isLegacy
                );

                let displayRoundScores = session.roundScores;
                if (isLeague && !displayRoundScores && session.details) {
                    displayRoundScores = [1, 2, 3].map(roundNum => {
                        const rDetails = session.details[roundNum] || {};
                        return (rDetails[1] || 0) * 1 +
                            (rDetails[2] || 0) * 2 +
                            (rDetails[3] || 0) * 3 +
                            (rDetails[4] || 0) * 4 +
                            (rDetails[5] || 0) * 5;
                    });
                }

                return (
                    <li
                        key={session.id}
                        onClick={() => {
                            if (tourActive) return;
                            toggleSession(session.id);
                            if (isExpanded) setShowDetailsId(null);
                        }}
                        className={cardClass}
                        style={{
                            boxShadow: isExpanded ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
                            transform: isExpanded ? 'scale(1.01)' : 'scale(1)',
                            zIndex: isHighlighted ? 6000 : 1,
                            background: isHighlighted ? '#ffffff' : undefined
                        }}
                    >
                        <div className="activity-header">
                            <div>
                                <div className="activity-date">{session.date}</div>
                                <div className="activity-badges">
                                    <div className="badge-mode">
                                        {isLeague ? <Trophy size={10} /> : (isWorld ? <Globe size={10} /> : isLadder ? <TrendingUp size={10} /> : <Target size={10} />)}
                                        <span>
                                            {isLeague ? 'LEAGUE' : (isWorld ? 'AROUND THE WORLD' : isLadder ? 'LADDER DRILL' : 'PRACTICE')}
                                        </span>
                                    </div>
                                    {isLegacy && <div className="badge-legacy">LEGACY</div>}
                                    {perfectRounds > 0 && (
                                        <div className={`badge-perfect ${isWorld ? 'world' : ''}`}>
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
                                <span className="activity-toggle" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                                    <ChevronDown size={18} />
                                </span>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="activity-expanded">
                                {!isLegacy && !isWorld && session.rounds && (
                                    <div className="dist-summary">
                                        <div className="activity-section-title">Accuracy Breakdown</div>
                                        {Object.entries(session.rounds.reduce((acc, r) => {
                                            if (!acc[r.distance]) acc[r.distance] = { made: 0, attempts: 0, stations: new Set() };
                                            acc[r.distance].made += Number(r.made);
                                            acc[r.distance].attempts += Number(r.attempts);
                                            if (r.points) acc[r.distance].stations.add(r.points);
                                            return acc;
                                        }, {})).map(([dist, stats]) => (
                                            <div key={dist} className="dist-row">
                                                <div className="dist-labels">
                                                    <span className="dist-name">
                                                        {dist}ft {isLeague && stats.stations.size > 0 &&
                                                            <span className="dist-stations">
                                                                (S{Array.from(stats.stations).sort().join(', S')})
                                                            </span>
                                                        }
                                                    </span>
                                                    <span className="dist-frac">{stats.made}/{stats.attempts}</span>
                                                </div>
                                                <div className="progress-track">
                                                    <div className="progress-track-fill" style={{ width: `${(stats.made / stats.attempts) * 100}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isLeague && !isLegacy && displayRoundScores && (
                                    <div className="league-rounds">
                                        {displayRoundScores.map((score, idx) => (
                                            <div key={idx} className="league-round-col">
                                                <div className="league-round-label">R{idx + 1}</div>
                                                <div className="league-round-val">{score}</div>
                                            </div>
                                        ))}
                                        <div className="league-total-col">
                                            <div className="league-round-label">TOTAL</div>
                                            <div className="league-total-val">{session.score}</div>
                                        </div>
                                    </div>
                                )}

                                {isLegacy && (
                                    <div className="legacy-notice">
                                        Legacy session. Detailed round data is unavailable.
                                    </div>
                                )}

                                {!isLeague && !isWorld && !isLegacy && session.rounds && (
                                    <div
                                        className="seq-section"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDetailsId(isDetailsVisible ? null : session.id);
                                        }}
                                    >
                                        <div className="seq-header">
                                            <span className="activity-section-title">Round Sequence</span>
                                            <span className="seq-toggle-text">
                                                {isDetailsVisible ? 'Hide Grid ▲' : 'Tap for Grid ▼'}
                                            </span>
                                        </div>
                                        <div className="seq-container">
                                            {session.rounds.map((r, i) => {
                                                const pct = Math.round((r.made / r.attempts) * 100);
                                                if (pct === 100) {
                                                    return (
                                                        <div key={i} className="seq-perfect-flame">
                                                            <Flame size={14} color="#f97316" fill="#f97316" />
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div key={i} className="seq-dot" style={getDotStyle(r.made, r.attempts)} />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {isDetailsVisible && session.rounds && (
                                    <div className="details-grid">
                                        {session.rounds.map((r, i) => (
                                            <div key={i} className="details-cell">
                                                <span className="details-cell-label">Rd {i + 1}</span>
                                                <span className="details-cell-val">{r.made}/{r.attempts}</span>
                                                <span className="details-cell-dist">{r.distance}'</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="activity-actions">
                                    {duplicateSession && onManualMerge && (
                                        <button className="merge-btn" onClick={(e) => { e.stopPropagation(); onManualMerge(duplicateSession, session); }}>
                                            <LinkIcon size={16} /> Merge Duplicate Sessions
                                        </button>
                                    )}
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => { e.stopPropagation(); deleteHistorySession(session.id); }}
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