import { useState } from 'react'
import { Check, Database, Flame, Mic, RefreshCw, Save, Settings, ShieldCheck, Sliders, User, Cloud } from 'lucide-react'
import { useVoiceApp } from '../../context/VoiceAppContext'
import { testFirestoreConnection } from '../../services/firestoreService'

export default function SettingsTab() {
  const { userProfile, setUserProfile, firestoreStatus, setFirestoreStatus } = useVoiceApp()
  const [name, setName] = useState(userProfile.name)
  const [micDevice, setMicDevice] = useState('Default Built-in Microphone Array')
  const [sensitivity, setSensitivity] = useState(75)
  const [savedNotice, setSavedNotice] = useState(false)
  const [isTestingDb, setIsTestingDb] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleTestDatabase = async () => {
    setIsTestingDb(true)
    setTestResult(null)
    try {
      const res = await testFirestoreConnection()
      setTestResult(res)
      setFirestoreStatus({
        connected: res.success,
        checked: true,
        message: res.success ? 'Connected to Firebase Firestore' : res.message
      })
    } catch (err) {
      setTestResult({ success: false, message: err.message })
    } finally {
      setIsTestingDb(false)
    }
  }

  const handleSave = (e) => {
    e.preventDefault()
    setUserProfile((prev) => ({
      ...prev,
      name,
      avatar: name.split(' ').map((n) => n[0]).join('').toUpperCase() || 'AM'
    }))
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2500)
  }

  return (
    <div className="settings-container animate-fade-in">
      {/* Header */}
      <div className="settings-hero glass-panel">
        <div>
          <p className="eyebrow neon-badge neon-badge-cyan">HARDWARE & PREFERENCES</p>
          <h2 className="settings-title">System & Audio Settings</h2>
          <p className="settings-desc">
            Configure microphone audio input devices, acoustic engine threshold sensitivity, and user workspace profile.
          </p>
        </div>
        <Settings size={32} className="cyan-glow-icon" />
      </div>

      <form className="settings-form" onSubmit={handleSave}>
        {/* User Profile Card */}
        <div className="settings-card glass-panel">
          <div className="card-title-row">
            <User size={18} className="icon-cyan" />
            <h3>User Workspace Profile</h3>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="settings-input"
            />
          </div>

          <div className="form-group">
            <label>Current Plan</label>
            <input
              type="text"
              value={userProfile.plan}
              disabled
              className="settings-input disabled"
            />
          </div>
        </div>

        {/* Firebase Cloud Firestore Card */}
        <div className="settings-card glass-panel firestore-card">
          <div className="card-title-row">
            <Flame size={20} className="icon-orange" style={{ color: '#ff9900' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Firebase Cloud Firestore Database
                <span className={`db-status-tag ${firestoreStatus?.connected ? 'status-online' : 'status-pending'}`}>
                  {firestoreStatus?.connected ? 'Online' : 'Ready'}
                </span>
              </h3>
            </div>
            <button
              type="button"
              className="btn-test-db"
              onClick={handleTestDatabase}
              disabled={isTestingDb}
            >
              <RefreshCw size={14} className={isTestingDb ? 'spin' : ''} />
              {isTestingDb ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          <div className="db-info-grid">
            <div className="db-info-item">
              <span className="db-label">Project ID</span>
              <span className="db-value">parkinson-s-96f47</span>
            </div>
            <div className="db-info-item">
              <span className="db-label">Auth Domain</span>
              <span className="db-value">parkinson-s-96f47.firebaseapp.com</span>
            </div>
            <div className="db-info-item">
              <span className="db-label">Storage Bucket</span>
              <span className="db-value">parkinson-s-96f47.firebasestorage.app</span>
            </div>
            <div className="db-info-item">
              <span className="db-label">Collections Synced</span>
              <span className="db-value">patients, sessions, users</span>
            </div>
          </div>

          {testResult && (
            <div className={`db-test-alert ${testResult.success ? 'alert-success' : 'alert-warning'}`}>
              {testResult.success ? (
                <>
                  <Check size={16} /> <b>Firestore Read/Write Verified:</b> Connection to project <code>parkinson-s-96f47</code> is active.
                </>
              ) : (
                <>
                  <ShieldCheck size={16} /> <b>Connection Status:</b> {testResult.message}
                </>
              )}
            </div>
          )}
        </div>

        {/* Audio Hardware Card */}
        <div className="settings-card glass-panel">
          <div className="card-title-row">
            <Mic size={18} className="icon-purple" />
            <h3>Microphone Hardware & Sensitivity</h3>
          </div>

          <div className="form-group">
            <label>Input Audio Device</label>
            <select
              value={micDevice}
              onChange={(e) => setMicDevice(e.target.value)}
              className="settings-select"
            >
              <option value="Default Built-in Microphone Array">Default Built-in Microphone Array</option>
              <option value="Studio USB Condenser Microphone">Studio USB Condenser Microphone</option>
              <option value="Wireless Bluetooth Headset">Wireless Bluetooth Headset</option>
            </select>
          </div>

          <div className="form-group">
            <label>Signal Processing Sensitivity Threshold: {sensitivity}%</label>
            <input
              type="range"
              min="20"
              max="100"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="settings-slider"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-cyber-primary">
            <Save size={16} /> Save Preferences
          </button>
          {savedNotice && (
            <span className="saved-badge">
              <Check size={14} /> Settings updated successfully!
            </span>
          )}
        </div>
      </form>

      <style>{`
        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-hero {
          padding: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(15, 20, 38, 0.7), rgba(0, 242, 254, 0.08));
        }

        .settings-title {
          font-size: 1.8rem;
          color: #fff;
          font-weight: 800;
        }

        .settings-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          max-width: 600px;
        }

        .cyan-glow-icon {
          color: var(--neon-cyan);
          filter: drop-shadow(0 0 10px var(--neon-cyan));
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .settings-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-title-row h3 {
          font-size: 1.15rem;
          color: #fff;
          font-weight: 700;
        }

        .icon-cyan {
          color: var(--neon-cyan);
        }

        .icon-purple {
          color: var(--neon-purple);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .settings-input, .settings-select {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 10px 16px;
          color: #fff;
          font-size: 0.9rem;
          width: 100%;
          max-width: 440px;
        }

        .settings-input.disabled {
          color: var(--text-dim);
          background: rgba(255, 255, 255, 0.02);
          cursor: not-allowed;
        }

        .settings-slider {
          accent-color: var(--neon-cyan);
          max-width: 440px;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .saved-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--neon-emerald);
          font-size: 0.88rem;
          font-weight: 600;
        }

        .firestore-card {
          border-color: rgba(255, 153, 0, 0.25);
          background: linear-gradient(135deg, rgba(20, 24, 45, 0.7), rgba(255, 153, 0, 0.05));
        }

        .db-status-tag {
          font-size: 0.7rem;
          padding: 3px 9px;
          border-radius: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .db-status-tag.status-online {
          background: rgba(0, 245, 212, 0.15);
          color: var(--neon-emerald);
          border: 1px solid rgba(0, 245, 212, 0.3);
        }

        .db-status-tag.status-pending {
          background: rgba(255, 170, 51, 0.15);
          color: #ffaa33;
          border: 1px solid rgba(255, 170, 51, 0.3);
        }

        .btn-test-db {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(255, 153, 0, 0.15);
          border: 1px solid rgba(255, 153, 0, 0.4);
          color: #ffaa33;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-test-db:hover:not(:disabled) {
          background: rgba(255, 153, 0, 0.25);
          color: #fff;
          border-color: rgba(255, 153, 0, 0.7);
        }

        .btn-test-db:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .db-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 8px;
        }

        .db-info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .db-label {
          font-size: 0.72rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .db-value {
          font-size: 0.85rem;
          color: #fff;
          font-family: monospace;
          word-break: break-all;
        }

        .db-test-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-top: 6px;
        }

        .db-test-alert.alert-success {
          background: rgba(0, 245, 212, 0.1);
          border: 1px solid rgba(0, 245, 212, 0.3);
          color: var(--neon-emerald);
        }

        .db-test-alert.alert-warning {
          background: rgba(255, 170, 51, 0.1);
          border: 1px solid rgba(255, 170, 51, 0.3);
          color: #ffaa33;
        }

        .db-test-alert code {
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 6px;
          border-radius: 4px;
          color: #fff;
        }
      `}</style>
    </div>
  )
}
