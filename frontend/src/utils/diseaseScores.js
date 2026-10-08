/**
 * ParkinsonVoice — Saved Score Helpers
 * ====================================
 * Normalises the multi-disease probability scores stored on saved voice
 * sessions, resolves the primary result of a single session, and aggregates
 * every sample already collected for a patient.
 */

import { PARKINSONISM_IDS, getParkinsonPredictionLabel } from './predictionLabels'

export const CATEGORY_LABELS = {
  A: 'Parkinsonism-Related Conditions',
  B: 'Other Neurological Conditions',
}

export const CATEGORY_SHORT_LABELS = {
  A: 'Category A · Parkinsonism',
  B: 'Category B · Other Neurological',
}

/** Clamp any incoming value into a 0–100 percentage. */
export function toPercent(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 0
  return Math.min(100, Math.max(0, numeric))
}

/** Two-decimal display string for a percentage. */
export function formatPercent(value) {
  return `${toPercent(value).toFixed(1)}%`
}

/** Resolve whether a score belongs to Category A or Category B. */
function resolveCategory(score) {
  if (score?.category === 'A' || score?.category === 'B') return score.category
  if (PARKINSONISM_IDS.includes(score?.id)) return 'A'
  return 'B'
}

/**
 * Convert the raw `diseaseScores` array stored on a session into a stable,
 * display-ready list. Older saved sessions may be missing fields, so every
 * value is coerced and defaults are supplied.
 *
 * @param {Array} diseaseScores
 * @returns {Array<{id:string,name:string,short:string,category:'A'|'B',
 *   categoryLabel:string,description:string,probability:number,isPrimary:boolean}>}
 */
export function normalizeDiseaseScores(diseaseScores) {
  if (!Array.isArray(diseaseScores)) return []

  return diseaseScores
    .filter((score) => score && (score.id || score.short || score.name))
    .map((score) => {
      const id = score.id || score.short || score.name
      const category = resolveCategory(score)
      return {
        id,
        name: score.name || score.short || id,
        short: score.short || score.id || id,
        category,
        categoryLabel: score.category_label || CATEGORY_LABELS[category],
        description: score.description || '',
        probability: toPercent(score.probability),
        isPrimary: Boolean(score.is_primary || score.isPrimary),
      }
    })
    .sort((a, b) => b.probability - a.probability)
}

/** Split a normalised score list into Category A and Category B buckets. */
export function groupByCategory(scores) {
  const list = Array.isArray(scores) ? scores : []
  return {
    parkinsonism: list.filter((score) => score.category === 'A'),
    other: list.filter((score) => score.category === 'B'),
  }
}

/**
 * Resolve the headline result for one saved session: which condition the model
 * scored highest, its display name, human-readable label and percentage.
 */
export function getSessionPrimaryResult(session) {
  const fallback = {
    id: 'Unknown',
    name: 'No analysis available',
    label: getParkinsonPredictionLabel('Unknown'),
    score: 0,
    healthyProbability: 0,
  }
  if (!session) return fallback

  const primaryId = session.prediction || 'Unknown'
  const scores = normalizeDiseaseScores(session.diseaseScores)
  const match = scores.find((score) => score.id === primaryId)

  let score = 0
  if (primaryId === 'Healthy') {
    score = toPercent(session.healthyProbability)
  } else if (match) {
    score = match.probability
  } else {
    score = toPercent(session.parkinsonProbability ?? session.riskScore)
  }

  const name = session.primaryName || (
    primaryId === 'Healthy'
      ? 'Healthy voice'
      : primaryId === 'Parkinson'
        ? "Parkinson's disease"
        : match?.name || getParkinsonPredictionLabel(primaryId)
  )

  return {
    id: primaryId,
    name,
    label: getParkinsonPredictionLabel(primaryId),
    score,
    healthyProbability: toPercent(session.healthyProbability),
  }
}

/** Pick the strongest session for a patient, ranking by primary score. */
export function getLatestPatientSession(sessions) {
  const list = Array.isArray(sessions) ? sessions : []
  return list[0] || null
}

/**
 * Aggregate every voice sample already collected for one patient into an
 * averaged per-condition profile, plus a majority-vote headline prediction.
 *
 * @param {Array} sessions - Saved sessions belonging to the patient.
 */
export function buildPatientDiseaseSummary(sessions) {
  const list = (Array.isArray(sessions) ? sessions : []).filter(Boolean)
  const accumulator = new Map()
  const predictionCounts = new Map()
  let analysedCount = 0
  let healthyTotal = 0
  let highestScore = 0
  let lowestScore = 100

  list.forEach((session) => {
    const scores = normalizeDiseaseScores(session.diseaseScores)
    const primary = getSessionPrimaryResult(session)
    if (session.prediction) {
      predictionCounts.set(session.prediction, (predictionCounts.get(session.prediction) || 0) + 1)
    }
    if (scores.length === 0 && !session.prediction) return

    analysedCount += 1
    healthyTotal += toPercent(session.healthyProbability)
    highestScore = Math.max(highestScore, primary.score)
    lowestScore = Math.min(lowestScore, primary.score)

    const primaryId = session.prediction
    scores.forEach((score) => {
      const entry = accumulator.get(score.id) || {
        id: score.id,
        name: score.name,
        short: score.short,
        category: score.category,
        categoryLabel: score.categoryLabel,
        description: score.description,
        total: 0,
        samples: 0,
        primaryCount: 0,
      }
      entry.total += score.probability
      entry.samples += 1
      if (primaryId === score.id) entry.primaryCount += 1
      if (!entry.name && score.name) entry.name = score.name
      accumulator.set(score.id, entry)
    })
  })

  const scores = [...accumulator.values()]
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      short: entry.short,
      category: entry.category,
      categoryLabel: entry.categoryLabel,
      description: entry.description,
      probability: entry.samples > 0 ? entry.total / entry.samples : 0,
      sampleCount: entry.samples,
      primaryCount: entry.primaryCount,
    }))
    .sort((a, b) => b.probability - a.probability)

  let primaryPrediction = 'Unknown'
  let bestCount = 0
  predictionCounts.forEach((count, id) => {
    if (count > bestCount) {
      bestCount = count
      primaryPrediction = id
    }
  })

  return {
    sessions,
    sessionCount: list.length,
    analysedCount,
    healthyProbability: analysedCount > 0 ? healthyTotal / analysedCount : 0,
    averagePrimaryScore: analysedCount > 0 ? (highestScore + lowestScore) / 2 : 0,
    highestPrimaryScore: highestScore,
    lowestPrimaryScore: analysedCount > 0 ? lowestScore : 0,
    primaryPrediction,
    primaryName: primaryPrediction === 'Healthy'
      ? 'Healthy voice'
      : scores.find((score) => score.id === primaryPrediction)?.name || primaryPrediction,
    scores,
  }
}

/** Describe how consistent a patient's samples are (majority share). */
export function getPredictionConsistency(sessions) {
  const list = (Array.isArray(sessions) ? sessions : []).filter((session) => session?.prediction)
  if (list.length === 0) return { label: 'No samples', ratio: 0 }

  const counts = new Map()
  list.forEach((session) => {
    counts.set(session.prediction, (counts.get(session.prediction) || 0) + 1)
  })
  const topCount = Math.max(...counts.values())
  const ratio = topCount / list.length

  if (ratio === 1) return { label: 'Consistent across all samples', ratio }
  if (ratio >= 0.6) return { label: 'Mostly consistent', ratio }
  return { label: 'Mixed findings across samples', ratio }
}
