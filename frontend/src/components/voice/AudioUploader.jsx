import { useRef, useState } from "react";
import { Upload, Check, AlertTriangle, Activity } from "lucide-react";
import { useVoiceApp } from "../../context/VoiceAppContext";
import { getParkinsonPredictionLabel, getRiskColor } from "../../utils/predictionLabels";
import { saveSessionAudio } from "../../utils/audioStorage";
import { predictParkinson } from "../../utils/api";
import { buildSessionData } from "../../utils/audioAnalysis";

const VOICE_MARKERS = [
  { key: "fo", label: "Avg Pitch", unit: "Hz", description: "Fundamental frequency estimate." },
  { key: "jitter", label: "Jitter proxy", unit: "", description: "Zero-crossing rate — irregularity indicator." },
  { key: "shimmer", label: "Shimmer proxy", unit: "", description: "Amplitude variation of the waveform." },
  { key: "hnr", label: "HNR estimate", unit: "dB", description: "Harmonic-to-noise ratio (signal clarity)." },
  { key: "spectral_centroid", label: "Spectral Centroid", unit: "Hz", description: "Brightness of the voice spectrum." },
  { key: "rms_energy", label: "RMS Energy", unit: "", description: "Overall vocal loudness / energy." },
];

const RISK_COLORS = {
  green: { border: "rgba(0,245,112,0.4)", bg: "rgba(0,245,112,0.06)", text: "#00f570" },
  red: { border: "rgba(255,48,79,0.5)", bg: "rgba(255,48,79,0.09)", text: "#ff304f" },
  orange: { border: "rgba(255,140,0,0.45)", bg: "rgba(255,140,0,0.08)", text: "#ff8c00" },
  yellow: { border: "rgba(255,220,0,0.4)", bg: "rgba(255,220,0,0.07)", text: "#ffd700" },
  blue: { border: "rgba(0,180,255,0.4)", bg: "rgba(0,180,255,0.07)", text: "#00b4ff" },
};

function DiseaseProbabilityBar({ disease, isTop }) {
  const colorKey = getRiskColor(disease.id);
  const colors = RISK_COLORS[colorKey] || RISK_COLORS.blue;
  const barWidth = Math.min(100, disease.probability);

  return (
    <div
      className="disease-bar-item"
      style={{
        border: isTop ? `1.5px solid ${colors.border}` : "1px solid rgba(255,255,255,0.06)",
        background: isTop ? colors.bg : "rgba(255,255,255,0.02)",
      }}
    >
      <div className="disease-bar-header">
        <div className="disease-bar-left">
          {isTop && <span className="top-badge">★ Primary</span>}
          <span className="disease-bar-name" style={{ color: isTop ? colors.text : "#d0d8f0" }}>
            {disease.short}
          </span>
          <span className="disease-bar-fullname">{disease.name}</span>
        </div>
        <span className="disease-bar-pct" style={{ color: isTop ? colors.text : "#8b92a7" }}>
          {disease.probability.toFixed(1)}%
        </span>
      </div>

      <div className="disease-bar-track">
        <div
          className="disease-bar-fill"
          style={{
            width: `${barWidth}%`,
            background: isTop
              ? `linear-gradient(90deg, ${colors.text}99, ${colors.text})`
              : "rgba(255,255,255,0.15)",
          }}
        />
      </div>

      {isTop && disease.description && (
        <p className="disease-bar-desc">{disease.description}</p>
      )}
    </div>
  );
}

