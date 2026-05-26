import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AppButton } from '../../../components/common/AppButton'
import { SiteFooter } from '../../../components/layout/SiteFooter'
import { SiteHeader } from '../../../components/layout/SiteHeader'

type Phase = 'idle' | 'shooting' | 'result' | 'gameover'

type LevelConfig = {
  level: number
  targetCount: number
  shootingTime: number
  minRadius: number
}

const LEVELS: LevelConfig[] = [
  { level: 1, targetCount: 6, shootingTime: 12000, minRadius: 40 },
  { level: 2, targetCount: 8, shootingTime: 12000, minRadius: 36 },
  { level: 3, targetCount: 10, shootingTime: 12000, minRadius: 32 },
  { level: 4, targetCount: 12, shootingTime: 12000, minRadius: 28 },
  { level: 5, targetCount: 14, shootingTime: 12000, minRadius: 24 },
]

type Target = {
  id: number
  x: number // %
  y: number // %
  spawnedAt: number
  isHit: boolean
}

type Shot = {
  targetId: number
  hit: boolean
  reactionMs: number
}

function makeTargets(config: LevelConfig): Target[] {
  const out: Target[] = []
  for (let i = 0; i < config.targetCount; i++) {
    const x = 8 + Math.random() * 84
    const y = 12 + Math.random() * 76
    out.push({ id: i, x, y, spawnedAt: 0, isHit: false })
  }
  return out
}

