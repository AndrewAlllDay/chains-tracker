import React from 'react';

export default function PostSessionCoachOverlay({ onDismiss, userRole, currentStepIndex, setCurrentStepIndex }) {

    const getStepContent = (index) => {
        const isCoach = userRole === 'coach';
        const contents = [
            isCoach
                ? "Your student's first session is tracked below. Tap any entry to analyze the round data."
                : "Your first session is in the books! Check out the list below to see your progress and stats.",
            "Tap this button to see performance charts. As more rounds are logged, you'll see accuracy climb!",
            "See this fire icon? That's the streak. Practice at least once every 24 hours to keep the flame alive!",
            isCoach
                ? "Access coaching tips and drill layouts here to help your students improve."
                : "Need a refresher on rules or distances? The Guide is always available at the top left.",
            "Toggle between Pro and Standard scoring or change your role anytime in the settings menu."
        ];
        return contents[index];
    };

    const tourSteps = [
        // STEP 1: Activity List (Top)
        {
            title: "Activity Logged!",
            justify: 'flex-start',
            padding: '140px 20px 20px 20px'
        },
        // STEP 2: Trends (Back to the Top)
        {
            title: "View Your Trends",
            justify: 'flex-start',
            padding: '140px 20px 20px 20px'
        },
        // STEP 3: Streak Badge (Bottom anchored, lifted 200px)
        {
            title: "Stay Consistent!",
            justify: 'flex-end',
            padding: '20px 20px 200px 20px'
        },
        // STEP 4: Guide (Top)
        {
            title: "The Guide",
            justify: 'flex-start',
            padding: '140px 20px 20px 20px'
        },
        // STEP 5: Settings (Top)
        {
            title: "Settings",
            justify: 'flex-start',
            padding: '140px 20px 20px 20px'
        }
    ];

    const handleNext = () => {
        if (currentStepIndex < tourSteps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            onDismiss();
        }
    };

    const currentTour = tourSteps[currentStepIndex];

    return (
        <div
            className="onboarding-overlay"
            onClick={handleNext}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 5000,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: currentTour.justify,
                padding: currentTour.padding,
                boxSizing: 'border-box'
            }}
        >
            <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '10px', color: 'white' }}>
                    {currentTour.title}
                </h2>
                <p style={{ fontSize: '1.2rem', color: 'white', opacity: 0.9, lineHeight: '1.6' }}>
                    {getStepContent(currentStepIndex)}
                </p>
                <div style={{
                    marginTop: '20px',
                    fontSize: '0.8rem',
                    color: 'white',
                    fontWeight: '800',
                    opacity: 0.6,
                    textTransform: 'uppercase'
                }}>
                    Step {currentStepIndex + 1} of 5 • Tap to continue
                </div>
            </div>
        </div>
    );
}