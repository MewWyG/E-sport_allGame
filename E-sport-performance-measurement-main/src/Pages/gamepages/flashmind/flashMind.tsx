import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AppButton } from '../../../components/common/AppButton'
import { SiteFooter } from '../../../components/layout/SiteFooter'
import { SiteHeader } from '../../../components/layout/SiteHeader'

type ColorOption = {
  name: string
  value: string
}

type Phase = 'idle' | 'countdown' | 'showing' | 'choosing' | 'cleared' | 'gameover'

const BASE_COLORS: ColorOption[] = [
  { name: 'RED', value: '#ff4d4d' },
  { name: 'BLUE', value: '#4d8dff' },
  { name: 'GREEN', value: '#4dff88' },
  { name: 'PURPLE', value: '#bb66ff' },
  { name: 'YELLOW', value: '#ffe066' },
  { name: 'PINK', value: '#ff66c4' },
]

function getDurations(level: number, count: number) {
  let normalTime = 950
  let shortTime = 500

  if (level >= 4) {
    normalTime = 850
    shortTime = 420
  }
  if (level >= 7) {
    normalTime = 720
    shortTime = 350
  }
  if (level >= 10) {
    normalTime = 600
    shortTime = 280
  }

  const durations = Array.from({ length: count }, () => normalTime)
  const shortestIndex = Math.floor(Math.random() * durations.length)
  durations[shortestIndex] = shortTime

  return { durations, shortestIndex }
}

function getColorCount(level: number) {
  if (level >= 10) return 6
  if (level >= 7) return 5
  if (level >= 4) return 4
  return 3
}

