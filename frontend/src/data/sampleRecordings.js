export const SAMPLE_RECORDINGS = [
  {
    id: 'sample-1',
    title: 'Sustained Phononic Vowel /a/',
    category: 'Vowel Sustenance',
    date: 'Today, 10:15 AM',
    duration: '03:45',
    audioUrl: 'https://actions.google.com/sounds/v1/human_voices/human_male_cough.ogg', // Fallback synth audio
    clarityScore: 88,
    riskLevel: 'Low Risk',
    riskScore: 14,
    metrics: {
      fo: 124.62, // Fundamental frequency (Hz)
      fhi: 148.21,
      flo: 111.04,
      jitter: 0.0034, // 0.34%
      jitterAbs: 0.000028,
      shimmer: 0.0182, // 1.82%
      hnr: 26.85, // dB
      nhr: 0.0142,
      ppe: 0.0864,
      rpde: 0.312,
      dfa: 0.624
    },
    mfcc: [-14.2, 12.8, -4.6, 8.1, -2.4, 5.9, -1.2, 3.4, -0.8, 2.1, -0.4, 1.1],
    analysisSummary: 'Excellent vocal cord closure and pitch stability. Minimal micro-tremor detected across 3.4 seconds of sustained phonation.'
  },
  {
    id: 'sample-2',
    title: 'Rainbow Speech Passage (Reading)',
    category: 'Continuous Speech',
    date: 'Yesterday, 4:20 PM',
    duration: '06:12',
    audioUrl: 'https://actions.google.com/sounds/v1/human_voices/human_male_speech.ogg',
    clarityScore: 74,
    riskLevel: 'Mild Variance',
    riskScore: 38,
    metrics: {
      fo: 142.18,
      fhi: 188.50,
      flo: 98.30,
      jitter: 0.0078, // 0.78%
      jitterAbs: 0.000062,
      shimmer: 0.0389, // 3.89%
      hnr: 20.40,
      nhr: 0.0410,
      ppe: 0.1840,
      rpde: 0.485,
      dfa: 0.718
    },
    mfcc: [-18.5, 9.4, -8.1, 5.2, -4.8, 3.1, -2.5, 1.8, -1.4, 0.9, -0.8, 0.5],
    analysisSummary: 'Slight modulation in vocal intensity during rapid sentence transitions. Recommended phonation exercise regimen.'
  },
  {
    id: 'sample-3',
    title: 'Subtle Vocal Tremor Phonation Test',
    category: 'Diagnostic Test',
    date: 'May 24, 02:40 PM',
    duration: '04:05',
    audioUrl: '',
    clarityScore: 61,
    riskLevel: 'Elevated Biomarkers',
    riskScore: 66,
    metrics: {
      fo: 168.45,
      fhi: 215.10,
      flo: 104.20,
      jitter: 0.0145, // 1.45%
      jitterAbs: 0.000120,
      shimmer: 0.0762, // 7.62%
      hnr: 15.30,
      nhr: 0.0890,
      ppe: 0.2840,
      rpde: 0.628,
      dfa: 0.792
    },
    mfcc: [-24.1, 6.2, -12.4, 3.1, -7.5, 1.8, -4.1, 0.9, -2.5, 0.4, -1.2, 0.1],
    analysisSummary: 'Elevated period density entropy and higher frequency perturbation (Jitter > 1.2%). Recommend longitudinal monitoring.'
  }
]
