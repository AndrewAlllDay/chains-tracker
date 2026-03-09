import React, { useMemo } from 'react';
import { Trophy, Target, CalendarDays, X, Archive, TrendingUp } from 'lucide-react';
import { useLeagueTrends } from '../hooks/useLeagueTrends';
import './SeasonWrapUpModal.css';

export default function SeasonWrapUpModal({ isOpen, onClose, history, onArchiveLeague }) {
    const leagueData = useLeagueTrends(history);

    const extraStats = useMemo(() => {
        const leagueSessions = history.filter(s => s.type === 'LEAGUE');

        if (leagueSessions.length === 0) return null;

        const totalNights = leagueSessions.length;

        // Summing up makes from the rounds array or falling back to the summary object
        const totalMakes = leagueSessions.reduce((acc, session) => {
            const makesFromRounds = session.rounds?.reduce((rAcc, r) => rAcc + (Number(r.made) || 0), 0) || 0;
            const makesFromSummary = Number(session.summary?.made) || 0;
            return acc + (makesFromRounds || makesFromSummary);
        }, 0);

        return { totalNights, totalMakes };
    }, [history]);

    if (!isOpen || !leagueData || !extraStats) return null;

    return (
        <div className="modal-overlay wrap-up-overlay" style={{ zIndex: 6000 }}>
            <div className="modal-content wrap-up-content">

                <button className="wrap-up-close" onClick={onClose}>
                    <X size={24} color="#9ca3af" />
                </button>

                <div className="wrap-up-header">
                    <div className="wrap-up-icon-wrapper">
                        <Trophy size={40} color="#ffffff" strokeWidth={1.5} />
                    </div>
                    <h2 className="wrap-up-title">Season Wrapped</h2>
                    <p className="wrap-up-subtitle">Putting League is officially over! Here is a look back at your performance this season.</p>
                </div>

                <div className="wrap-up-body">
                    <div className="wrap-up-stats-grid">
                        <div className="wrap-up-stat-box">
                            <CalendarDays size={20} color="var(--league)" style={{ marginBottom: '8px' }} />
                            <div className="stat-val">{extraStats.totalNights}</div>
                            <div className="stat-label">League Nights</div>
                        </div>

                        <div className="wrap-up-stat-box highlight">
                            <Trophy size={20} color="#f59e0b" style={{ marginBottom: '8px' }} />
                            <div className="stat-val" style={{ color: '#f59e0b' }}>{leagueData.personalBest}</div>
                            <div className="stat-label">Personal Best</div>
                        </div>

                        <div className="wrap-up-stat-box">
                            <Target size={20} color="var(--primary)" style={{ marginBottom: '8px' }} />
                            <div className="stat-val">{extraStats.totalMakes}</div>
                            <div className="stat-label">Total Putts Made</div>
                        </div>

                        <div className="wrap-up-stat-box">
                            <TrendingUp size={20} color="var(--league)" style={{ marginBottom: '8px' }} />
                            <div className="stat-val medium" style={{ color: 'var(--league)' }}>{leagueData.seasonAvg}</div>
                            <div className="stat-label">Season Avg Score</div>
                        </div>
                    </div>

                    <div className="wrap-up-action-area">
                        <p className="wrap-up-action-text">
                            Ready to focus on practice for the off-season? Archive League mode to declutter your dashboard. (You can turn it back on in Settings anytime).
                        </p>

                        <button className="save-btn archive-btn" onClick={onArchiveLeague}>
                            <Archive size={18} />
                            Archive League Mode
                        </button>

                        <button className="secondary-btn keep-btn" onClick={onClose}>
                            No thanks, keep it open
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}