function AimTrainerGamePage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('idle')
  const [levelIndex, setLevelIndex] = useState(0)
  const [targets, setTargets] = useState<Target[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [shots, setShots] = useState<Shot[]>([])
  const [hitCount, setHitCount] = useState(0)
  const [allStats, setAllStats] = useState<
    { level: number; accuracy: number; avgReaction: number; hits: number; total: number }[]
  >([])
  const [effects, setEffects] = useState<{ id: number; x: number; y: number; hit: boolean }[]>([])

  const startedAtRef = useRef(0)
  const lastSpawnRef = useRef(0)
  const timerRef = useRef<number | null>(null)
  const effectIdRef = useRef(0)
  const config = LEVELS[levelIndex]

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    return () => clearTimer()
  }, [])

  const startLevel = useCallback((idx: number) => {
    clearTimer()
    const cfg = LEVELS[idx]
    const newTargets = makeTargets(cfg)
    setTargets(newTargets)
    setShots([])
    setHitCount(0)
    setLevelIndex(idx)
    setActiveId(0)
    setPhase('shooting')
    startedAtRef.current = performance.now()
    lastSpawnRef.current = performance.now()
    newTargets[0].spawnedAt = performance.now()
    setTimeLeft(cfg.shootingTime)

    timerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startedAtRef.current
      const remaining = Math.max(cfg.shootingTime - elapsed, 0)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearTimer()
        endLevel()
      }
    }, 50)
  }, [])

  const endLevel = useCallback(() => {
    setShots((prevShots) => {
      const hits = prevShots.filter((s) => s.hit)
      const total = prevShots.length
      const accuracy = total > 0 ? Math.round((hits.length / total) * 100) : 0
      const avgReaction =
        hits.length > 0 ? Math.round(hits.reduce((s, h) => s + h.reactionMs, 0) / hits.length) : 0
      setAllStats((prev) => [
        ...prev,
        { level: levelIndex + 1, accuracy, avgReaction, hits: hits.length, total },
      ])
      return prevShots
    })
    setPhase('result')
  }, [levelIndex])

  const nextLevel = () => {
    if (levelIndex + 1 >= LEVELS.length) {
      setPhase('gameover')
      return
    }
    startLevel(levelIndex + 1)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'shooting') return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const effectId = ++effectIdRef.current
    const activeTarget = targets.find((t) => t.id === activeId)
    let hit = false
    if (activeTarget) {
      const dx = (activeTarget.x - x) * (rect.width / 100)
      const dy = (activeTarget.y - y) * (rect.height / 100)
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= config.minRadius) hit = true
    }

    setEffects((prev) => [...prev, { id: effectId, x, y, hit }])
    setTimeout(() => setEffects((prev) => prev.filter((e) => e.id !== effectId)), 400)

    const reactionMs = Math.round(performance.now() - (activeTarget?.spawnedAt || 0))
    setShots((prev) => [...prev, { targetId: activeId ?? -1, hit, reactionMs }])

    if (hit && activeTarget) {
      setHitCount((h) => h + 1)
      setTargets((prev) => prev.map((t) => (t.id === activeTarget.id ? { ...t, isHit: true } : t)))
      const nextId = activeId !== null ? activeId + 1 : 0
      if (nextId >= config.targetCount) {
        clearTimer()
        endLevel()
        return
      }
      setActiveId(nextId)
      setTargets((prev) =>
        prev.map((t) => (t.id === nextId ? { ...t, spawnedAt: performance.now() } : t)),
      )
    }
  }

  const overallAccuracy =
    allStats.length > 0
      ? Math.round(
          (allStats.reduce((s, l) => s + l.hits, 0) /
            Math.max(1, allStats.reduce((s, l) => s + l.total, 0))) *
            100,
        )
      : 0
  const overallReaction =
    allStats.length > 0
      ? Math.round(allStats.reduce((s, l) => s + l.avgReaction, 0) / allStats.length)
      : 0

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-sp-bg font-sans text-sp-text">
      <SiteHeader />

      <main className="mx-auto w-full max-w-sp-page flex-grow px-6 py-8 md:px-12 md:py-12">
        <section className="animate-sp-fade-in mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              to="/gameinfo/aimtrainer"
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

            <div className="w-fit rounded-sp-pill border border-sp-danger/20 bg-sp-danger-soft px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest text-sp-danger">
              Aim Trainer
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Stage" value={`${levelIndex + 1}/${LEVELS.length}`} />
            <StatCard label="Hits" value={`${hitCount}/${config.targetCount}`} />
            <StatCard label="Time Left" value={`${(timeLeft / 1000).toFixed(1)}s`} />
            <StatCard
              label="Accuracy"
              value={
                shots.length > 0
                  ? `${Math.round((shots.filter((s) => s.hit).length / shots.length) * 100)}%`
                  : '-'
              }
            />
          </div>

          {phase === 'idle' && (
            <div className="rounded-sp-card border border-sp-border bg-sp-glass p-8 backdrop-blur-xl md:p-12 min-h-[420px] flex flex-col items-center justify-center text-center">
              <div className="mb-4 text-7xl">◎</div>
              <h1 className="mb-4 text-4xl font-black text-sp-text md:text-5xl">Aim Trainer</h1>
              <p className="mb-8 max-w-xl text-lg text-sp-text-muted">
                ทดสอบความเร็วและความแม่นยำในการเล็ง คลิกเป้าหมายให้ถูกตามลำดับ
              </p>
              <AppButton onClick={() => startLevel(0)} className="px-10 py-4 text-xl">
                START
              </AppButton>
            </div>
          )}

          {phase === 'shooting' && (
            <div
              onClick={handleClick}
              className="relative rounded-sp-card border border-sp-border bg-sp-glass backdrop-blur-xl overflow-hidden"
              style={{
                cursor: 'crosshair',
                aspectRatio: '16/9',
                backgroundImage:
                  'linear-gradient(rgba(124,92,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.04) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            >
              {targets.map((t) => {
                const isActive = t.id === activeId && !t.isHit
                if (t.isHit || !isActive) return null
                return (
                  <div
                    key={t.id}
                    style={{
                      position: 'absolute',
                      left: `${t.x}%`,
                      top: `${t.y}%`,
                      transform: 'translate(-50%,-50%)',
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      className="rounded-full border-4 border-sp-danger"
                      style={{
                        width: 64,
                        height: 64,
                        boxShadow: '0 0 28px #fb718577',
                        background: 'radial-gradient(circle, #fb7185 0%, #b91c1c 80%)',
                      }}
                    />
                  </div>
                )
              })}

              {effects.map((e) => (
                <div
                  key={e.id}
                  style={{
                    position: 'absolute',
                    left: `${e.x}%`,
                    top: `${e.y}%`,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: e.hit
                      ? 'radial-gradient(circle, #34d399, transparent)'
                      : 'radial-gradient(circle, #fb7185, transparent)',
                    transform: 'translate(-50%,-50%) scale(2)',
                    opacity: 0.4,
                    pointerEvents: 'none',
                    transition: 'all 0.4s',
                  }}
                />
              ))}
            </div>
          )}

          {phase === 'result' && (
            <div className="rounded-sp-card border border-sp-border bg-sp-glass p-8 backdrop-blur-xl text-center">
              <p className="mb-2 text-sm uppercase tracking-widest text-sp-text-subtle">
                Stage {levelIndex + 1} Result
              </p>
              <h2 className="mb-6 text-3xl font-black text-sp-text md:text-4xl">Performance</h2>
              {allStats[allStats.length - 1] && (
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <StatCard
                    label="Accuracy"
                    value={`${allStats[allStats.length - 1].accuracy}%`}
                  />
                  <StatCard
                    label="Hits"
                    value={`${allStats[allStats.length - 1].hits}/${allStats[allStats.length - 1].total}`}
                  />
                  <StatCard
                    label="Avg Reaction"
                    value={`${allStats[allStats.length - 1].avgReaction} ms`}
                  />
                </div>
              )}
              <div className="flex flex-col gap-3 md:flex-row md:justify-center">
                <AppButton onClick={nextLevel} className="px-10 py-3 text-lg">
                  {levelIndex + 1 >= LEVELS.length ? 'ดูสรุปทั้งหมด' : 'Stage ถัดไป'}
                </AppButton>
                <AppButton
                  variant="glass"
                  onClick={() => navigate('/librarygame')}
                  className="px-10 py-3 text-lg"
                >
                  Main Menu
                </AppButton>
              </div>
            </div>
          )}

          {phase === 'gameover' && (
            <div className="rounded-sp-card border border-sp-border bg-sp-glass p-8 backdrop-blur-xl text-center">
              <div className="mb-4 text-6xl">🏆</div>
              <h2 className="mb-6 text-3xl font-black text-sp-text md:text-4xl">
                All Stages Cleared!
              </h2>
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <StatCard label="Overall Accuracy" value={`${overallAccuracy}%`} />
                <StatCard label="Avg Reaction" value={`${overallReaction} ms`} />
              </div>
              <div className="mb-8 space-y-2">
                {allStats.map((s) => (
                  <div
                    key={s.level}
                    className="flex items-center justify-between rounded-sp-xl border border-sp-border bg-sp-surface/50 p-3 text-sm"
                  >
                    <span className="font-bold text-sp-text">Stage {s.level}</span>
                    <div className="flex gap-6 text-sp-text-muted">
                      <span>Acc: {s.accuracy}%</span>
                      <span>Reaction: {s.avgReaction}ms</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:justify-center">
                <AppButton
                  onClick={() => {
                    setAllStats([])
                    startLevel(0)
                  }}
                  className="px-10 py-3 text-lg"
                >
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
      <p className="text-2xl font-black text-sp-text">{value}</p>
    </div>
  )
}

export default AimTrainerGamePage
