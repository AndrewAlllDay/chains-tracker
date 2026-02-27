import React, { useState } from 'react';
import {
    Flame, ChevronDown, Link as LinkIcon, Trash2, Target, Trophy, Globe
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
        <ul className="history-list" style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            position: 'relative',
            zIndex: tourActive ? 5001 : 1
        }}>
            {displayedHistory.map((session, index) => {
                const isExpanded = expandedSession === session.id;
                const isLeague = session.type === 'LEAGUE';
                const isWorld = session.subType === 'WORLD';
                const isLegacy = session.isLegacy === true;
                const isHighlighted = tourActive && index < 2;
                const isDetailsVisible = showDetailsId === session.id;

                let perfectRounds = 0;
                if (!isLeague && !isWorld && session.rounds) {
                    perfectRounds = session.rounds.filter((r) => {
                        return r.made === r.attempts && r.attempts > 0;
                    }).length;
                }

                const cardClass = `activity-card ${isLeague ? 'league' : ''} ${isWorld ? 'world' : ''} ${isHighlighted ? 'tour-highlight-active' : ''}`;

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
                    s.date === session.date && s.id !== session.id && s.type === 'PRACTICE' && !s.subType && !s.isLegacy
                );

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
                            position: 'relative',
                            marginBottom: '12px',
                            background: isHighlighted ? '#ffffff' : undefined
                        }}
                    >
                        <div className="activity-header">
                            <div>
                                <div className="activity-date">{session.date}</div>
                                <div className="activity-badges" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                                    display: 'flex', alignItems: 'center'
                                }}>
                                    <ChevronDown size={18} />
                                </span>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="activity-expanded">

                                {/* --- LEAGUE MODE EXPANDED VIEW --- */}
                                {isLeague && (
                                    <div className="league-breakdown" style={{ marginBottom: '20px' }}>
                                        {isLegacy || !session.details ? (
                                            <div style={{ textAlign: 'center', padding: '15px', color: 'var(--text-muted)', fontSize: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                Legacy session. Detailed round data is unavailable.
                                            </div>
                                        ) : (
                                            <>
                                                <div className="league-rounds" style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                                                    {session.roundScores?.map((score, idx) => (
                                                        <div key={idx} style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: '800' }}>R{idx + 1}</div>
                                                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--league)' }}>{score}</div>
                                                        </div>
                                                    ))}
                                                    <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
                                                        <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: '800' }}>TOTAL</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text)' }}>{session.score}</div>
                                                    </div>
                                                </div>

                                                <div className="activity-section-title" style={{ marginBottom: '10px' }}>Station Accuracy</div>
                                                {[1, 2, 3, 4, 5].map(station => {
                                                    const totalMadeAtStation = [1, 2, 3].reduce((acc, round) => {
                                                        const made = session.details?.[round]?.[station] || 0;
                                                        return acc + made;
                                                    }, 0);
                                                    const maxAttempts = 15;
                                                    const pct = (totalMadeAtStation / maxAttempts) * 100;

                                                    return (
                                                        <div key={station} className="dist-row" style={{ marginBottom: '8px' }}>
                                                            <div className="dist-labels" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                                <span className="dist-name" style={{ fontSize: '0.75rem', fontWeight: '800' }}>
                                                                    Station {station} <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>({station}pt)</span>
                                                                </span>
                                                                <span className="dist-frac" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{totalMadeAtStation}/{maxAttempts}</span>
                                                            </div>
                                                            <div className="progress-track" style={{ height: '4px', background: 'var(--bg)', borderRadius: '2px', overflow: 'hidden' }}>
                                                                <div style={{
                                                                    width: `${pct}%`,
                                                                    height: '100%',
                                                                    background: 'var(--league)'
                                                                }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* --- AROUND THE WORLD MODE EXPANDED VIEW (SUBWAY MAP) --- */}
                                {isWorld && session.rounds && (
                                    <div className="world-breakdown" style={{ marginBottom: '20px' }}>
                                        <div className="activity-section-title" style={{ marginBottom: '10px' }}>Journey Map</div>

                                        <div className="journey-map-wrapper" style={{
                                            background: '#f8fafc',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            padding: '40px 15px 20px 15px',
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}>
                                            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch' }}>
                                                {Array.from({ length: Math.ceil(session.rounds.length / 5) }).map((_, chunkIndex) => {
                                                    const chunkSize = 5;
                                                    // Flipped logic: Start with 10ft (story mode)
                                                    const roundsInOrder = [...session.rounds].reverse();
                                                    const chunk = roundsInOrder.slice(chunkIndex * chunkSize, chunkIndex * chunkSize + chunkSize);
                                                    const isEven = chunkIndex % 2 === 0;
                                                    const isLastChunk = chunkIndex === Math.ceil(session.rounds.length / 5) - 1;

                                                    return (
                                                        <div key={chunkIndex} style={{
                                                            display: 'flex',
                                                            flexDirection: isEven ? 'row' : 'row-reverse',
                                                            justifyContent: 'flex-start',
                                                            /* Margin applied to ROW, not line */
                                                            marginBottom: isLastChunk ? '0' : '55px',
                                                            position: 'relative'
                                                        }}>
                                                            {chunk.map((r, i) => {
                                                                const actualIndex = chunkIndex * chunkSize + i;
                                                                const isPerfect = r.made === r.attempts && r.attempts > 0;
                                                                const isAbsoluteLast = actualIndex === roundsInOrder.length - 1;
                                                                const isLastInChunk = i === chunk.length - 1;

                                                                return (
                                                                    <div key={actualIndex} style={{ display: 'flex', flexDirection: isEven ? 'row' : 'row-reverse', alignItems: 'center', position: 'relative' }}>

                                                                        {/* Station Node Wrapper */}
                                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', minWidth: '45px', zIndex: 2 }}>
                                                                            <div style={{
                                                                                width: '28px',
                                                                                height: '28px',
                                                                                borderRadius: '50%',
                                                                                background: isPerfect ? '#3b82f6' : '#f8fafc',
                                                                                border: '2px solid #3b82f6',
                                                                                display: 'flex',
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                                color: isPerfect ? '#ffffff' : '#3b82f6',
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: '900',
                                                                                boxShadow: isPerfect ? '0 0 8px rgba(59, 130, 246, 0.4)' : 'none',
                                                                                position: 'relative'
                                                                            }}>
                                                                                {r.distance}

                                                                                {/* Vertical Line Fix: Centered & no bottom margin */}
                                                                                {isLastInChunk && !isAbsoluteLast && (
                                                                                    <div style={{
                                                                                        position: 'absolute',
                                                                                        top: '14px',
                                                                                        left: '50%',
                                                                                        width: '3px',
                                                                                        height: '83px',
                                                                                        background: '#bfdbfe',
                                                                                        zIndex: -1,
                                                                                        transform: 'translateX(-50%)'
                                                                                    }} />
                                                                                )}
                                                                            </div>

                                                                            <span style={{
                                                                                fontSize: '0.65rem',
                                                                                color: '#94a3b8',
                                                                                fontWeight: '700',
                                                                                marginTop: '6px',
                                                                                background: '#f8fafc',
                                                                                padding: '2px 4px',
                                                                                borderRadius: '4px'
                                                                            }}>
                                                                                {r.made}/{r.attempts}
                                                                            </span>
                                                                        </div>

                                                                        {/* Horizontal Line Fix: Centered & no bottom margin */}
                                                                        {!isLastInChunk && !isAbsoluteLast && (
                                                                            <div style={{
                                                                                width: '35px',
                                                                                height: '3px',
                                                                                background: '#bfdbfe',
                                                                                zIndex: 1,
                                                                                margin: '0 -2px',
                                                                                marginBottom: '20px',
                                                                            }} />
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', marginTop: '12px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                                            Total Rounds: {session.rounds.length}
                                        </div>
                                    </div>
                                )}


                                {/* --- PRACTICE MODE EXPANDED VIEW --- */}
                                {!isLeague && !isWorld && session.rounds && (
                                    <div className="dist-summary" style={{ marginBottom: '20px' }}>
                                        <div className="activity-section-title">Distance Accuracy</div>
                                        {Object.entries(session.rounds.reduce((acc, r) => {
                                            if (!acc[r.distance]) acc[r.distance] = { made: 0, attempts: 0 };
                                            acc[r.distance].made += Number(r.made);
                                            acc[r.distance].attempts += Number(r.attempts);
                                            return acc;
                                        }, {})).map(([dist, stats]) => (
                                            <div key={dist} className="dist-row" style={{ marginBottom: '8px' }}>
                                                <div className="dist-labels" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                    <span className="dist-name" style={{ fontSize: '0.75rem', fontWeight: '800' }}>{dist}ft</span>
                                                    <span className="dist-frac" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{stats.made}/{stats.attempts}</span>
                                                </div>
                                                <div className="progress-track" style={{ height: '4px', background: 'var(--bg)', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${(stats.made / stats.attempts) * 100}%`,
                                                        height: '100%',
                                                        background: 'linear-gradient(90deg, #fb923c, var(--primary))'
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!isLeague && !isWorld && session.rounds && (
                                    <div
                                        className="seq-section"
                                        style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDetailsId(isDetailsVisible ? null : session.id);
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span className="activity-section-title" style={{ margin: 0 }}>Round Sequence</span>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                                {isDetailsVisible ? 'Hide Grid ▲' : 'Tap for Grid ▼'}
                                            </span>
                                        </div>

                                        <div className="seq-container" style={{ display: 'flex', gap: '6px', padding: '4px 0', cursor: 'pointer' }}>
                                            {session.rounds.map((r, i) => {
                                                const pct = Math.round((r.made / r.attempts) * 100);

                                                if (pct === 100) {
                                                    return (
                                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '12px', height: '12px' }}>
                                                            <Flame size={14} color="#f97316" fill="#f97316" />
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div
                                                        key={i}
                                                        className="seq-dot"
                                                        style={{ width: '12px', height: '12px', borderRadius: '50%', ...getDotStyle(r.made, r.attempts) }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {!isLeague && !isWorld && session.rounds && isDetailsVisible && (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(55px, 1fr))',
                                        gap: '10px',
                                        marginTop: '16px',
                                        padding: '12px',
                                        background: '#f9fafb',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        animation: 'slideDownReveal 0.25s ease-out forwards'
                                    }}>
                                        {session.rounds.map((r, i) => (
                                            <div key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: '800' }}>Rd {i + 1}</span>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '900' }}>{r.made}/{r.attempts}</span>
                                                <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>{r.distance}'</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="activity-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', marginTop: '15px' }}>
                                    {duplicateSession && onManualMerge && (
                                        <button className="secondary-btn" onClick={(e) => { e.stopPropagation(); onManualMerge(duplicateSession, session); }} style={{ width: '100%', background: '#eff6ff', color: '#3b82f6', border: '1px solid #dbeafe', padding: '12px', borderRadius: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <LinkIcon size={16} /> Merge Duplicate Sessions
                                        </button>
                                    )}
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => { e.stopPropagation(); deleteHistorySession(session.id); }}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '40%' }}
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