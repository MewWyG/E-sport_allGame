import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AppButton } from '../../../components/common/AppButton'
import { SiteFooter } from '../../../components/layout/SiteFooter'
import { SiteHeader } from '../../../components/layout/SiteHeader'

type CircleColor = 'green' | 'red'
type RoundData = { color: CircleColor; x: number; y: number }
type ReactionData = { reaction: number; correct: boolean }

const MAX_ROUNDS = 15
const CIRCLE_SIZE = 110
const MIN_DISTANCE = 180
const MAX_DISTANCE = 500
const PADDING_X = 60
const PADDING_Y = 100
const AREA_WIDTH = 800
const AREA_HEIGHT = 500

function generateFairSequence(): RoundData[] {
  const colors: CircleColor[] = [
    ...Array(8).fill('green'),
    ...Array(7).fill('red'),
  ] as CircleColor[]
  colors.sort(() => Math.random() - 0.5)

  const sequence: RoundData[] = []
  let prevX = AREA_WIDTH / 2
  let prevY = AREA_HEIGHT / 2

  for (let i = 0; i < MAX_ROUNDS; i++) {
    let valid = false
    let nextX = prevX
    let nextY = prevY
    let attempts = 0
    while (!valid && attempts < 50) {
      attempts++
      nextX =
        Math.random() * (AREA_WIDTH - CIRCLE_SIZE - PADDING_X * 2) + PADDING_X
      nextY =
        Math.random() * (AREA_HEIGHT - CIRCLE_SIZE - PADDING_Y) + PADDING_Y / 2
      const dx = nextX - prevX
      const dy = nextY - prevY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist >= MIN_DISTANCE && dist <= MAX_DISTANCE) valid = true
    }
    sequence.push({ color: colors[i], x: nextX, y: nextY })
    prevX = nextX
    prevY = nextY
  }
  return sequence.sort(() => Math.random() - 0.5)
}

function calculatePoints(reaction: number) {
  if (reaction < 300) return 100
  if (reaction < 500) return 80
  if (reaction < 800) return 60
  return 40
}

