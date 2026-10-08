import { useState } from 'react'
import { Activity, BarChart2, Info, Waves, Zap, X } from 'lucide-react'
import { ACOUSTIC_BIOMARKERS } from '../../data/acousticKnowledge'

export default function AcousticMetricsGrid({ metrics }) {
  const [selectedBio, setSelectedBio] = useState(null)

  if (!metrics) {
    return (
      <section className="metrics-section">
        <div className="section-title-wrap">
          <div>
            <p className="eyebrow neon-badge neon-badge-cyan">ACOUSTIC BIOMARKER MATRIX</p>
            <h3 className="section-heading-text">Vocal Signal Biomarkers</h3>
          </div>
        </div>
        <p className="metrics-empty glass-panel">No analysis for this patient yet. Record a voice sample or upload an audio file to see metrics.</p>
        <style>{`.metrics-empty { padding: 22px; color: var(--text-muted); font-size: .9rem; }`}</style>
      </section>
    )
  }

  const m = {
  jitter: metrics?.jitter ?? 0,
  shimmer: metrics?.shimmer ?? 0,
  hnr: metrics?.hnr ?? 0,
  ppe: metrics?.ppe ?? 0,
  rpde: metrics?.rpde ?? 0,
  dfa: metrics?.dfa ?? 0,
  fo: metrics?.fo ?? 0
}

  const metricCards = [
    {
      id: 'jitter',
      title: 'Jitter (local)',
      value: `${(m.jitter * 100).toFixed(2)}%`,
      status: m.jitter < 0.01 ? 'Normal' : 'Elevated',
      statusColor: m.jitter < 0.01 ? 'emerald' : 'magenta',
      subtext: `Normal < 1.0% (F0: ${m.fo} Hz)`,
      icon: Activity
    },
    {
      id: 'shimmer',
      title: 'Shimmer (local)',
      value: `${(m.shimmer * 100).toFixed(2)}%`,
      status: m.shimmer < 0.038 ? 'Normal' : 'Elevated',
      statusColor: m.shimmer < 0.038 ? 'emerald' : 'amber',
      subtext: 'Normal < 3.8% (Amp Variation)',
      icon: Waves
    },
    {
      id: 'hnr',
      title: 'HNR Ratio',
      value: `${m.hnr.toFixed(1)} dB`,
      status: m.hnr > 20 ? 'Optimal' : 'Low Noise Ratio',
      statusColor: m.hnr > 20 ? 'cyan' : 'amber',
      subtext: 'Optimal > 20 dB Phonation',
      icon: Zap
    },
    {
      id: 'ppe',
      title: 'PPE Score',
      value: m.ppe.toFixed(3),
      status: m.ppe < 0.15 ? 'Stable' : 'High Entropy',
      statusColor: m.ppe < 0.15 ? 'purple' : 'magenta',
      subtext: 'Pitch Period Entropy (< 0.15)',
      icon: BarChart2
    },
    {
      id: 'rpde',
      title: 'RPDE Entropy',
      value: m.rpde.toFixed(3),
      status: m.rpde < 0.45 ? 'Normal' : 'Turbulent',
      statusColor: m.rpde < 0.45 ? 'emerald' : 'amber',
      subtext: 'Phase Space Recurrence',
      icon: Activity
    },
    {
      id: 'dfa',
      title: 'DFA Fractal Exponent',
      value: m.dfa.toFixed(3),
      status: 'Scaling Valid',
      statusColor: 'cyan',
      subtext: 'Fractal Scaling (0.50 - 0.70)',
      icon: Waves
    }
  ]

  return (
    <div className="metrics-section">
      <div className="section-title-wrap">
        <div>
          <p className="eyebrow neon-badge neon-badge-cyan">ACOUSTIC BIOMARKER MATRIX</p>
          <h3 className="section-heading-text">Vocal Signal Biomarkers</h3>
        </div>
        <span className="matrix-badge font-mono">12-FEATURE PARKINSON VECTOR</span>
      </div>

      <div className="metrics-grid">
        {metricCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.id} className="metric-card glass-panel">
              <div className="metric-card-top">
                <div className="metric-icon-box">
                  <Icon size={18} />
                </div>
                <button
                  className="info-btn"
                  onClick={() => setSelectedBio(ACOUSTIC_BIOMARKERS[card.id])}
                  title="View Metric Info"
                >
                  <Info size={15} />
                </button>
              </div>

              <div className="metric-value-wrap">
                <span className="metric-val font-display">{card.value}</span>
                <span className="metric-name">{card.title}</span>
              </div>

              <div className="metric-card-bottom">
                <span className={`neon-badge neon-badge-${card.statusColor}`}>
                  {card.status}
                </span>
                <small className="metric-subtext">{card.subtext}</small>
              </div>
            </div>
          )
        })}
      </div>

      {/* Metric Detail Modal */}
      {selectedBio && (
        <div className="modal-backdrop" onClick={() => setSelectedBio(null)}>
          <div className="modal-card glass-panel-heavy" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="gradient-text font-display">{selectedBio.title}</h4>
              <button className="modal-close" onClick={() => setSelectedBio(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-row">
                <span>Clinical Reference Range:</span>
                <b className="neon-badge neon-badge-cyan">{selectedBio.normalRange}</b>
              </div>
              <p className="modal-desc">{selectedBio.description}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .metrics-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-title-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-heading-text {
          font-size: 1.25rem;
          color: #fff;
          font-weight: 700;
        }

        .matrix-badge {
          font-size: 0.72rem;
          color: var(--neon-cyan);
          background: rgba(0, 242, 254, 0.1);
          border: 1px solid rgba(0, 242, 254, 0.3);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 900px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }

        .metric-card {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .metric-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .metric-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(0, 242, 254, 0.1);
          color: var(--neon-cyan);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .info-btn {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: var(--transition-smooth);
        }

        .info-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        .metric-value-wrap {
          display: flex;
          flex-direction: column;
        }

        .metric-val {
          font-size: 1.6rem;
          font-weight: 800;
          color: #fff;
        }

        .metric-name {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .metric-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .metric-subtext {
          font-size: 0.7rem;
          color: var(--text-dim);
        }

        /* Modal styling */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-card {
          width: 100%;
          max-width: 440px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fade-in-up 0.3s ease;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-header h4 {
          font-size: 1.2rem;
        }

        .modal-close {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .modal-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .modal-desc {
          font-size: 0.88rem;
          color: #cbd5e1;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}
