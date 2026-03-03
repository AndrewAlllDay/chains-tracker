import React from 'react';
import { X, LogOut, ShieldCheck, Dices } from 'lucide-react';
import './SettingsModal.css';

export default function SettingsModal({
    isOpen,
    onClose,
    isLeagueMode,
    isProMode,
    handleRoleSelect,
    updateSettings,
    handleLogout
}) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 5000 }}>
            <div className="modal-content settings-modal-content" onClick={e => e.stopPropagation()}>

                <div className="settings-header">
                    <h2>Settings</h2>
                    <button onClick={onClose} className='no-border' style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#44474e" />
                    </button>
                </div>

                <div className="setting-row">
                    <div className="setting-info">
                        <ShieldCheck size={22} color="#44474e" />
                        <label>League Mode</label>

                    </div>

                    <div
                        onClick={() => handleRoleSelect(isLeagueMode ? 'practice' : 'league')}
                        className={`toggle-switch ${isLeagueMode ? 'active' : 'inactive'}`}
                    >
                        <div className="toggle-knob" />
                    </div>
                </div>

                <div className="setting-row">
                    <div className="setting-info">
                        <Dices size={22} color="#44474e" />
                        <label>Pro Scoring Mode</label>
                    </div>
                    <div
                        onClick={() => updateSettings({ scoringStyle: isProMode ? 'SIMPLE' : 'PRO' })}
                        className={`toggle-switch ${isProMode ? 'active' : 'inactive'}`}
                    >
                        <div className="toggle-knob" />
                    </div>
                </div>
                <div className="app-version text-center w-full block">Version 1.5</div>
                <button className="logout-action-btn" onClick={() => { handleLogout(); onClose(); }}>
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}