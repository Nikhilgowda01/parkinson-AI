import { Cpu, Grid, Layers } from 'lucide-react'

export default function SpectrogramView({ mfcc }) {
  const coefficients = mfcc || [-14.2, 12.8, -4.6, 8.1, -2.4, 5.9, -1.2, 3.4, -0.8, 2.1, -0.4, 1.1]

  return (
    <div className="spectrogram-card glass-panel">
      <div className="spectrogram-header">
        <div>
          <p className="eyebrow neon-badge neon-badge-purple">SPECTRAL FEATURE MATRIX</p>
          <h3 className="spectrogram-title">12-Coefficient MFCC Heatmap</h3>
        </div>
        <Cpu size={22} className="purple-glow-icon" />
      </div>

      <p className="spectrogram-desc">
        Mel-Frequency Cepstral Coefficients map vocal tract shape and acoustic spectral envelope characteristics.
      </p>

      {/* Heatmap Grid */}
      <div className="mfcc-grid font-mono">
        {coefficients.map((val, idx) => {
          // Normalize value for color intensity
          const norm = Math.min(100, Math.max(10, Math.abs(val) * 5))
          return (
            <div key={idx} className="mfcc-cell" style={{ '--intensity': `${norm}%` }}>
              <span className="mfcc-label">C{idx + 1}</span>
              <b className="mfcc-val">{val > 0 ? `+${val}` : val}</b>
              <div className="cell-bar" style={{ height: `${norm}%` }} />
            </div>
          )
        })}
      </div>

      <style>{`
        .spectrogram-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .spectrogram-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .spectrogram-title {
          font-size: 1.15rem;
          color: #fff;
          font-weight: 700;
        }

        .purple-glow-icon {
          color: var(--neon-purple);
          filter: drop-shadow(0 0 8px var(--neon-purple));
        }

        .spectrogram-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .mfcc-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
        }

        @media (max-width: 700px) {
          .mfcc-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .mfcc-cell {
          background: rgba(157, 78, 221, 0.08);
          border: 1px solid rgba(157, 78, 221, 0.25);
          border-radius: 12px;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          position: relative;
          overflow: hidden;
          transition: var(--transition-smooth);
        }

        .mfcc-cell:hover {
          border-color: var(--neon-cyan);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.25);
        }

        .mfcc-label {
          font-size: 0.65rem;
          color: var(--text-dim);
          z-index: 2;
        }

        .mfcc-val {
          font-size: 0.88rem;
          color: #fff;
          z-index: 2;
        }

        .cell-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(0deg, rgba(0, 242, 254, 0.3), rgba(157, 78, 221, 0.1));
          z-index: 1;
          transition: height 0.5s ease;
        }
      `}</style>
    </div>
  )
}
