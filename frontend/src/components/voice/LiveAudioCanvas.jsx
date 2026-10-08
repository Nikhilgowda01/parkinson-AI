import { useEffect, useRef } from 'react'

export default function LiveAudioCanvas({ isRecording, analyserNode }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animationFrameId

    const width = (canvas.width = Math.max(300, canvas.parentElement?.clientWidth || 500))
    const height = (canvas.height = 140)

    // Data array buffer for frequency
    const barCount = 48
    let simulatedPhase = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      let frequencyData = new Uint8Array(barCount)

      if (analyserNode && isRecording) {
        const tempArray = new Uint8Array(analyserNode.frequencyBinCount)
        analyserNode.getByteFrequencyData(tempArray)
        // Downsample to barCount
        const step = Math.floor(tempArray.length / barCount) || 1
        for (let i = 0; i < barCount; i++) {
          frequencyData[i] = tempArray[i * step] || 0
        }
      } else if (isRecording) {
        // Simulated lively frequency response when recording without live analyser node
        simulatedPhase += 0.15
        for (let i = 0; i < barCount; i++) {
          const val = Math.sin(simulatedPhase + i * 0.25) * 80 + Math.cos(simulatedPhase * 0.8 + i * 0.4) * 60 + 100
          frequencyData[i] = Math.min(255, Math.max(20, val))
        }
      } else {
        // Idle gentle waveform pulse
        simulatedPhase += 0.04
        for (let i = 0; i < barCount; i++) {
          const val = Math.sin(simulatedPhase + i * 0.2) * 20 + 25
          frequencyData[i] = Math.max(10, val)
        }
      }

      // Draw equalizer spectrum bars
      const barWidth = Math.max(2, (width - (barCount - 1) * 4) / barCount)
      const centerY = height / 2

      for (let i = 0; i < barCount; i++) {
        const amp = Math.max(4, (frequencyData[i] / 255) * (height * 0.85))
        const x = i * (barWidth + 4)

        // Gradient for bars (Cyan -> Purple -> Magenta)
        const gradient = ctx.createLinearGradient(0, centerY - amp / 2, 0, centerY + amp / 2)
        if (isRecording) {
          gradient.addColorStop(0, '#ff007f')
          gradient.addColorStop(0.5, '#9d4edd')
          gradient.addColorStop(1, '#00f2fe')
        } else {
          gradient.addColorStop(0, 'rgba(0, 242, 254, 0.7)')
          gradient.addColorStop(1, 'rgba(157, 78, 221, 0.3)')
        }

        ctx.fillStyle = gradient
        ctx.beginPath()
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, centerY - amp / 2, barWidth, amp, 2)
        } else {
          ctx.rect(x, centerY - amp / 2, barWidth, amp)
        }
        ctx.fill()

        // Glow effect for active high frequencies
        if (isRecording && amp > height * 0.5) {
          ctx.shadowBlur = 12
          ctx.shadowColor = '#ff007f'
        } else {
          ctx.shadowBlur = 0
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isRecording, analyserNode])

  return (
    <div className="audio-canvas-wrapper">
      <canvas ref={canvasRef} className="live-audio-canvas" />
      <style>{`
        .audio-canvas-wrapper {
          width: 100%;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: rgba(8, 10, 22, 0.6);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .live-audio-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
      `}</style>
    </div>
  )
}
