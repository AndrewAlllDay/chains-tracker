import React from 'react';
import { Flame, Zap, Snowflake } from 'lucide-react';

export default function StreakPill({ streak, milestone, onClick }) {
    return (
        <div
            className={`streak-pill ${streak > 0 ? 'active' : 'inactive'}`}
            onClick={onClick}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
            <span className="streak-pill-icon" style={{ display: 'flex' }}>
                {streak > 0 ? (
                    <Flame size={16} color="#f97316" fill="#f97316" />
                ) : (
                    milestone?.title === 'Day One'
                        ? <Zap size={16} color="#eab308" fill="#eab308" />
                        : <Snowflake size={16} color="#3b82f6" />
                )}
            </span>
            <span className="streak-pill-val" style={{ fontWeight: '800', paddingTop: '2px' }}>
                {streak}
            </span>
        </div>
    );
}