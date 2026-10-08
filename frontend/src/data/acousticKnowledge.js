export const ACOUSTIC_BIOMARKERS = {
  jitter: {
    title: 'Jitter (Pitch Perturbation)',
    unit: '%',
    normalRange: '< 1.0%',
    description: 'Measures cycle-to-cycle variations in vocal fundamental frequency (F0). Higher jitter indicates vocal cord frequency instability often correlated with laryngeal muscle rigidity.',
    normalThreshold: 0.010
  },
  shimmer: {
    title: 'Shimmer (Amplitude Perturbation)',
    unit: '%',
    normalRange: '< 3.8%',
    description: 'Measures cycle-to-cycle variations in voice amplitude. Elevated shimmer indicates uneven glottal resistance during sound generation.',
    normalThreshold: 0.038
  },
  hnr: {
    title: 'HNR (Harmonics-to-Noise Ratio)',
    unit: 'dB',
    normalRange: '> 20 dB',
    description: 'Quantifies the ratio between pure acoustic harmonics and turbulent glottal noise. Lower HNR signals breathiness and voice quality degradation.',
    normalThreshold: 20.0
  },
  ppe: {
    title: 'PPE (Pitch Period Entropy)',
    unit: 'score',
    normalRange: '< 0.15',
    description: 'Measures non-linear variation in pitch natural speech fluctuations, specifically designed to capture dysphonia variations in Parkinsonian voice patterns.',
    normalThreshold: 0.15
  },
  rpde: {
    title: 'RPDE (Recurrence Period Density Entropy)',
    unit: 'score',
    normalRange: '< 0.45',
    description: 'Non-linear dynamical complexity measure of vocal signal phase space. Higher values indicate turbulent or chaotic vocal cord vibrations.',
    normalThreshold: 0.45
  },
  dfa: {
    title: 'DFA (Detrended Fluctuation Analysis)',
    unit: 'exponent',
    normalRange: '0.50 - 0.70',
    description: 'Measures signal self-similarity and fractal scaling properties across different speech duration windows.',
    normalThreshold: 0.70
  }
}