export default function AudioUploader() {
  const { activePatientId, patients, addSession, accountId } = useVoiceApp();

  const fileInputRef = useRef(null);

  const [uploadedName, setUploadedName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [activeCategory, setActiveCategory] = useState("A"); // "A" | "B"

  const activePatient = patients.find((p) => p.id === activePatientId);
  const canAnalyze = !!activePatientId;

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !canAnalyze) return;

    setUploadedName(file.name);
    setPredictionResult(null);
    setUploadError("");
    setIsAnalyzing(true);

    try {
      const rawResult = await predictParkinson(file);
      const sessionData = buildSessionData(rawResult);

      const session = await addSession({
        title: file.name.replace(/\.[^/.]+$/, ""),
        category: "Uploaded Audio File",
        patientId: activePatientId,
        duration: "00:00",
        audioUrl: URL.createObjectURL(file),
        hasAudio: true,
        prediction: sessionData.prediction,
        healthyProbability: sessionData.healthyProbability,
        parkinsonProbability: sessionData.parkinsonProbability,
        riskScore: sessionData.riskScore,
        riskLevel: sessionData.riskLevel,
        metrics: sessionData.metrics,
        analysisSummary: sessionData.analysisSummary,
        // Extra multi-disease fields stored for history view
        diseaseScores: sessionData.diseaseScores,
        confidence: sessionData.confidence,
        primaryName: sessionData.primaryName,
      });

      setPredictionResult({ ...rawResult, sessionData });

      try {
        await saveSessionAudio(accountId, session.id, file);
      } catch (audioErr) {
        setUploadError(
          `Analysis complete, but audio could not be saved for playback: ${
            audioErr instanceof Error ? audioErr.message : "audio storage failed"
          }`
        );
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Audio analysis failed. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const topId = predictionResult?.primary_prediction;
  const diseaseScores = predictionResult?.disease_scores || [];
  const catA = diseaseScores.filter((d) => d.category === "A");
  const catB = diseaseScores.filter((d) => d.category === "B");
  const activeList = activeCategory === "A" ? catA : catB;
  const healthyPct = predictionResult?.healthy_probability ?? 0;
  const topColorKey = topId ? getRiskColor(topId) : "blue";
  const topColors = RISK_COLORS[topColorKey] || RISK_COLORS.blue;

  return (
    <>
      <div className="uploader-card glass-panel">
        {/* Header */}
        <div>
          <p className="eyebrow neon-badge neon-badge-purple">AUDIO FILE INGESTION</p>
          <h3>Upload Speech File</h3>
          <p className="upload-desc">
            Upload a WAV, MP3, or OGG recording for 13-condition neurological voice analysis.
          </p>
        </div>

        <div className="audio-patient-label">
          Selected patient: <b>{activePatient?.name || "None"}</b>
        </div>

        {!canAnalyze ? (
          <button
            className="primary-btn"
            onClick={() =>
              alert("Please create a patient first from the Patient Management section.")
            }
          >
            Choose or register a patient first
          </button>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,.ogg,.webm,.flac,.m4a"
              hidden
              onChange={handleFileUpload}
            />

            <div className="dropzone" onClick={() => fileInputRef.current?.click()}>
              <div className="upload-icon-circle">
                <Upload size={22} />
              </div>
              <div className="dropzone-text">
                <b>{isAnalyzing ? "Analyzing voice sample…" : "Click to browse audio files"}</b>
                <small>Supports WAV, MP3, OGG, WEBM · Up to 60 seconds recommended</small>
              </div>
            </div>

            {isAnalyzing && uploadedName && (
              <div className="analyzing-status">
                <Activity size={16} className="spin-icon" />
                Extracting acoustic biomarkers from <b>{uploadedName}</b>…
              </div>
            )}

            {uploadError && (
              <div className="upload-error-box" role="alert">
                <AlertTriangle size={16} />
                <span>{uploadError}</span>
              </div>
            )}

            {predictionResult && (
              <section className="results-section" role="status" aria-live="polite">
                {/* Analysed badge */}
                <div className="uploaded-badge">
                  <Check size={16} />
                  {uploadedName} — analysis complete
                </div>

                {/* Primary Result Banner */}
                <div
                  className="primary-result-banner"
                  style={{
                    borderColor: topColors.border,
                    background: topColors.bg,
                    boxShadow: `0 0 28px ${topColors.border}`,
                  }}
                >
                  <div className="primary-result-top">
                    <span className="eyebrow" style={{ color: topColors.text }}>
                      ★ PRIMARY FINDING — HIGHEST MATCH
                    </span>
                    <div className="confidence-pill">
                      Confidence: <b>{predictionResult.confidence}</b>
                    </div>
                  </div>

                  {/* Big disease name */}
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: topColors.text, lineHeight: 1.2 }}>
                    {predictionResult.primary_prediction === 'Healthy'
                      ? '✅ Healthy Voice'
                      : predictionResult.disease_scores?.[0]?.name || predictionResult.primary_name}
                  </div>

                  {/* Big percentage */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: 900, color: topColors.text, fontVariantNumeric: 'tabular-nums' }}>
                      {predictionResult.disease_scores?.[0]?.probability?.toFixed(1) ?? '—'}%
                    </span>
                    <span style={{ fontSize: '13px', color: '#8b92a7' }}>match score</span>
                  </div>

                  <p className="primary-label">
                    {getParkinsonPredictionLabel(predictionResult.primary_prediction)}
                  </p>
                  <div className="healthy-score-row">
                    <span>Healthy probability:</span>
                    <strong style={{ color: healthyPct > 40 ? "#00f570" : "#ff8c00" }}>
                      {healthyPct}%
                    </strong>
                  </div>
                  <div className="risk-level-badge">
                    {predictionResult.risk_level}
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="category-tabs">
                  <button
                    className={`cat-tab ${activeCategory === "A" ? "active" : ""}`}
                    onClick={() => setActiveCategory("A")}
                  >
                    🧠 Parkinsonism-Related (7)
                  </button>
                  <button
                    className={`cat-tab ${activeCategory === "B" ? "active" : ""}`}
                    onClick={() => setActiveCategory("B")}
                  >
                    🗣️ Other Neurological (6)
                  </button>
                </div>

                <p className="category-note">
                  {activeCategory === "A"
                    ? "Conditions most closely related to Parkinsonism"
                    : "Other neurological conditions affecting voice/speech — not types of Parkinson's"}
                </p>

                {/* Disease probability bars */}
                <div className="disease-bars-list">
                  {activeList.map((disease) => (
                    <DiseaseProbabilityBar
                      key={disease.id}
                      disease={disease}
                      isTop={disease.id === topId}
                    />
                  ))}
                </div>

                {/* Voice markers */}
                <div className="voice-markers">
                  <h5>Acoustic Voice Markers</h5>
                  <div className="voice-markers-grid">
                    {VOICE_MARKERS.map((marker) => {
                      const value = predictionResult.metrics?.[marker.key];
                      const formatted =
                        typeof value === "number" && Number.isFinite(value)
                          ? `${value}${marker.unit ? ` ${marker.unit}` : ""}`
                          : "Unavailable";
                      return (
                        <div className="voice-marker" key={marker.key}>
                          <b>{marker.label}</b>
                          <span>{formatted}</span>
                          <small>{marker.description}</small>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="disclaimer-box">
                  <AlertTriangle size={13} />
                  <small>
                    <b>Research use only.</b> These are simplified acoustic signal measurements,
                    not validated clinical diagnostics. Results cannot confirm or rule out any
                    neurological condition. Always consult a qualified clinician.
                  </small>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <style>{`
        .uploader-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 280px;
        }

        .upload-desc {
          color: #8b92a7;
          font-size: 13px;
          margin-top: 8px;
        }

        .audio-patient-label {
          color: #9ee7ff;
          font-size: 13px;
        }

        .dropzone {
          width: 100%;
          min-height: 110px;
          border: 2px dashed rgba(157,78,221,0.4);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
          background: rgba(157,78,221,0.05);
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .dropzone:hover {
          border-color: #9d4edd;
          background: rgba(157,78,221,0.12);
        }
        .upload-icon-circle {
          width: 50px; height: 50px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(157,78,221,0.18);
          color: #b86cff;
        }
        .dropzone-text { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .dropzone-text b { color: white; font-size: 14px; }
        .dropzone-text small { color: #8b92a7; margin-top: 4px; }

        .analyzing-status {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(0,180,255,0.08);
          border: 1px solid rgba(0,180,255,0.22);
          color: #9ee7ff; font-size: 13px;
        }
        .spin-icon { animation: spin 1.2s linear infinite; color: #00b4ff; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .upload-error-box {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(255,48,79,0.08);
          border: 1px solid rgba(255,48,79,0.28);
          color: #ff8c9a; font-size: 13px;
        }

        .uploaded-badge {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(0,245,212,0.08);
          border: 1px solid rgba(0,245,212,0.25);
          color: #00f5d4; font-size: 13px;
        }

        .results-section {
          display: flex; flex-direction: column; gap: 14px;
        }

        /* Primary Result Banner */
        .primary-result-banner {
          padding: 18px; border-radius: 14px;
          border: 1.5px solid rgba(0,242,254,0.3);
          background: rgba(0,242,254,0.06);
          display: flex; flex-direction: column; gap: 8px;
        }
        .primary-result-top {
          display: flex; align-items: center; justify-content: space-between;
        }
        .primary-result-banner h4 {
          margin: 0; font-size: 1.05rem; font-weight: 700;
        }
        .primary-label { margin: 0; color: #c0cbdf; font-size: 13px; }
        .healthy-score-row {
          display: flex; gap: 8px; align-items: center;
          font-size: 13px; color: #8b92a7;
        }
        .risk-level-badge {
          align-self: flex-start;
          padding: 4px 12px; border-radius: 20px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #c0cbdf; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .confidence-pill {
          padding: 3px 10px; border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #8b92a7; font-size: 11px;
        }
        .confidence-pill b { color: #d0d8f0; }

        /* Category Tabs */
        .category-tabs {
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .cat-tab {
          padding: 7px 14px; border-radius: 20px; border: none;
          font-size: 12px; font-weight: 600; cursor: pointer;
          background: rgba(255,255,255,0.05);
          color: #8b92a7;
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.2s ease;
        }
        .cat-tab.active {
          background: rgba(157,78,221,0.18);
          border-color: rgba(157,78,221,0.5);
          color: #c87fff;
        }
        .category-note {
          margin: 0; color: #6b7280; font-size: 11.5px;
          font-style: italic;
        }

        /* Disease Bars */
        .disease-bars-list {
          display: flex; flex-direction: column; gap: 8px;
        }
        .disease-bar-item {
          padding: 10px 14px; border-radius: 10px;
          display: flex; flex-direction: column; gap: 6px;
          transition: all 0.2s ease;
        }
        .disease-bar-header {
          display: flex; justify-content: space-between; align-items: center;
        }
        .disease-bar-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .disease-bar-name { font-weight: 700; font-size: 13.5px; }
        .disease-bar-fullname { font-size: 11.5px; color: #6b7280; }
        .disease-bar-pct { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }
        .top-badge {
          font-size: 10px; font-weight: 800;
          padding: 2px 7px; border-radius: 8px;
          background: rgba(157,78,221,0.2);
          color: #c87fff; letter-spacing: 0.3px;
        }
        .disease-bar-track {
          width: 100%; height: 4px; border-radius: 4px;
          background: rgba(255,255,255,0.07); overflow: hidden;
        }
        .disease-bar-fill {
          height: 100%; border-radius: 4px;
          transition: width 0.6s ease;
        }
        .disease-bar-desc { margin: 0; font-size: 11.5px; color: #6b7280; line-height: 1.4; }

        /* Voice Markers */
        .voice-markers { display: flex; flex-direction: column; gap: 10px; }
        .voice-markers h5 { margin: 0; color: white; font-size: 0.88rem; }
        .voice-markers-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .voice-marker {
          display: flex; flex-direction: column; gap: 3px;
          padding: 9px 11px; border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .voice-marker b { color: white; font-size: 0.78rem; }
        .voice-marker span { color: #9ee7ff; font-variant-numeric: tabular-nums; font-size: 13px; }
        .voice-marker small { color: #6b7280; line-height: 1.3; font-size: 10.5px; }

        /* Disclaimer */
        .disclaimer-box {
          display: flex; align-items: flex-start; gap: 7px;
          padding: 10px 13px; border-radius: 9px;
          background: rgba(255,183,3,0.06);
          border: 1px solid rgba(255,183,3,0.18);
          color: #aab4c8; font-size: 11.5px; line-height: 1.5;
        }
        .disclaimer-box svg { flex-shrink: 0; margin-top: 2px; color: #ffd700; }
        .disclaimer-box b { color: #ffd700; }

        @media (max-width: 560px) {
          .voice-markers-grid { grid-template-columns: repeat(2, 1fr); }
          .category-tabs { flex-direction: column; }
        }
        @media (max-width: 380px) {
          .voice-markers-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}