import { useState } from 'react'
import { AudioLines, Calendar, Clock, Download, FileAudio, Filter, Search, Trash2, CheckCircle2, ShieldAlert, AlertCircle } from 'lucide-react'
import { useVoiceApp } from '../../context/VoiceAppContext'
import { deleteSessionAudio } from '../../utils/audioStorage'
import SessionAudioButton from '../common/SessionAudioButton'
import PatientVoiceReport from './PatientVoiceReport'

export default function HistoryTab() {
  const { sessions, setSessions, deleteSession, currentSession, setCurrentSession, patients, accountId } = useVoiceApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState('All')
  const [filterPatient, setFilterPatient] = useState('All')
  const [expandedSessionId, setExpandedSessionId] = useState('')
  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (deleteSession) {
      deleteSession(id)
    } else {
      setSessions((prev) => prev.filter((s) => s.id !== id))
    }
    deleteSessionAudio(accountId, id).catch((error) => console.warn('Saved audio could not be removed:', error))
  }

  const handleExportPDF = (session, e) => {
    e.stopPropagation()
    const reportJSON = JSON.stringify(session, null, 2)
    const blob = new Blob([reportJSON], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ParkinsonVoice_Report_${session.id}.json`
    a.click()
  }

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = filterRisk === 'All' || s.riskLevel === filterRisk
    const matchesPatient = filterPatient === 'All' || (filterPatient === 'Unassigned' ? !s.patientId : s.patientId === filterPatient)
    return matchesSearch && matchesRisk && matchesPatient
  })

  return (
    <div className="history-container animate-fade-in">
      {/* Header Banner */}
      <div className="history-header glass-panel">
        <div>
          <p className="eyebrow neon-badge neon-badge-purple">CLINICAL AUDIT TRAIL</p>
          <h2 className="history-title">Session History & Export</h2>
          <p className="history-desc">
            Review past voice recordings, track acoustic perturbation over time, and generate exportable clinical JSON summaries.
          </p>
        </div>

        <button
          className="btn-cyber-primary"
            onClick={() => currentSession && handleExportPDF(currentSession, { stopPropagation: () => {} })}
          disabled={!currentSession}
        >
          <Download size={16} /> Export Active Session Report
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="filter-controls-bar glass-panel">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search sessions by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="risk-filters">
          <Filter size={16} className="filter-icon" />
          {['All', 'Low Risk', 'Mild Variance', 'Elevated Biomarkers'].map((risk) => (
            <button
              key={risk}
              className={`filter-chip ${filterRisk === risk ? 'active' : ''}`}
              onClick={() => setFilterRisk(risk)}
            >
              {risk}
            </button>
          ))}
        </div>

        <label className="patient-history-filter">
          <span>Patient</span>
          <select value={filterPatient} onChange={(event) => setFilterPatient(event.target.value)}>
            <option value="All">All patients</option>
            <option value="Unassigned">Unassigned</option>
            {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName}</option>)}
          </select>
        </label>
      </div>

      {/* Sessions Grid / Table */}
      <div className="history-list glass-panel">
        {filteredSessions.length === 0 ? (
          <div className="empty-history">
            <FileAudio size={40} className="empty-icon" />
            <p>No recording sessions match your query.</p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isSelected = currentSession?.id === session.id
            const patient = patients.find((entry) => entry.id === session.patientId)
            const isExpanded = expandedSessionId === session.id
            const patientSessions = patient
              ? sessions.filter((entry) => entry.patientId === patient.id)
              : [session]

            let badgeClass = 'neon-badge-emerald'
            let RiskIcon = CheckCircle2
            if (session.riskLevel === 'Elevated Biomarkers') {
              badgeClass = 'neon-badge-magenta'
              RiskIcon = ShieldAlert
            } else if (session.riskLevel === 'Mild Variance') {
              badgeClass = 'neon-badge-amber'
              RiskIcon = AlertCircle
            }

            return (
              <div className="history-entry" key={session.id}>
                <div
                  className={`history-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setCurrentSession(session)}
                >
                  <div className="card-left">
                    <div className="session-type-icon">
                      <AudioLines size={22} />
                    </div>
                    <div className="title-block">
                      <b className="session-title">{session.title}</b>
                      <small className="session-date-row">
                        <Calendar size={12} /> {session.date} • {session.category}
                      </small>
                      <small className="history-patient-name">
                        <button
                          type="button"
                          className="history-patient-button"
                          aria-expanded={isExpanded}
                          onClick={(event) => {
                            event.stopPropagation()
                            setCurrentSession(session)
                            setExpandedSessionId(isExpanded ? '' : session.id)
                          }}
                        >
                          <span className="history-patient-label">
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'Unassigned sample session'}
                          </span>
                          <span className="history-patient-action">
                            {isExpanded ? 'Hide analysis' : 'View disease analysis'}
                          </span>
                        </button>
                      </small>
                    </div>
                  </div>

                  <div className="card-center">
                    <div className="metric-chip font-mono">
                      <span>Jitter: <b>{session.metrics?.jitter != null ? `${((session.metrics.jitter || 0) * 100).toFixed(2)}%` : 'N/A'}</b></span>
                      <span>Shimmer: <b>{session.metrics?.shimmer != null ? `${((session.metrics.shimmer || 0) * 100).toFixed(2)}%` : 'N/A'}</b></span>
                      <span>HNR: <b>{session.metrics?.hnr != null ? `${Number(session.metrics.hnr || 0).toFixed(1)} dB` : 'N/A'}</b></span>
                    </div>
                    <span className={`neon-badge ${badgeClass}`}>
                      <RiskIcon size={13} /> {session.riskLevel}
                    </span>
                  </div>

                  <div className="card-right">
                    <div className="duration-pill font-mono">
                      <Clock size={14} /> {session.duration}
                    </div>

                    <SessionAudioButton session={session} accountId={accountId} />

                    <button
                      className="action-icon-btn"
                      onClick={(e) => handleExportPDF(session, e)}
                      title="Export JSON report"
                    >
                      <Download size={16} />
                    </button>

                    <button
                      className="action-icon-btn danger"
                      onClick={(e) => handleDelete(session.id, e)}
                      title="Delete session"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <PatientVoiceReport
                    session={session}
                    patient={patient}
                    patientSessions={patientSessions}
                    accountId={accountId}
                    onSelectSession={(next) => {
                      setCurrentSession(next)
                      setExpandedSessionId(next.id)
                    }}
                    onClose={() => setExpandedSessionId('')}
                  />
                )}
              </div>
            )
          })
        )}
      </div>

      <style>{`
        .history-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .history-header {
          padding: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(15, 20, 38, 0.7), rgba(157, 78, 221, 0.1));
        }

        .history-title {
          font-size: 1.8rem;
          color: #fff;
          font-weight: 800;
        }

        .history-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          max-width: 600px;
        }

        .filter-controls-bar {
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        @media (max-width: 900px) {
          .filter-controls-bar { align-items: stretch; flex-direction: column; }
          .risk-filters { flex-wrap: wrap; }
        }

        .patient-history-filter { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: .8rem; }
        .patient-history-filter select { max-width: 190px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.12); border-radius: 8px; color: #fff; padding: 8px; }
        .patient-history-filter option { background: #101525; }
        .history-patient-name { display: block; margin-top: 4px; }
        .history-patient-button { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; max-width: 100%; padding: 3px 9px; border-radius: 8px; background: rgba(0, 242, 254, .08); border: 1px solid rgba(0, 242, 254, .3); color: var(--neon-cyan); font: inherit; font-size: .72rem; font-weight: 700; cursor: pointer; transition: var(--transition-smooth); }
        .history-patient-button:hover { background: rgba(0, 242, 254, .16); border-color: var(--neon-cyan); }
        .history-patient-label { color: var(--neon-cyan); }
        .history-patient-action { color: var(--text-muted); font-weight: 600; }
        .history-patient-button:hover .history-patient-action { color: #fff; }
        .history-entry { display: flex; flex-direction: column; gap: 12px; }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          color: var(--text-dim);
        }

        .search-box input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 8px 16px 8px 40px;
          color: #fff;
          font-size: 0.88rem;
        }

        .risk-filters {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-icon {
          color: var(--text-dim);
        }

        .filter-chip {
          padding: 6px 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .filter-chip.active {
          background: rgba(0, 242, 254, 0.15);
          border-color: var(--neon-cyan);
          color: var(--neon-cyan);
        }

        .history-list {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-history {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
          gap: 12px;
          color: var(--text-dim);
        }

        .history-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .history-card:hover, .history-card.selected {
          background: rgba(0, 242, 254, 0.08);
          border-color: rgba(0, 242, 254, 0.3);
        }

        .card-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
        }

        .session-type-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(0, 242, 254, 0.12);
          color: var(--neon-cyan);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .title-block {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .session-title {
          font-size: 1rem;
          color: #fff;
        }

        .session-date-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          color: var(--text-dim);
        }

        .card-center {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          justify-content: center;
        }

        .metric-chip {
          display: flex;
          gap: 12px;
          font-size: 0.78rem;
          color: var(--text-muted);
          background: rgba(0, 0, 0, 0.3);
          padding: 6px 12px;
          border-radius: 8px;
        }

        .metric-chip b {
          color: #fff;
        }

        .card-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .duration-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .action-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .action-icon-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
        }

        .action-icon-btn.danger:hover {
          background: rgba(255, 0, 127, 0.2);
          color: var(--neon-magenta);
          border-color: var(--neon-magenta);
        }
      `}</style>
    </div>
  )
}
