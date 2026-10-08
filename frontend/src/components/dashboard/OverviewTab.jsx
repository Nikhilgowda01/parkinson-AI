import { useState } from 'react'
import { AudioLines, Clock3, Mic, Sparkles, X } from 'lucide-react'
import { useVoiceApp } from '../../context/VoiceAppContext'
import AcousticMetricsGrid from '../analytics/AcousticMetricsGrid'
import MLPredictionGauge from '../analytics/MLPredictionGauge'
import VocalTrendsChart from '../analytics/VocalTrendsChart'
import AudioRecorder from '../voice/AudioRecorder'
import AudioUploader from '../voice/AudioUploader'
import SessionAudioButton from '../common/SessionAudioButton'

export default function OverviewTab() {
  const { currentSession, sessions, activePatientId, accountId, setCurrentSession, userProfile, setActiveTab } = useVoiceApp()
  const [showNote, setShowNote] = useState(true)
  const patientSessions = activePatientId ? sessions.filter((session) => session.patientId === activePatientId) : []

  return (
    <div className="overview-container animate-fade-in">
      {/* Welcome Hero Header */}
      <section className="welcome-hero glass-panel">
        <div className="hero-text-col">
          <p className="eyebrow neon-badge neon-badge-cyan">
            <span className="status-dot" /> CLINICAL VOCAL DASHBOARD
          </p>
          <h1 className="hero-heading">
            Good morning, <span className="gradient-text">{userProfile.name}</span>.
          </h1>
          <p className="hero-subtext">
            Review experimental acoustic estimates such as pitch, jitter, shimmer, and HNR across voice sessions. These results are for demonstration, not diagnosis.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn-cyber-primary" onClick={() => setActiveTab('VoiceLab')}>
            <Mic size={18} /> Launch Voice Lab
          </button>
        </div>
      </section>

      {/* Main Grid Section */}
      <div className="main-overview-grid">
        {/* Left Column: Live Recording & Audio Uploader */}
        <div className="grid-left-col">
          <AudioRecorder />
          <AudioUploader />
        </div>

        {/* Right Column: AI Risk Meter & Trends */}
        <div className="grid-right-col">
          <MLPredictionGauge session={currentSession} />
          <VocalTrendsChart sessions={sessions} patientId={activePatientId} />
        </div>
      </div>

      {/* Acoustic Biomarkers Grid */}
      <AcousticMetricsGrid metrics={currentSession?.metrics} />

      {/* Recent Sessions Table */}
      <section className="sessions-section glass-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow neon-badge neon-badge-purple">HISTORY LOG</p>
            <h3 className="section-title-text">Recent Phonation Sessions</h3>
          </div>
          <button className="btn-glass" onClick={() => setActiveTab('Sessions')}>
            View All ({patientSessions.length})
          </button>
        </div>

        <div className="sessions-list">
          {patientSessions.length === 0 && <p className="overview-no-sessions">No voice records for the selected patient yet. Record a sample or upload audio to start their history.</p>}
          {patientSessions.slice(0, 3).map((session) => {
            return (
              <div
                key={session.id}
                className={`session-row ${currentSession?.id === session.id ? 'active-row' : ''}`}
                onClick={() => setCurrentSession(session)}
              >
                <div className="session-icon-wrap">
                  <AudioLines size={20} />
                </div>

                <div className="session-main-info">
                  <b className="session-name">{session.title}</b>
                  <small className="session-meta">{session.date} • {session.category}</small>
                  <small className="session-meta">{session.riskLevel} · {session.riskScore}% prediction</small>
                </div>

                <div className="session-duration font-mono">
                  <Clock3 size={14} /> {session.duration}
                </div>

                <div className="session-score">
                  <span className="score-ring"><b>{session.clarityScore}</b></span>
                  <small>Clarity Score</small>
                </div>

                <div className="session-actions">
                  <SessionAudioButton session={session} accountId={accountId} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Neural AI Note Banner */}
      {showNote && currentSession && (
        <section className="ai-note-card glass-panel">
          <div className="sparkle-icon-box">
            <Sparkles size={22} />
          </div>
          <div className="note-text-wrap">
            <p className="eyebrow neon-badge neon-badge-emerald">PARKINSON VOICE INSIGHT</p>
            <h4>Morning sessions demonstrate 14.2% higher harmonic purity (HNR).</h4>
            <p>Sustained phonation stability is highest between 8:00 AM and 11:00 AM baseline tests.</p>
          </div>
          <button className="close-note-btn" onClick={() => setShowNote(false)}>
            <X size={18} />
          </button>
        </section>
      )}

      <style>{`
        .overview-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .welcome-hero {
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(15, 20, 38, 0.7), rgba(0, 242, 254, 0.08));
          border-color: rgba(0, 242, 254, 0.25);
        }

        .hero-text-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 650px;
        }

        .hero-heading {
          font-size: 2.2rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
        }

        .hero-subtext {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .main-overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .main-overview-grid {
            grid-template-columns: 1fr;
          }
        }

        .grid-left-col, .grid-right-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sessions-section {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title-text {
          font-size: 1.2rem;
          color: #fff;
          font-weight: 700;
        }

        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .session-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .session-row:hover, .session-row.active-row {
          background: rgba(0, 242, 254, 0.08);
          border-color: rgba(0, 242, 254, 0.3);
        }

        .session-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(0, 242, 254, 0.12);
          color: var(--neon-cyan);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .session-main-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          margin-left: 14px;
        }

        .session-name {
          font-size: 0.95rem;
          color: #fff;
        }

        .session-meta {
          font-size: 0.76rem;
          color: var(--text-dim);
        }

        .session-duration {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.84rem;
          color: var(--text-muted);
        }

        .session-score {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .score-ring {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 245, 212, 0.15);
          border: 1px solid var(--neon-emerald);
          color: var(--neon-emerald);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.82rem;
          font-weight: 800;
        }

        .session-score small {
          font-size: 0.72rem;
          color: var(--text-dim);
        }

        .play-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .play-btn:hover, .play-btn.playing {
          background: var(--neon-cyan);
          color: #000;
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.6);
        }

        .ai-note-card {
          padding: 20px 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(157, 78, 221, 0.08));
          border-color: rgba(0, 245, 212, 0.3);
        }

        .sparkle-icon-box {
          color: var(--neon-emerald);
          margin-top: 2px;
        }

        .note-text-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .note-text-wrap h4 {
          font-size: 1rem;
          color: #fff;
          font-weight: 700;
        }

        .note-text-wrap p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .close-note-btn {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
