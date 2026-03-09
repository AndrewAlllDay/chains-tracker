import { useMemo } from 'react';

export const useStreakStats = (history, streak) => {
    return useMemo(() => {
        const activeHistory = (history || []).filter(s => s.type === 'PRACTICE' || s.type === 'LEAGUE');

        if (activeHistory.length === 0) {
            return { current: 0, involvedDates: [], made: 0, att: 0, pct: 0, distData: [], practiceTrend: [], leagueTrend: [] };
        }

        const dates = [...new Set(activeHistory.map(s => s.date))].sort((a, b) => new Date(b) - new Date(a));

        const today = new Date().toLocaleDateString('en-US');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-US');

        let effectiveStreak = streak;
        if (streak === 0) {
            if (dates[0] === today || dates[0] === yesterdayStr) {
                effectiveStreak = 1;
            } else {
                return { current: 0, involvedDates: [], made: 0, att: 0, pct: 0, distData: [], practiceTrend: [], leagueTrend: [] };
            }
        }

        const involvedDates = dates.slice(0, effectiveStreak);
        const chronologicalDates = [...involvedDates].reverse();

        const sessionsInStreak = activeHistory.filter(s => involvedDates.includes(s.date));
        let totalMade = 0;
        let totalAtt = 0;
        const distMap = {};

        // NEW: Separate Trend Calculations
        const practiceTrend = chronologicalDates.map(date => {
            const daySessions = activeHistory.filter(s => s.date === date && s.type === 'PRACTICE');
            let dMade = 0, dAtt = 0;
            daySessions.forEach(s => {
                if (s.summary) { dMade += s.summary.made; dAtt += s.summary.attempts; }
                else if (s.rounds) { s.rounds.forEach(r => { dMade += r.made; dAtt += r.attempts; }); }
            });
            return dAtt > 0 ? Math.round((dMade / dAtt) * 100) : null; // null if no practice that day
        });

        const leagueTrend = chronologicalDates.map(date => {
            const daySessions = activeHistory.filter(s => s.date === date && s.type === 'LEAGUE');
            let dMade = 0, dAtt = 0;
            daySessions.forEach(s => {
                if (s.summary) { dMade += s.summary.made; dAtt += s.summary.attempts; }
                else if (s.rounds) { s.rounds.forEach(r => { dMade += r.made; dAtt += r.attempts; }); }
            });
            return dAtt > 0 ? Math.round((dMade / dAtt) * 100) : null; // null if no league that day
        });

        sessionsInStreak.forEach(s => {
            if (s.summary) { totalMade += s.summary.made; totalAtt += s.summary.attempts; }
            else if (s.rounds) {
                totalMade += s.rounds.reduce((acc, r) => acc + (r.made || 0), 0);
                totalAtt += s.rounds.reduce((acc, r) => acc + (r.attempts || 0), 0);
            }
            s.rounds?.forEach(r => {
                const dist = r.distance;
                if (!distMap[dist]) distMap[dist] = { m: 0, a: 0, stations: new Set() };
                distMap[dist].m += r.made; distMap[dist].a += r.attempts;
                if (r.points) distMap[dist].stations.add(r.points);
            });
        });

        const distData = Object.entries(distMap).map(([dist, stats]) => ({
            distance: dist,
            made: stats.m,
            attempts: stats.a,
            pct: stats.a > 0 ? Math.round((stats.m / stats.a) * 100) : 0,
            stations: Array.from(stats.stations)
        })).sort((a, b) => parseInt(a.distance) - parseInt(b.distance));

        return {
            current: effectiveStreak,
            involvedDates,
            made: totalMade,
            att: totalAtt,
            pct: totalAtt > 0 ? Math.round((totalMade / totalAtt) * 100) : 0,
            distData,
            practiceTrend,
            leagueTrend
        };
    }, [history, streak]);
};