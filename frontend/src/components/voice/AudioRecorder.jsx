import { useEffect, useRef, useState } from 'react'
import { Activity, AlertTriangle, CheckCircle, Mic, RefreshCw, Square } from 'lucide-react'
import { useVoiceApp } from '../../context/VoiceAppContext'
import { extractAcousticFeatures } from '../../utils/audioAnalysis'
import { saveSessionAudio } from '../../utils/audioStorage'
import { getRiskColor } from '../../utils/predictionLabels'
import LiveAudioCanvas from './LiveAudioCanvas'

const RISK_COLORS = {
  green:  { border: 'rgba(0,245,112,0.45)',  bg: 'rgba(0,245,112,0.07)',  text: '#00f570', glow: '0 0 24px rgba(0,245,112,0.3)' },
  red:    { border: 'rgba(255,48,79,0.5)',   bg: 'rgba(255,48,79,0.09)',  text: '#ff304f', glow: '0 0 24px rgba(255,48,79,0.3)' },
  orange: { border: 'rgba(255,140,0,0.45)',  bg: 'rgba(255,140,0,0.08)', text: '#ff8c00', glow: '0 0 24px rgba(255,140,0,0.3)' },
  yellow: { border: 'rgba(255,220,0,0.4)',   bg: 'rgba(255,220,0,0.07)', text: '#ffd700', glow: '0 0 24px rgba(255,220,0,0.3)' },
  blue:   { border: 'rgba(0,180,255,0.4)',   bg: 'rgba(0,180,255,0.07)', text: '#00b4ff', glow: '0 0 24px rgba(0,180,255,0.3)' },
}

