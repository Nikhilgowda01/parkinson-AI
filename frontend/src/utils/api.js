/**
 * ParkinsonVoice — Backend API Client
 * Handles audio upload and multi-disease prediction results.
 */

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '')

/**
 * Upload an audio file and get multi-disease neurological predictions.
 * @param {File} file  - Audio file (WAV, MP3, OGG, WEBM)
 * @returns {Promise<MultiDiseasePredictionResult>}
 */
export async function predictParkinson(file) {
  // In production a VITE_API_BASE_URL must be set; in dev we allow no prefix.
  if (!configuredApiBaseUrl && !import.meta.env.DEV) {
    throw new Error(
      'Voice analysis API is not configured. Set VITE_API_BASE_URL to the deployed backend URL and rebuild the frontend.'
    )
  }

  const formData = new FormData()
  formData.append('file', file)

  let response
  try {
    response = await fetch(`${configuredApiBaseUrl || ''}/predict`, {
      method: 'POST',
      body: formData,
      // Do NOT set Content-Type header — browser must set multipart boundary automatically
    })
  } catch (networkErr) {
    throw new Error(
      'Cannot reach the voice analysis backend. ' +
      'Start the backend from the backend folder (python run.py), then retry. ' +
      `Details: ${networkErr?.message || networkErr}`
    )
  }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error(`Voice analysis server returned a non-JSON response (HTTP ${response.status}).`)
  }

  if (!response.ok) {
    const detail = result?.detail || result?.message || `Voice analysis failed (HTTP ${response.status}).`
    throw new Error(detail)
  }

  // Validate minimum required fields
  if (
    typeof result.primary_prediction !== 'string' ||
    !Number.isFinite(result.healthy_probability) ||
    !Array.isArray(result.disease_scores)
  ) {
    throw new Error('Voice analysis returned an invalid or incomplete prediction result.')
  }

  return result
}
