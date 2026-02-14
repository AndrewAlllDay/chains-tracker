import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import LoginLanding from './components/LoginLanding';
import RoleSelector from './components/RoleSelector';
import logoIcon from './assets/Dialed.svg';

// --- FIREBASE IMPORTS ---
import { db, auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

function App() {
  const ATTEMPTS_PER_ROUND = 5;

  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);

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

  const [alertState, setAlertState] = useState({
    isOpen: false, message: '', type: 'default', onConfirm: null
  });

  // --- EFFECTS: AUTH & DATA SYNC ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        setHistory([]);
        setUserRole(null);
        setNeedsRoleSelection(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // SAFETY GUARD: Default to empty array if history is missing
          setHistory(data.history || []);

          if (data.role) {
            setUserRole(data.role);
            setNeedsRoleSelection(false);
          } else {
            // ROLE IS MISSING: Show Selector
            setUserRole(null);
            setNeedsRoleSelection(true);
          }
        } else {
          // NEW USER: Default empty history and show selector
          setHistory([]);
          setUserRole(null);
          setNeedsRoleSelection(true);
        }
      }, (error) => {
        console.error("Firestore sync error:", error);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('currentDraft', JSON.stringify(currentRounds));
  }, [currentRounds]);

  // --- HELPER: SAVE DATA ---
  const saveHistoryToStorage = async (newHistory) => {
    setHistory(newHistory);
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), { history: newHistory }, { merge: true });
      } catch (e) {
        console.error("Error adding document: ", e);
        alert("Error saving to cloud!");
      }
    }
  };

  // --- HELPER: HANDLE ROLE SELECTION ---
  const handleRoleSelect = async (selectedRole) => {
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), { role: selectedRole }, { merge: true });
        setUserRole(selectedRole);
        setNeedsRoleSelection(false);
      } catch (e) {
        console.error("Error saving role:", e);
        alert("Error saving your choice!");
      }
    }
  };

  // --- HELPER: SAVE SINGLE SESSION ---
  const handleSaveSession = (newSession) => {
    setHistory(prevHistory => {
      const newHistory = [newSession, ...prevHistory];
      if (user) {
        setDoc(doc(db, "users", user.uid), { history: newHistory }, { merge: true })
          .catch(e => console.error("Error auto-saving session:", e));
      }
      return newHistory;
    });
  };

  // --- AUTH ACTIONS ---
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // --- SHARED LOGIC ---
  const increment = () => { if (made < ATTEMPTS_PER_ROUND) setMade(made + 1); };
  const decrement = () => { if (made > 0) setMade(made - 1); };

  // --- ALERT HELPERS ---
  const closeAlert = () => { setAlertState(prev => ({ ...prev, isOpen: false })); };

  const triggerConfirm = (message, onConfirm, type = 'default') => {
    setAlertState({ isOpen: true, message, type, onConfirm });
  };

  const handleAlertConfirm = () => {
    if (alertState.onConfirm) alertState.onConfirm();
    closeAlert();
  };

  // --- MODE STARTERS ---
  const startSingleSession = () => {
    setShowModal(false);
    setView('SINGLE_SESSION');
    setMade(0);
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
      [leagueRound]: { ...leagueScores[leagueRound], [activeStation]: made }
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

  const calculateLeagueScore = () => {
    let total = 0;
    Object.keys(leagueScores).forEach(r => {
      Object.entries(leagueScores[r]).forEach(([station, makes]) => {
        total += (makes * parseInt(station));
      });
    });
    return total;
  };

  const calculateRoundScore = () => {
    const currentScores = leagueScores[leagueRound] || {};
    return Object.entries(currentScores).reduce((total, [station, makes]) => {
      return total + (makes * parseInt(station));
    }, 0);
  };

  const finishLeague = () => {
    triggerConfirm("Finish League Night and Save Score?", () => {
      const finalScore = calculateLeagueScore();
      const newSession = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        type: 'LEAGUE',
        score: finalScore,
        details: leagueScores
      };
      const newHistory = [newSession, ...history];
      saveHistoryToStorage(newHistory);
      setView('HOME');
    });
  };

  const exitLeague = () => {
    triggerConfirm("Exit League? Progress will be lost.", () => {
      setView('HOME');
    }, 'danger');
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
    setCurrentRounds([newRound, ...currentRounds]);
    setMade(0);
  };

  const finishSession = () => {
    if (currentRounds.length === 0) { setView('HOME'); return; }

    triggerConfirm("Finish this session and save to history?", () => {
      const totalAtt = currentRounds.reduce((acc, r) => acc + r.attempts, 0);
      const totalMade = currentRounds.reduce((acc, r) => acc + r.made, 0);
      const newSession = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        type: 'PRACTICE',
        summary: { attempts: totalAtt, made: totalMade },
        rounds: currentRounds
      };
      const newHistory = [newSession, ...history];
      saveHistoryToStorage(newHistory);
      setCurrentRounds([]);
      setView('HOME');
    });
  };

  const exitSingleSession = () => {
    if (currentRounds.length === 0) { setView('HOME'); return; }
    triggerConfirm("Exit session? Unsaved rounds will be lost.", () => {
      setCurrentRounds([]);
      setView('HOME');
    }, 'danger');
  };

  const deleteHistorySession = (id) => {
    triggerConfirm("Delete this entire past session?", () => {
      const newHistory = history.filter(s => s.id !== id);
      saveHistoryToStorage(newHistory);
    }, 'danger');
  }

  const clearAllHistory = () => {
    triggerConfirm("⚠ WARNING: Delete ALL data? This cannot be undone.", () => {
      saveHistoryToStorage([]);
    }, 'danger');
  }

  // --- RENDER ---
  if (loading) return <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

  if (!user) {
    return <LoginLanding onLogin={handleLogin} />;
  }

  return (
    <div className="container">
      {/* HEADER */}
      <header style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '25px 0', marginBottom: '15px' }}>
        <div style={{ width: '150px', zIndex: 1 }}>
          <img src={logoIcon} alt="DIALED Logo" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <div style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', zIndex: 2, paddingBottom: '170px' }}>
          <button onClick={handleLogout} style={{
            padding: '8px 16px', fontSize: '0.8rem', background: 'transparent', color: '#6b7280',
            border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
          }}>Sign Out</button>
        </div>
      </header>

      {/* === VIEW LOGIC === */}
      {needsRoleSelection ? (
        <RoleSelector onSelect={handleRoleSelect} />
      ) : (
        <>
          {/* HOME VIEW: Only if role is set and history exists */}
          {view === 'HOME' && userRole && history && (
            <Dashboard
              user={user}
              userRole={userRole}
              history={history}
              startSingleSession={startSingleSession}
              startLeagueSession={startLeagueSession}
              deleteHistorySession={deleteHistorySession}
              clearAllHistory={clearAllHistory}
              saveSession={handleSaveSession}
            />
          )}

          {/* LEAGUE VIEW */}
          {view === 'LEAGUE' && (
            <>
              <div className="session-nav">
                <button className="back-link" onClick={exitLeague}>&larr; Exit</button>
                <div style={{ fontWeight: 'bold', color: 'var(--primary)', textAlign: 'center', fontSize: '1.2rem' }}>Round {leagueRound} / 3</div>
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
                      <button key={station} className={`station-btn ${hasScore ? 'done' : ''}`} onClick={() => openStation(station)}>
                        <div className="station-num">Station {station}</div>
                        <div className="station-pts">{station} pts/make</div>
                        {hasScore && <div className="station-result">{currentRoundScores[station]}/5</div>}
                      </button>
                    )
                  })}
                </div>
                <div className="league-actions" style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                  {leagueRound > 1 && <button className="secondary-btn" onClick={prevLeagueRound}>&larr; R{leagueRound - 1}</button>}
                  {leagueRound < 3 ? <button className="save-btn" onClick={nextLeagueRound}>Start Round {leagueRound + 1} &rarr;</button> : <button className="finish-btn" onClick={finishLeague}>Finish League Night</button>}
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
                    <button className="save-btn" style={{ marginTop: '25px' }} onClick={saveStationScore}>Save Station</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* SINGLE SESSION VIEW */}
          {view === 'SINGLE_SESSION' && (
            <>
              <div className="session-nav">
                <button className="back-link" onClick={exitSingleSession}>&larr; Exit</button>
                <div style={{ fontWeight: 'bold' }}>Rounds: {currentRounds.length}</div>
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
                    <label style={{ textAlign: 'center', marginBottom: '10px' }}>Putts Made (of {ATTEMPTS_PER_ROUND})</label>
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
                <>
                  <h3 className="section-title">Current Session ({currentRounds.length})</h3>
                  <ul className="history-list">
                    {currentRounds.map((r, i) => {
                      const isPerfect = r.made === r.attempts;
                      const isZero = r.made === 0;
                      return (
                        <li key={r.id} className={`history-item session-item ${isPerfect ? 'perfect-round' : ''} ${isZero ? 'bad-round' : ''}`}>
                          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {isPerfect && <span className="fire-icon">🔥</span>}
                              <span style={{ color: '#888', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                #{currentRounds.length - i}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <strong style={{ fontSize: '1.2rem', marginRight: '5px' }}>{r.made}/{r.attempts}</strong>
                              <span style={{ color: '#666', fontSize: '0.9rem' }}>@ {r.distance}ft</span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <button className="finish-btn" onClick={finishSession} style={{ marginTop: '20px' }}>Finish & Save Session</button>
                </>
              )}
            </>
          )}
        </>
      )}

      {/* MODALS & ALERTS */}
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

      {alertState.isOpen && (
        <div className="modal-overlay" onClick={closeAlert} style={{ zIndex: 2000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title" style={{ color: alertState.type === 'danger' ? '#ef4444' : 'inherit' }}>
              {alertState.type === 'danger' ? '⚠️ Warning' : 'Confirm'}
            </h3>
            <p style={{ marginBottom: '25px', fontSize: '1.1rem', lineHeight: '1.5' }}>{alertState.message}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="secondary-btn" onClick={closeAlert} style={{ flex: 1, margin: 0, justifyContent: 'center', backgroundColor: '#e5e7eb', color: '#1f2937', padding: '12px', fontSize: '1rem', fontWeight: '500' }}>Cancel</button>
              <button className={alertState.type === 'danger' ? 'delete-btn' : 'save-btn'} onClick={handleAlertConfirm} style={{ flex: 1, margin: 0, justifyContent: 'center', padding: '12px', fontSize: '1rem', fontWeight: '500' }}>
                {alertState.type === 'danger' ? 'Yes, Delete' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App;