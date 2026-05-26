import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AppButton } from '../../../components/common/AppButton'
import { SiteFooter } from '../../../components/layout/SiteFooter'
import { SiteHeader } from '../../../components/layout/SiteHeader'

const GAME_CONFIG = {
  memorizeTimeMs: 15000,
  nextLevelDelayMs: 750,
  correctPreviewMs: 200,
  wrongPreviewMs: 500,
}

const ALL_SHAPES = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'hexagon',
  'star',
  'pentagon',
  'cross',
  'oval',
  'rectangle',
  'roundedSquare',
  'octagon',
  'trapezoid',
  'parallelogram',
  'leftTriangle',
  'rightTriangle',
  'ring',
  'xShape',
  'kite',
  'hourglass',
  'semicircle',
  'pill',
  'thinDiamond',
  'wideHexagon',
] as const

const SHAPE_COLORS = [
  '#e74c3c',
  '#e67e22',
  '#f39c12',
  '#27ae60',
  '#16a085',
  '#2980b9',
  '#8e44ad',
  '#c0392b',
  '#d35400',
  '#2ecc71',
  '#1abc9c',
  '#3498db',
  '#9b59b6',
  '#e91e63',
  '#00bcd4',
  '#ff5722',
  '#4caf50',
  '#673ab7',
  '#009688',
  '#ff9800',
  '#795548',
  '#607d8b',
  '#f44336',
  '#2196f3',
]

type Card = {
  id: string
  pairId: string
  shape: string
  color: string
  isMatched: boolean
}

type Phase = 'idle' | 'memorize' | 'playing' | 'result'

type State = {
  phase: Phase
  level: number
  cards: Card[]
  selectedIds: string[]
  correctPairsInLevel: number
  wrongAttempts: number
  totalCorrect: number
  totalWrong: number
  completedLevels: number
}

type Action =
  | { type: 'START' }
  | { type: 'BEGIN_PLAY' }
  | { type: 'SELECT_CARD'; cardId: string }
  | { type: 'MATCH_PAIR'; firstId: string; secondId: string }
  | { type: 'WRONG_PAIR' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'FAIL' }
  | { type: 'RESET' }

const initial: State = {
  phase: 'idle',
  level: 0,
  cards: [],
  selectedIds: [],
  correctPairsInLevel: 0,
  wrongAttempts: 0,
  totalCorrect: 0,
  totalWrong: 0,
  completedLevels: 0,
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function buildCards(level: number): Card[] {
  const pairCount = Math.min(level + 2, ALL_SHAPES.length)
  const shapes = shuffle([...ALL_SHAPES]).slice(0, pairCount)
  const cards: Card[] = []
  shapes.forEach((shape, i) => {
    const pairId = `pair-${level}-${i}`
    const color = SHAPE_COLORS[i % SHAPE_COLORS.length]
    cards.push({ id: `${pairId}-a`, pairId, shape, color, isMatched: false })
    cards.push({ id: `${pairId}-b`, pairId, shape, color, isMatched: false })
  })
  return shuffle(cards)
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { ...initial, phase: 'memorize', level: 1, cards: buildCards(1) }
    case 'BEGIN_PLAY':
      return { ...state, phase: 'playing', selectedIds: [] }
    case 'SELECT_CARD':
      if (state.selectedIds.includes(action.cardId) || state.selectedIds.length >= 2) return state
      return { ...state, selectedIds: [...state.selectedIds, action.cardId] }
    case 'MATCH_PAIR':
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.firstId || c.id === action.secondId ? { ...c, isMatched: true } : c,
        ),
        selectedIds: [],
        correctPairsInLevel: state.correctPairsInLevel + 1,
        totalCorrect: state.totalCorrect + 1,
      }
    case 'WRONG_PAIR':
      return {
        ...state,
        selectedIds: [],
        wrongAttempts: state.wrongAttempts + 1,
        totalWrong: state.totalWrong + 1,
      }
    case 'NEXT_LEVEL': {
      const next = state.level + 1
      return {
        ...state,
        phase: 'memorize',
        level: next,
        cards: buildCards(next),
        selectedIds: [],
        correctPairsInLevel: 0,
        wrongAttempts: 0,
        completedLevels: state.completedLevels + 1,
      }
    }
    case 'FAIL':
      return { ...state, phase: 'result', selectedIds: [] }
    case 'RESET':
      return initial
    default:
      return state
  }
}

