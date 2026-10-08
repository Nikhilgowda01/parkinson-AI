import { AlertCircle, Info, X } from 'lucide-react'
import { useVoiceApp } from '../../context/VoiceAppContext'

export default function Footer() {
  const { showDisclaimer, setShowDisclaimer } = useVoiceApp()

  return (
    <footer className="footer-container">
      {showDisclaimer && (
        <div className="disclaimer-banner glass-panel">
          <div className="disclaimer-icon-wrap">
            <AlertCircle size={20} className="disclaimer-icon" />
          </div>
          <div className="disclaimer-content">
            <b>ACADEMIC & RESEARCH DISCLAIMER:</b>
            <span>
              ParkinsonVoice is an experimental voice-analysis demo. Its heuristic estimates are not validated clinical results and do not constitute a diagnosis. Do not use this prototype for medical decisions.
            </span>
          </div>
          <button className="disclaimer-close-btn" onClick={() => setShowDisclaimer(false)}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="footer-bottom glass-panel">
        <div className="footer-left">
          <span>PARKINSON<b className="gradient-text">VOICE</b> AI LAB</span>
          <span className="footer-dot">•</span>
          <span>Version 3.4.0 High-Precision Neural Phonation Engine</span>
        </div>
        <div className="footer-right">
          <span className="privacy-badge">
            <Info size={13} /> Demo only · data stored in this browser
          </span>
        </div>
      </div>

      <style>{`
        .footer-container {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .disclaimer-banner {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 20px;
          background: linear-gradient(135deg, rgba(255, 183, 3, 0.12), rgba(255, 84, 0, 0.08));
          border: 1px solid rgba(255, 183, 3, 0.35);
          border-radius: 16px;
          color: #f1f5f9;
        }

        .disclaimer-icon-wrap {
          color: var(--neon-amber);
          margin-top: 2px;
        }

        .disclaimer-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.84rem;
          line-height: 1.4;
          flex: 1;
        }

        .disclaimer-content b {
          color: var(--neon-amber);
          letter-spacing: 0.5px;
        }

        .disclaimer-close-btn {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          transition: var(--transition-smooth);
        }

        .disclaimer-close-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          border-radius: 14px;
          background: rgba(15, 20, 38, 0.4);
          font-size: 0.8rem;
          color: var(--text-dim);
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-left b {
          letter-spacing: 0.5px;
        }

        .footer-dot {
          color: var(--border-glass);
        }

        .footer-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        @media (max-width: 900px) {
          .footer-bottom { align-items: flex-start; flex-direction: column; gap: 12px; }
          .footer-left, .footer-right { flex-wrap: wrap; }
        }

        .privacy-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--neon-emerald);
          font-size: 0.75rem;
          font-weight: 600;
        }
      `}</style>
    </footer>
  )
}
