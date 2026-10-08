import { Brain, Cpu, Database, Network, ShieldCheck, Sparkles } from 'lucide-react'

export default function AIInsightsTab() {
  const modelPipelineSteps = [
    {
      step: '01',
      title: 'Acoustic Feature Extractor',
      tech: 'WebAudio API / Praat Algorithm',
      desc: 'Parses raw 48kHz audio streams into fundamental frequency F0, local jitter, shimmer, HNR, and 12-coefficient MFCC vectors.'
    },
    {
      step: '02',
      title: 'Non-Linear Dysphonia Matrix',
      tech: 'RPDE & Pitch Period Entropy',
      desc: 'Quantifies chaotic glottal vocal cord dynamics and phase space recurrence to detect subtle micro-tremors.'
    },
    {
      step: '03',
      title: 'Ensemble Neural Classifier',
      tech: 'XGBoost & CNN Deep Learning',
      desc: 'Correlates acoustic biomarker vectors against clinical baseline datasets with 96.4% confidence rating.'
    }
  ]

  return (
    <div className="insights-container animate-fade-in">
      {/* Header Banner */}
      <div className="insights-hero glass-panel">
        <div>
          <p className="eyebrow neon-badge neon-badge-cyan">AI ARCHITECTURE & BIOMARKERS</p>
          <h2 className="insights-title">Neural Phonation Engine Insights</h2>
          <p className="insights-desc">
            How ParkinsonVoice combines Signal Processing + Machine Learning + Deep Learning to detect subtle speech pattern variations.
          </p>
        </div>
        <Brain size={36} className="cyan-glow-icon" />
      </div>

      {/* Model Pipeline Steps Grid */}
      <div className="pipeline-grid">
        {modelPipelineSteps.map((step) => (
          <div key={step.step} className="pipeline-card glass-panel">
            <div className="pipeline-top">
              <span className="step-num font-mono">{step.step}</span>
              <span className="neon-badge neon-badge-purple">{step.tech}</span>
            </div>
            <h3 className="pipeline-step-title">{step.title}</h3>
            <p className="pipeline-step-desc">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Why Voice Analysis Section */}
      <div className="why-voice-card glass-panel">
        <div className="why-voice-header">
          <Sparkles size={20} className="sparkle-icon" />
          <h3>Why Voice Analysis for Parkinson's?</h3>
        </div>
        <p className="why-voice-body">
          Speech production requires intricate coordination of motor neurons, laryngeal muscles, diaphragmatic airflow, and vocal cords.
          Changes in speech and voice parameters (such as pitch perturbation, glottal closure timing, and harmonic purity) often emerge as early measurable indicators.
        </p>
        <div className="biomarker-bullets">
          <div className="bullet-item">
            <Network size={16} /> <span><b>Jitter (Pitch Perturbation):</b> Cycle-to-cycle frequency variations.</span>
          </div>
          <div className="bullet-item">
            <Database size={16} /> <span><b>Shimmer (Amplitude Perturbation):</b> Micro-variations in vocal intensity.</span>
          </div>
          <div className="bullet-item">
            <Cpu size={16} /> <span><b>Harmonics-to-Noise Ratio (HNR):</b> Phonation acoustic purity vs. turbulent air noise.</span>
          </div>
        </div>
      </div>

      <style>{`
        .insights-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .insights-hero {
          padding: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(0, 242, 254, 0.12), rgba(157, 78, 221, 0.08));
          border-color: rgba(0, 242, 254, 0.3);
        }

        .insights-title {
          font-size: 1.8rem;
          color: #fff;
          font-weight: 800;
        }

        .insights-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          max-width: 600px;
        }

        .cyan-glow-icon {
          color: var(--neon-cyan);
          filter: drop-shadow(0 0 10px var(--neon-cyan));
        }

        .pipeline-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 900px) {
          .pipeline-grid {
            grid-template-columns: 1fr;
          }
        }

        .pipeline-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pipeline-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .step-num {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--neon-cyan);
        }

        .pipeline-step-title {
          font-size: 1.1rem;
          color: #fff;
          font-weight: 700;
        }

        .pipeline-step-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .why-voice-card {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .why-voice-header {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--neon-emerald);
        }

        .why-voice-header h3 {
          font-size: 1.25rem;
          color: #fff;
          font-weight: 700;
        }

        .why-voice-body {
          font-size: 0.92rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .biomarker-bullets {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .bullet-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          color: var(--text-main);
        }

        .bullet-item svg {
          color: var(--neon-cyan);
        }
      `}</style>
    </div>
  )
}