function FlashMindGamePage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('idle')
  const [level, setLevel] = useState(1)
  const [countdownText, setCountdownText] = useState('READY')
  const [colors, setColors] = useState<ColorOption[]>([])
  const [shownIndex, setShownIndex] = useState(0)
  const [showingColor, setShowingColor] = useState<ColorOption | null>(null)
  const [shortestIndex, setShortestIndex] = useState(0)
  const [correctAnswer, setCorrectAnswer] = useState('')

  const timeoutsRef = useRef<number[]>([])

  const clearAllTimers = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
  }

  useEffect(() => {
    return () => clearAllTimers()
  }, [])

  const playSequence = useCallback(
    (currentColors: ColorOption[], currentShortest: number, lvl: number) => {
      const { durations } = getDurations(lvl, currentColors.length)
      // Use the durations from the helper but override shortest index from input
      const finalDurations = currentColors.map((_, i) =>
        i === currentShortest ? durations[currentShortest] : 950 - Math.min(lvl, 10) * 25,
      )
      const shortDuration =
        lvl >= 10 ? 280 : lvl >= 7 ? 350 : lvl >= 4 ? 420 : 500
      finalDurations[currentShortest] = shortDuration

      let index = 0
      const showNext = () => {
        if (index >= currentColors.length) {
          setShowingColor(null)
          setPhase('choosing')
          return
        }
        const current = currentColors[index]
        setShowingColor(current)
        setShownIndex(index)
        const onTime = window.setTimeout(() => {
          setShowingColor(null)
          const offTime = window.setTimeout(() => {
            index++
            showNext()
          }, 250)
          timeoutsRef.current.push(offTime)
        }, finalDurations[index])
        timeoutsRef.current.push(onTime)
      }
      showNext()
    },
    [],
  )

  const startLevel = useCallback(
    (lvl: number) => {
      clearAllTimers()
      const count = getColorCount(lvl)
      const newColors = BASE_COLORS.slice(0, count)
      const idx = Math.floor(Math.random() * count)
      setColors(newColors)
      setShortestIndex(idx)
      setCorrectAnswer(newColors[idx].name)
      setShownIndex(0)
      setPhase('showing')
      const start = window.setTimeout(() => {
        playSequence(newColors, idx, lvl)
      }, 400)
      timeoutsRef.current.push(start)
    },
    [playSequence],
  )

  const runCountdown = useCallback(
    (then: () => void) => {
      const sequence = ['3', '2', '1', "LET'S GO!"]
      sequence.forEach((text, i) => {
        const id = window.setTimeout(() => setCountdownText(text), i * 800)
        timeoutsRef.current.push(id)
      })
      const finish = window.setTimeout(then, sequence.length * 800 + 400)
      timeoutsRef.current.push(finish)
    },
    [],
  )

  const handleStart = () => {
    clearAllTimers()
    setLevel(1)
    setPhase('countdown')
    setCountdownText('ARE YOU READY?')
    runCountdown(() => startLevel(1))
  }

  const handleAnswer = (name: string) => {
    if (phase !== 'choosing') return
    if (name === correctAnswer) {
      setPhase('cleared')
    } else {
      setPhase('gameover')
    }
  }

  const handleNextLevel = () => {
    const next = level + 1
    setLevel(next)
    setPhase('countdown')
    runCountdown(() => startLevel(next))
  }

  const handleRestart = () => {
    handleStart()
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-sp-bg font-sans text-sp-text">
      <SiteHeader />

      <main className="mx-auto w-full max-w-sp-page flex-grow px-6 py-8 md:px-12 md:py-12">
        <section className="animate-sp-fade-in mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              to="/gameinfo/flashmind"
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

            <div className="w-fit rounded-sp-pill border border-sp-primary/20 bg-sp-primary/10 px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest text-sp-primary-hover">
              FlashMind
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatCard label="Level" value={`${level}`} />
            <StatCard label="จำนวนสี" value={`${getColorCount(level)}`} />
            <StatCard label="สถานะ" value={phase === 'showing' ? 'กำลังแสดง' : phase === 'choosing' ? 'เลือกคำตอบ' : '-'} />
          </div>

          <div className="rounded-sp-card border border-sp-border bg-sp-glass p-8 backdrop-blur-xl md:p-12 min-h-[480px] flex flex-col items-center justify-center">
            {phase === 'idle' && (
              <div className="text-center">
                <h1 className="mb-4 text-4xl font-black text-sp-text md:text-5xl">
                  FlashMind
                </h1>
                <p className="mb-8 text-lg text-sp-text-muted">
                  จดจำสีที่ปรากฏเร็วที่สุด
                </p>
                <AppButton onClick={handleStart} className="px-10 py-4 text-xl">
                  เริ่มเล่น
                </AppButton>
              </div>
            )}

            {phase === 'countdown' && (
              <div className="text-center">
                <h2 className="text-6xl font-black text-sp-primary-hover md:text-8xl">
                  {countdownText}
                </h2>
              </div>
            )}

            {phase === 'showing' && (
              <div className="text-center">
                <p className="mb-6 text-sp-text-muted">
                  สีที่ {shownIndex + 1} / {colors.length}
                </p>
                <div
                  className="mx-auto h-48 w-48 rounded-full transition-opacity duration-300 md:h-64 md:w-64"
                  style={{
                    background: showingColor?.value ?? 'transparent',
                    opacity: showingColor ? 1 : 0,
                    boxShadow: showingColor
                      ? `0 0 120px ${showingColor.value}`
                      : 'none',
                  }}
                />
              </div>
            )}

            {phase === 'choosing' && (
              <div className="w-full text-center">
                <h2 className="mb-8 text-2xl font-bold text-sp-text md:text-3xl">
                  สีไหนแสดงเร็วที่สุด?
                </h2>
                <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleAnswer(color.name)}
                      className="rounded-sp-lg py-4 font-black text-white transition-transform hover:scale-105"
                      style={{
                        background: color.value,
                        boxShadow: `0 4px 20px ${color.value}55`,
                      }}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === 'cleared' && (
              <div className="text-center">
                <h2 className="mb-4 text-4xl font-black text-sp-success md:text-6xl">
                  LEVEL CLEAR
                </h2>
                <p className="mb-8 text-xl text-sp-text-muted">
                  ยินดีต้อนรับสู่ Level {level + 1}
                </p>
                <AppButton onClick={handleNextLevel} className="px-10 py-4 text-xl">
                  Level ถัดไป
                </AppButton>
              </div>
            )}

            {phase === 'gameover' && (
              <div className="text-center">
                <h2 className="mb-4 text-4xl font-black text-sp-danger md:text-6xl">
                  GAME OVER
                </h2>
                <p className="mb-2 text-lg text-sp-text-muted">
                  คำตอบที่ถูก: <span className="font-bold text-sp-text">{correctAnswer}</span>
                </p>
                <p className="mb-8 text-lg text-sp-text-muted">
                  Level ที่ทำได้: <span className="font-bold text-sp-text">{level}</span>
                </p>
                <div className="flex flex-col gap-4 md:flex-row md:justify-center">
                  <AppButton onClick={handleRestart} className="px-10 py-4 text-xl">
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

export default FlashMindGamePage