function ShapeIcon({ shape, color, size = 48 }: { shape: string; color: string; size?: number }) {
  const c = color
  const props = {
    viewBox: '0 0 100 100' as const,
    width: size,
    height: size,
    'aria-hidden': true,
  }
  switch (shape) {
    case 'circle':
      return (
        <svg {...props}>
          <circle cx="50" cy="50" r="42" fill={c} />
        </svg>
      )
    case 'square':
      return (
        <svg {...props}>
          <rect x="18" y="18" width="64" height="64" rx="8" fill={c} />
        </svg>
      )
    case 'triangle':
      return (
        <svg {...props}>
          <polygon points="50,10 90,82 10,82" fill={c} />
        </svg>
      )
    case 'diamond':
      return (
        <svg {...props}>
          <polygon points="50,8 92,50 50,92 8,50" fill={c} />
        </svg>
      )
    case 'hexagon':
      return (
        <svg {...props}>
          <polygon points="28,10 72,10 94,50 72,90 28,90 6,50" fill={c} />
        </svg>
      )
    case 'star':
      return (
        <svg {...props}>
          <polygon
            points="50,6 61,36 94,36 67,56 78,90 50,70 22,90 33,56 6,36 39,36"
            fill={c}
          />
        </svg>
      )
    case 'pentagon':
      return (
        <svg {...props}>
          <polygon points="50,8 92,40 76,92 24,92 8,40" fill={c} />
        </svg>
      )
    case 'cross':
      return (
        <svg {...props}>
          <path d="M38 8H62V38H92V62H62V92H38V62H8V38H38Z" fill={c} />
        </svg>
      )
    case 'oval':
      return (
        <svg {...props}>
          <ellipse cx="50" cy="50" rx="42" ry="28" fill={c} />
        </svg>
      )
    case 'rectangle':
      return (
        <svg {...props}>
          <rect x="10" y="30" width="80" height="40" rx="8" fill={c} />
        </svg>
      )
    case 'roundedSquare':
      return (
        <svg {...props}>
          <rect x="16" y="16" width="68" height="68" rx="20" fill={c} />
        </svg>
      )
    case 'octagon':
      return (
        <svg {...props}>
          <polygon points="32,8 68,8 92,32 92,68 68,92 32,92 8,68 8,32" fill={c} />
        </svg>
      )
    case 'trapezoid':
      return (
        <svg {...props}>
          <polygon points="25,18 75,18 92,82 8,82" fill={c} />
        </svg>
      )
    case 'parallelogram':
      return (
        <svg {...props}>
          <polygon points="30,16 92,16 70,84 8,84" fill={c} />
        </svg>
      )
    case 'leftTriangle':
      return (
        <svg {...props}>
          <polygon points="12,50 88,12 88,88" fill={c} />
        </svg>
      )
    case 'rightTriangle':
      return (
        <svg {...props}>
          <polygon points="12,12 88,50 12,88" fill={c} />
        </svg>
      )
    case 'ring':
      return (
        <svg {...props}>
          <circle cx="50" cy="50" r="33" fill="none" stroke={c} strokeWidth="16" />
        </svg>
      )
    case 'xShape':
      return (
        <svg {...props}>
          <path
            d="M22 8L50 36L78 8L92 22L64 50L92 78L78 92L50 64L22 92L8 78L36 50L8 22Z"
            fill={c}
          />
        </svg>
      )
    case 'kite':
      return (
        <svg {...props}>
          <polygon points="50,6 88,38 50,94 12,38" fill={c} />
        </svg>
      )
    case 'thinDiamond':
      return (
        <svg {...props}>
          <polygon points="50,4 78,50 50,96 22,50" fill={c} />
        </svg>
      )
    case 'hourglass':
      return (
        <svg {...props}>
          <polygon points="12,8 88,8 58,50 88,92 12,92 42,50" fill={c} />
        </svg>
      )
    case 'semicircle':
      return (
        <svg {...props}>
          <path d="M10 70A40 40 0 0 1 90 70Z" fill={c} />
        </svg>
      )
    case 'pill':
      return (
        <svg {...props}>
          <rect x="8" y="30" width="84" height="40" rx="22" fill={c} />
        </svg>
      )
    case 'wideHexagon':
      return (
        <svg {...props}>
          <polygon points="20,20 80,20 96,50 80,80 20,80 4,50" fill={c} />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <rect x="18" y="18" width="64" height="64" rx="8" fill={c} />
        </svg>
      )
  }
}

function getGridCols(total: number) {
  if (total <= 4) return 2
  if (total <= 6) return 3
  if (total <= 12) return 4
  if (total <= 20) return 5
  if (total <= 30) return 6
  return 7
}

