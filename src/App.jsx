import { useState, useEffect, useRef } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import LoginLanding from './components/LoginLanding';
import RoleSelector from './components/RoleSelector';
import PracticeSession from './components/scoring/PracticeSession';
import LeagueSession from './components/scoring/LeagueSession';
import AppGuide from './components/AppGuide';
import WhatsNewModal from './components/WhatsNewModal';
import logoIcon from './assets/Dialed.svg';

// --- COHESIVE ICONS ---
import { Settings, Paperclip, AlertTriangle } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { db, auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const CURRENT_VERSION = 3.3;

function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // NEW: Flag to prevent the app from rendering before Firestore syncs the real data
  const [isFirestoreSynced, setIsFirestoreSynced] = useState(false);

  const [history, setHistory] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userSettings, setUserSettings] = useState({ scoringStyle: 'PRO', hasCompletedOnboarding: false });
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [view, setView] = useState('HOME');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const initialModalCheckDone = useRef(false);
  const [versionData, setVersionData] = useState({ version: 0, count: 0 });
  const [pendingSession, setPendingSession] = useState(null);

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
        setIsFirestoreSynced(false); // NEW: Reset the sync flag on logout
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      initialModalCheckDone.current = false;

      const userDocRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          // 1. Sync History
          const sortedHistory = (data.history || []).sort((a, b) => new Date(b.date) - new Date(a.date));
          setHistory(sortedHistory);

          // 2. Sync Settings (with fallback for the onboarding flag)
          if (data.settings) {
            setUserSettings({
              hasCompletedOnboarding: false, // Default fallback
              ...data.settings
            });
          }

          // 3. Version Tracking
          const dbVersion = data.lastSeenVersion || 0;
          const dbCount = data.versionViewCount || 0;
          setVersionData({ version: dbVersion, count: dbCount });

          if (!initialModalCheckDone.current) {
            setShowUpdateModal(false);
            initialModalCheckDone.current = true;
          }

          // 4. Role Sync
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
          initialModalCheckDone.current = true;
        }

        // NEW: UNLOCK RENDER. Firestore has returned our true data state.
        setIsFirestoreSynced(true);

      }, (error) => {
        console.error("Firestore sync error:", error);
        // NEW: Fail-safe so the app doesn't hang infinitely if Firestore fails
        setIsFirestoreSynced(true);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // --- HELPERS ---

  const updateSettings = async (newSettings) => {
    const updated = { ...userSettings, ...newSettings };
    setUserSettings(updated);

    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          settings: updated
        }, { merge: true });
      } catch (e) {
        console.error("Error saving settings:", e);
      }
    }
  };

  const handleDismissUpdate = async () => {
    setShowUpdateModal(false);
    if (user) {
      try {
        let newCount = 1;
        if (versionData.version === CURRENT_VERSION) {
          newCount = versionData.count + 1;
        }
        await setDoc(doc(db, "users", user.uid), {
          lastSeenVersion: CURRENT_VERSION,
          versionViewCount: newCount
        }, { merge: true });
      } catch (e) {
        console.error("Error saving version flag:", e);
      }
    }
  };

  const saveHistoryToStorage = async (newSessionOrHistory) => {
    const sortByDate = (list) => [...list].sort((a, b) => new Date(b.date) - new Date(a.date));

    setHistory((prevHistory) => {
      const updatedHistory = Array.isArray(newSessionOrHistory)
        ? sortByDate(newSessionOrHistory)
        : sortByDate([newSessionOrHistory, ...prevHistory]);

      if (user) {
        setDoc(doc(db, "users", user.uid), { history: updatedHistory }, { merge: true })
          .catch(e => console.error("Error saving to database: ", e));
      }

      return updatedHistory;
    });
  };

  const handleMergeSession = (existingSession, newSessionData) => {
    const mergedSession = {
      ...existingSession,
      summary: {
        attempts: (existingSession.summary?.attempts || 0) + newSessionData.summary.attempts,
        made: (existingSession.summary?.made || 0) + newSessionData.summary.made
      },
      rounds: [...existingSession.rounds, ...newSessionData.rounds]
    };
    const newHistory = history.map(s => s.id === existingSession.id ? mergedSession : s);
    const filteredHistory = newHistory.filter(s => s.id !== newSessionData.id || s.id === existingSession.id);
    saveHistoryToStorage(filteredHistory);
    setPendingSession(null);
    setView('HOME');
  };

  const processPracticeSave = (newSession) => {
    const today = new Date().toLocaleDateString('en-US');
    const existingToday = history.find(s =>
      s.date === today && s.type === 'PRACTICE' && !s.subType && !s.isLegacy
    );

    if (existingToday) {
      setPendingSession({ existing: existingToday, new: newSession });
    } else {
      saveHistoryToStorage(newSession);
      setView('HOME');
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
      secondaryText: 'Around The World',
      // We'll add a third option here. 
      // Note: If your Alert modal only renders two buttons, 
      // you might need to update the Alert modal JSX at the bottom of App.js 
      // to map through an array of buttons instead.
      onLadder: () => setView('LADDER_SESSION'),
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

  const startSingleSession = () => triggerModeSelect();
  const startLeagueSession = () => setView('LEAGUE');

  const deleteHistorySession = (id) => {
    triggerConfirm("Delete this entire past session?", () => {
      const newHistory = history.filter(s => s.id !== id);
      saveHistoryToStorage(newHistory);
    }, 'danger');
  }

  const clearAllHistory = () => {
    triggerConfirm("Delete ALL data? This cannot be undone.", () => {
      saveHistoryToStorage([]);
    }, 'danger');
  }

  // NEW: Updated loading check to also wait for Firestore to finish its initial sync
  if (loading || (user && !isFirestoreSynced)) return <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return <LoginLanding onLogin={handleLogin} />;

  return (
    <div className="container">

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
              onManualMerge={handleMergeSession}
              handleLogout={handleLogout}
              userSettings={userSettings}
              updateSettings={updateSettings}
              showSettings={showSettings}
              setShowSettings={setShowSettings}
              handleRoleSelect={handleRoleSelect}
              // NEW: Passing these down so Dashboard can control the complete header
              setShowGuideModal={setShowGuideModal}
              logoIcon={logoIcon}
            />
          )}

          {view === 'LEAGUE' && (
            <div className="session-view-wrapper">
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

          {(view === 'SINGLE_SESSION' || view === 'WORLD_SESSION') && (
            <div className="session-view-wrapper">
              <PracticeSession
                initialMode={view === 'WORLD_SESSION' ? "WORLD" : "STANDARD"}
                scoringStyle={userSettings.scoringStyle}
                onSave={(finalData) => {
                  const totalAtt = finalData.reduce((acc, r) => acc + r.attempts, 0);
                  const totalMade = finalData.reduce((acc, r) => acc + r.made, 0);

                  const newSession = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString('en-US'),
                    type: 'PRACTICE',
                    summary: { attempts: totalAtt, made: totalMade },
                    rounds: finalData
                  };

                  if (view === 'WORLD_SESSION') {
                    newSession.subType = 'WORLD';
                    saveHistoryToStorage(newSession);
                    setView('HOME');
                  } else {
                    processPracticeSave(newSession);
                  }
                }}
                onCancel={() => setView('HOME')}
              />
            </div>
          )}
        </>
      )}

      {pendingSession && (
        <div className="modal-overlay" style={{ zIndex: 4000 }}>
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
              <Paperclip size={48} color="var(--primary)" />
            </div>
            <h2 style={{ marginBottom: '10px', fontWeight: '900' }}>Daily Practice <br /> Detected!</h2>
            <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '20px' }}>
              You already practiced today. Would you like to combine this session?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <button className="save-btn" onClick={() => handleMergeSession(pendingSession.existing, pendingSession.new)}>Combine Sessions</button>
              <button onClick={() => { saveHistoryToStorage(pendingSession.new); setPendingSession(null); setView('HOME'); }} className="secondary-btn">Save Separately</button>
            </div>
          </div>
        </div>
      )}

      {alertState.isOpen && (
        <div className="modal-overlay" onClick={closeAlert} style={{ zIndex: 2000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title" style={{ color: alertState.type === 'danger' ? '#ef4444' : '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {alertState.isModeSelection ? 'Mode Selection' : (
                alertState.type === 'danger'
                  ? <><AlertTriangle size={20} /> Warning</>
                  : 'Confirm'
              )}
            </h3>
            <p style={{ marginBottom: '25px', fontSize: '1.1rem', lineHeight: '1.5' }}>{alertState.message}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <button onClick={() => { alertState.onConfirm(); closeAlert(); }} className={!alertState.isModeSelection ? "save-btn" : "secondary-btn"}>{alertState.confirmText}</button>
              <button onClick={() => { if (alertState.onSecondary) alertState.onSecondary(); closeAlert(); }} className="secondary-btn">{alertState.secondaryText}</button>
            </div>
          </div>
        </div>
      )}

      <AppGuide isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} userRole={userRole} />
      <WhatsNewModal isOpen={showUpdateModal} onClose={handleDismissUpdate} />

    </div>
  );
}

export default App;