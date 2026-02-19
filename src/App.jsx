import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import LoginLanding from './components/LoginLanding';
import RoleSelector from './components/RoleSelector';
import PracticeSession from './components/scoring/PracticeSession';
import LeagueSession from './components/scoring/LeagueSession';
import AppGuide from './components/AppGuide';
import logoIcon from './assets/Dialed.svg';

// --- FIREBASE IMPORTS ---
import { db, auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const CURRENT_VERSION = 2.0; // Increment this to trigger new "What's New" popups

function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [view, setView] = useState('HOME');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    type: 'default',
    onConfirm: null,
    onSecondary: null,
    secondaryText: '',
    isModeSelection: false
  });

  // --- EFFECTS ---
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
          const sortedHistory = (data.history || []).sort((a, b) => new Date(b.date) - new Date(a.date));
          setHistory(sortedHistory);

          if (!data.lastSeenVersion || data.lastSeenVersion < CURRENT_VERSION) {
            setShowUpdateModal(true);
          }

          if (data.role) {
            setUserRole(data.role);
            setNeedsRoleSelection(false);
          } else {
            setUserRole(null);
            setNeedsRoleSelection(true);
          }
        } else {
          setHistory([]);
          setUserRole(null);
          setNeedsRoleSelection(true);
          setShowUpdateModal(true);
        }
      }, (error) => {
        console.error("Firestore sync error:", error);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // --- HELPERS ---
  const handleDismissUpdate = async () => {
    setShowUpdateModal(false);
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          lastSeenVersion: CURRENT_VERSION
        }, { merge: true });
      } catch (e) {
        console.error("Error saving version flag:", e);
      }
    }
  };

  const saveHistoryToStorage = async (newSessionOrHistory) => {
    let updatedHistory;
    const sortByDate = (list) => [...list].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (Array.isArray(newSessionOrHistory)) {
      updatedHistory = sortByDate(newSessionOrHistory);
      setHistory(updatedHistory);
    } else {
      setHistory((prevHistory) => {
        updatedHistory = sortByDate([newSessionOrHistory, ...prevHistory]);
        return updatedHistory;
      });
    }

    if (user) {
      try {
        setTimeout(async () => {
          await setDoc(doc(db, "users", user.uid), { history: updatedHistory }, { merge: true });
        }, 200);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  };

  const handleRoleSelect = async (selectedRole) => {
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), { role: selectedRole }, { merge: true });
        setUserRole(selectedRole);
        setNeedsRoleSelection(false);
      } catch (e) {
        console.error("Error saving role:", e);
      }
    }
  };

  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); }
    catch (error) { console.error("Login failed", error); }
  };

  const handleLogout = async () => { await signOut(auth); };

  const closeAlert = () => { setAlertState(prev => ({ ...prev, isOpen: false })); };

  const triggerModeSelect = () => {
    setAlertState({
      isOpen: true,
      isModeSelection: true,
      message: "Choose your practice mode:",
      onConfirm: () => setView('SINGLE_SESSION'),
      confirmText: 'Standard',
      onSecondary: () => setView('WORLD_SESSION'),
      secondaryText: 'Around the World'
    });
  };

  const triggerConfirm = (message, onConfirm, type = 'default') => {
    setAlertState({
      isOpen: true,
      isModeSelection: false,
      message,
      type,
      onConfirm,
      confirmText: 'Confirm',
      onSecondary: closeAlert,
      secondaryText: 'Cancel'
    });
  };

  // --- NAVIGATION ---
  const startSingleSession = () => triggerModeSelect();
  const startLeagueSession = () => setView('LEAGUE');

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

  if (loading) return <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return <LoginLanding onLogin={handleLogin} />;

  return (
    <div className="container">
      {view === 'HOME' && (
        <header style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px 0', marginBottom: '15px' }}>
          <div style={{ position: 'absolute', left: '0', top: '10px', zIndex: 2 }}>
            <button onClick={() => setShowGuideModal(true)} className="secondary-btn" style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'transparent', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600' }}>
              Guide
            </button>
          </div>
          <div style={{ width: '150px', zIndex: 1, marginTop: '10px' }}>
            <img src={logoIcon} alt="DIALED Logo" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
          <div style={{ position: 'absolute', right: '0', top: '10px', zIndex: 2 }}>
            <button onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'transparent', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600' }}>
              Sign Out
            </button>
          </div>
        </header>
      )}

      {needsRoleSelection ? (
        <RoleSelector onSelect={handleRoleSelect} />
      ) : (
        <>
          {view === 'HOME' && (
            <Dashboard
              user={user}
              userRole={userRole}
              history={history}
              startSingleSession={startSingleSession}
              startLeagueSession={startLeagueSession}
              deleteHistorySession={deleteHistorySession}
              clearAllHistory={clearAllHistory}
              saveSession={(sess) => saveHistoryToStorage(sess)}
            />
          )}

          {view === 'LEAGUE' && (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '85vh', width: '100%' }}>
              <LeagueSession
                onSave={(sessionData, finalScore) => {
                  const calc = (r) => Object.entries(sessionData[r] || {}).reduce((acc, [st, m]) => acc + (m * parseInt(st)), 0);
                  const newSession = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString('en-US'),
                    type: 'LEAGUE',
                    score: finalScore,
                    roundScores: [calc(1), calc(2), calc(3)],
                    details: sessionData
                  };
                  saveHistoryToStorage(newSession);
                  setView('HOME');
                }}
                onCancel={() => triggerConfirm("Exit League? Progress will be lost.", () => setView('HOME'), 'danger')}
              />
            </div>
          )}

          {view === 'SINGLE_SESSION' && (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '85vh', width: '100%' }}>
              <PracticeSession
                initialMode="STANDARD"
                onSave={(finalData) => {
                  const totalAtt = finalData.reduce((acc, r) => acc + r.attempts, 0);
                  const totalMade = finalData.reduce((acc, r) => acc + r.made, 0);
                  saveHistoryToStorage({
                    id: Date.now(),
                    date: new Date().toLocaleDateString('en-US'),
                    type: 'PRACTICE',
                    summary: { attempts: totalAtt, made: totalMade },
                    rounds: finalData
                  });
                  setView('HOME');
                }}
                onCancel={() => setView('HOME')}
              />
            </div>
          )}

          {view === 'WORLD_SESSION' && (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '85vh', width: '100%' }}>
              <PracticeSession
                initialMode="WORLD"
                onSave={(finalData) => {
                  const totalAtt = finalData.reduce((acc, r) => acc + r.attempts, 0);
                  const totalMade = finalData.reduce((acc, r) => acc + r.made, 0);
                  saveHistoryToStorage({
                    id: Date.now(),
                    date: new Date().toLocaleDateString('en-US'),
                    type: 'PRACTICE',
                    subType: 'WORLD',
                    summary: { attempts: totalAtt, made: totalMade },
                    rounds: finalData
                  });
                  setView('HOME');
                }}
                onCancel={() =>
                  triggerConfirm(
                    `Exit Around the World?
Progress will be lost.`,
                    () => setView('HOME'),
                    'danger'
                  )
                }
              />
            </div>
          )}
        </>
      )}

      <AppGuide isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} userRole={userRole} />

      {showUpdateModal && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎯</div>
            <h2 style={{ marginBottom: '10px', fontWeight: '900' }}>New Practice <br /> Mode Unlocked!</h2>
            <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '20px' }}>
              Take your practice to the next level with <strong>Around the World</strong>—a structured putting challenge with dynamic difficulty.
            </p>
            <ul style={{ textAlign: 'left', fontSize: '0.9rem', marginBottom: '25px', color: '#4b5563', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>🔄 <strong>Dynamic Flow</strong>: Success moves out in the orbit; misses bring you in.</li>
              <li style={{ marginBottom: '8px' }}>🗺️ <strong>Visual Progress</strong>: Real-time station map tracking.</li>
              <li>📈 <strong>Integrated Stats</strong>: Sessions count toward your streaks and accuracy.</li>
            </ul>
            <button
              className="save-btn"
              onClick={handleDismissUpdate}
              style={{ width: '100%', padding: '16px', borderRadius: '12px' }}
            >
              Let's Go!
            </button>
          </div>
        </div>
      )}

      {alertState.isOpen && (
        <div className="modal-overlay" onClick={closeAlert} style={{ zIndex: 2000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title" style={{
              color: alertState.type === 'danger' ? '#ef4444' : '#1f2937'
            }}>
              {alertState.isModeSelection ? 'Mode Selection' : (alertState.type === 'danger' ? '⚠️ Warning' : 'Confirm')}
            </h3>

            <p style={{
              marginBottom: '25px',
              fontSize: '1.1rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-line'
            }}>
              {alertState.message}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => { alertState.onConfirm(); closeAlert(); }}
                className={!alertState.isModeSelection ? "save-btn" : ""}
                style={{
                  padding: '15px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: '800',
                  cursor: 'pointer',
                  ...(alertState.isModeSelection ? {
                    backgroundColor: '#e5e7eb',
                    color: '#1f2937',
                    textTransform: 'none'
                  } : {
                    backgroundColor: alertState.type === 'danger' ? '#ef4444' : undefined
                  })
                }}
              >
                {alertState.confirmText}
              </button>

              <button
                onClick={() => {
                  if (alertState.onSecondary) alertState.onSecondary();
                  closeAlert();
                }}
                style={{
                  padding: '15px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: '800',
                  textTransform: 'none',
                  cursor: 'pointer',
                  backgroundColor: '#e5e7eb',
                  color: '#1f2937',
                }}
              >
                {alertState.secondaryText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;