function ColorSymbolMatchingGamePage() {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(reducer, initial)
  const [timeLeftMs, setTimeLeftMs] = useState(GAME_CONFIG.memorizeTimeMs)
  const [locked, setLocked] = useState(false)
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)
  const levelStartRef = useRef(0)
  const completedRef = useRef(false)

  const pairsInLevel = state.level > 0 ? state.level + 2 : 0

  const matchedPairsInLevel = useMemo(() => {
    const ids = new Set(state.cards.filter((c) => c.isMatched).map((c) => c.pairId))
    return ids.size
  }, [state.cards])

  // Memorize phase timer
  useEffect(() => {
    if (state.phase !== 'memorize') return
    levelStartRef.current = performance.now()
    completedRef.current = false
    setLocked(true)
    setTimeLeftMs(GAME_CONFIG.memorizeTimeMs)

    const interval = window.setInterval(() => {
      const elapsed = performance.now() - levelStartRef.current
      setTimeLeftMs(Math.max(GAME_CONFIG.memorizeTimeMs - elapsed, 0))
    }, 100)

    const timer = window.setTimeout(() => {
      setLocked(false)
      dispatch({ type: 'BEGIN_PLAY' })
    }, GAME_CONFIG.memorizeTimeMs)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timer)
    }
  }, [state.phase, state.level])

  // Pair check
  useEffect(() => {
    if (state.selectedIds.length !== 2) return
    setLocked(true)
    const [firstId, secondId] = state.selectedIds
    const first = state.cards.find((c) => c.id === firstId)
    const second = state.cards.find((c) => c.id === secondId)
    if (!first || !second) {
      setLocked(false)
      return
    }
    if (first.pairId === second.pairId) {
      setFlash('correct')
      const tid = window.setTimeout(() => {
        dispatch({ type: 'MATCH_PAIR', firstId, secondId })
        setFlash(null)
        setLocked(false)
      }, GAME_CONFIG.correctPreviewMs)
      return () => window.clearTimeout(tid)
    }
    setFlash('wrong')
    const tid = window.setTimeout(() => {
      setFlash(null)
      setLocked(false)
      dispatch({ type: 'FAIL' })
    }, GAME_CONFIG.wrongPreviewMs)
    return () => window.clearTimeout(tid)
  }, [state.selectedIds, state.cards])

  // Level complete
  useEffect(() => {
    if (state.phase !== 'playing') return
    if (matchedPairsInLevel !== pairsInLevel || pairsInLevel === 0) return
    if (completedRef.current) return
    completedRef.current = true
    const tid = window.setTimeout(() => {
      dispatch({ type: 'NEXT_LEVEL' })
    }, GAME_CONFIG.nextLevelDelayMs)
    return () => window.clearTimeout(tid)
  }, [matchedPairsInLevel, pairsInLevel, state.phase])

  const handleStart = useCallback(() => {
    dispatch({ type: 'START' })
  }, [])

  const handleCardClick = (card: Card) => {
    if (state.phase !== 'playing' || locked || card.isMatched) return
    if (state.selectedIds.includes(card.id)) return
    dispatch({ type: 'SELECT_CARD', cardId: card.id })
  }

  const handleReadyToPlay = () => {
    if (state.phase !== 'memorize') return
    setLocked(false)
    setTimeLeftMs(0)
    dispatch({ type: 'BEGIN_PLAY' })
  }

  const isPlaying = state.phase === 'playing'
  const isMemorize = state.phase === 'memorize'
  const totalCards = state.cards.length
  const gridCols = getGridCols(totalCards)
  const accuracy =
    state.totalCorrect + state.totalWrong > 0
      ? Math.round((state.totalCorrect / (state.totalCorrect + state.totalWrong)) * 100)
      : 100
  const timerPct = (timeLeftMs / GAME_CONFIG.memorizeTimeMs) * 100
  const seconds = Math.ceil(timeLeftMs / 1000)

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-sp-bg font-sans text-sp-text">
      <SiteHeader />

      <main className="mx-auto w-full max-w-sp-page flex-grow px-6 py-8 md:px-12 md:py-12">
        <section className="animate-sp-fade-in mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              to="/gameinfo/colorsymbolmatching"
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
              Color Symbol Matching
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Level" value={`${state.level || '-'}`} />
            <StatCard label="Pairs" value={`${matchedPairsInLevel}/${pairsInLevel || 0}`} />
            <StatCard label="Accuracy" value={`${accuracy}%`} />
            <StatCard label="Completed" value={`${state.completedLevels}`} />
          </div>

          <div
            className="relative rounded-sp-card border border-sp-border bg-sp-glass p-6 backdrop-blur-xl md:p-10 min-h-[520px] flex flex-col items-center justify-center"
            style={{
              background:
                flash === 'correct'
                  ? 'rgba(80,220,120,0.10)'
                  : flash === 'wrong'
                    ? 'rgba(255,80,80,0.10)'
                    : undefined,
              transition: 'background 0.15s',
            }}
          >
            {state.phase === 'idle' && (
              <div className="text-center">
                <div className="mb-6 flex justify-center gap-3">
                  <ShapeIcon shape="circle" color={SHAPE_COLORS[0]} size={48} />
                  <ShapeIcon shape="hexagon" color={SHAPE_COLORS[3]} size={48} />
                  <ShapeIcon shape="star" color={SHAPE_COLORS[6]} size={48} />
                  <ShapeIcon shape="diamond" color={SHAPE_COLORS[9]} size={48} />
                </div>
                <h1 className="mb-4 text-4xl font-black text-sp-text md:text-5xl">
                  Color Symbol Matching
                </h1>
                <p className="mb-8 max-w-xl text-lg text-sp-text-muted">
                  จำตำแหน่งของรูปทรงและสี แล้วจับคู่ให้ถูกต้อง ทุก Level ความยากเพิ่มขึ้น
                </p>
                <AppButton onClick={handleStart} className="px-10 py-4 text-xl">
                  เริ่มเล่น
                </AppButton>
              </div>
            )}

            {(isMemorize || isPlaying) && (
              <div className="w-full">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-center text-sm text-sp-text-muted md:text-left">
                    {isMemorize
                      ? `จำตำแหน่งรูปทรงทั้งหมดใน ${seconds}s`
                      : 'จับคู่รูปทรง — กดผิดเกมจบ!'}
                  </p>
                  {isMemorize && (
                    <button
                      onClick={handleReadyToPlay}
                      className="rounded-sp-pill bg-sp-primary px-6 py-2 text-sm font-bold text-white hover:bg-sp-primary-hover transition"
                    >
                      พร้อมตอบเลย
                    </button>
                  )}
                </div>

                {isMemorize && (
                  <div className="mb-4 h-2 w-full overflow-hidden rounded-sp-pill bg-sp-surface">
                    <div
                      className="h-full bg-gradient-to-r from-sp-warning to-sp-primary transition-all"
                      style={{ width: `${timerPct}%` }}
                    />
                  </div>
                )}

                <div
                  className="grid mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                    gap: totalCards <= 12 ? 12 : 8,
                    maxWidth: 'min(92%, 720px)',
                  }}
                >
                  {state.cards.map((card) => {
                    const selected = state.selectedIds.includes(card.id)
                    const hidden = isPlaying && !selected && !card.isMatched
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => handleCardClick(card)}
                        disabled={!isPlaying || locked || card.isMatched}
                        className="aspect-square rounded-sp-lg transition-all flex items-center justify-center"
                        style={{
                          border: selected
                            ? '3px solid #fbbf24'
                            : card.isMatched
                              ? '2px solid rgba(80,220,120,0.4)'
                              : '1.5px solid var(--color-sp-border)',
                          background: card.isMatched
                            ? 'rgba(80,220,120,0.08)'
                            : selected
                              ? 'rgba(251,191,36,0.18)'
                              : 'rgba(255,255,255,0.04)',
                          opacity: card.isMatched ? 0.4 : 1,
                          transform: selected ? 'scale(1.06)' : 'scale(1)',
                          cursor:
                            !isPlaying || locked || card.isMatched ? 'default' : 'pointer',
                        }}
                      >
                        {!hidden && <ShapeIcon shape={card.shape} color={card.color} size={56} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {state.phase === 'result' && (
              <div className="text-center">
                <p className="mb-2 text-sm uppercase tracking-widest text-sp-text-subtle">ผลการเล่น</p>
                <div className="mb-2 text-7xl font-black text-sp-warning md:text-8xl">
                  {state.completedLevels}
                </div>
                <p className="mb-6 text-lg text-sp-text-muted">ด่านที่ผ่าน</p>
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <StatCard label="Score" value={`${state.completedLevels * 10}`} />
                  <StatCard label="Accuracy" value={`${accuracy}%`} />
                  <StatCard label="ด่านที่หยุด" value={`${state.level}`} />
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

export default ColorSymbolMatchingGamePage
