import { useState } from 'react';

export const useOnboarding = (userSettings, updateSettings, history = []) => {
    const [localDismiss, setLocalDismiss] = useState(false);
    const [localPostSessionDismiss, setLocalPostSessionDismiss] = useState(false);

    // 1. Initial Onboarding Logic (Welcome)
    const showOnboarding =
        userSettings &&
        userSettings.hasCompletedOnboarding === false &&
        !localDismiss;

    // 2. First Session Logic (The Wrench)
    // Production logic restored: Will hide instantly on Step 5 dismiss
    const showFirstSessionOverlay =
        userSettings &&
        userSettings.hasCompletedOnboarding === true &&
        history.length > 0 &&
        userSettings.hasSeenPostSessionCoach !== true &&
        !localPostSessionDismiss;

    const completeOnboarding = async () => {
        setLocalDismiss(true);
        if (updateSettings) {
            await updateSettings({ ...userSettings, hasCompletedOnboarding: true });
        }
    };

    const completePostSessionCoach = async () => {
        setLocalPostSessionDismiss(true); // Instantly hides the overlay locally
        if (updateSettings) {
            await updateSettings({ ...userSettings, hasSeenPostSessionCoach: true }); // Saves to Firebase
        }
    };

    return {
        showOnboarding,
        showFirstSessionOverlay,
        completeOnboarding,
        completePostSessionCoach
    };
};