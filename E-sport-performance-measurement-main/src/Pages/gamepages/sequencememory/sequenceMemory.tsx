import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AppButton } from '../../../components/common/AppButton'
import { SiteFooter } from '../../../components/layout/SiteFooter'
import { SiteHeader } from '../../../components/layout/SiteHeader'

type GamePhase = 'idle' | 'showing' | 'input' | 'result'

type State = {
  phase: GamePhase
  level: number
  sequence: number[]
  playerInput: number[]
}

type Action =
  | { type: 'START' }
  | { type: 'BEGIN_INPUT' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'PLAYER_PRESS'; cell: number }
  | { type: 'FAIL' }
  | { type: 'RESET' }

const initial: State = {
  phase: 'idle',
  level: 0,
  sequence: [],
  playerInput: [],
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return {
        phase: 'showing',
        level: 1,
        sequence: [Math.floor(Math.random() * 9)],
        playerInput: [],
      }
    case 'BEGIN_INPUT':
      return { ...state, phase: 'input', playerInput: [] }
    case 'NEXT_LEVEL':
      return {
        ...state,
        phase: 'showing',
        level: state.level + 1,
        sequence: [...state.sequence, Math.floor(Math.random() * 9)],
        playerInput: [],
      }
    case 'PLAYER_PRESS':
      return { ...state, playerInput: [...state.playerInput, action.cell] }
    case 'FAIL':
      return { ...state, phase: 'result' }
    case 'RESET':
      return initial
    default:
      return state
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const FLASH_ON_MS = 400
const FLASH_OFF_MS = 200

function SequenceMemoryGamePage() {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(reducer, initial)
  const [litCell, setLitCell] = useState<number | null>(null)
  const [failedCell, setFailedCell] = useState<number | null>(null)
  const [correctCell, setCorrectCell] = useState<number | null>(null)

  const inputRef = useRef<number[]>([])
  const sequenceRef = useRef<number[]>([])

  useEffect(() => {
    inputRef.current = state.playerInput
  }, [state.playerInput])

  useEffect(() => {
    sequenceRef.current = state.sequence
  }, [state.sequence])

  useEffect(() => {
    if (state.phase !== 'showing') return
    let cancelled = false
    const play = async () => {
      await sleep(600)
      for (let i = 0; i < state.sequence.length; i++) {
        if (cancelled) return
        setLitCell(state.sequence[i])
        await sleep(FLASH_ON_MS)
        if (cancelled) return
        setLitCell(null)
        if (i < state.sequence.length - 1) await sleep(FLASH_OFF_MS)
      }
      await sleep(400)
      if (!cancelled) dispatch({ type: 'BEGIN_INPUT' })
    }
    play()
    return () => {
      cancelled = true
      setLitCell(null)
    }
  }, [state.phase, state.sequence])

  const handleCellClick = useCallback(
    (cellIndex: number) => {
      if (state.phase !== 'input') return
      const position = inputRef.current.length
      const expected = sequenceRef.current[position]

      if (cellIndex !== expected) {
        setFailedCell(cellIndex)
        setTimeout(() => {
          dispatch({ type: 'FAIL' })
          setFailedCell(null)
        }, 600)
        return
      }

      setCorrectCell(cellIndex)
      setTimeout(() => setCorrectCell(null), 180)
      dispatch({ type: 'PLAYER_PRESS', cell: cellIndex })

      if (position + 1 === sequenceRef.current.length) {
        setTimeout(() => dispatch({ type: 'NEXT_LEVEL' }), 800)
      }
    },
    [state.phase],
  )

  const remaining = state.sequence.length - state.playerInput.length
  const statusText =
    state.phase === 'showing'
      ? 'Watch the pattern...'
      : state.phase === 'input'
        ? `Repeat the pattern — ${remaining} left`
        : ''

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-sp-bg font-sans text-sp-text">
      <SiteHeader />

      <main className="mx-auto w-full max-w-sp-page flex-grow px-6 py-8 md:px-12 md:py-12">
        <section className="animate-sp-fade-in mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              to="/gameinfo/sequencememory"
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
              Sequence Memory
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatCard label="Level" value={`${state.level || '-'}`} />
            <StatCard label="Pattern Length" value={`${state.sequence.length}`} />
            <StatCard label="Remaining" value={`${remaining}`} />
          </div>

          <div className="rounded-sp-card border border-sp-border bg-sp-glass p-8 backdrop-blur-xl md:p-12 min-h-[560px] flex flex-col items-center justify-center">
            {state.phase === 'idle' && (
              <div className="text-center">
                <h1 className="mb-4 text-4xl font-black text-sp-text md:text-5xl">
                  Sequence Memory
                </h1>
                <p className="mb-8 max-w-xl text-lg text-sp-text-muted">
                  ดูลำดับปุ่มที่ติดสว่าง แล้วกดให้ตรงตามลำดับ
                  ทุก Level จะเพิ่มความยาวขึ้นทีละ 1
                </p>
                <AppButton
                  onClick={() => dispatch({ type: 'START' })}
                  className="px-10 py-4 text-xl"
                >
                  เริ่มเล่น
                </AppButton>
              </div>
            )}

            {(state.phase === 'showing' || state.phase === 'input') && (
              <div className="w-full flex flex-col items-center gap-6">
                <p className="text-lg text-sp-text-muted">{statusText}</p>
                <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                  {Array.from({ length: 9 }, (_, i) => {
                    const isLit = litCell === i
                    const isFailed = failedCell === i
                    const isCorrect = correctCell === i
                    return (
                      <button
                        key={i}
                        aria-label={`cell ${i + 1}`}
                        disabled={state.phase !== 'input'}
                        onClick={() => handleCellClick(i)}
                        className={`aspect-square rounded-sp-lg transition-all ${
                          isFailed
                            ? 'bg-sp-danger'
                            : isCorrect
                              ? 'bg-white/70'
                              : isLit
                                ? 'bg-white/90 shadow-sp-brand'
                                : 'bg-sp-surface hover:bg-sp-surface-strong border border-sp-border'
                        } ${state.phase !== 'input' ? 'cursor-default' : 'cursor-pointer'}`}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {state.phase === 'result' && (
              <div className="text-center">
                <h2 className="mb-2 text-xl font-bold text-sp-text-muted">
                  You reached level
                </h2>
                <div className="mb-6 text-8xl font-black text-sp-primary-hover md:text-9xl">
                  {state.level}
                </div>
                <p className="mb-8 max-w-md mx-auto text-lg text-sp-text-muted">
                  ความจำลำดับ {state.sequence.length - 1} ตัวสำเร็จ
                </p>
                <div className="flex flex-col gap-4 md:flex-row md:justify-center">
                  <AppButton
                    onClick={() => dispatch({ type: 'START' })}
                    className="px-10 py-4 text-xl"
                  >
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

export default SequenceMemoryGamePage
