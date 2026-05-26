import { Link, useNavigate } from 'react-router'
import { AppButton } from '../../../components/common/AppButton'
import { SiteFooter } from '../../../components/layout/SiteFooter'
import { SiteHeader } from '../../../components/layout/SiteHeader'

const instructions = [
  'จะมีเส้นทางสีม่วงแสดงขึ้นบนหน้าจอชั่วครู่',
  'หลังจากเส้นทางหายไป ผู้เล่นต้องลากเมาส์ตามเส้นทางเดิมจากจุดเริ่ม (สีม่วง) ไปจุดจบ (สีชมพู)',
  'ระบบจะคำนวณความแม่นยำเป็นเปอร์เซ็นต์ ต้องได้ ≥ 40% ถึงผ่าน Level',
  'แต่ละ Level มีโอกาส Retry ได้ 3 ครั้ง',
  'ผ่านครบ 10 Level จะแสดงสรุปผลทั้งหมด',
]

const difficultyRules = [
  { level: 'Level 1-3', detail: 'จุด 3-5 จุด', extra: 'เวลาแสดง 2.5s' },
  { level: 'Level 4-6', detail: 'จุด 5-6 จุด', extra: 'เวลาแสดง 2.1s' },
  { level: 'Level 7-9', detail: 'จุด 7-8 จุด', extra: 'เวลาแสดง 1.5s' },
  { level: 'Level 10', detail: 'จุด 9 จุด · ซับซ้อน', extra: 'เวลาแสดง 1.1s' },
]

export function TraceMemoryInfoPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-sp-bg font-sans text-sp-text">
      <SiteHeader />

      <main className="mx-auto w-full max-w-sp-page flex-grow px-6 py-12 md:px-12 md:py-20">
        <section className="animate-sp-fade-in mx-auto max-w-4xl">
          <Link
            to="/librarygame"
            className="group mb-8 inline-flex items-center gap-2 text-sp-text-muted transition-colors hover:text-sp-text"
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
            <span>กลับไปยังคลังเกม</span>
          </Link>

          <div className="rounded-sp-card border border-sp-border bg-sp-glass p-8 backdrop-blur-xl md:p-12">
            <div className="flex flex-col items-center gap-10 md:flex-row md:gap-12">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-sp-card bg-sp-info-soft text-6xl shadow-sp-brand md:h-48 md:w-48 md:text-8xl">
                ✏️
              </div>

              <div className="flex-grow text-center md:text-left">
                <h1 className="mb-4 text-4xl font-black text-sp-text md:text-5xl">
                  Trace Memory
                </h1>

                <p className="mb-8 text-xl leading-relaxed text-sp-text-muted">
                  จดจำเส้นทาง แล้วลากเมาส์ตามเส้นทางเดิมให้แม่นที่สุด
                  ทดสอบความจำเชิงพื้นที่และการควบคุมเมาส์
                </p>

                <AppButton
                  onClick={() => navigate('/gameplay/tracememory')}
                  className="w-full px-12 py-5 text-xl md:w-auto"
                >
                  เล่นเลย
                </AppButton>
              </div>
            </div>

            <div className="mt-12 border-t border-sp-surface pt-12">
              <h2 className="mb-6 text-xl font-bold text-sp-text">วิธีการเล่น</h2>
              <ul className="space-y-4 text-sp-text-muted">
                {instructions.map((instruction, index) => (
                  <li key={instruction} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sp-pill bg-sp-surface-strong text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12">
              <h2 className="mb-6 text-xl font-bold text-sp-text">ระดับความยาก</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {difficultyRules.map((rule) => (
                  <div
                    key={rule.level}
                    className="rounded-sp-xl border border-sp-border bg-sp-surface/50 p-5"
                  >
                    <p className="mb-2 text-sm font-bold text-sp-primary-hover">{rule.level}</p>
                    <p className="text-lg font-black text-sp-text">{rule.detail}</p>
                    <p className="mt-1 text-sm text-sp-text-muted">{rule.extra}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
              <InfoBox label="รูปแบบเกม" value="Spatial Memory" />
              <InfoBox label="เงื่อนไขผ่าน" value="ความแม่น ≥ 40%" />
              <InfoBox label="ผลลัพธ์หลัก" value="Accuracy / Time" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

type InfoBoxProps = {
  label: string
  value: string
}

function InfoBox({ label, value }: InfoBoxProps) {
  return (
    <div className="rounded-sp-xl border border-sp-border bg-sp-surface/50 p-5">
      <p className="mb-1 text-sm font-semibold text-sp-text-subtle">{label}</p>
      <p className="text-lg font-bold text-sp-text">{value}</p>
    </div>
  )
}
