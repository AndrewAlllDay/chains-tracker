import { useMemo } from 'react';

export const useStreakStats = (history, streak) => {
    return useMemo(() => {
        const practiceHistory = (history || []).filter(s => s.type === 'PRACTICE');

        if (practiceHistory.length === 0 || streak === 0)
            return { current: 0, involvedDates: [], made: 0, att: 0, pct: 0, distData: [], dailyTrend: [] };

        const dates = [...new Set(practiceHistory.map(s => s.date))].sort((a, b) => new Date(b) - new Date(a));
        const involvedDates = dates.slice(0, streak);
        const chronologicalDates = [...involvedDates].reverse();

        const sessionsInStreak = practiceHistory.filter(s => involvedDates.includes(s.date));
        let totalMade = 0;
        let totalAtt = 0;
        const distMap = {};

        const dailyTrend = chronologicalDates.map(date => {
            const daySessions = practiceHistory.filter(s => s.date === date);
            let dMade = 0;
            let dAtt = 0;
            daySessions.forEach(s => {
                dMade += s.summary?.made || 0;
                dAtt += s.summary?.attempts || 0;
            });
            return dAtt > 0 ? Math.round((dMade / dAtt) * 100) : 0;
        });

        sessionsInStreak.forEach(s => {
            totalMade += s.summary?.made || 0;
            totalAtt += s.summary?.attempts || 0;
            s.rounds?.forEach(r => {
                if (!distMap[r.distance]) distMap[r.distance] = { m: 0, a: 0 };
                distMap[r.distance].m += r.made;
                distMap[r.distance].a += r.attempts;
            });
        });

        const distData = Object.entries(distMap)
            .map(([dist, stats]) => ({
                distance: dist,
                made: stats.m,
                attempts: stats.a,
                pct: Math.round((stats.m / stats.a) * 100)
            }))
            .sort((a, b) => parseInt(a.distance) - parseInt(b.distance));

        return {
            current: streak,
            involvedDates,
            made: totalMade,
            att: totalAtt,
            pct: totalAtt > 0 ? Math.round((totalMade / totalAtt) * 100) : 0,
            distData,
            dailyTrend
        };
    }, [history, streak]);
};