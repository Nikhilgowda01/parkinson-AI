import { Activity, AudioLines, ChevronRight, CircleHelp, Cpu, FileAudio, LayoutDashboard, LogOut, Settings, Sparkles, UsersRound } from 'lucide-react'
import { useVoiceApp } from '../../context/VoiceAppContext'

export default function Sidebar() {
  const { activeTab, setActiveTab, sessions, userProfile, authUser, signOut } = useVoiceApp()

  const navItems = [
    { id: 'Overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'VoiceLab', label: 'Voice Acoustic Lab', icon: AudioLines, badge: 'LIVE' },
    { id: 'Insights', label: 'AI Biomarker Insights', icon: Cpu, badge: null },
    { id: 'Sessions', label: 'Session History', icon: FileAudio, badge: sessions.length.toString() },
    { id: 'Patients', label: 'Patient Records', icon: UsersRound, badge: null },
  ]

  const manageItems = [
    { id: 'Settings', label: 'Settings & Audio Input', icon: Settings },
    { id: 'Help', label: 'Acoustic Glossary & Help', icon: CircleHelp },
  ]

  return (
    <aside className="sidebar-container glass-panel-heavy">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-icon-wrapper animate-pulse-glow">
          <AudioLines size={22} className="brand-icon" />
        </div>
        <div className="brand-text">
          <span className="brand-title font-display">PARKINSON<span className="gradient-text">VOICE</span></span>
          <span className="brand-subtitle">AI ACOUSTIC DIAGNOSTICS</span>
        </div>
      </div>

      {/* User Workspace Pill */}
      <div className="workspace-card glass-panel">
        <div className="avatar-circle font-display">{userProfile.avatar}</div>
        <div className="user-details">
          <b className="user-name">{userProfile.name}</b>
          <small className="user-plan">{authUser?.email}</small>
        </div>
        <button className="signout-button" type="button" onClick={signOut} title="Sign out" aria-label="Sign out"><LogOut size={17} /></button>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <p className="nav-group-label">WORKSPACE STUDIO</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-btn ${isActive ? 'active' : ''}`}
            >
              <div className="nav-btn-content">
                <Icon size={19} className="nav-icon" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={item.badge === 'LIVE' ? 'neon-badge neon-badge-cyan' : 'nav-count'}>
                  {item.badge}
                </span>
              )}
            </button>
          )}
        )}

        <p className="nav-group-label nav-group-spaced">SYSTEM & HELP</p>
        {manageItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-btn ${isActive ? 'active' : ''}`}
            >
              <div className="nav-btn-content">
                <Icon size={19} className="nav-icon" />
                <span>{item.label}</span>
              </div>
            </button>
          )}
        )}
      </nav>

      {/* Sidebar Footer Card */}
      <div className="sidebar-footer">
        <div className="pro-banner glass-panel">
          <div className="pro-header">
            <Sparkles size={18} className="sparkle-icon" />
            <span>Voice Session Analysis</span>
          </div>
          <p>Review experimental acoustic estimates and saved voice sessions.</p>
          <button className="btn-cyber-primary btn-sm" onClick={() => setActiveTab('VoiceLab')}>
            Open Voice Lab <ChevronRight size={14} />
          </button>
        </div>

        <div className="vocal-baseline-indicator">
          <Activity size={14} />
          <span>Baseline: <b>92% Stability</b></span>
        </div>
      </div>

      <style>{`
        .sidebar-container {
          width: 280px;
          height: 100vh;
          min-height: 0;
          display: flex;
          flex-direction: column;
          padding: 24px 18px;
          gap: 20px;
          position: sticky;
          top: 0;
          align-self: flex-start;
          overflow-y: auto;
          flex: 0 0 280px;
          z-index: 20;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(10, 13, 26, 0.75);
          backdrop-filter: blur(20px);
        }

        .brand-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 4px 8px;
        }

        .brand-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(157, 78, 221, 0.2));
          border: 1px solid var(--neon-cyan);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--neon-cyan);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #fff;
        }

        .brand-subtitle {
          font-size: 0.65rem;
          letter-spacing: 1.2px;
          color: var(--neon-cyan);
          font-weight: 700;
        }

        .workspace-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
        }

        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--grad-vibrant);
          color: #fff;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          box-shadow: 0 0 10px rgba(255, 0, 127, 0.4);
        }

        .user-details {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .user-name {
          font-size: 0.88rem;
          color: #fff;
        }

        .user-plan {
          font-size: 0.72rem;
          color: var(--neon-cyan);
        }

        .user-verified-icon {
          color: var(--neon-emerald);
        }

        .signout-button { display: grid; place-items: center; flex: 0 0 32px; width: 32px; height: 32px; border: 0; border-radius: 6px; background: transparent; color: var(--text-muted); cursor: pointer; }
        .signout-button:hover { background: rgba(255,255,255,.08); color: #fff; }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .nav-group-label {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 1.2px;
          color: var(--text-dim);
          padding: 12px 10px 4px;
        }

        .nav-group-spaced {
          margin-top: 12px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          border-radius: 12px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .nav-btn-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.08);
        }

        .nav-btn.active {
          background: rgba(0, 242, 254, 0.12);
          color: var(--neon-cyan);
          border-color: rgba(0, 242, 254, 0.35);
          box-shadow: 0 0 20px rgba(0, 242, 254, 0.15);
        }

        .nav-btn.active .nav-icon {
          color: var(--neon-cyan);
          filter: drop-shadow(0 0 6px var(--neon-cyan));
        }

        .nav-count {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 0.72rem;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 700;
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .pro-banner {
          padding: 14px;
          background: linear-gradient(135deg, rgba(157, 78, 221, 0.15), rgba(0, 242, 254, 0.08));
          border: 1px solid rgba(157, 78, 221, 0.3);
          border-radius: 16px;
        }

        .pro-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--neon-purple);
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 6px;
        }

        .pro-banner p {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.35;
          margin-bottom: 12px;
        }

        .btn-sm {
          padding: 8px 14px;
          font-size: 0.78rem;
          width: 100%;
          justify-content: center;
        }

        .vocal-baseline-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: var(--text-muted);
          justify-content: center;
          padding: 8px;
          background: rgba(0, 245, 212, 0.06);
          border-radius: 10px;
          border: 1px solid rgba(0, 245, 212, 0.2);
        }

        .vocal-baseline-indicator svg {
          color: var(--neon-emerald);
        }

        @media (max-width: 1024px) {
          .sidebar-container {
            position: relative;
            top: auto;
            width: 100%;
            height: auto;
            min-height: 0;
            flex: 0 0 auto;
            overflow: visible;
          }
        }
      `}</style>
    </aside>
  )
}
