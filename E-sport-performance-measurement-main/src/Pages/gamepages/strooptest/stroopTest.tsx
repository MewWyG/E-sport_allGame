import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AppButton } from '../../../components/common/AppButton'
import { SiteFooter } from '../../../components/layout/SiteFooter'
import { SiteHeader } from '../../../components/layout/SiteHeader'

type Phase = 'idle' | 'playing' | 'gameover'

const COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW'] as const
type ColorName = (typeof COLORS)[number]

const COLOR_MAP: Record<ColorName, string> = {
  RED: '#ef4444',
  BLUE: '#3b82f6',
  GREEN: '#21a652',
  YELLOW: '#facc15',
}

const TIME_OPTIONS = [10, 20, 30]

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function StroopTestGamePage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('idle')
  const [selectedTime, setSelectedTime] = useState(10)
  const [timeLeft, setTimeLeft] = useState(10)
  const [score, setScore] = useState(0)
  const [avgReaction, setAvgReaction] = useState(0)
  const [word, setWord] = useState<ColorName>('RED')
  const [colorOfWord, setColorOfWord] = useState<ColorName>('BLUE')

  const lastWordRef = useRef<ColorName | ''>('')
  const lastColorRef = useRef<ColorName | ''>('')
  const totalReactionRef = useRef(0)
  const scoreRef = useRef(0)
  const startTimeRef = useRef(0)
  const correctColorRef = useRef<ColorName>('BLUE')
  const timerRef = useRef<number | null>(null)
  const activeRef = useRef(false)
  const colorStatsRef = useRef<Record<ColorName, number>>({
    RED: 0,
    BLUE: 0,
    GREEN: 0,
    YELLOW: 0,
  })

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    return () => clearTimer()
  }, [])

  const generateQuestion = useCallback(() => {
    const availableWords = COLORS.filter((c) => c !== lastWordRef.current)
    const newWord = pickRandom(availableWords)

    const availableColors = COLORS.filter((c) => {
      if (c === lastColorRef.current) return false
      if (c === newWord) return false
      return true
    })

    const minCount = Math.min(...availableColors.map((c) => colorStatsRef.current[c]))
    const balanced = availableColors.filter((c) => colorStatsRef.current[c] === minCount)
    const newColor = pickRandom(balanced)

    lastWordRef.current = newWord
    lastColorRef.current = newColor
    colorStatsRef.current[newColor] += 1

    setWord(newWord)
    setColorOfWord(newColor)
    correctColorRef.current = newColor
    startTimeRef.current = performance.now()
  }, [])

  const endGame = useCallback(() => {
    activeRef.current = false
    clearTimer()
    setPhase('gameover')
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    timerRef.current = window.setInterval(() => {
      if (!activeRef.current) return
      setTimeLeft((prev) => {
        const next = prev - 1
        if (next <= 0) {
          endGame()
          return 0
        }
        return next
      })
    }, 1000)
  }, [endGame])

  const handleStart = () => {
    activeRef.current = true
    scoreRef.current = 0
    totalReactionRef.current = 0
    lastWordRef.current = ''
    lastColorRef.current = ''
    colorStatsRef.current = { RED: 0, BLUE: 0, GREEN: 0, YELLOW: 0 }
    setScore(0)
    setAvgReaction(0)
    setTimeLeft(selectedTime)
    setPhase('playing')
    generateQuestion()
    startTimer()
  }

  const handleClick = (color: ColorName) => {
    if (!activeRef.current) return
    const reaction = performance.now() - startTimeRef.current

    if (color === correctColorRef.current) {
      scoreRef.current += 1
      totalReactionRef.current += reaction
      setScore(scoreRef.current)
      setAvgReaction(Math.round(totalReactionRef.current / scoreRef.current))
      generateQuestion()
    } else {
      endGame()
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-sp-bg font-sans text-sp-text">
      <SiteHeader />

      <main className="mx-auto w-full max-w-sp-page flex-grow px-6 py-8 md:px-12 md:py-12">
        <section className="animate-sp-fade-in mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              to="/gameinfo/strooptest"
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

            <div className="w-fit rounded-sp-pill border border-sp-warning/20 bg-sp-warning-soft px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest text-sp-warning">
              Stroop Test
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <StatCard label="Time Left" value={`${timeLeft}s`} />
            <StatCard label="Score" value={`${score}`} />
            <StatCard
              label="Avg Reaction"
              value={avgReaction > 0 ? `${avgReaction} ms` : '-'}
            />
          </div>

          <div className="rounded-sp-card border border-sp-border bg-sp-glass p-8 backdrop-blur-xl md:p-12 min-h-[480px] flex flex-col items-center justify-center">
            {phase === 'idle' && (
              <div className="w-full text-center">
                <h1 className="mb-4 text-4xl font-black text-sp-text md:text-5xl">
                  Stroop Test
                </h1>
                <p className="mb-8 max-w-xl mx-auto text-lg text-sp-text-muted">
                  เลือก "สี" ของคำให้ถูก ไม่ใช่อ่านคำ ทดสอบสมาธิและการควบคุมความสนใจ
                </p>

                <div className="mb-8">
                  <p className="mb-3 text-sm uppercase tracking-widest text-sp-text-subtle">
                    เลือกเวลา
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {TIME_OPTIONS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`rounded-sp-pill px-6 py-2 font-bold transition-colors ${
                          selectedTime === t
                            ? 'bg-sp-primary text-white'
                            : 'border border-sp-border bg-sp-surface text-sp-text-muted hover:bg-sp-surface-strong'
                        }`}
                      >
                        {t}s
                      </button>
                    ))}
                  </div>
                </div>

                <AppButton onClick={handleStart} className="px-10 py-4 text-xl">
                  เริ่มทดสอบ
                </AppButton>
              </div>
            )}

            {phase === 'playing' && (
              <div className="w-full text-center">
                <p className="mb-8 text-sp-text-muted">
                  เลือก "สี" ของคำ (ไม่ใช่อ่านคำ)
                </p>
                <div
                  className="mb-12 text-7xl font-black md:text-9xl"
                  style={{ color: COLOR_MAP[colorOfWord] }}
                >
                  {word}
                </div>
                <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleClick(c)}
                      className="rounded-sp-lg py-4 font-black text-white transition-transform hover:scale-105"
                      style={{
                        background: COLOR_MAP[c],
                        boxShadow: `0 4px 20px ${COLOR_MAP[c]}55`,
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === 'gameover' && (
              <div className="text-center">
                <h2 className="mb-6 text-4xl font-black text-sp-text md:text-5xl">
                  Final Result
                </h2>
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <StatCard label="Score" value={`${score}`} />
                  <StatCard
                    label="Avg Reaction"
                    value={avgReaction > 0 ? `${avgReaction} ms` : '-'}
                  />
                </div>
                <div className="flex flex-col gap-4 md:flex-row md:justify-center">
                  <AppButton onClick={handleStart} className="px-10 py-4 text-xl">
                    เล่นอีกครั้ง
                  </AppButton>
                  <AppButton
                    variant="glass"
                    onClick={() => {
                      setPhase('idle')
                      setTimeLeft(selectedTime)
                    }}
                    className="px-10 py-4 text-xl"
                  >
                    เลือกเวลาใหม่
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

export default StroopTestGamePage
