/**
 * TEMPORARY — local verification seed only. Deleted before delivery.
 * Builds demo patients and voice sessions so the patient analysis report can
 * be checked in the browser without running the Python analysis backend.
 */

const DISEASE_CATALOGUE = [
  ['PD', "Parkinson's Disease", 'A'],
  ['MSA', 'Multiple System Atrophy', 'A'],
  ['PSP', 'Progressive Supranuclear Palsy', 'A'],
  ['CBD', 'Corticobasal Degeneration', 'A'],
  ['DLB', 'Dementia with Lewy Bodies', 'A'],
  ['VP', 'Vascular Parkinsonism', 'A'],
  ['DIP', 'Drug-Induced Parkinsonism', 'A'],
  ['ET', 'Essential Tremor', 'B'],
  ['ALS', 'Amyotrophic Lateral Sclerosis', 'B'],
  ['HD', "Huntington's Disease", 'B'],
  ['CA', 'Cerebellar Ataxia', 'B'],
  ['SRD', 'Stroke-related Dysarthria', 'B'],
  ['MS', 'Multiple Sclerosis', 'B'],
]

function buildScores(probabilities, primaryId) {
  return DISEASE_CATALOGUE.map(([id, name, category]) => ({
    id,
    name,
    short: id,
    category,
    category_label: category === 'A' ? 'Parkinsonism-Related' : 'Other Neurological (Voice/Speech)',
    description: '',
    probability: probabilities[id] ?? 0,
    is_primary: id === primaryId,
  }))
    .sort((a, b) => b.probability - a.probability)
}

const PD_LEAN = buildScores(
  { PD: 21.4, MSA: 9.8, PSP: 7.6, CBD: 6.1, DLB: 8.4, VP: 7.2, DIP: 10.3, ET: 6.9, ALS: 5.2, HD: 4.8, CA: 3.6, SRD: 4.1, MS: 3.3 },
  'PD'
)
const PD_LEAN_2 = buildScores(
  { PD: 24.1, MSA: 10.2, PSP: 7.1, CBD: 5.8, DLB: 9.1, VP: 6.7, DIP: 11.4, ET: 6.2, ALS: 5.0, HD: 4.1, CA: 3.2, SRD: 3.8, MS: 2.6 },
  'PD'
)
const MIXED = buildScores(
  { PD: 12.6, MSA: 13.9, PSP: 8.8, CBD: 6.4, DLB: 7.2, VP: 9.5, DIP: 8.1, ET: 10.2, ALS: 5.6, HD: 4.9, CA: 4.2, SRD: 4.6, MS: 3.1 },
  'MSA'
)
const ET_LEAN = buildScores(
  { ET: 19.8, PD: 11.2, MSA: 8.1, PSP: 6.4, CBD: 5.2, DLB: 6.8, VP: 7.4, DIP: 8.9, ALS: 5.1, HD: 6.3, CA: 5.8, SRD: 4.4, MS: 4.2 },
  'ET'
)
const HEALTHY_LEAN = buildScores(
  { PD: 6.1, MSA: 4.2, PSP: 3.4, CBD: 2.8, DLB: 3.6, VP: 3.1, DIP: 3.9, ET: 7.4, ALS: 2.6, HD: 2.2, CA: 2.9, SRD: 2.4, MS: 2.1 },
  'Healthy'
)

const PATIENT_A = 'patient-verify-a'
const PATIENT_B = 'patient-verify-b'

export const DEV_PATIENTS = [
  {
    id: PATIENT_A,
    firstName: 'Meera',
    lastName: 'Krishnan',
    dateOfBirth: '1958-04-12',
    gender: 'Female',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    diagnosis: "Parkinson's disease",
    diagnosisDate: '2023-02-18',
    symptomOnset: '2021-09-01',
    allergies: '',
    medicalHistory: 'Hypertension, controlled.',
    medications: 'Levodopa/carbidopa 100/25 mg',
    clinician: 'Dr. A. Rao',
    notes: 'Longitudinal voice monitoring, quarterly.',
    audioConsent: true,
  },
  {
    id: PATIENT_B,
    firstName: 'Daniel',
    lastName: 'Okoye',
    dateOfBirth: '1966-11-02',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    diagnosis: 'Under evaluation',
    diagnosisDate: '2025-06-01',
    symptomOnset: '',
    allergies: '',
    medicalHistory: '',
    medications: '',
    clinician: 'Dr. S. Iyer',
    notes: 'Referred for tremor assessment.',
    audioConsent: true,
  },
]