function PrimaryDiseaseResult({ result, onRecordAgain }) {
  const top = result.disease_scores?.[0]
  const primaryId = result.primary_prediction || 'Unknown'
  const isHealthy = primaryId === 'Healthy'
  const colorKey = getRiskColor(primaryId)
  const colors = RISK_COLORS[colorKey] || RISK_COLORS.blue
  const healthyPct = result.healthy_probability ?? 0
  const top5 = (result.disease_scores || []).slice(0, 5)

  return (
    <div className="rec-result-wrap">
      {/* ── PRIMARY FINDING ─────────────────────────── */}
      <div className="rec-primary-card" style={{ borderColor: colors.border, background: colors.bg, boxShadow: colors.glow }}>
        <div className="rec-primary-eyebrow">
          <CheckCircle size={15} />
          <span>ANALYSIS COMPLETE — PRIMARY FINDING</span>
        </div>

        {/* BIG disease name */}
        <div className="rec-disease-name" style={{ color: colors.text }}>
          {isHealthy ? '✅ Healthy Voice' : top?.name || primaryId}
        </div>

        {isHealthy ? (
          <p className="rec-disease-sub">No significant neurological voice pattern detected in this recording.</p>
        ) : (
          <p className="rec-disease-sub">{top?.description || 'Neurological voice pattern detected.'}</p>
        )}

        {/* Probability highlight */}
        <div className="rec-prob-row">
          <div className="rec-prob-box" style={{ borderColor: colors.border }}>
            <span className="rec-prob-label">Match Score</span>
            <span className="rec-prob-value" style={{ color: colors.text }}>
              {top?.probability?.toFixed(1) ?? '—'}%
            </span>
          </div>
          <div className="rec-prob-box" style={{ borderColor: 'rgba(0,245,112,0.3)' }}>
            <span className="rec-prob-label">Healthy Prob.</span>
            <span className="rec-prob-value" style={{ color: healthyPct > 40 ? '#00f570' : '#ff8c00' }}>
              {healthyPct.toFixed(1)}%
            </span>
          </div>
          <div className="rec-prob-box">
            <span className="rec-prob-label">Confidence</span>
            <span className="rec-prob-value" style={{ color: '#d0d8f0' }}>{result.confidence}</span>
          </div>
        </div>

        {/* Risk level pill */}
        <div className="rec-risk-pill" style={{ borderColor: colors.border, color: colors.text }}>
          {result.risk_level}
        </div>

        {/* Category badge */}
        {top && (
          <div className="rec-cat-badge">
            {top.category === 'A' ? '🧠 Parkinsonism-Related' : '🗣️ Other Neurological'}
            &ensp;·&ensp;Short code: <b>{top.short}</b>
          </div>
        )}
      </div>

      {/* ── TOP 5 CONDITIONS BAR CHART ──────────────── */}
      <div className="rec-top5-section">
        <h5 className="rec-section-title">Top 5 Detected Conditions</h5>
        <div className="rec-bars">
          {top5.map((d, idx) => {
            const ck = getRiskColor(d.id)
            const c = RISK_COLORS[ck] || RISK_COLORS.blue
            const isFirst = idx === 0
            return (
              <div key={d.id} className="rec-bar-row" style={{ background: isFirst ? c.bg : 'transparent' }}>
                <div className="rec-bar-meta">
                  <span className="rec-bar-rank" style={{ color: isFirst ? c.text : '#6b7280' }}>
                    {isFirst ? '★' : `#${idx + 1}`}
                  </span>
                  <span className="rec-bar-name" style={{ color: isFirst ? c.text : '#c0cbdf' }}>
                    {d.short}
                  </span>
                  <span className="rec-bar-full">{d.name}</span>
                  <span className="rec-bar-cat">[{d.category === 'A' ? 'Parkinsonism' : 'Other Neuro'}]</span>
                </div>
                <div className="rec-bar-right">
                  <span className="rec-bar-pct" style={{ color: isFirst ? c.text : '#8b92a7' }}>
                    {d.probability.toFixed(1)}%
                  </span>
                  <div className="rec-bar-track">
                    <div
                      className="rec-bar-fill"
                      style={{
                        width: `${Math.min(100, d.probability * 3)}%`,
                        background: isFirst ? c.text : 'rgba(255,255,255,0.18)',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── DISCLAIMER ──────────────────────────────── */}
      <div className="rec-disclaimer">
        <AlertTriangle size={13} />
        <small>
          <b>Research only.</b> Not a clinical diagnosis. Consult a qualified neurologist for any concerns.
        </small>
      </div>

      {/* ── RECORD AGAIN ────────────────────────────── */}
      <button className="rec-again-btn" onClick={onRecordAgain}>
        🎙 Record Another Sample
      </button>
    </div>
  )
}

export default function AudioRecorder() {
  const {
    isRecording,
    setIsRecording,
    isAnalyzing,
    setIsAnalyzing,
    patients,
    activePatientId,
    accountId,
    setActiveTab,
    addSession,
  } = useVoiceApp()

  const [timerSeconds, setTimerSeconds] = useState(0)
  const [analyserNode, setAnalyserNode] = useState(null)
  const [recordingError, setRecordingError] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)  // stores final result

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerIntervalRef = useRef(null)
  const audioContextRef = useRef(null)
  const timerSecondsRef = useRef(0)

  const activePatient = patients.find((p) => p.id === activePatientId)
  const canRecord = Boolean(activePatient?.audioConsent)

  const resetForNewRecording = () => {
    setAnalysisResult(null)
    setRecordingError('')
  }

  // ── Start Recording ────────────────────────────────────────────────
  const startRecording = async () => {
    if (!canRecord) return
    resetForNewRecording()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      audioContextRef.current = audioCtx
      setAnalyserNode(analyser)

      // Pick the best supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : ''

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        })
        const url = URL.createObjectURL(blob)
        stream.getTracks().forEach((track) => track.stop())
        try { audioContextRef.current?.close() } catch {}
        runAcousticPipeline(blob, timerSecondsRef.current, url)
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setTimerSeconds(0)
      timerSecondsRef.current = 0

      timerIntervalRef.current = setInterval(() => {
        timerSecondsRef.current += 1
        setTimerSeconds(timerSecondsRef.current)
      }, 1000)
    } catch (err) {
      console.warn('Mic error:', err)
      setRecordingError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser and try again.'
          : `Microphone unavailable: ${err.message}`
      )
    }
  }

  // ── Stop Recording ─────────────────────────────────────────────────
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    clearInterval(timerIntervalRef.current)
    setIsRecording(false)
  }

  // ── Process & Analyse ──────────────────────────────────────────────
  const runAcousticPipeline = async (blob, elapsedSeconds, recordingUrl) => {
    setIsAnalyzing(true)
    // Small delay so the UI can show the analyzing overlay
    await new Promise((r) => setTimeout(r, 600))

    try {
      const sessionData = await extractAcousticFeatures(blob)

      const sessionTitle = `Vocal Phonation #${Math.floor(Math.random() * 899 + 100)}`
      const session = await addSession({
        title: sessionTitle,
        category: 'Live Mic Phonation',
        patientId: activePatientId,
        duration: formatTime(elapsedSeconds || 1),
        audioUrl: recordingUrl,
        hasAudio: true,
        prediction: sessionData.prediction,
        primaryName: sessionData.primaryName,
        healthyProbability: sessionData.healthyProbability,
        parkinsonProbability: sessionData.parkinsonProbability,
        riskScore: sessionData.riskScore,
        riskLevel: sessionData.riskLevel,
        confidence: sessionData.confidence,
        metrics: sessionData.metrics,
        diseaseScores: sessionData.diseaseScores,
        topParkinsonism: sessionData.topParkinsonism,
        topOther: sessionData.topOther,
        analysisSummary: sessionData.analysisSummary,
      })

      setAnalysisResult(sessionData.rawResult)

      try {
        await saveSessionAudio(accountId, session.id, blob)
      } catch (audioErr) {
        console.warn('Audio storage failed (non-critical):', audioErr)
      }
    } catch (error) {
      console.error('Analysis pipeline failed:', error)
      setRecordingError(
        error instanceof Error
          ? error.message
          : 'Voice analysis failed. Make sure the backend is running (python run.py) and try again.'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  useEffect(() => () => clearInterval(timerIntervalRef.current), [])

  // ── If we have a result, show the result card ──────────────────────
  if (analysisResult) {
    return (
      <div className="recorder-card glass-panel">
        <div className="recorder-header">
          <div>
            <p className="eyebrow neon-badge neon-badge-cyan">LIVE VOICE SIGNAL CAPTURE</p>
            <h2 className="recorder-title">Voice Analysis Result</h2>
          </div>
        </div>
        <PrimaryDiseaseResult result={analysisResult} onRecordAgain={resetForNewRecording} />
        <RecorderStyles />
      </div>
    )
  }

  // ── Normal recorder UI ─────────────────────────────────────────────
  return (
    <div className="recorder-card glass-panel">
      {/* Header */}
      <div className="recorder-header">
        <div>
          <p className="eyebrow neon-badge neon-badge-cyan">LIVE VOICE SIGNAL CAPTURE</p>
          <h2 className="recorder-title">
            {isRecording ? 'Listening & Extracting Biomarkers...' : 'Record Voice Sample'}
          </h2>
        </div>
        <span className={`live-pill-badge ${isRecording ? 'pulse' : ''}`}>
          <span className={isRecording ? 'status-dot status-dot-recording' : 'status-dot'} />
          {isRecording ? 'RECORDING ACTIVE' : 'READY TO STREAM'}
        </span>
      </div>

      {/* Patient */}
      {activePatient ? (
        <p className="recording-patient-label">
          Selected patient: <b>{activePatient.firstName || activePatient.name} {activePatient.lastName || ''}</b>
        </p>
      ) : (
        <button className="btn-glass recording-patient-prompt" type="button" onClick={() => setActiveTab('Patients')}>
          Choose or register a patient first
        </button>
      )}
      {activePatient && !activePatient.audioConsent && (
        <p className="recording-error">
          Recording is disabled until audio consent is recorded in the patient record.
        </p>
      )}
      {recordingError && (
        <div className="rec-error-box" role="alert">
          <AlertTriangle size={15} />
          <span>{recordingError}</span>
        </div>
      )}

      {/* Waveform canvas */}
      <LiveAudioCanvas isRecording={isRecording} analyserNode={analyserNode} />

      {/* Controls */}
      <div className="controls-row">
        <div className="timer-display font-mono">
          <Activity size={18} className={isRecording ? 'timer-icon recording' : 'timer-icon'} />
          <span>{formatTime(timerSeconds)}</span>
        </div>

        {!isRecording ? (
          <button
            className="big-record-btn start animate-pulse-glow"
            onClick={startRecording}
            disabled={isAnalyzing || !canRecord}
            title="Start Microphone Recording"
          >
            <Mic size={28} />
          </button>
        ) : (
          <button
            className="big-record-btn stop"
            onClick={stopRecording}
            title="Stop & Process Recording"
          >
            <Square size={26} fill="currentColor" />
          </button>
        )}

        <div className="recorder-hint">
          {isRecording ? 'Tap ■ to stop & analyse' : 'Say a sustained "Ahhh" for 4–5 seconds'}
        </div>
      </div>

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div className="analyzing-overlay glass-panel-heavy">
          <div className="spinner-wrap">
            <RefreshCw size={36} className="spinner-icon animate-spin-slow" />
          </div>
          <b className="gradient-text">Analysing Voice Sample…</b>
          <p>Converting to WAV → extracting MFCCs, pitch, jitter, shimmer, HNR…</p>
          <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>Checking 13 neurological conditions</p>
        </div>
      )}

      <RecorderStyles />
    </div>
  )
}

