import { AlertTriangle, Bell, Info, Mic, Search, ShieldCheck } from 'lucide-react'
import { useVoiceApp } from '../../context/VoiceAppContext'

export default function Header() {
  const { activeTab, setActiveTab, showDisclaimer, setShowDisclaimer, isRecording, firestoreStatus } = useVoiceApp()

  const tabLabels = {
    Overview: 'Voice Diagnostics Overview',
    VoiceLab: 'Live Acoustic Signal Laboratory',
    Insights: 'AI Vocal Biomarker Insights',
    Sessions: 'Clinical Session Database',
    Settings: 'Hardware & Neural Settings',
    Help: 'Acoustic Glossary & Help Center'
  }

  return (
    <header className="header-container glass-panel">
      <div className="header-left">
        <div className="breadcrumb-trail">
          <span className="breadcrumb-root">ParkinsonVoice Studio</span>
          <span className="breadcrumb-separator">/</span>
          <b className="breadcrumb-active gradient-text">{tabLabels[activeTab] || activeTab}</b>
        </div>
      </div>

      <div className="header-right">
        {/* Firebase Cloud Firestore Status */}
        <div
          className={`status-pill ${firestoreStatus?.connected ? 'firestore-ready' : 'firestore-syncing'}`}
          title={firestoreStatus?.message || 'Firebase Firestore'}
        >
          <span className={`status-dot ${firestoreStatus?.connected ? 'status-dot-firestore' : ''}`} />
          <span>{firestoreStatus?.connected ? '🔥 FIRESTORE CONNECTED' : '🔥 FIRESTORE SYNC'}</span>
        </div>

        {/* Live Audio Status */}
        <div className={`status-pill ${isRecording ? 'recording' : 'ready'}`}>
          <span className={isRecording ? 'status-dot status-dot-recording' : 'status-dot'} />
          <span>{isRecording ? 'MIC LIVE RECORDING' : 'AUDIO ENGINE READY'}</span>
        </div>

        {/* Disclaimer Toggle Button */}
        <button
          className={`icon-btn ${showDisclaimer ? 'active-disclaimer' : ''}`}
          onClick={() => setShowDisclaimer(!showDisclaimer)}
          title="Toggle Medical Disclaimer"
        >
          <ShieldCheck size={18} />
        </button>

        {/* Quick Voice Lab shortcut */}
        <button className="icon-btn" onClick={() => setActiveTab('VoiceLab')} title="Voice Lab">
          <Mic size={18} />
        </button>

        {/* Notifications */}
        <button className="icon-btn notification-btn" title="Notifications">
          <Bell size={18} />
          <span className="notification-badge" />
        </button>
      </div>

      <style>{`
        .header-container {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          margin-bottom: 24px;
          border-radius: 20px;
          background: rgba(15, 20, 38, 0.55);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .breadcrumb-trail {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.95rem;
        }

        .breadcrumb-root {
          color: var(--text-dim);
          font-weight: 500;
        }

        .breadcrumb-separator {
          color: var(--border-glass);
        }

        .breadcrumb-active {
          font-size: 1.05rem;
          font-weight: 700;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          color: var(--text-dim);
        }

        .search-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 9px 16px 9px 40px;
          color: #fff;
          font-size: 0.85rem;
          width: 260px;
          transition: var(--transition-smooth);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--neon-cyan);
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.25);
          width: 300px;
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          background: rgba(0, 245, 212, 0.08);
          border: 1px solid rgba(0, 245, 212, 0.3);
          color: var(--neon-emerald);
        }

        .status-pill.recording {
          background: rgba(255, 0, 127, 0.15);
          border-color: rgba(255, 0, 127, 0.5);
          color: var(--neon-magenta);
          box-shadow: 0 0 15px rgba(255, 0, 127, 0.3);
        }

        .status-pill.firestore-ready {
          background: rgba(255, 153, 0, 0.12);
          border-color: rgba(255, 153, 0, 0.4);
          color: #ffaa33;
        }

        .status-pill.firestore-syncing {
          background: rgba(0, 245, 212, 0.08);
          border-color: rgba(0, 245, 212, 0.3);
          color: var(--neon-cyan);
        }

        .status-dot-firestore {
          background: #ffaa33;
          box-shadow: 0 0 8px #ffaa33;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-smooth);
          position: relative;
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .icon-btn.active-disclaimer {
          color: var(--neon-cyan);
          border-color: var(--neon-cyan);
          background: rgba(0, 242, 254, 0.15);
        }

        .notification-btn {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--neon-magenta);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--neon-magenta);
        }
      `}</style>
    </header>
  )
}
