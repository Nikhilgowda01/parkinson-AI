import { Activity, TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function VocalTrendsChart({ sessions = [], patientId }) {
  const patientSessions = patientId ? sessions.filter((session) => session.patientId === patientId).slice(0, 7).reverse() : []
  const trendData = patientSessions.map((session, index) => ({
    day: `Test ${index + 1}`,
    score: session.clarityScore,
    jitter: (session.metrics?.jitter || 0) * 100,
    hnr: session.metrics?.hnr || 0
  }))

  if (trendData.length === 0) {
    return (
      <div className="trends-card glass-panel">
        <div className="trends-header"><div><p className="eyebrow neon-badge neon-badge-emerald">PATIENT SESSION TRENDS</p><h3 className="trends-title">Voice analysis history</h3></div></div>
        <p className="trends-empty">Patient-specific trends will appear after voice samples are analyzed.</p>
        <style>{`.trends-empty { color: var(--text-muted); font-size: .88rem; padding: 20px 0; }`}</style>
      </div>
    )
  }

  const averageClarity = (trendData.reduce((total, entry) => total + (entry.score || 0), 0) / trendData.length).toFixed(1)
  const latestJitter = ((trendData.at(-1)?.jitter ?? 0)).toFixed(2)

  return (
    <div className="trends-card glass-panel">
      <div className="trends-header">
        <div>
          <p className="eyebrow neon-badge neon-badge-emerald">PATIENT SESSION TRENDS</p>
          <h3 className="trends-title">Voice analysis history</h3>
        </div>
        <div className="trend-stat">
          <TrendingUp size={16} className="trend-icon" />
          <span>{trendData.length} analyzed sessions</span>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#00f2fe" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255, 255, 255, 0.06)" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis hide domain={[60, 100]} />
            <Tooltip
              contentStyle={{
                background: 'rgba(10, 13, 26, 0.9)',
                border: '1px solid rgba(0, 242, 254, 0.4)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 0 15px rgba(0, 242, 254, 0.2)'
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#00f2fe"
              strokeWidth={3}
              fill="url(#scoreGlow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-footer font-mono">
        <div className="footer-item">
          <Activity size={14} className="icon-cyan" />
          <span>Average Clarity: <b>{averageClarity}%</b></span>
        </div>
        <div className="footer-item">
          <span className="dot-emerald" />
          <span>Latest Jitter: <b>{latestJitter}%</b></span>
        </div>
      </div>

      <style>{`
        .trends-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .trends-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .trends-title {
          font-size: 1.15rem;
          color: #fff;
          font-weight: 700;
        }

        .trend-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 12px;
          background: rgba(0, 245, 212, 0.12);
          border: 1px solid rgba(0, 245, 212, 0.3);
          color: var(--neon-emerald);
          font-size: 0.78rem;
          font-weight: 700;
        }

        .chart-wrapper {
          width: 100%;
          height: 160px;
        }

        .chart-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .footer-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .icon-cyan {
          color: var(--neon-cyan);
        }

        .dot-emerald {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--neon-emerald);
          box-shadow: 0 0 6px var(--neon-emerald);
        }
      `}</style>
    </div>
  )
}
