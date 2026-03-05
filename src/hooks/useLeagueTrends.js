import { useMemo } from 'react';

export const useLeagueTrends = (history) => {
    return useMemo(() => {
        const ls = history?.filter(s => s.type === 'LEAGUE')
            .sort((a, b) => new Date(b.date) - new Date(a.date)) || [];

        if (!ls.length) return null;

        const granularSessions = ls.filter(s => !s.isLegacy);
        const sums = { 1: 0, 2: 0, 3: 0 };
        let c1M = 0, c1A = 0, c2M = 0, c2A = 0;

        // NEW: Track stats per station (1-5)
        const stationMap = {
            1: { made: 0, att: 0, dist: 18 },
            2: { made: 0, att: 0, dist: 25 },
            3: { made: 0, att: 0, dist: 25 },
            4: { made: 0, att: 0, dist: 33 },
            5: { made: 0, att: 0, dist: 40 }
        };

        granularSessions.forEach(s => {
            [1, 2, 3].forEach(r => {
                const roundDetails = s.details?.[r] || {};

                // Calculate round averages
                sums[r] += Object.entries(roundDetails).reduce((acc, [st, val]) => acc + (val * st), 0);

                // Calculate Circle Accuracy & Station Ratios
                [1, 2, 3, 4, 5].forEach(st => {
                    const made = roundDetails[st] || 0;
                    const att = 5; // Standard 5 putts per station

                    // Circle 1 (Stations 1, 2, 3)
                    if (st <= 3) { c1M += made; c1A += att; }
                    // Circle 2 (Stations 4, 5)
                    else { c2M += made; c2A += att; }

                    // Individual Station Tracking
                    if (stationMap[st]) {
                        stationMap[st].made += made;
                        stationMap[st].att += att;
                    }
                });
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

        // Format station stats for the UI
        const stationStats = Object.entries(stationMap).map(([id, data]) => ({
            id,
            dist: data.dist,
            made: data.made,
            attempts: data.att,
            pct: data.att > 0 ? Math.round((data.made / data.att) * 100) : 0
        }));

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
            stationStats,
            trend,
            seasonAvg,
            personalBest
        };
    }, [history]);
};