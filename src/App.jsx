import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // 1. STATE: Load from LocalStorage or start empty
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('puttingSessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [distance, setDistance] = useState(20);
  const [attempts, setAttempts] = useState(10);
  const [made, setMade] = useState(0);

  // 2. EFFECT: Auto-save whenever 'sessions' changes
  useEffect(() => {
    localStorage.setItem('puttingSessions', JSON.stringify(sessions));
  }, [sessions]);

  // 3. ACTION: Add Session
  const addSession = (e) => {
    e.preventDefault();

    // Validation
    const numAttempts = parseInt(attempts);
    const numMade = parseInt(made);

    if (numMade > numAttempts) return alert("You can't make more than you attempt!");
    if (numAttempts < 1) return alert("Attempts must be at least 1");

    const newSession = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      distance,
      attempts: numAttempts,
      made: numMade
    };

    // Add to top of list
    setSessions([newSession, ...sessions]);
    setMade(0); // Reset 'Made' for rapid entry
  };

  // 4. ACTION: Delete Session
  const deleteSession = (id) => {
    if (confirm("Delete this entry?")) {
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  // 5. STATS CALCULATION
  const totalAttempts = sessions.reduce((acc, curr) => acc + curr.attempts, 0);
  const totalMade = sessions.reduce((acc, curr) => acc + curr.made, 0);
  const accuracy = totalAttempts === 0 ? 0 : Math.round((totalMade / totalAttempts) * 100);

  return (
    <div className="container">
      <header>
        <h1>Chains ⛓️</h1>
      </header>

      {/* STATS CARD */}
      <div className="card stats-grid">
        <div className="stat-box">
          <div className="stat-val">{totalAttempts}</div>
          <div className="stat-label">Total Putts</div>
        </div>
        <div className="stat-box">
          <div className="stat-val">{accuracy}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
      </div>

      {/* INPUT FORM CARD */}
      <div className="card">
        <form onSubmit={addSession}>
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

          <div className="form-group">
            <label>Attempts</label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={attempts}
              onChange={(e) => setAttempts(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Made</label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={made}
              onChange={(e) => setMade(e.target.value)}
            />
          </div>

          <button type="submit" className="save-btn">Log Session</button>
        </form>
      </div>

      {/* HISTORY LIST */}
      <div className="card">
        <h3>History</h3>
        {sessions.length === 0 ? (
          <p className="empty-state">No sessions yet. Go practice!</p>
        ) : (
          <ul className="history-list">
            {sessions.map(s => (
              <li key={s.id} className="history-item">
                <div className="history-info">
                  <span className="history-score">
                    {s.made}/{s.attempts} <span className="pct-badge">{Math.round((s.made / s.attempts) * 100)}%</span>
                  </span>
                  <span className="history-meta">{s.distance}ft • {s.date}</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteSession(s.id)}
                >✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App