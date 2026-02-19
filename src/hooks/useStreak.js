import { useMemo } from 'react';

export const useStreak = (history = []) => {
    // 1. Calculate the numerical streak
    const streak = useMemo(() => {
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

    // 2. Calculate the milestone message based on the streak number
    const streakMilestone = useMemo(() => {
        if (streak >= 30) {
            return { title: "Legendary Consistency", msg: "A full month of progress. You are officially in the top tier of dedicated putters!" };
        }
        if (streak >= 21) {
            return { title: "Disc Golf Addict", msg: "Three weeks down. This isn't just practice anymore; it's a lifestyle." };
        }
        if (streak >= 14) {
            return { title: "Fortnight of Fire", msg: "Two weeks straight! Your muscle memory is locking in." };
        }
        if (streak >= 7) {
            return { title: "Weekly Warrior", msg: "Seven days in a row. That’s a full cycle of commitment—don't stop now!" };
        }
        if (streak >= 3) {
            return { title: "Building Momentum", msg: "Three days deep. The hardest part is starting, and you've already cleared that hurdle." };
        }
        if (streak === 2) {
            return { title: "Double Down", msg: "Back-to-back days! You've officially started a streak." };
        }
        if (streak === 1) {
            return { title: "Day One", msg: "The journey begins. Log another session tomorrow to keep the flame alive." };
        }

        return { title: "Cold Start", msg: "No active streak right now. Grab your putters and get Dialed!" };
    }, [streak]);

    // 3. Final return for the hook
    return { streak, streakMilestone };
};