/**
 * Convert a recorded audio Blob (webm/ogg) to WAV format using the
 * Web Audio API — no external libraries needed.
 *
 * @param {Blob} audioBlob  – raw blob from MediaRecorder
 * @returns {Promise<Blob>} – WAV blob safe for librosa backend
 */
export async function convertBlobToWav(audioBlob) {
  const arrayBuffer = await audioBlob.arrayBuffer()

  // Decode with Web Audio API
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  let decoded
  try {
    decoded = await audioCtx.decodeAudioData(arrayBuffer)
  } finally {
    audioCtx.close()
  }

  const numChannels = 1 // mono
  const sampleRate = decoded.sampleRate
  const length = decoded.length

  // Mix down to mono float32
  const monoData = new Float32Array(length)
  for (let c = 0; c < decoded.numberOfChannels; c++) {
    const channelData = decoded.getChannelData(c)
    for (let i = 0; i < length; i++) {
      monoData[i] += channelData[i] / decoded.numberOfChannels
    }
  }

  // Convert float32 → int16 PCM
  const pcm16 = new Int16Array(length)
  for (let i = 0; i < length; i++) {
    const clamped = Math.max(-1, Math.min(1, monoData[i]))
    pcm16[i] = clamped < 0 ? clamped * 32768 : clamped * 32767
  }

  // Build WAV file in memory
  const wavBuffer = _buildWav(pcm16, sampleRate, numChannels)
  return new Blob([wavBuffer], { type: 'audio/wav' })
}

function _buildWav(pcm16, sampleRate, numChannels) {
  const byteRate = sampleRate * numChannels * 2 // 16-bit = 2 bytes
  const blockAlign = numChannels * 2
  const dataSize = pcm16.length * 2
  const bufferSize = 44 + dataSize

  const buffer = new ArrayBuffer(bufferSize)
  const view = new DataView(buffer)

  // RIFF chunk
  _writeStr(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  _writeStr(view, 8, 'WAVE')

  // fmt sub-chunk
  _writeStr(view, 12, 'fmt ')
  view.setUint32(16, 16, true)       // sub-chunk size
  view.setUint16(20, 1, true)        // PCM format
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)       // bits per sample

  // data sub-chunk
  _writeStr(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  // Write PCM samples
  const offset = 44
  for (let i = 0; i < pcm16.length; i++) {
    view.setInt16(offset + i * 2, pcm16[i], true)
  }

  return buffer
}

function _writeStr(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}
