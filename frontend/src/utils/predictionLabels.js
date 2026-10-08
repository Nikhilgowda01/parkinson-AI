/**
 * Human-readable prediction labels for all 13 neurological conditions
 * and the Healthy outcome.
 */

const PREDICTION_LABELS = {
  // Healthy
  Healthy: "No significant neurological voice pattern detected",

  // Category A — Parkinsonism-related
  PD: "Parkinson's disease-associated voice pattern detected",
  MSA: "Multiple System Atrophy-associated voice pattern detected",
  PSP: "Progressive Supranuclear Palsy-associated voice pattern detected",
  CBD: "Corticobasal Degeneration-associated voice pattern detected",
  DLB: "Dementia with Lewy Bodies-associated voice pattern detected",
  VP: "Vascular Parkinsonism-associated voice pattern detected",
  DIP: "Drug-Induced Parkinsonism-associated voice pattern detected",

  // Category B — Other neurological conditions
  ET: "Essential Tremor-associated voice pattern detected",
  ALS: "ALS-associated bulbar voice pattern detected",
  HD: "Huntington's Disease-associated voice pattern detected",
  CA: "Cerebellar Ataxia-associated voice pattern detected",
  SRD: "Stroke-related Dysarthria pattern detected",
  MS: "Multiple Sclerosis-associated voice pattern detected",

  // Fallbacks
  Uncertain: "Inconclusive — repeat the recording or consult a clinician",
  Unknown: "No prediction available",
}

/**
 * Return a human-readable label for any prediction ID.
 * @param {string} prediction
 * @returns {string}
 */
export function getParkinsonPredictionLabel(prediction) {
  return PREDICTION_LABELS[prediction] ?? PREDICTION_LABELS.Unknown
}

/**
 * Category A disease IDs (Parkinsonism-related).
 */
export const PARKINSONISM_IDS = ['PD', 'MSA', 'PSP', 'CBD', 'DLB', 'VP', 'DIP']

/**
 * Category B disease IDs (Other neurological conditions).
 */
export const OTHER_NEURO_IDS = ['ET', 'ALS', 'HD', 'CA', 'SRD', 'MS']

/**
 * Returns a risk colour token based on disease category or healthy status.
 * @param {string} id
 * @returns {'green'|'red'|'orange'|'yellow'|'blue'}
 */
export function getRiskColor(id) {
  if (id === 'Healthy') return 'green'
  if (['PD', 'MSA', 'PSP', 'CBD', 'DLB', 'ALS'].includes(id)) return 'red'
  if (['VP', 'DIP', 'HD', 'SRD'].includes(id)) return 'orange'
  if (['ET', 'CA'].includes(id)) return 'yellow'
  return 'blue'
}
