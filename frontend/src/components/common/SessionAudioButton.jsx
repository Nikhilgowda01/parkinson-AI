import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { loadSessionAudio } from '../../utils/audioStorage'

export default function SessionAudioButton({ session, accountId }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackError, setPlaybackError] = useState('')
  const audioRef = useRef(null)
  const urlRef = useRef('')

  const stopPlayback = () => {
    audioRef.current?.pause()
    audioRef.current = null
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = ''
    setIsPlaying(false)
  }

  const togglePlayback = async (event) => {
    event.stopPropagation()
    setPlaybackError('')
    if (isPlaying) {
      stopPlayback()
      return
    }

    try {
      const savedAudio = await loadSessionAudio(accountId, session.id)
      let audioSource = savedAudio ? URL.createObjectURL(savedAudio) : session.audioUrl
      if (!audioSource) throw new Error('Audio file is not available in this browser.')
      if (savedAudio) urlRef.current = audioSource

      const audio = new Audio(audioSource)
      audioRef.current = audio
      audio.onended = stopPlayback
      audio.onerror = () => {
        stopPlayback()
        setPlaybackError('Could not play this audio file.')
      }
      await audio.play()
      setIsPlaying(true)
    } catch (error) {
      stopPlayback()
      setPlaybackError(error.message || 'Could not play this audio file.')
    }
  }

  useEffect(() => () => {
    audioRef.current?.pause()
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
  }, [])

  return (
    <span className="session-audio-control">
      <button
        className={`play-btn ${isPlaying ? 'playing' : ''}`}
        type="button"
        disabled={!session.hasAudio && !session.audioUrl}
        onClick={togglePlayback}
        title={isPlaying ? 'Pause audio playback' : session.hasAudio || session.audioUrl ? 'Play recorded audio' : 'No audio file saved'}
        aria-label={isPlaying ? `Pause ${session.title}` : `Play ${session.title}`}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
      </button>
      {playbackError && <small className="playback-error" role="status">{playbackError}</small>}
      <style>{`.session-audio-control { display: inline-flex; align-items: center; gap: 7px; } .session-audio-control .play-btn:disabled { opacity: .35; cursor: not-allowed; } .playback-error { max-width: 180px; color: var(--neon-amber); font-size: .68rem; }`}</style>
    </span>
  )
}