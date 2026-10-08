import { useMemo } from 'react'
import {
  Activity,
  AlertCircle,
  Brain,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Gauge,
  HeartPulse,
  Mic,
  ShieldAlert,
  TrendingUp,
  X,
} from 'lucide-react'
import SessionAudioButton from '../common/SessionAudioButton'
import { getRiskColor } from '../../utils/predictionLabels'
import {
  buildPatientDiseaseSummary,
  formatPercent,
  getPredictionConsistency,
  getSessionPrimaryResult,
  groupByCategory,
  normalizeDiseaseScores,
  toPercent,
} from '../../utils/diseaseScores'

const RADIUS = 62
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const STROKE_COLORS = {
  green: '#00f5d4',
  red: '#ff007f',
  orange: '#ff5400',
  yellow: '#ffb703',
  blue: '#00f2fe',
}

const BADGE_CLASSES = {
  green: 'emerald',
  red: 'magenta',
  orange: 'magenta',
  yellow: 'amber',
  blue: 'cyan',
}

function RiskIcon({ color }) {
  if (color === 'green') return <CheckCircle2 size={13} />
  if (color === 'yellow') return <AlertCircle size={13} />
  return <ShieldAlert size={13} />
}

function MetricChip({ label, value, hint }) {
  return (
    <div className="report-metric" title={hint}>
      <span>{label}</span>
      <b className="font-mono">{value}</b>
    </div>
  )
}

/**
 * Every condition percentage the model produced for a sample, grouped into
 * Parkinsonism-related and other conditions, with a healthy-voice row on top.
 *
 * @param {object} props
 * @param {Array} props.scores - Normalised score list.
 * @param {number} props.healthyProbability - Healthy voice percentage.
 * @param {string} props.primaryId - Id of the leading result.
 * @param {'session'|'patient'} [props.mode] - Label variant.
 * @param {string} [props.emptyMessage] - Shown when no scores are stored.
 */
function DiseaseScoreBreakdown({
  scores,
  healthyProbability,
  primaryId,
  mode = 'session',
  emptyMessage = 'No stored condition scores for this sample.',
}) {
  const list = Array.isArray(scores) ? scores : []
  const { parkinsonism, other } = groupByCategory(list)
  const healthyValue = toPercent(healthyProbability)
  const showHealthy = primaryId === 'Healthy' || healthyProbability != null
  const suffix = mode === 'patient' ? 'avg' : 'score'

  if (list.length === 0 && !showHealthy) {
    return <p className="breakdown-empty">{emptyMessage}</p>
  }

  const renderRow = (score) => {
    const isPrimary = score.id === primaryId
    const width = Math.min(100, Math.max(0, score.probability))
    return (
      <li key={score.id} className={`breakdown-row ${isPrimary ? 'is-primary' : ''}`}>
        <div className="breakdown-row-head">
          <span className="breakdown-code font-mono">{score.short}</span>
          <span className="breakdown-name" title={score.description || score.name}>{score.name}</span>
          {mode === 'patient' && score.primaryCount > 0 && (
            <span className="breakdown-tag">top in {score.primaryCount}/{score.sampleCount}</span>
          )}
          {isPrimary && mode === 'session' && <span className="breakdown-tag primary-tag">LEADING</span>}
          <b className="breakdown-value font-mono">{score.probability.toFixed(1)}%</b>
        </div>
        <div className="breakdown-track">
          <span
            className={`breakdown-fill ${isPrimary ? 'primary-fill' : ''}`}
            style={{ width: `${width}%` }}
          />
        </div>
      </li>
    )
  }

  return (
    <div className="disease-breakdown">
      {showHealthy && (
        <ul className="breakdown-group breakdown-group-healthy">
          <li className={`breakdown-row ${primaryId === 'Healthy' ? 'is-primary' : ''}`}>
            <div className="breakdown-row-head">
              <span className="breakdown-code font-mono"><HeartPulse size={12} /></span>
              <span className="breakdown-name">Healthy voice pattern</span>
              {primaryId === 'Healthy' && <span className="breakdown-tag primary-tag">LEADING</span>}
              <b className="breakdown-value font-mono">{healthyValue.toFixed(1)}%</b>
            </div>
            <div className="breakdown-track">
              <span
                className="breakdown-fill healthy-fill"
                style={{ width: `${Math.min(100, Math.max(0, healthyValue))}%` }}
              />
            </div>
          </li>
        </ul>
      )}

      {parkinsonism.length > 0 && (
        <section className="breakdown-group" aria-label="Parkinsonism-related condition scores">
          <h4 className="breakdown-group-title">
            <Activity size={14} /> Parkinsonism-related ({parkinsonism.length}) <small>{suffix}</small>
          </h4>
          <ul className="breakdown-rows">{parkinsonism.map(renderRow)}</ul>
        </section>
      )}

      {other.length > 0 && (
        <section className="breakdown-group" aria-label="Other neurological condition scores">
          <h4 className="breakdown-group-title">
            <Activity size={14} /> Other neurological ({other.length}) <small>{suffix}</small>
          </h4>
          <ul className="breakdown-rows">{other.map(renderRow)}</ul>
        </section>
      )}
    </div>
  )
}

