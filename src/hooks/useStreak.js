import { useMemo } from 'react';

export const useStreak = (history = []) => {
    // 1. Calculate the raw consecutive days
    const consecutiveDays = useMemo(() => {
        if (!history || history.length === 0) return 0;

        // Filter for Practice sessions (including Around the World)
        const practiceHistory = history.filter(s => s.type === 'PRACTICE');
        if (practiceHistory.length === 0) return 0;

        const dates = [...new Set(practiceHistory.map(s => s.date))].sort((a, b) => new Date(b) - new Date(a));
        const today = new Date().toLocaleDateString('en-US');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-US');

        // Streak is dead if no activity today OR yesterday
        if (dates[0] !== today && dates[0] !== yesterdayStr) return 0;

        let count = 0;
        let checkDate = new Date(dates[0]);

        for (let i = 0; i < dates.length; i++) {
            if (new Date(dates[i]).toLocaleDateString('en-US') === checkDate.toLocaleDateString('en-US')) {
                count++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return count;
    }, [history]);

    // 2. Only count it as an official "streak" for the UI if it's 2 or more days
    const streak = consecutiveDays >= 2 ? consecutiveDays : 0;

    // 3. Calculate the milestone message based on the raw days
    const streakMilestone = useMemo(() => {
        // --- NO ACTIVITY ---
        if (consecutiveDays === 0) {
            return { title: "Cold Start", msg: "No active streak right now. Grab your putters and get Dialed!" };
        }

        // --- EXACT MILESTONES (The Surprises) ---
        if (consecutiveDays === 30) return { title: "Legendary Consistency", msg: "A full month of progress. You are officially in the top tier of dedicated putters!" };
        if (consecutiveDays === 21) return { title: "Disc Golf Addict", msg: "Three weeks down. This isn't just practice anymore; it's a lifestyle." };
        if (consecutiveDays === 14) return { title: "Fortnight of Fire", msg: "Two weeks straight! Your muscle memory is locking in." };
        if (consecutiveDays === 7) return { title: "Weekly Warrior", msg: "Seven days in a row. That’s a full cycle of commitment—don't stop now!" };
        if (consecutiveDays === 3) return { title: "Building Momentum", msg: "Three days deep. The hardest part is starting, and you've already cleared that hurdle." };
        if (consecutiveDays === 2) return { title: "Double Down", msg: "Back-to-back days! You've officially started a streak." };

        // Note: We still want to encourage them on day one, even though 'streak' is outputting 0 for the UI pill!
        if (consecutiveDays === 1) return { title: "Day One", msg: "The journey begins. Log another session tomorrow to officially start your streak!" };

        // --- THE IN-BETWEEN (Generic Encouragement) ---
        // No more "next goal" spoilers.
        return {
            title: "Dialed In",
            msg: `You've got a ${streak}-day streak going. Every putt today is building a better game for tomorrow.`
        };
    }, [consecutiveDays, streak]);

    // 4. Final return for the hook
    return { streak, streakMilestone };
};