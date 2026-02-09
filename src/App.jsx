import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const ATTEMPTS_PER_ROUND = 5;

  // --- STATE ---
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('puttingHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentRounds, setCurrentRounds] = useState(() => {
    const saved = localStorage.getItem('currentDraft');
    return saved ? JSON.parse(saved) : [];
  });

  const [leagueScores, setLeagueScores] = useState({ 1: {}, 2: {}, 3: {} });
  const [leagueRound, setLeagueRound] = useState(1);
  const [activeStation, setActiveStation] = useState(null);

  const [view, setView] = useState('HOME');
  const [showModal, setShowModal] = useState(false);

  const [distance, setDistance] = useState(20);
  const [made, setMade] = useState(0);

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('puttingHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('currentDraft', JSON.stringify(currentRounds));
  }, [currentRounds]);

  // --- SHARED LOGIC ---
  const increment = () => { if (made < ATTEMPTS_PER_ROUND) setMade(made + 1); };
  const decrement = () => { if (made > 0) setMade(made - 1); };

  // --- MODE STARTERS ---
  const startSingleSession = () => {
    setShowModal(false);
    setView('SINGLE_SESSION');
    setMade(0); // Reset stepper on start
  };

  const startLeagueSession = () => {
    setLeagueScores({ 1: {}, 2: {}, 3: {} });
    setLeagueRound(1);
    setShowModal(false);
    setView('LEAGUE');
  };

  // --- LEAGUE LOGIC ---
  const openStation = (stationNum) => {
    const currentScore = leagueScores[leagueRound][stationNum] || 0;
    setMade(currentScore);
    setActiveStation(stationNum);
  };

  const saveStationScore = () => {
    setLeagueScores({
      ...leagueScores,
      [leagueRound]: {
        ...leagueScores[leagueRound],
        [activeStation]: made
      }
    });
    setActiveStation(null);
  };

  const nextLeagueRound = () => {
    window.scrollTo(0, 0);
    setLeagueRound(leagueRound + 1);
  };

  const prevLeagueRound = () => {
    setLeagueRound(leagueRound - 1);
  };

  // 1. Calculate TOTAL Score
  const calculateLeagueScore = () => {
    let total = 0;
    Object.keys(leagueScores).forEach(r => {
      Object.entries(leagueScores[r]).forEach(([station, makes]) => {
        total += (makes * parseInt(station));
      });
    });
    return total;
  };

  // 2. Calculate CURRENT ROUND Score
  const calculateRoundScore = () => {
    const currentScores = leagueScores[leagueRound] || {};
    return Object.entries(currentScores).reduce((total, [station, makes]) => {
      return total + (makes * parseInt(station));
    }, 0);
  };

  const finishLeague = () => {
    if (confirm("Finish League Night and Save Score?")) {
      const finalScore = calculateLeagueScore();
      const newSession = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        type: 'LEAGUE',
        score: finalScore,
        details: leagueScores
      };
      setHistory([newSession, ...history]);
      setView('HOME');
    }
  };

  // --- SINGLE SESSION LOGIC ---
  const logRound = (e) => {
    e.preventDefault();
    const newRound = {
      id: Date.now(),
      distance,
      attempts: ATTEMPTS_PER_ROUND,
      made: made
    };
    // Add to top of list
    setCurrentRounds([newRound, ...currentRounds]);
    setMade(0); // Reset for next round
  };

  const finishSession = () => {
    if (currentRounds.length === 0) { setView('HOME'); return; }
    if (confirm("Finish this session and save to history?")) {
      const totalAtt = currentRounds.reduce((acc, r) => acc + r.attempts, 0);
      const totalMade = currentRounds.reduce((acc, r) => acc + r.made, 0);
      const newSession = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        type: 'PRACTICE',
        summary: { attempts: totalAtt, made: totalMade },
        rounds: currentRounds
      };
      setHistory([newSession, ...history]);
      setCurrentRounds([]);
      setView('HOME');
    }
  };

  const deleteHistorySession = (id) => {
    if (confirm("Delete this entire past session?")) setHistory(history.filter(s => s.id !== id));
  }

  const clearAllHistory = () => {
    if (confirm("⚠ WARNING: Delete ALL data?")) setHistory([]);
  }

  // --- RENDER ---
  return (
    <div className="container">
      <header>
        <h1>Chains ⛓️</h1>
      </header>

      {/* === VIEW: HOME === */}
      {view === 'HOME' && (
        <>
          <button className="big-start-btn" onClick={() => setShowModal(true)}>
            Start Session
          </button>

          {history.length > 0 && (
            <div className="card">
              <h3>Past Sessions</h3>
              <ul className="history-list">
                {history.map(session => {
                  if (session.type === 'LEAGUE') {
                    return (
                      <li key={session.id} className="history-item session-item">
                        <div style={{ width: '100%' }}>
                          <div className="session-header">
                            <span className="session-date">{session.date}</span>
                            <span className="session-badge league-badge">League</span>
                          </div>
                          <div className="session-details">
                            <strong>Total Score: {session.score}</strong> pts
                          </div>
                        </div>
                        <button className="delete-btn" onClick={() => deleteHistorySession(session.id)}>✕</button>
                      </li>
                    )
                  }

                  const sessPct = Math.round((session.summary.made / session.summary.attempts) * 100);
                  let badgeColor = sessPct >= 80 ? 'var(--primary)' : (sessPct > 50 ? '#d97706' : '#ef4444');

                  return (
                    <li key={session.id} className="history-item session-item">
                      <div style={{ width: '100%' }}>
                        <div className="session-header">
                          <span className="session-date">{session.date}</span>
                          <span className="session-badge" style={{ backgroundColor: badgeColor }}>{sessPct}%</span>
                        </div>
                        <div className="session-details">
                          {session.summary.made}/{session.summary.attempts} putts
                        </div>
                      </div>
                      <button className="delete-btn" onClick={() => deleteHistorySession(session.id)}>✕</button>
                    </li>
                  )
                })}
              </ul>
              <button className="reset-link" onClick={clearAllHistory}>Reset All Data</button>
            </div>
          )}
        </>
      )}

      {/* === MODAL: MODE SELECT === */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Select Mode</h2>
            <button className="mode-btn primary" onClick={startSingleSession}>Single Practice</button>
            <button className="mode-btn league" onClick={startLeagueSession}>Putting League 🏆</button>
            <button className="close-modal-btn" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* === VIEW: LEAGUE === */}
      {view === 'LEAGUE' && (
        <>
          <div className="session-nav">
            <button className="back-link" onClick={() => { if (confirm("Exit League? Progress will be lost.")) setView('HOME') }}>&larr; Exit</button>
            <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Round {leagueRound} / 3</div>
          </div>

          <div className="card">
            <div className="league-score-box">
              <div className="score-item">
                <span className="league-label">Round {leagueRound}</span>
                <span className="league-total">{calculateRoundScore()}</span>
              </div>
              <div className="score-divider"></div>
              <div className="score-item">
                <span className="league-label">Total</span>
                <span className="league-total">{calculateLeagueScore()}</span>
              </div>
            </div>

            <div className="station-grid">
              {[1, 2, 3, 4, 5].map(station => {
                const currentRoundScores = leagueScores[leagueRound] || {};
                const hasScore = currentRoundScores[station] !== undefined;

                return (
                  <button
                    key={station}
                    className={`station-btn ${hasScore ? 'done' : ''}`}
                    onClick={() => openStation(station)}
                  >
                    <div className="station-num">Station {station}</div>
                    <div className="station-pts">{station} pts/make</div>
                    {hasScore && <div className="station-result">{currentRoundScores[station]}/5</div>}
                  </button>
                )
              })}
            </div>

            <div className="league-actions" style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
              {leagueRound > 1 && (
                <button className="secondary-btn" onClick={prevLeagueRound}>
                  &larr; R{leagueRound - 1}
                </button>
              )}

              {leagueRound < 3 ? (
                <button className="save-btn" onClick={nextLeagueRound}>
                  Start Round {leagueRound + 1} &rarr;
                </button>
              ) : (
                <button className="finish-btn" onClick={finishLeague}>
                  Finish League Night
                </button>
              )}
            </div>

          </div>

          {activeStation && (
            <div className="modal-overlay" onClick={() => setActiveStation(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">Station {activeStation}</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>Worth {activeStation} pts per make</p>

                <div className="stepper-controls">
                  <button type="button" className="step-btn minus" onClick={decrement} disabled={made === 0}>−</button>
                  <div className="step-display">{made}</div>
                  <button type="button" className="step-btn plus" onClick={increment} disabled={made === ATTEMPTS_PER_ROUND}>+</button>
                </div>

                <button className="save-btn" style={{ marginTop: '25px' }} onClick={saveStationScore}>
                  Save Station
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* === VIEW: SINGLE SESSION === */}
      {view === 'SINGLE_SESSION' && (
        <>
          <div className="session-nav">
            <button className="back-link" onClick={() => { if (currentRounds.length === 0 || confirm("Exit?")) { setCurrentRounds([]); setView('HOME') } }}>&larr; Exit</button>
            <div style={{ fontWeight: 'bold' }}>
              Rounds: {currentRounds.length}
            </div>
          </div>

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

          {currentRounds.length > 0 && (
            <div className="card active-session-card">
              <h3>Current Session ({currentRounds.length})</h3>
              <ul className="history-list">
                {currentRounds.map((r, i) => (
                  <li key={r.id} className="history-item">
                    <div className="history-info">
                      <span style={{ marginRight: '10px', color: '#888', fontWeight: 'bold' }}>
                        #{currentRounds.length - i}
                      </span>
                      <strong>{r.made}/{r.attempts}</strong> at {r.distance}ft
                    </div>
                  </li>
                ))}
              </ul>
              <button className="finish-btn" onClick={finishSession}>Finish & Save Session</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App