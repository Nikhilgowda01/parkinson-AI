import { useEffect, useRef } from 'react'

export default function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animationFrameId

    let width = (canvas.width = Math.max(100, window.innerWidth))
    let height = (canvas.height = Math.max(100, window.innerHeight))

    const handleResize = () => {
      width = canvas.width = Math.max(100, window.innerWidth)
      height = canvas.height = Math.max(100, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Particle nodes
    const particleCount = 45
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2.5 + 1,
      color: Math.random() > 0.5 ? 'rgba(0, 242, 254, ' : 'rgba(157, 78, 221, ',
      alpha: Math.random() * 0.5 + 0.2
    }))

    // Sine wave parameters
    let step = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw subtle background neon ambient gradient blur
      const rad1 = Math.max(10, width * 0.8)
      const gradient = ctx.createRadialGradient(
        width * 0.3,
        height * 0.2,
        20,
        width * 0.5,
        height * 0.5,
        rad1
      )
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)')
      gradient.addColorStop(0.5, 'rgba(10, 14, 30, 0.98)')
      gradient.addColorStop(1, '#070913')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Animated Aurora Mesh Waves
      step += 0.008
      ctx.beginPath()
      ctx.moveTo(0, height * 0.7)
      for (let x = 0; x <= width; x += 30) {
        const y = Math.sin(x * 0.003 + step) * 40 + Math.cos(x * 0.001 + step * 1.5) * 25 + height * 0.65
        ctx.lineTo(x, y)
      }
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()
      const waveGrad = ctx.createLinearGradient(0, height * 0.5, width, height)
      waveGrad.addColorStop(0, 'rgba(0, 242, 254, 0.04)')
      waveGrad.addColorStop(0.5, 'rgba(157, 78, 221, 0.05)')
      waveGrad.addColorStop(1, 'rgba(255, 0, 127, 0.03)')
      ctx.fillStyle = waveGrad
      ctx.fill()

      // Render Floating Particles & Connections
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.alpha})`
        ctx.fill()

        // Connect nearby particles with subtle neon line
        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 140) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            const lineAlpha = (1 - dist / 140) * 0.15
            ctx.strokeStyle = `rgba(0, 242, 254, ${lineAlpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  )
}
