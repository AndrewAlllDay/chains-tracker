import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const ATTEMPTS_PER_ROUND = 5;

  // 1. STATE
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('puttingHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentRounds, setCurrentRounds] = useState(() => {
    const saved = localStorage.getItem('currentDraft');
    return saved ? JSON.parse(saved) : [];
  });

  const [distance, setDistance] = useState(20);
  const [made, setMade] = useState(0);

  // 2. EFFECTS
  useEffect(() => {
    localStorage.setItem('puttingHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('currentDraft', JSON.stringify(currentRounds));
  }, [currentRounds]);

  // 3. LOGIC
  const increment = () => { if (made < ATTEMPTS_PER_ROUND) setMade(made + 1); };
  const decrement = () => { if (made > 0) setMade(made - 1); };

  const logRound = (e) => {
    e.preventDefault();
    const newRound = {
      id: Date.now(),
      distance,
      attempts: ATTEMPTS_PER_ROUND,
      made: made
    };
    setCurrentRounds([newRound, ...currentRounds]);
    setMade(0);
  };

  const finishSession = () => {
    if (currentRounds.length === 0) return;
    if (confirm("Finish this session and save to history?")) {
      const totalAtt = currentRounds.reduce((acc, r) => acc + r.attempts, 0);
      const totalMade = currentRounds.reduce((acc, r) => acc + r.made, 0);

      const newSession = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        rounds: currentRounds,
        summary: { attempts: totalAtt, made: totalMade }
      };

      setHistory([newSession, ...history]);
      setCurrentRounds([]);
    }
  };

  const deleteDraftRound = (id) => setCurrentRounds(currentRounds.filter(r => r.id !== id));

  const deleteHistorySession = (id) => {
    if (confirm("Delete this entire past session?")) setHistory(history.filter(s => s.id !== id));
  }

  const clearAllHistory = () => {
    if (confirm("⚠ WARNING: This will permanently delete ALL lifetime stats and past sessions. Are you sure?")) {
      setHistory([]);
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Chains ⛓️</h1>
      </header>

      {/* INPUT AREA (Now at the top) */}
      <div className="card input-card">
        <form onSubmit={logRound}>
          <div className="form-group">
            <label>Distance</label>
            <select value={distance} onChange={(e) => setDistance(e.target.value)}>
              <option value="15">15 ft</option>
              <option value="20">20 ft (C1)</option>
              <option value="25">25 ft</option>
              <option value="33">33 ft (C1 Edge)</option>
              <option value="40">40 ft (C2)</option>
            </select>
          </div>

          <div className="stepper-container">
            <label style={{ textAlign: 'center', marginBottom: '10px' }}>
              Putts Made (of {ATTEMPTS_PER_ROUND})
            </label>
            <div className="stepper-controls">
              <button type="button" className="step-btn minus" onClick={decrement} disabled={made === 0}>−</button>
              <div className="step-display">{made}</div>
              <button type="button" className="step-btn plus" onClick={increment} disabled={made === ATTEMPTS_PER_ROUND}>+</button>
            </div>
          </div>

          <button type="submit" className="save-btn">Log Round</button>
        </form>
      </div>

      {/* ACTIVE SESSION */}
      {currentRounds.length > 0 && (
        <div className="card active-session-card">
          <h3>Current Session</h3>
          <ul className="history-list">
            {currentRounds.map(r => (
              <li key={r.id} className="history-item">
                <div className="history-info">
                  <strong>{r.made}/{r.attempts}</strong> at {r.distance}ft
                </div>
                <button className="delete-btn" onClick={() => deleteDraftRound(r.id)}>✕</button>
              </li>
            ))}
          </ul>
          <div className="session-summary">
            Total: {currentRounds.reduce((a, c) => a + c.made, 0)} / {currentRounds.reduce((a, c) => a + c.attempts, 0)}
          </div>
          <button className="finish-btn" onClick={finishSession}>Finish & Save Session</button>
        </div>
      )}
      {/* PAST HISTORY */}
      <div className="card">
        <h3>Past Sessions</h3>
        {history.length === 0 ? (
          <p className="empty-state">No saved sessions.</p>
        ) : (
          <ul className="history-list">
            {history.map(session => {
              // 1. Calculate Percentage
              const sessPct = Math.round((session.summary.made / session.summary.attempts) * 100);

              // 2. Traffic Light Logic
              let badgeColor = '#ef4444'; // Default Red (<= 50%)

              if (sessPct >= 80) {
                badgeColor = 'var(--primary)'; // Green (>= 80%)
              } else if (sessPct > 50) {
                badgeColor = '#d97706'; // Dark Amber/Yellow (51% - 79%)
              }

              return (
                <li key={session.id} className="history-item session-item">
                  <div style={{ width: '100%', paddingRight: '20px' }}>
                    <div className="session-header">
                      <span className="session-date">{session.date}</span>

                      <span
                        className="session-badge pr-5"
                        style={{ backgroundColor: badgeColor }}
                      >
                        {sessPct}%
                      </span>
                    </div>
                    <div className="session-details">
                      {session.summary.made} of {session.summary.attempts} total putts
                    </div>
                  </div>
                  <button className="delete-btn" onClick={() => deleteHistorySession(session.id)}>✕</button>
                </li>
              )
            })}
          </ul>
        )}

        {history.length > 0 && (
          <button className="reset-link" onClick={clearAllHistory}>Reset All Data</button>
        )}
      </div>
    </div>
  )
}

export default App