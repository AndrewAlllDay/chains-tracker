import React from 'react';
import {
    Flame, ChevronDown, Link as LinkIcon, Trash2, Target, Trophy, Globe
} from 'lucide-react';
import './ActivityList.css';

const ActivityList = ({ displayedHistory, expandedSession, toggleSession, deleteHistorySession, onManualMerge, tourActive }) => {
    // FIX: Removed the unused 'expandedSeqId' state to clear ESLint error

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

                let perfectRounds = 0;
                if (!isLeague && session.rounds) {
                    perfectRounds = session.rounds.filter((r) => {
                        if (isWorld && (r.distance === 10 || r.distance === '10')) return false;
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
                                {session.rounds && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(55px, 1fr))', gap: '10px', marginTop: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                                        {session.rounds.map((r, i) => (
                                            <div key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: '800' }}>Rd {i + 1}</span>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '900' }}>{r.made}/{r.attempts}</span>
                                                <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>{r.distance}'</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="activity-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                                    {duplicateSession && onManualMerge && (
                                        <button className="secondary-btn" onClick={(e) => { e.stopPropagation(); onManualMerge(duplicateSession, session); }} style={{ width: '100%', background: '#eff6ff', color: '#3b82f6', border: '1px solid #dbeafe', padding: '12px', borderRadius: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <LinkIcon size={16} /> Merge Duplicate Sessions
                                        </button>
                                    )}
                                    <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteHistorySession(session.id); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
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