function ColorReflexGamePage() {
  const navigate = useNavigate()
  const GAME_SEQUENCE = useMemo(() => generateFairSequence(), [])
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
  const [reactionData, setReactionData] = useState<ReactionData[]>([])
  const [currentColor, setCurrentColor] = useState<CircleColor>('green')
  const [pos, setPos] = useState({ x: AREA_WIDTH / 2, y: AREA_HEIGHT / 2 })
  const reactionStartRef = useRef(0)

  const spawnCircle = useCallback(
    (idx: number) => {
      if (idx >= MAX_ROUNDS) {
        setGameOver(true)
        return
      }
      const current = GAME_SEQUENCE[idx]
      setCurrentColor(current.color)
      setPos({ x: current.x, y: current.y })
      reactionStartRef.current = Date.now()
    },
    [GAME_SEQUENCE],
  )

  const handleStart = () => {
    setStarted(true)
    setRound(0)
    setScore(0)
    setReactionData([])
    setGameOver(false)
    spawnCircle(0)
  }

  useEffect(() => {
    if (started && round > 0 && round < MAX_ROUNDS) {
      spawnCircle(round)
    } else if (round >= MAX_ROUNDS) {
      setGameOver(true)
    }
  }, [round, started, spawnCircle])

  const correctAction = useCallback(() => {
    const reaction = Date.now() - reactionStartRef.current
    const pts = calculatePoints(reaction)
    setScore((p) => p + pts)
    setReactionData((p) => [...p, { reaction, correct: true }])
    setMessage(`Correct +${pts}`)
    setTimeout(() => setMessage(''), 300)
    setRound((p) => p + 1)
  }, [])

  const wrongAction = useCallback(() => {
    setScore((p) => Math.max(0, p - 50))
    setReactionData((p) => [
      ...p,
      { reaction: Date.now() - reactionStartRef.current, correct: false },
    ])
    setMessage('Wrong -50')
    setTimeout(() => setMessage(''), 300)
    setRound((p) => p + 1)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!started || gameOver) return
      if (e.code === 'Space') {
        e.preventDefault()
        if (currentColor === 'red') correctAction()
        else wrongAction()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentColor, started, gameOver, correctAction, wrongAction])

  const handleClick = () => {
    if (!started || gameOver) return
    if (currentColor === 'green') correctAction()
    else wrongAction()
  }

  const correctAnswers = reactionData.filter((r) => r.correct).length
  const wrongAnswers = reactionData.filter((r) => !r.correct).length
  const accuracy = Math.floor((correctAnswers / MAX_ROUNDS) * 100)
  const reactionTimes = reactionData.filter((r) => r.correct).map((r) => r.reaction)
  const avgReaction =
    reactionTimes.length > 0
      ? Math.floor(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0
  const fastest = reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0
  const totalTime = reactionData.reduce((a, b) => a + b.reaction, 0) / 1000

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-sp-bg font-sans text-sp-text">
      <SiteHeader />

      <main className="mx-auto w-full max-w-sp-page flex-grow px-6 py-8 md:px-12 md:py-12">
        <section className="animate-sp-fade-in mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              to="/gameinfo/colorreflex"
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

            <div className="w-fit rounded-sp-pill border border-sp-success/20 bg-sp-success-soft px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest text-sp-success">
              Color Reflex
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <StatCard label="Round" value={`${Math.min(round + 1, MAX_ROUNDS)}/${MAX_ROUNDS}`} />
            <StatCard label="Score" value={`${score}`} />
            <StatCard label="Message" value={message || '-'} />
          </div>

          {!started ? (
            <div className="rounded-sp-card border border-sp-border bg-sp-glass p-8 backdrop-blur-xl md:p-12 min-h-[420px] flex flex-col items-center justify-center text-center">
              <h1 className="mb-4 text-4xl font-black text-sp-text md:text-5xl">
                Color Reflex
              </h1>
              <p className="mb-2 text-lg text-sp-text-muted">🟢 Green = คลิกที่วงกลม</p>
              <p className="mb-8 text-lg text-sp-text-muted">🔴 Red = กด Space</p>
              <AppButton onClick={handleStart} className="px-10 py-4 text-xl">
                เริ่มเล่น
              </AppButton>
            </div>
          ) : gameOver ? (
            <div className="rounded-sp-card border border-sp-border bg-sp-glass p-8 backdrop-blur-xl md:p-12">
              <h2 className="mb-6 text-center text-3xl font-black text-sp-text md:text-4xl">
                Result
              </h2>
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                <StatCard label="Accuracy" value={`${accuracy}%`} />
                <StatCard label="Correct" value={`${correctAnswers}/${MAX_ROUNDS}`} />
                <StatCard label="Wrong" value={`${wrongAnswers}`} />
                <StatCard label="Avg Reaction" value={`${avgReaction} ms`} />
                <StatCard label="Fastest" value={`${fastest} ms`} />
                <StatCard label="Total Time" value={`${totalTime.toFixed(2)}s`} />
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:justify-center">
                <AppButton onClick={handleStart} className="px-10 py-3 text-lg">
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
          ) : (
            <div
              className="relative overflow-hidden rounded-sp-card border border-sp-border bg-sp-glass backdrop-blur-xl"
              style={{ aspectRatio: `${AREA_WIDTH}/${AREA_HEIGHT}` }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at center, rgba(124,92,255,0.1), transparent 70%)',
                }}
              />
              <div
                onClick={handleClick}
                style={{
                  position: 'absolute',
                  left: `${(pos.x / AREA_WIDTH) * 100}%`,
                  top: `${(pos.y / AREA_HEIGHT) * 100}%`,
                  width: `${(CIRCLE_SIZE / AREA_WIDTH) * 100}%`,
                  aspectRatio: '1',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'left 0.08s linear, top 0.08s linear',
                  background:
                    currentColor === 'green'
                      ? 'radial-gradient(circle, #4ade80, #15803d)'
                      : 'radial-gradient(circle, #f87171, #991b1b)',
                  boxShadow:
                    currentColor === 'green'
                      ? '0 0 50px #4ade80aa'
                      : '0 0 50px #f87171aa',
                }}
              />
            </div>
          )}

          {started && !gameOver && (
            <p className="mt-4 text-center text-sm text-sp-text-subtle">
              🟢 คลิกวงกลม · 🔴 กด Space
            </p>
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

export default ColorReflexGamePage
