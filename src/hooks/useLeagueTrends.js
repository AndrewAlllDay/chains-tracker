import { useMemo } from 'react';

export const useLeagueTrends = (history) => {
    return useMemo(() => {
        const ls = history?.filter(s => s.type === 'LEAGUE')
            .sort((a, b) => new Date(b.date) - new Date(a.date)) || [];

        if (!ls.length) return null;

        const granularSessions = ls.filter(s => !s.isLegacy);
        const sums = { 1: 0, 2: 0, 3: 0 };
        let c1M = 0, c1A = 0, c2M = 0, c2A = 0;

        granularSessions.forEach(s => {
            [1, 2, 3].forEach(r => {
                sums[r] += Object.entries(s.details?.[r] || {}).reduce((acc, [k, v]) => acc + (v * k), 0);
                [1, 2, 3].forEach(st => { c1M += (s.details?.[r]?.[st] || 0); c1A += 5; });
                [4, 5].forEach(st => { c2M += (s.details?.[r]?.[st] || 0); c2A += 5; });
            });
        });

        const getSessionTotal = (s) => {
            if (s.isLegacy) return s.totalScore;
            return [1, 2, 3].reduce((acc, r) =>
                acc + Object.entries(s.details?.[r] || {}).reduce((sum, [k, v]) => sum + (v * k), 0), 0
            );
        };

        const allTotals = ls.map(s => getSessionTotal(s));
        const seasonAvg = Math.round(allTotals.reduce((a, b) => a + b, 0) / allTotals.length);
        const personalBest = Math.max(...allTotals);

        const avgsCount = granularSessions.length || 1;
        const avgs = {
            1: Math.round(sums[1] / avgsCount),
            2: Math.round(sums[2] / avgsCount),
            3: Math.round(sums[3] / avgsCount)
        };

        let trend = null;
        if (ls.length >= 2) {
            const latestTotal = getSessionTotal(ls[0]);
            const previousTotal = getSessionTotal(ls[1]);
            const diff = latestTotal - previousTotal;
            trend = { diff: diff > 0 ? `+${diff}` : diff, isPositive: diff >= 0, latestTotal, previousTotal };
        }

        return {
            averages: avgs,
            hasGranular: granularSessions.length > 0,
            maxAvg: Math.max(...Object.values(avgs)),
            c1: { pct: c1A > 0 ? Math.round((c1M / c1A) * 100) : 0 },
            c2: { pct: c2A > 0 ? Math.round((c2M / c2A) * 100) : 0 },
            trend,
            seasonAvg,
            personalBest
        };
    }, [history]);
};