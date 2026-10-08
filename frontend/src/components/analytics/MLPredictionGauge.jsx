import { useEffect, useState } from 'react'
import { AlertCircle, Brain, CheckCircle2, ShieldAlert } from 'lucide-react'
import { getParkinsonPredictionLabel } from '../../utils/predictionLabels'

export default function MLPredictionGauge({ session }) {

  const parkinsonScore =
    session?.parkinsonProbability ?? session?.riskScore ?? 0

  const healthyProbability = session?.healthyProbability ?? 0
  const parkinsonProbability = session?.parkinsonProbability ?? 0
  const rawPrediction = session?.prediction
  const prediction = getParkinsonPredictionLabel(rawPrediction)

  const [animatedProgress, setAnimatedProgress] = useState({
    sessionId: '',
    score: 0,
  })

  useEffect(() => {
    if (!session?.id || parkinsonScore <= 0) return undefined

    let current = 0
    const interval = setInterval(() => {
      current += 2

      if (current >= parkinsonScore) {
        setAnimatedProgress({ sessionId: session.id, score: parkinsonScore })
        clearInterval(interval)
      } else {
        setAnimatedProgress({ sessionId: session.id, score: current })
      }
    }, 25)

    return () => clearInterval(interval)
  }, [parkinsonScore, session?.id])

  const animatedScore =
    animatedProgress.sessionId === session?.id ? animatedProgress.score : 0

  let colorClass = 'emerald'
  let strokeColor = '#00f5d4'
  let Icon = CheckCircle2

  if (rawPrediction === 'Parkinson') {
    colorClass = 'magenta'
    strokeColor = '#ff007f'
    Icon = ShieldAlert
  } else if (rawPrediction === 'Uncertain') {
    colorClass = 'amber'
    strokeColor = '#ffb703'
    Icon = AlertCircle
  }

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference

  if (!session) {
    return (
      <div className="gauge-card glass-panel gauge-empty-card">
        <div className="gauge-header">
          <div>
            <p className="eyebrow neon-badge neon-badge-cyan">
              VOICE ANALYSIS
            </p>
            <h3 className="gauge-title">
              Parkinson AI Prediction
            </h3>
          </div>

          <Brain size={24} className="brain-icon" />
        </div>

        <p className="gauge-summary">
          No analyzed voice sample available.
        </p>

        <style>{`
          .gauge-empty-card {
            min-height: 230px;
            justify-content: center;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="gauge-card glass-panel">

      <div className="gauge-header">
        <div>
          <p className={`eyebrow neon-badge neon-badge-${colorClass}`}>
            AI MODEL RESULT
          </p>

          <h3 className="gauge-title">
            Parkinson AI Prediction
          </h3>
        </div>

        <Brain size={24} className="brain-icon" />
      </div>

      <div className="gauge-visual-wrap">
        <svg
          className="radial-gauge-svg"
          width="180"
          height="180"
          viewBox="0 0 180 180"
        >
          <circle
            cx="90"
            cy="90"
            r={radius}
            className="gauge-bg-circle"
            strokeWidth="12"
          />

          <circle
            cx="90"
            cy="90"
            r={radius}
            className="gauge-progress-circle"
            stroke={strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="gauge-center-content">
          <span className="gauge-number">
            {animatedScore.toFixed(1)}%
          </span>

          <span className="gauge-label">
            PARKINSON'S DISEASE MODEL SCORE
          </span>
        </div>
      </div>

      <div className={`risk-result-badge ${colorClass}`}>
        <Icon size={18} />
        <b>{prediction}</b>
      </div>

      <p className="gauge-summary">
        Experimental model output only—not a medical diagnosis and cannot
        confirm or rule out Parkinson's disease. This model does not evaluate
        other conditions; discuss concerns with a qualified clinician.
        <br />
        <strong>Control comparison score:</strong>{' '}
        {healthyProbability.toFixed(1)}%
        <br />
        <strong>Parkinson's disease model score:</strong>{' '}
        {parkinsonProbability.toFixed(1)}%
        <br />
        <small>
          Percentage is the model's score for this voice sample, not the
          probability that the patient has Parkinson's disease.
        </small>
      </p>

      <div className="gauge-footer-stats">
        <div className="stat-col">
          <span>Control score</span>
          <b>{healthyProbability.toFixed(1)}%</b>
        </div>

        <div className="stat-divider" />

        <div className="stat-col">
          <span>Model</span>
          <b>Random Forest</b>
        </div>

        <div className="stat-divider" />

        <div className="stat-col">
          <span>Parkinson's disease score</span>
          <b>{parkinsonProbability.toFixed(1)}%</b>
        </div>
      </div>

      <style>{`
        .gauge-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }

        .gauge-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .gauge-title {
          font-size: 1.15rem;
          color: #fff;
          font-weight: 700;
          text-align: left;
        }

        .brain-icon {
          color: var(--neon-cyan);
        }

        .gauge-visual-wrap {
          position: relative;
          width: 180px;
          height: 180px;
        }

        .radial-gauge-svg {
          transform: rotate(-90deg);
        }

        .gauge-bg-circle {
          fill: none;
          stroke: rgba(255,255,255,0.08);
        }

        .gauge-progress-circle {
          fill: none;
          transition: stroke-dashoffset .8s ease;
        }

        .gauge-center-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .gauge-number {
          font-size: 2.2rem;
          font-weight: 800;
          color: white;
        }

        .gauge-label {
          font-size: .75rem;
          color: var(--text-muted);
        }

        .risk-result-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 20px;
          width: 100%;
          justify-content: center;
        }

        .risk-result-badge.emerald {
          color: #00f5d4;
          background: rgba(0,245,212,.1);
        }

        .risk-result-badge.amber {
          color: #ffb703;
          background: rgba(255,183,3,.1);
        }

        .risk-result-badge.magenta {
          color: #ff007f;
          background: rgba(255,0,127,.1);
        }

        .gauge-summary {
          color: var(--text-muted);
          line-height: 1.6;
        }

        .gauge-footer-stats {
          width: 100%;
          display: flex;
          justify-content: space-around;
          align-items: center;
          border-top: 1px solid rgba(255,255,255,.08);
          padding-top: 12px;
        }

        .stat-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-col span {
          font-size: .72rem;
          color: var(--text-muted);
        }

        .stat-col b {
          color: white;
        }

        .stat-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,.1);
        }
      `}</style>

    </div>
  )
}