export const DEV_SESSIONS = [
  {
    id: 'session-verify-1',
    title: 'Sustained Vowel /a/ — baseline',
    category: 'Live Mic Recording',
    date: '12/03/2026, 09:14 AM',
    duration: '00:04',
    patientId: PATIENT_A,
    prediction: 'PD',
    primaryName: "Parkinson's Disease",
    healthyProbability: 1.3,
    parkinsonProbability: 21.4,
    confidence: 'Moderate',
    riskLevel: 'Elevated Biomarkers',
    riskScore: 21.4,
    clarityScore: 61,
    diseaseScores: PD_LEAN,
    metrics: { fo: 168.4, jitter: 0.0145, shimmer: 0.0762, hnr: 15.3 },
    mfcc: [],
    analysisSummary: 'Elevated pitch perturbation with reduced harmonic purity.',
  },
  {
    id: 'session-verify-2',
    title: 'Sustained Vowel /a/ — week 6',
    category: 'Live Mic Recording',
    date: '22/04/2026, 09:02 AM',
    duration: '00:05',
    patientId: PATIENT_A,
    prediction: 'PD',
    primaryName: "Parkinson's Disease",
    healthyProbability: 1.1,
    parkinsonProbability: 24.1,
    confidence: 'Moderate',
    riskLevel: 'Elevated Biomarkers',
    riskScore: 24.1,
    clarityScore: 58,
    diseaseScores: PD_LEAN_2,
    metrics: { fo: 172.1, jitter: 0.0158, shimmer: 0.0791, hnr: 14.6 },
    mfcc: [],
    analysisSummary: 'Slightly increased jitter versus previous sample.',
  },
  {
    id: 'session-verify-3',
    title: 'Reading passage — mixed findings',
    category: 'Uploaded Audio',
    date: '30/05/2026, 11:47 AM',
    duration: '00:09',
    patientId: PATIENT_A,
    prediction: 'MSA',
    primaryName: 'Multiple System Atrophy',
    healthyProbability: 2.8,
    parkinsonProbability: 12.6,
    confidence: 'Moderate',
    riskLevel: 'Elevated Biomarkers',
    riskScore: 13.9,
    clarityScore: 64,
    diseaseScores: MIXED,
    metrics: { fo: 158.9, jitter: 0.0121, shimmer: 0.0644, hnr: 17.2 },
    mfcc: [],
    analysisSummary: 'Broader spectral spread with irregular pitch.',
  },
  {
    id: 'session-verify-4',
    title: 'Prolonged phonation — tremor check',
    category: 'Live Mic Recording',
    date: '18/02/2026, 03:20 PM',
    duration: '00:06',
    patientId: PATIENT_B,
    prediction: 'ET',
    primaryName: 'Essential Tremor',
    healthyProbability: 4.4,
    parkinsonProbability: 11.2,
    confidence: 'Moderate',
    riskLevel: 'Mild Variance',
    riskScore: 19.8,
    clarityScore: 72,
    diseaseScores: ET_LEAN,
    metrics: { fo: 141.3, jitter: 0.0092, shimmer: 0.0421, hnr: 19.8 },
    mfcc: [],
    analysisSummary: 'Rhythmic amplitude modulation consistent with voice tremor.',
  },
  {
    id: 'session-verify-5',
    title: 'Sustained Vowel /a/ — control',
    category: 'Uploaded Audio',
    date: '05/03/2026, 10:05 AM',
    duration: '00:04',
    patientId: PATIENT_B,
    prediction: 'Healthy',
    primaryName: 'Healthy (No significant neurological voice pattern)',
    healthyProbability: 55.4,
    parkinsonProbability: 6.1,
    confidence: 'High',
    riskLevel: 'Low Risk',
    riskScore: 6.1,
    clarityScore: 86,
    diseaseScores: HEALTHY_LEAN,
    metrics: { fo: 132.7, jitter: 0.0061, shimmer: 0.0244, hnr: 24.1 },
    mfcc: [],
    analysisSummary: 'Clean sustained phonation with stable pitch.',
  },
]
