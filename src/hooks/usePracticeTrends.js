import { useMemo } from 'react';

export const usePracticeTrends = (history) => {
    return useMemo(() => {
        const ps = history?.filter(s => s.type === 'PRACTICE')
            .sort((a, b) => new Date(a.date) - new Date(b.date)) || [];

        if (!ps.length) return null;

        let totalMade = 0;
        let totalAtt = 0;
        const distStats = {};

        // Calculate session accuracies and limit to the MOST RECENT 10
        const sessionTrend = ps.map(s => {
            const made = s.summary?.made || 0;
            const att = s.summary?.attempts || 0;
            return att > 0 ? Math.round((made / att) * 100) : 0;
        }).slice(-10);

        ps.forEach(s => {
            totalMade += s.summary?.made || 0;
            totalAtt += s.summary?.attempts || 0;

            s.rounds?.forEach(r => {
                const d = r.distance;
                if (!distStats[d]) distStats[d] = { m: 0, a: 0 };
                // Ensure we are adding numbers to prevent NaN
                distStats[d].m += (Number(r.made) || 0);
                distStats[d].a += (Number(r.attempts) || 0);
            });
        });

        const overallPct = totalAtt > 0 ? Math.round((totalMade / totalAtt) * 100) : 0;

        const distances = Object.entries(distStats).map(([dist, stats]) => ({
            distance: dist,
            pct: stats.a > 0 ? Math.round((stats.m / stats.a) * 100) : 0,
            attempts: stats.a,
            made: stats.m
        })).sort((a, b) => parseInt(a.distance) - parseInt(b.distance));

        // Only highlight a "Best Distance" if you have at least 10 putts there
        const bestDist = [...distances].filter(d => d.attempts >= 10).sort((a, b) => b.pct - a.pct)[0] || null;

        return {
            overallPct,
            sessionTrend,
            distances,
            bestDist
        };
    }, [history]);
};