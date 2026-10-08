/**
 * ParkinsonVoice — Audio Analysis Bridge
 * Converts recorded audio → WAV → sends to multi-disease backend.
 */
import { predictParkinson } from './api'
import { convertBlobToWav } from './wavConverter'

/**
 * Extracts acoustic features & disease predictions from a mic-recorded Blob.
 * Converts webm/ogg → WAV before sending so librosa can decode it.
 * @param {Blob} audioBlob
 * @returns {Promise<object>}
 */
export async function extractAcousticFeatures(audioBlob) {
  let wavBlob
  try {
    wavBlob = await convertBlobToWav(audioBlob)
  } catch (convErr) {
    console.warn('WAV conversion failed, sending raw blob:', convErr)
    // fallback: send raw blob anyway
    wavBlob = audioBlob
  }

  const file = new File([wavBlob], 'recording.wav', { type: 'audio/wav' })
  const result = await predictParkinson(file)
  return buildSessionData(result)
}

/**
 * Build a session-compatible data object from the backend prediction result.
 * @param {object} result - Raw API response
 */
export function buildSessionData(result) {
  const topDisease = result.disease_scores?.[0]
  const primaryId = result.primary_prediction || 'Unknown'
  const primaryName = result.primary_name || primaryId

  return {
    prediction: primaryId,
    primaryName,
    healthyProbability: result.healthy_probability ?? 0,
    parkinsonProbability:
      result.parkinson_probability ??
      result.disease_scores?.find((d) => d.id === 'PD')?.probability ??
      0,
    riskScore: topDisease?.probability ?? 0,
    riskLevel: result.risk_level || 'Unknown',
    confidence: result.confidence || 'Low',
    diseaseScores: result.disease_scores || [],
    topParkinsonism: result.top_parkinsonism || null,
    topOther: result.top_other || null,
    metrics: result.metrics || {},
    analysisSummary: buildSummary(result),
    // Pass raw result for display
    rawResult: result,
  }
}

function buildSummary(result) {
  const top3 = (result.disease_scores || [])
    .slice(0, 3)
    .map((d) => `${d.short}: ${d.probability}%`)
    .join(', ')
  return [
    `Primary: ${result.primary_name || result.primary_prediction}`,
    `Healthy probability: ${result.healthy_probability}%`,
    `Confidence: ${result.confidence}`,
    `Top conditions: ${top3}`,
  ].join('\n')
}

export function getFallbackAnalysis() {
  return {
    prediction: 'Unavailable',
    healthyProbability: 0,
    parkinsonProbability: 0,
    diseaseScores: [],
    riskLevel: 'Unknown',
    confidence: 'Low',
  }
}