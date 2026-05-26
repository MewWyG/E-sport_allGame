import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AppButton } from '../../../components/common/AppButton'
import { SiteFooter } from '../../../components/layout/SiteFooter'
import { SiteHeader } from '../../../components/layout/SiteHeader'

type Phase = 'idle' | 'playing' | 'gameover'

const DIRECTIONS = ['⬅', '➡', '⬆', '⬇'] as const
type Direction = (typeof DIRECTIONS)[number]

const OPPOSITE_KEY: Record<Direction, string> = {
  '⬅': 'ArrowRight',
  '➡': 'ArrowLeft',
  '⬆': 'ArrowDown',
  '⬇': 'ArrowUp',
}

function getMaxTime(score: number) {
  if (score >= 50) return 1.5
  if (score >= 40) return 2
  if (score >= 30) return 2.5
  return 3
}

function ReverseMindGamePage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('idle')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(3)
  const [direction, setDirection] = useState<Direction>('⬅')
  const [totalAnswers, setTotalAnswers] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [survivalTime, setSurvivalTime] = useState(0)

  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const directionRef = useRef<Direction>('⬅')
  const startTimeRef = useRef(0)
  const totalAnswersRef = useRef(0)
  const correctAnswersRef = useRef(0)
  const timerRef = useRef<number | null>(null)
  const activeRef = useRef(false)

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    return () => clearTimer()
  }, [])

  const endGame = useCallback(() => {
    activeRef.current = false
    clearTimer()
    const survival = (Date.now() - startTimeRef.current) / 1000
    setSurvivalTime(survival)
    setTotalAnswers(totalAnswersRef.current)
    setCorrectAnswers(correctAnswersRef.current)
    setPhase('gameover')
  }, [])

  const loseLife = useCallback(() => {
    livesRef.current -= 1
    setLives(livesRef.current)
    if (livesRef.current <= 0) {
      endGame()
    } else {
      nextRound()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endGame])

  const nextRound = useCallback(() => {
    clearTimer()
    const max = getMaxTime(scoreRef.current)
    setTimeLeft(max)
    const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
    directionRef.current = dir
    setDirection(dir)

    let current = max
    timerRef.current = window.setInterval(() => {
      if (!activeRef.current) return
      current = Math.round((current - 0.1) * 10) / 10
      setTimeLeft(current)
      if (current <= 0) {
        clearTimer()
        loseLife()
      }
    }, 100)
  }, [loseLife])

  const handleStart = () => {
    activeRef.current = true
    scoreRef.current = 0
    livesRef.current = 3
    totalAnswersRef.current = 0
    correctAnswersRef.current = 0
    startTimeRef.current = Date.now()
    setScore(0)
    setLives(3)
    setPhase('playing')
    nextRound()
  }

  const handlePress = useCallback(
    (key: string) => {
      if (!activeRef.current) return
      totalAnswersRef.current += 1
      const correct = OPPOSITE_KEY[directionRef.current]
      if (key === correct) {
        scoreRef.current += 1
        correctAnswersRef.current += 1
        setScore(scoreRef.current)
        nextRound()
      } else {
        loseLife()
      }
    },
    [loseLife, nextRound],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'playing') return
      if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)
      ) {
        e.preventDefault()
        handlePress(e.code)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, handlePress])

  const accuracy =
    totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-sp-bg font-sans text-sp-text">
      <SiteHeader />

      <main className="mx-auto w-full max-w-sp-page flex-grow px-6 py-8 md:px-12 md:py-12">
        <section className="animate-sp-fade-in mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              to="/gameinfo/reversemind"
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
              ReverseMind
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4 md:grid-cols-4">
            <StatCard label="Score" value={`${score}`} />
            <StatCard label="Lives" value={'❤️'.repeat(lives) || '0'} />
            <StatCard label="Timer" value={`${timeLeft.toFixed(1)}s`} />
            <StatCard
              label="Accuracy"
              value={
                totalAnswersRef.current > 0
                  ? `${Math.round(
                      (correctAnswersRef.current / totalAnswersRef.current) * 100,
                    )}%`
                  : '100%'
              }
            />
          </div>

          <div className="rounded-sp-card border border-sp-border bg-sp-glass p-8 backdrop-blur-xl md:p-12 min-h-[480px] flex flex-col items-center justify-center">
            {phase === 'idle' && (
              <div className="text-center">
                <h1 className="mb-4 text-4xl font-black text-sp-text md:text-5xl">
                  ReverseMind
                </h1>
                <p className="mb-8 max-w-xl text-lg text-sp-text-muted">
                  เห็นลูกศรไปทางไหน ให้กดทิศตรงข้าม! ทดสอบการยับยั้งและตอบสนอง
                </p>
                <AppButton onClick={handleStart} className="px-10 py-4 text-xl">
                  เริ่มเล่น
                </AppButton>
              </div>
            )}

            {phase === 'playing' && (
              <div className="text-center">
                <p className="mb-6 text-sp-text-muted">กดทิศตรงข้ามให้ทันเวลา</p>
                <div className="mb-8 text-8xl md:text-9xl drop-shadow-lg">
                  {direction}
                </div>
                <p className="mb-6 text-sm uppercase tracking-widest text-sp-text-subtle">
                  หรือใช้ปุ่มลูกศรบนคีย์บอร์ด
                </p>
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  <div />
                  <button
                    onClick={() => handlePress('ArrowUp')}
                    className="rounded-sp-lg bg-sp-surface hover:bg-sp-surface-strong p-4 text-3xl text-sp-text transition-colors"
                  >
                    ⬆
                  </button>
                  <div />
                  <button
                    onClick={() => handlePress('ArrowLeft')}
                    className="rounded-sp-lg bg-sp-surface hover:bg-sp-surface-strong p-4 text-3xl text-sp-text transition-colors"
                  >
                    ⬅
                  </button>
                  <div />
                  <button
                    onClick={() => handlePress('ArrowRight')}
                    className="rounded-sp-lg bg-sp-surface hover:bg-sp-surface-strong p-4 text-3xl text-sp-text transition-colors"
                  >
                    ➡
                  </button>
                  <div />
                  <button
                    onClick={() => handlePress('ArrowDown')}
                    className="rounded-sp-lg bg-sp-surface hover:bg-sp-surface-strong p-4 text-3xl text-sp-text transition-colors"
                  >
                    ⬇
                  </button>
                  <div />
                </div>
              </div>
            )}

            {phase === 'gameover' && (
              <div className="text-center">
                <h2 className="mb-6 text-4xl font-black text-sp-danger md:text-6xl">
                  GAME OVER
                </h2>
                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <StatCard label="Score" value={`${score}`} />
                  <StatCard label="Accuracy" value={`${accuracy}%`} />
                  <StatCard label="Survival" value={`${survivalTime.toFixed(1)}s`} />
                  <StatCard label="Answers" value={`${totalAnswers}`} />
                </div>
                <div className="flex flex-col gap-4 md:flex-row md:justify-center">
                  <AppButton onClick={handleStart} className="px-10 py-4 text-xl">
                    เล่นอีกครั้ง
                  </AppButton>
                  <AppButton
                    variant="glass"
                    onClick={() => navigate('/librarygame')}
                    className="px-10 py-4 text-xl"
                  >
                    กลับคลังเกม
                  </AppButton>
                </div>
              </div>
            )}
          </div>
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
      <p className="text-2xl font-black text-sp-text">{value}</p>
    </div>
  )
}

export default ReverseMindGamePage
