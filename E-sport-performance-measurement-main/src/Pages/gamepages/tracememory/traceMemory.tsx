import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AppButton } from '../../../components/common/AppButton'
import { SiteFooter } from '../../../components/layout/SiteFooter'
import { SiteHeader } from '../../../components/layout/SiteHeader'
import { generatePath, type Point } from './utils/generatePath'

const SHOW_TIME = [2500, 2400, 2300, 2200, 2100, 1900, 1700, 1500, 1300, 1100]
const MAX_LEVEL = 10

type LevelResult = {
  level: number
  score: number
  time: number
}

function TraceMemoryGamePage() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const levelStartTimeRef = useRef(0)

  const [size, setSize] = useState({ width: 800, height: 500 })
  const [level, setLevel] = useState(1)
  const [path, setPath] = useState<Point[]>([])
  const [showPath, setShowPath] = useState(true)
  const [drawing, setDrawing] = useState(false)
  const [playerPath, setPlayerPath] = useState<Point[]>([])
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [passed, setPassed] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [results, setResults] = useState<LevelResult[]>([])
  const [started, setStarted] = useState(false)

  // Resize handler
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setSize({
        width: Math.max(320, rect.width),
        height: Math.max(400, Math.min(600, window.innerHeight - 300)),
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [started])

  const startLevel = useCallback(
    (lvl: number) => {
      const generated = generatePath(lvl, size.width, size.height)
      setPath(generated)
      setPlayerPath([])
      setFinished(false)
      setScore(null)
      setPassed(false)
      setShowPath(true)
      levelStartTimeRef.current = Date.now()
      const timer = setTimeout(() => setShowPath(false), SHOW_TIME[lvl - 1])
      return () => clearTimeout(timer)
    },
    [size],
  )

  useEffect(() => {
    if (!started || gameComplete) return
    const cleanup = startLevel(level)
    return cleanup
  }, [level, size, started, gameComplete, startLevel])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, size.width, size.height)
    // Background
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, size.width, size.height)

    // Grid pattern
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    for (let x = 0; x < size.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, size.height)
      ctx.stroke()
    }
    for (let y = 0; y < size.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(size.width, y)
      ctx.stroke()
    }

    if (showPath && path.length > 0) {
      ctx.strokeStyle = '#7c5cff'
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      path.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.stroke()
    }

    if (playerPath.length > 0) {
      ctx.strokeStyle = '#34d399'
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      playerPath.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.stroke()
    }

    if (path.length > 0) {
      const start = path[0]
      const end = path[path.length - 1]
      ctx.fillStyle = '#a78bfa'
      ctx.beginPath()
      ctx.arc(start.x, start.y, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ec4899'
      ctx.beginPath()
      ctx.arc(end.x, end.y, 14, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [path, playerPath, showPath, size])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const createInterpolatedPath = (original: Point[]) => {
    const out: Point[] = []
    for (let i = 0; i < original.length - 1; i++) {
      const s = original[i]
      const e = original[i + 1]
      const dist = Math.hypot(e.x - s.x, e.y - s.y)
      const steps = Math.max(1, Math.floor(dist / 6))
      for (let j = 0; j <= steps; j++) {
        const t = j / steps
        out.push({ x: s.x + (e.x - s.x) * t, y: s.y + (e.y - s.y) * t })
      }
    }
    return out
  }

  const calculateScore = useCallback(() => {
    if (playerPath.length === 0) return
    const sampled = createInterpolatedPath(path)
    const tolerance = Math.max(28, 58 - level * 2)

    let total = 0
    playerPath.forEach((pp) => {
      let minDist = Infinity
      sampled.forEach((sp) => {
        const d = Math.hypot(pp.x - sp.x, pp.y - sp.y)
        if (d < minDist) minDist = d
      })
      const norm = Math.max(0, 1 - Math.pow(minDist / tolerance, 1.4))
      total += norm
    })

    const playerEnd = playerPath[playerPath.length - 1]
    const actualEnd = path[path.length - 1]
    const endDist = Math.hypot(playerEnd.x - actualEnd.x, playerEnd.y - actualEnd.y)
    const endPenalty = endDist > tolerance ? 0.82 : 1

    const accuracy = Math.floor((total / playerPath.length) * 100 * endPenalty)
    const levelTime = Number(((Date.now() - levelStartTimeRef.current) / 1000).toFixed(1))

    setResults((prev) => [...prev, { level, score: accuracy, time: levelTime }])
    setScore(accuracy)
    setPassed(accuracy >= 40)
    setFinished(true)
  }, [level, path, playerPath])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (showPath || finished || path.length === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const start = path[0]
    const dist = Math.hypot(x - start.x, y - start.y)
    if (dist > 40) return
    setDrawing(true)
    setPlayerPath([{ x, y }])
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || finished) return
    const rect = e.currentTarget.getBoundingClientRect()
    setPlayerPath((prev) => [
      ...prev,
      { x: e.clientX - rect.left, y: e.clientY - rect.top },
    ])
  }

  const handleMouseUp = () => {
    if (!drawing) return
    setDrawing(false)
    calculateScore()
  }

  const goToNextLevel = () => {
    if (level >= MAX_LEVEL) {
      setGameComplete(true)
      return
    }
    setRetryCount(0)
    setLevel((p) => p + 1)
  }

  const retryLevel = () => {
    if (retryCount >= 2) {
      goToNextLevel()
      return
    }
    setRetryCount((p) => p + 1)
    startLevel(level)
  }

  const restartGame = () => {
    setLevel(1)
    setRetryCount(0)
    setResults([])
    setGameComplete(false)
    setStarted(true)
  }

  const totalTime = results.reduce((s, r) => s + r.time, 0)
  const totalScore =
    results.length > 0
      ? Math.floor(results.reduce((s, r) => s + r.score, 0) / results.length)
      : 0

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-sp-bg font-sans text-sp-text">
      <SiteHeader />

      <main className="mx-auto w-full max-w-sp-page flex-grow px-6 py-8 md:px-12 md:py-12">
        <section className="animate-sp-fade-in mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              to="/gameinfo/tracememory"
              className="group inline-flex w-fit items-center gap-2 text-sp-text-muted transition-colors hover:text-sp-text"
            >
              <svg
                className="h-5 w-5 transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>กลับไปหน้ารายละเอียดเกม</span>
            </Link>

            <div className="w-fit rounded-sp-pill border border-sp-info/20 bg-sp-info-soft px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest text-sp-info">
              Trace Memory
            </div>
          </div>

          {!started && (
            <div className="rounded-sp-card border border-sp-border bg-sp-glass p-8 backdrop-blur-xl md:p-12 min-h-[420px] flex flex-col items-center justify-center text-center">
              <h1 className="mb-4 text-4xl font-black text-sp-text md:text-5xl">Trace Memory</h1>
              <p className="mb-8 max-w-xl text-lg text-sp-text-muted">
                จดจำเส้นทางที่แสดง แล้วลากเมาส์ไล่ตามเส้นทางเดียวกันให้แม่นที่สุด
              </p>
              <AppButton onClick={() => setStarted(true)} className="px-10 py-4 text-xl">
                เริ่มเล่น
              </AppButton>
            </div>
          )}

          {started && !gameComplete && (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard label="Level" value={`${level}/${MAX_LEVEL}`} />
                <StatCard label="Retry" value={`${retryCount}/3`} />
                <StatCard
                  label="Status"
                  value={
                    showPath ? 'จำเส้นทาง' : finished ? 'จบ Level' : 'ลากเส้น'
                  }
                />
                <StatCard label="Score" value={score !== null ? `${score}%` : '-'} />
              </div>

              <div
                ref={containerRef}
                className="rounded-sp-card border border-sp-border bg-sp-glass p-4 backdrop-blur-xl overflow-hidden"
              >
                <canvas
                  ref={canvasRef}
                  width={size.width}
                  height={size.height}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{
                    touchAction: 'none',
                    cursor: 'crosshair',
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: 12,
                  }}
                />
              </div>

              {finished && (
                <div className="mt-6 rounded-sp-card border border-sp-border bg-sp-glass p-6 backdrop-blur-xl text-center">
                  <h2 className="mb-4 text-5xl font-black text-sp-primary-hover">
                    {score}%
                  </h2>
                  {passed ? (
                    <>
                      <p className="mb-6 text-lg font-bold text-sp-success">
                        Level Cleared!
                      </p>
                      <AppButton onClick={goToNextLevel} className="px-10 py-3 text-lg">
                        Level ถัดไป
                      </AppButton>
                    </>
                  ) : (
                    <>
                      <p className="mb-6 text-lg font-bold text-sp-danger">
                        ต้องการความแม่นยำมากกว่านี้
                      </p>
                      <div className="flex flex-col gap-3 md:flex-row md:justify-center">
                        <AppButton onClick={retryLevel} className="px-10 py-3 text-lg">
                          ลองอีกครั้ง ({3 - retryCount} เหลือ)
                        </AppButton>
                        <AppButton
                          variant="glass"
                          onClick={restartGame}
                          className="px-10 py-3 text-lg"
                        >
                          เริ่มใหม่
                        </AppButton>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {gameComplete && (
            <div className="rounded-sp-card border border-sp-border bg-sp-glass p-8 backdrop-blur-xl">
              <h2 className="mb-6 text-center text-3xl font-black text-sp-text md:text-4xl">
                Game Summary
              </h2>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <StatCard label="Total Time" value={`${totalTime.toFixed(1)}s`} />
                <StatCard label="Overall Accuracy" value={`${totalScore}%`} />
              </div>
              <div className="mb-6 space-y-3">
                {results.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-sp-xl border border-sp-border bg-sp-surface/50 p-4"
                  >
                    <p className="font-bold text-sp-text">Level {r.level}</p>
                    <div className="flex gap-6 text-sm text-sp-text-muted">
                      <span>Score: {r.score}%</span>
                      <span>Time: {r.time}s</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:justify-center">
                <AppButton onClick={restartGame} className="px-10 py-3 text-lg">
                  เล่นอีกครั้ง
                </AppButton>
                <AppButton
                  variant="glass"
                  onClick={() => navigate('/librarygame')}
                  className="px-10 py-3 text-lg"
                >
                  กลับคลังเกม
                </AppButton>
              </div>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

type StatCardProps = {
  label: string
  value: string
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-sp-xl border border-sp-border bg-sp-surface/50 p-4 text-center">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-sp-text-subtle">
        {label}
      </p>
      <p className="text-xl font-black text-sp-text md:text-2xl">{value}</p>
    </div>
  )
}

export default TraceMemoryGamePage
