import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AppButton } from '../../../components/common/AppButton'
import { SiteFooter } from '../../../components/layout/SiteFooter'
import { SiteHeader } from '../../../components/layout/SiteHeader'

type Phase = 'idle' | 'playing' | 'gameover'
type EntityType = 'enemy' | 'ally'

function getGameSpeed(score: number) {
  if (score >= 40) return 600
  if (score >= 30) return 720
  if (score >= 20) return 850
  if (score >= 10) return 1000
  if (score >= 5) return 1125
  return 1250
}

function QuickDecisionGamePage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('idle')
  const [hearts, setHearts] = useState(3)
  const [score, setScore] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [avgReaction, setAvgReaction] = useState(0)
  const [currentType, setCurrentType] = useState<EntityType | null>(null)
  const [visible, setVisible] = useState(false)

  const totalShotsRef = useRef(0)
  const totalReactionRef = useRef(0)
  const startTimeRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)
  const spawnTimeoutRef = useRef<number | null>(null)
  const lastTypesRef = useRef<EntityType[]>([])
  const enemyCountRef = useRef(0)
  const allyCountRef = useRef(0)
  const heartsRef = useRef(3)
  const scoreRef = useRef(0)
  const currentTypeRef = useRef<EntityType | null>(null)
  const activeRef = useRef(false)

  const clearTimers = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    if (spawnTimeoutRef.current) window.clearTimeout(spawnTimeoutRef.current)
    timeoutRef.current = null
    spawnTimeoutRef.current = null
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  const updateAccuracy = useCallback(() => {
    if (totalShotsRef.current === 0) {
      setAccuracy(100)
      return
    }
    setAccuracy(Math.round((scoreRef.current / totalShotsRef.current) * 100))
  }, [])

  const getBalancedType = useCallback((): EntityType => {
    const types: EntityType[] = ['enemy', 'ally']
    let available = [...types]
    const last = lastTypesRef.current
    if (last.length >= 2 && last[0] === last[1]) {
      available = available.filter((t) => t !== last[0])
    }
    const diff = enemyCountRef.current - allyCountRef.current
    if (diff >= 2) available = available.filter((t) => t !== 'enemy')
    if (diff <= -2) available = available.filter((t) => t !== 'ally')
    if (available.length === 0) available = [...types]
    return available[Math.floor(Math.random() * available.length)]
  }, [])

  const endGame = useCallback(() => {
    activeRef.current = false
    clearTimers()
    setVisible(false)
    setPhase('gameover')
  }, [])

  const loseHeart = useCallback(() => {
    heartsRef.current -= 1
    setHearts(heartsRef.current)
    if (heartsRef.current <= 0) {
      endGame()
    }
  }, [endGame])

  const spawnCharacter = useCallback(() => {
    if (!activeRef.current) return
    setVisible(false)
    spawnTimeoutRef.current = window.setTimeout(() => {
      if (!activeRef.current) return
      const type = getBalancedType()
      currentTypeRef.current = type
      lastTypesRef.current.push(type)
      if (lastTypesRef.current.length > 2) lastTypesRef.current.shift()
      if (type === 'enemy') enemyCountRef.current += 1
      else allyCountRef.current += 1

      setCurrentType(type)
      setVisible(true)
      startTimeRef.current = performance.now()

      const speed = getGameSpeed(scoreRef.current)
      timeoutRef.current = window.setTimeout(() => {
        if (!activeRef.current) return
        if (currentTypeRef.current === 'enemy') {
          totalShotsRef.current += 1
          updateAccuracy()
          loseHeart()
        }
        spawnCharacter()
      }, speed)
    }, 250)
  }, [getBalancedType, loseHeart, updateAccuracy])

  const handleStart = () => {
    clearTimers()
    heartsRef.current = 3
    scoreRef.current = 0
    totalShotsRef.current = 0
    totalReactionRef.current = 0
    enemyCountRef.current = 0
    allyCountRef.current = 0
    lastTypesRef.current = []
    activeRef.current = true
    setHearts(3)
    setScore(0)
    setAccuracy(100)
    setAvgReaction(0)
    setPhase('playing')
    spawnCharacter()
  }

  const handleShoot = useCallback(() => {
    if (!activeRef.current) return
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    if (spawnTimeoutRef.current) window.clearTimeout(spawnTimeoutRef.current)

    const reaction = Math.round(performance.now() - startTimeRef.current)
    totalShotsRef.current += 1

    if (currentTypeRef.current === 'enemy') {
      scoreRef.current += 1
      totalReactionRef.current += reaction
      setScore(scoreRef.current)
      setAvgReaction(
        scoreRef.current === 0
          ? 0
          : Math.round(totalReactionRef.current / scoreRef.current),
      )
    } else {
      loseHeart()
    }
    updateAccuracy()
    if (activeRef.current) spawnCharacter()
  }, [loseHeart, spawnCharacter, updateAccuracy])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && phase === 'playing') {
        e.preventDefault()
        handleShoot()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, handleShoot])

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-sp-bg font-sans text-sp-text">
      <SiteHeader />

      <main className="mx-auto w-full max-w-sp-page flex-grow px-6 py-8 md:px-12 md:py-12">
        <section className="animate-sp-fade-in mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              to="/gameinfo/quickdecision"
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

            <div className="w-fit rounded-sp-pill border border-sp-danger/30 bg-sp-danger-soft px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest text-sp-danger">
              Quick Decision
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label="Hearts"
              value={'❤️'.repeat(hearts) || '0'}
              accent={hearts === 1 ? 'text-sp-danger' : undefined}
            />
            <StatCard label="Score" value={`${score}`} />
            <StatCard label="Accuracy" value={`${accuracy}%`} />
            <StatCard
              label="Avg Reaction"
              value={avgReaction > 0 ? `${avgReaction} ms` : '-'}
            />
          </div>

          <div className="rounded-sp-card border border-sp-border bg-sp-glass p-8 backdrop-blur-xl md:p-12 min-h-[520px] flex flex-col items-center justify-center">
            {phase === 'idle' && (
              <div className="text-center">
                <h1 className="mb-4 text-4xl font-black text-sp-text md:text-5xl">
                  Quick Decision
                </h1>
                <p className="mb-8 max-w-xl text-lg text-sp-text-muted">
                  ระบุศัตรูให้เร็วที่สุด ยิง 🔴 ศัตรู ปกป้อง 🟢 พวกพ้อง
                </p>
                <AppButton onClick={handleStart} className="px-10 py-4 text-xl">
                  เริ่มเล่น
                </AppButton>
              </div>
            )}

            {phase === 'playing' && (
              <div className="flex w-full flex-col items-center gap-8">
                <div
                  className="flex h-48 w-48 items-center justify-center rounded-full text-7xl transition-all duration-200 md:h-64 md:w-64 md:text-9xl"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'scale(1)' : 'scale(0.92)',
                    background:
                      currentType === 'enemy'
                        ? 'radial-gradient(circle, #ef4444aa, #7f1d1d33)'
                        : 'radial-gradient(circle, #22c55eaa, #14532d33)',
                    boxShadow:
                      currentType === 'enemy'
                        ? '0 0 80px #ef4444aa'
                        : '0 0 80px #22c55eaa',
                  }}
                >
                  {currentType === 'enemy' ? '👹' : '🤝'}
                </div>

                <AppButton
                  onClick={handleShoot}
                  className="px-12 py-5 text-2xl"
                >
                  SHOOT (Space)
                </AppButton>

                <p className="text-sm text-sp-text-subtle">
                  เคล็ดลับ: ยิงเฉพาะ 👹 ศัตรู หากยิงพวกพ้อง 🤝 จะเสียหัวใจ
                </p>
              </div>
            )}

            {phase === 'gameover' && (
              <div className="text-center">
                <h2 className="mb-6 text-4xl font-black text-sp-danger md:text-6xl">
                  GAME OVER
                </h2>
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <StatCard label="Score" value={`${score}`} />
                  <StatCard label="Accuracy" value={`${accuracy}%`} />
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
  accent?: string
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="rounded-sp-xl border border-sp-border bg-sp-surface/50 p-4 text-center">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-sp-text-subtle">
        {label}
      </p>
      <p className={`text-2xl font-black ${accent ?? 'text-sp-text'}`}>{value}</p>
    </div>
  )
}

export default QuickDecisionGamePage