// ── Styles extracted to avoid duplication ──────────────────────────────
function RecorderStyles() {
  return (
    <style>{`
      .recorder-card {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        position: relative;
      }
      .recorder-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .recording-patient-label, .recording-error { color: var(--text-muted); font-size: .82rem; }
      .recording-patient-label b { color: var(--neon-cyan); }
      .recording-error { color: var(--neon-amber); }
      .recording-patient-prompt { align-self: flex-start; }
      .eyebrow { margin-bottom: 6px; }
      .recorder-title { font-size: 1.4rem; font-weight: 700; color: #fff; }

      .rec-error-box {
        display: flex; align-items: flex-start; gap: 8px;
        padding: 10px 14px; border-radius: 10px;
        background: rgba(255,48,79,0.08);
        border: 1px solid rgba(255,48,79,0.3);
        color: #ff8c9a; font-size: 13px;
      }

      .live-pill-badge {
        display: flex; align-items: center; gap: 8px;
        padding: 6px 14px; border-radius: 20px;
        font-size: 0.75rem; font-weight: 800;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        color: var(--text-muted);
      }
      .live-pill-badge.pulse {
        background: rgba(255,0,127,0.15);
        border-color: var(--neon-magenta);
        color: var(--neon-magenta);
      }

      .controls-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 16px;
        background: rgba(255,255,255,0.03);
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.06);
      }
      .timer-display {
        display: flex; align-items: center; gap: 10px;
        font-size: 1.4rem; font-weight: 700; color: #fff;
      }
      .timer-icon { color: var(--neon-cyan); }
      .timer-icon.recording { color: var(--neon-magenta); }

      .big-record-btn {
        width: 64px; height: 64px; border-radius: 50%; border: none;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: var(--transition-bounce, all .2s ease);
      }
      .big-record-btn.start {
        background: var(--grad-primary, linear-gradient(135deg,#00f2fe,#00d4ff));
        color: #000; box-shadow: var(--glow-cyan, 0 0 20px rgba(0,242,254,.5));
      }
      .big-record-btn.start:hover { transform: scale(1.1); }
      .big-record-btn.stop {
        background: var(--grad-vibrant, linear-gradient(135deg,#ff0080,#ff304f));
        color: #fff; box-shadow: var(--glow-magenta, 0 0 20px rgba(255,0,127,.5));
      }
      .big-record-btn:disabled { opacity: .4; cursor: not-allowed; }
      .recorder-hint { font-size: 0.82rem; color: var(--text-muted); max-width: 160px; text-align: right; }

      .analyzing-overlay {
        position: absolute; inset: 0; z-index: 10;
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 12px;
        background: rgba(7,9,19,0.92); border-radius: 20px;
        text-align: center; padding: 20px;
      }
      .spinner-icon { color: var(--neon-cyan); }
      .analyzing-overlay p { font-size: 0.85rem; color: var(--text-muted); margin: 0; }

      /* ── Result panel ────────────────────────────── */
      .rec-result-wrap { display: flex; flex-direction: column; gap: 16px; }

      .rec-primary-card {
        padding: 20px; border-radius: 16px;
        border: 1.5px solid;
        display: flex; flex-direction: column; gap: 10px;
        transition: all .3s ease;
      }
      .rec-primary-eyebrow {
        display: flex; align-items: center; gap: 6px;
        font-size: 11px; font-weight: 800; letter-spacing: .8px;
        color: #6b7280; text-transform: uppercase;
      }
      .rec-disease-name {
        font-size: 1.55rem; font-weight: 800; line-height: 1.2;
      }
      .rec-disease-sub {
        margin: 0; font-size: 13px; color: #8b92a7; line-height: 1.5;
      }

      .rec-prob-row {
        display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px;
      }
      .rec-prob-box {
        flex: 1; min-width: 80px;
        padding: 10px 14px; border-radius: 10px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        display: flex; flex-direction: column; gap: 3px;
      }
      .rec-prob-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: .5px; }
      .rec-prob-value { font-size: 1.3rem; font-weight: 800; font-variant-numeric: tabular-nums; }

      .rec-risk-pill {
        align-self: flex-start;
        padding: 4px 14px; border-radius: 20px;
        border: 1px solid; font-size: 11px; font-weight: 700;
        text-transform: uppercase; letter-spacing: .4px;
      }
      .rec-cat-badge {
        font-size: 12px; color: #8b92a7;
      }
      .rec-cat-badge b { color: #c0cbdf; }

      /* Top-5 bars */
      .rec-top5-section { display: flex; flex-direction: column; gap: 8px; }
      .rec-section-title { margin: 0; color: #fff; font-size: 0.88rem; }
      .rec-bars { display: flex; flex-direction: column; gap: 4px; }
      .rec-bar-row {
        display: flex; align-items: center; justify-content: space-between;
        gap: 8px; padding: 8px 12px; border-radius: 8px;
      }
      .rec-bar-meta { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; flex-wrap: wrap; }
      .rec-bar-rank { font-size: 13px; font-weight: 800; min-width: 20px; }
      .rec-bar-name { font-size: 14px; font-weight: 700; }
      .rec-bar-full { font-size: 11.5px; color: #6b7280; }
      .rec-bar-cat { font-size: 10.5px; color: #4b5563; }
      .rec-bar-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 80px; }
      .rec-bar-pct { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }
      .rec-bar-track {
        width: 80px; height: 4px; border-radius: 4px;
        background: rgba(255,255,255,0.06);
      }
      .rec-bar-fill { height: 100%; border-radius: 4px; transition: width .5s ease; }

      .rec-disclaimer {
        display: flex; align-items: flex-start; gap: 7px;
        padding: 10px 13px; border-radius: 9px;
        background: rgba(255,183,3,0.06);
        border: 1px solid rgba(255,183,3,0.18);
        color: #aab4c8; font-size: 11.5px; line-height: 1.5;
      }
      .rec-disclaimer svg { flex-shrink: 0; margin-top: 2px; color: #ffd700; }
      .rec-disclaimer b { color: #ffd700; }

      .rec-again-btn {
        align-self: center;
        padding: 10px 28px; border-radius: 25px; border: none;
        background: linear-gradient(135deg, #9d4edd, #c87fff);
        color: #fff; font-size: 14px; font-weight: 700;
        cursor: pointer; transition: all .2s ease;
        box-shadow: 0 0 18px rgba(157,78,221,0.35);
      }
      .rec-again-btn:hover { transform: scale(1.04); box-shadow: 0 0 26px rgba(157,78,221,0.55); }

      @media (max-width: 480px) {
        .rec-prob-row { flex-direction: column; }
        .rec-disease-name { font-size: 1.25rem; }
      }
    `}</style>
  )
}