/**
 * Full analysis read-out for one saved patient voice sample — the same result
 * view that appears after an audio upload, plus the aggregated record of every
 * sample already collected for that patient.
 *
 * @param {object} props
 * @param {object} props.session - The saved session being inspected.
 * @param {object} [props.patient] - Owner of the session.
 * @param {Array} props.patientSessions - Every session collected for the patient.
 * @param {(session: object) => void} [props.onSelectSession] - Switch sample.
 * @param {() => void} [props.onClose] - Collapse the report.
 * @param {string} [props.accountId] - Account id used to resolve stored audio.
 */
export default function PatientVoiceReport({
  session,
  patient,
  patientSessions,
  onSelectSession,
  onClose,
  accountId,
}) {
  const samples = useMemo(() => (Array.isArray(patientSessions) ? patientSessions : []), [patientSessions])
  const summary = useMemo(() => buildPatientDiseaseSummary(samples), [samples])
  const consistency = useMemo(() => getPredictionConsistency(samples), [samples])

  const primary = getSessionPrimaryResult(session)
  const scores = normalizeDiseaseScores(session?.diseaseScores)
  const riskColor = getRiskColor(primary.id)
  const badgeClass = BADGE_CLASSES[riskColor] || 'cyan'
  const strokeColor = STROKE_COLORS[riskColor] || '#00f2fe'

  const metrics = session?.metrics || {}
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unassigned patient'
  const dashOffset = CIRCUMFERENCE - (toPercent(primary.score) / 100) * CIRCUMFERENCE

  return (
    <section
      className="patient-report glass-panel animate-fade-in"
      aria-label={`Voice analysis for ${patientName}`}
    >
      <header className="report-head">
        <div className="report-head-identity">
          <span className="report-avatar" aria-hidden="true">
            {patient ? `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}` : <Mic size={16} />}
          </span>
          <div>
            <p className="eyebrow neon-badge neon-badge-purple">SAVED VOICE ANALYSIS</p>
            <h3 className="report-title">{patientName}</h3>
            <p className="report-subtitle">
              <Calendar size={12} /> {session?.title} · {session?.date} · {session?.category}
            </p>
          </div>
        </div>

        <div className="report-head-actions">
          <span className={`neon-badge neon-badge-${badgeClass}`}>
            <RiskIcon color={riskColor} /> {session?.riskLevel || 'Risk level unavailable'}
          </span>
          <SessionAudioButton session={session} accountId={accountId} />
          {onClose && (
            <button
              type="button"
              className="report-close"
              onClick={onClose}
              title="Hide analysis"
              aria-label="Hide analysis"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="report-body">
        <div className="report-gauge">
          <div className="report-gauge-visual">
            <svg
              width="150"
              height="150"
              viewBox="0 0 150 150"
              className="report-gauge-svg"
              role="img"
              aria-label={`Leading condition score ${primary.score.toFixed(1)} percent`}
            >
              <circle cx="75" cy="75" r={RADIUS} className="report-gauge-track" strokeWidth="10" />
              <circle
                cx="75"
                cy="75"
                r={RADIUS}
                className="report-gauge-fill"
                stroke={strokeColor}
                strokeWidth="10"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="report-gauge-center">
              <span className="report-gauge-number font-display">{primary.score.toFixed(1)}%</span>
              <span className="report-gauge-caption">LEADING SCORE</span>
            </div>
          </div>

          <div className="report-primary-copy">
            <b>{primary.name}</b>
            <p>{primary.label}</p>
            {session?.confidence && (
              <span className="report-confidence">
                <Brain size={13} /> {session.confidence} confidence
              </span>
            )}
          </div>
        </div>

        <div className="report-side">
          <h4 className="report-section-title">
            <Activity size={15} /> Acoustic biomarkers
          </h4>
          <div className="report-metrics">
            <MetricChip
              label="Jitter"
              value={metrics.jitter != null ? `${(Number(metrics.jitter) * 100).toFixed(2)}%` : 'N/A'}
              hint="Cycle-to-cycle frequency perturbation. Normal below 1.0%."
            />
            <MetricChip
              label="Shimmer"
              value={metrics.shimmer != null ? `${(Number(metrics.shimmer) * 100).toFixed(2)}%` : 'N/A'}
              hint="Cycle-to-cycle amplitude perturbation. Normal below 3.8%."
            />
            <MetricChip
              label="HNR"
              value={metrics.hnr != null ? `${Number(metrics.hnr).toFixed(1)} dB` : 'N/A'}
              hint="Harmonics-to-noise ratio. Optimal above 20 dB."
            />
            <MetricChip
              label="F0 mean"
              value={metrics.fo != null ? `${Number(metrics.fo).toFixed(1)} Hz` : 'N/A'}
              hint="Mean fundamental frequency of the recorded sample."
            />
            <MetricChip
              label="Clarity"
              value={session?.clarityScore != null ? `${Number(session.clarityScore).toFixed(0)}/100` : 'N/A'}
              hint="Composite phonation clarity index stored with the session."
            />
            <MetricChip
              label="Duration"
              value={session?.duration || 'N/A'}
              hint="Length of the analysed recording."
            />
          </div>

          <h4 className="report-section-title report-section-spaced">
            <ClipboardList size={15} /> Patient record
          </h4>
          <dl className="report-patient-meta">
            <div><dt>Registered diagnosis</dt><dd>{patient?.diagnosis || 'Not provided'}</dd></div>
            <div><dt>Clinician</dt><dd>{patient?.clinician || 'Not provided'}</dd></div>
            <div><dt>Samples collected</dt><dd>{summary.sessionCount}</dd></div>
            <div><dt>Trend across samples</dt><dd>{consistency.label}</dd></div>
          </dl>
        </div>
      </div>

      <div className="report-conditions">
        <h4 className="report-section-title">
          <Gauge size={15} /> This sample — condition percentages
        </h4>
        <p className="report-note">
          All condition scores the model produced for this voice sample. They are model scores for the
          recording, not the probability that the patient has any condition.
        </p>
        <DiseaseScoreBreakdown
          scores={scores}
          healthyProbability={session?.healthyProbability}
          primaryId={primary.id}
          mode="session"
          emptyMessage="This saved session has no stored condition breakdown — only the leading result was kept."
        />
      </div>

      {summary.analysedCount > 0 && (
        <div className="report-record">
          <h4 className="report-section-title">
            <TrendingUp size={15} /> Collected record — {summary.analysedCount}{' '}
            analysed sample{summary.analysedCount === 1 ? '' : 's'}
          </h4>
          <p className="report-note">
            Average condition percentages across every sample already collected for this patient. Leading
            result: <b>{summary.primaryName}</b> · healthy voice average{' '}
            {formatPercent(summary.healthyProbability)}.
          </p>
          <DiseaseScoreBreakdown
            scores={summary.scores}
            healthyProbability={summary.healthyProbability}
            primaryId={summary.primaryPrediction}
            mode="patient"
          />
        </div>
      )}

      {samples.length > 0 && (
        <div className="report-history">
          <h4 className="report-section-title">
            <HeartPulse size={15} /> Sample history ({samples.length})
          </h4>
          <ul className="report-history-list">
            {samples.map((entry) => {
              const entryPrimary = getSessionPrimaryResult(entry)
              const isCurrent = entry.id === session?.id
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={`report-history-item ${isCurrent ? 'is-current' : ''}`}
                    onClick={() => onSelectSession?.(entry)}
                    aria-current={isCurrent}
                  >
                    <span className="report-history-main">
                      <b>{entry.title}</b>
                      <small>{entry.date} · {entry.category} · {entry.duration}</small>
                    </span>
                    <span className="report-history-result">
                      <b>{entryPrimary.name}</b>
                      <small className="font-mono">{formatPercent(entryPrimary.score)}</small>
                    </span>
                    <span
                      className={`neon-badge neon-badge-${BADGE_CLASSES[getRiskColor(entry.prediction)] || 'cyan'}`}
                    >
                      {entry.riskLevel || 'Unrated'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <p className="report-disclaimer">
        Experimental research output. These percentages are model scores for the recorded voice sample and
        are not a diagnosis or the probability that the patient has any condition. Discuss any concerns with
        a qualified clinician.
      </p>

      <style>{`
        .patient-report { padding: 22px; display: flex; flex-direction: column; gap: 20px; border-color: rgba(0, 242, 254, .28); }

        .report-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .report-head-identity { display: flex; align-items: center; gap: 13px; min-width: 0; }
        .report-avatar { display: grid; place-items: center; flex: 0 0 44px; height: 44px; border-radius: 50%; background: rgba(157, 78, 221, .18); border: 1px solid rgba(157, 78, 221, .45); color: #fff; font-weight: 800; font-size: .85rem; }
        .report-title { color: #fff; font-size: 1.25rem; margin: 6px 0 3px; }
        .report-subtitle { display: flex; align-items: center; gap: 6px; color: var(--text-dim); font-size: .76rem; }
        .report-head-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .report-close { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 9px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); color: var(--text-muted); cursor: pointer; transition: var(--transition-smooth); }
        .report-close:hover { background: rgba(255,255,255,.12); color: #fff; }

        .report-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 20px; }

        .report-gauge { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
        .report-gauge-visual { position: relative; width: 150px; height: 150px; }
        .report-gauge-svg { transform: rotate(-90deg); }
        .report-gauge-track { fill: none; stroke: rgba(255,255,255,.08); }
        .report-gauge-fill { fill: none; transition: stroke-dashoffset .8s ease; }
        .report-gauge-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; }
        .report-gauge-number { font-size: 1.85rem; font-weight: 800; color: #fff; }
        .report-gauge-caption { font-size: .62rem; letter-spacing: .1em; color: var(--text-dim); font-weight: 700; }
        .report-primary-copy b { display: block; color: #fff; font-size: .98rem; }
        .report-primary-copy p { color: var(--text-muted); font-size: .8rem; line-height: 1.45; margin-top: 4px; }
        .report-confidence { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; padding: 4px 10px; border-radius: 20px; background: rgba(0,242,254,.1); border: 1px solid rgba(0,242,254,.3); color: var(--neon-cyan); font-size: .7rem; font-weight: 700; }

        .report-side { display: flex; flex-direction: column; gap: 10px; }
        .report-section-title { display: flex; align-items: center; gap: 7px; color: #fff; font-size: .85rem; font-weight: 700; }
        .report-section-title svg { color: var(--neon-cyan); flex: 0 0 auto; }
        .report-section-spaced { margin-top: 8px; }

        .report-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
        .report-metric { display: flex; flex-direction: column; gap: 3px; padding: 9px 11px; border-radius: 9px; background: rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.06); min-width: 0; }
        .report-metric span { color: var(--text-dim); font-size: .66rem; }
        .report-metric b { color: #fff; font-size: .82rem; overflow-wrap: anywhere; }

        .report-patient-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .report-patient-meta > div { min-width: 0; }
        .report-patient-meta dt { color: var(--text-dim); font-size: .68rem; margin-bottom: 3px; }
        .report-patient-meta dd { color: #e5ebef; font-size: .78rem; overflow-wrap: anywhere; }

        .report-conditions, .report-record, .report-history { display: flex; flex-direction: column; gap: 10px; border-top: 1px solid rgba(255,255,255,.09); padding-top: 16px; }
        .report-note { color: var(--text-muted); font-size: .78rem; line-height: 1.55; }
        .report-note b { color: #fff; }

        .disease-breakdown { display: flex; flex-direction: column; gap: 14px; }
        .breakdown-empty { color: var(--text-muted); font-size: .82rem; }
        .breakdown-group { display: flex; flex-direction: column; gap: 8px; }
        .breakdown-group-healthy { list-style: none; margin: 0; padding: 0; }
        .breakdown-group-title { display: flex; align-items: center; gap: 7px; color: var(--text-muted); font-size: .7rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; margin: 0; }
        .breakdown-group-title svg { color: var(--neon-cyan); flex: 0 0 auto; }
        .breakdown-group-title small { color: var(--text-dim); font-size: .62rem; font-weight: 700; letter-spacing: 0; text-transform: none; }
        .breakdown-rows { list-style: none; display: flex; flex-direction: column; gap: 7px; margin: 0; padding: 0; }
        .breakdown-row { display: flex; flex-direction: column; gap: 5px; padding: 8px 10px; border-radius: 9px; background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.06); }
        .breakdown-row.is-primary { background: rgba(0,242,254,.09); border-color: rgba(0,242,254,.35); }
        .breakdown-row-head { display: flex; align-items: center; gap: 8px; }
        .breakdown-code { display: inline-flex; align-items: center; justify-content: center; min-width: 34px; height: 20px; padding: 0 5px; border-radius: 6px; background: rgba(0,242,254,.12); color: var(--neon-cyan); font-size: .64rem; font-weight: 700; flex: 0 0 auto; }
        .breakdown-name { flex: 1; min-width: 0; color: #e8eef4; font-size: .78rem; overflow-wrap: anywhere; }
        .breakdown-value { color: #fff; font-size: .78rem; flex: 0 0 auto; }
        .breakdown-tag { flex: 0 0 auto; font-size: .6rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--text-dim); border: 1px solid rgba(255,255,255,.12); border-radius: 6px; padding: 2px 5px; }
        .breakdown-tag.primary-tag { color: var(--neon-cyan); border-color: rgba(0,242,254,.4); background: rgba(0,242,254,.12); }
        .breakdown-track { height: 6px; border-radius: 4px; background: rgba(255,255,255,.07); overflow: hidden; }
        .breakdown-fill { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #00f2fe, #9d4edd); transition: width .6s cubic-bezier(.4,0,.2,1); }
        .breakdown-fill.primary-fill { background: linear-gradient(90deg, #00f2fe, #00f5d4); box-shadow: 0 0 10px rgba(0,242,254,.5); }
        .breakdown-fill.healthy-fill { background: linear-gradient(90deg, #00f5d4, #00b4d8); }

        .report-history-list { list-style: none; display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; }
        .report-history-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 11px 13px; border-radius: 10px; background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.08); color: var(--text-muted); text-align: left; cursor: pointer; transition: var(--transition-smooth); }
        .report-history-item:hover { border-color: rgba(0,242,254,.4); background: rgba(0,242,254,.07); }
        .report-history-item.is-current { border-color: var(--neon-cyan); background: rgba(0,242,254,.1); }
        .report-history-main { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
        .report-history-main b { color: #fff; font-size: .82rem; }
        .report-history-main small { color: var(--text-dim); font-size: .7rem; }
        .report-history-result { display: flex; flex-direction: column; gap: 2px; text-align: right; flex: 0 0 auto; }
        .report-history-result b { color: var(--neon-cyan); font-size: .78rem; }
        .report-history-result small { color: var(--text-muted); font-size: .72rem; }

        .report-disclaimer { color: var(--text-dim); font-size: .72rem; line-height: 1.55; border-top: 1px solid rgba(255,255,255,.09); padding-top: 12px; }

        @media (max-width: 860px) {
          .report-body { grid-template-columns: 1fr; }
          .report-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .report-history-item { flex-wrap: wrap; }
        }

        @media (max-width: 560px) {
          .patient-report { padding: 16px; }
          .report-metrics { grid-template-columns: 1fr; }
          .report-patient-meta { grid-template-columns: 1fr; }
          .report-head-actions { width: 100%; }
          .breakdown-row-head { flex-wrap: wrap; }
        }
      `}</style>
    </section>
  )
}
