import { Link, useNavigate } from 'react-router'
import { AppButton } from '../../../components/common/AppButton'
import { SiteFooter } from '../../../components/layout/SiteFooter'
import { SiteHeader } from '../../../components/layout/SiteHeader'

const instructions = [
  'หน้าจอจะแสดงคำสีหนึ่งแต่ตัวอักษรจะมีสีอีกสีหนึ่ง',
  'ผู้เล่นต้องเลือก "สีของตัวอักษร" ไม่ใช่ "อ่านคำ"',
  'ตัวอย่าง: คำว่า "RED" สีเหลือง → ต้องกด YELLOW',
  'ตอบเร็วและถูกจะได้คะแนนสะสมพร้อมเวลาตอบสนองเฉลี่ย',
  'ตอบผิด 1 ครั้ง = เกมจบทันที',
]

const features = [
  { title: 'Cognitive Control', detail: 'การควบคุมสมาธิและการยับยั้ง' },
  { title: 'Selective Attention', detail: 'การเลือกใส่ใจสีอย่างเจาะจง' },
  { title: 'Processing Speed', detail: 'ความเร็วในการประมวลผลข้อมูล' },
  { title: 'Fair Distribution', detail: 'สี/คำกระจายอย่างสมดุล' },
]

export function StroopTestInfoPage() {
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
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-sp-card bg-sp-warning-soft text-6xl shadow-sp-brand md:h-48 md:w-48 md:text-8xl">
                🎨
              </div>

              <div className="flex-grow text-center md:text-left">
                <h1 className="mb-4 text-4xl font-black text-sp-text md:text-5xl">
                  Stroop Test
                </h1>

                <p className="mb-8 text-xl leading-relaxed text-sp-text-muted">
                  ทดสอบ Cognitive Control · Focus · Attention
                  เลือกสีของตัวอักษร ไม่ใช่อ่านคำ ตอบให้เร็วและแม่นที่สุด
                </p>

                <AppButton
                  onClick={() => navigate('/gameplay/strooptest')}
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
              <h2 className="mb-6 text-xl font-bold text-sp-text">สิ่งที่เกมวัด</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-sp-xl border border-sp-border bg-sp-surface/50 p-5"
                  >
                    <p className="mb-2 text-sm font-bold text-sp-primary-hover">{feature.title}</p>
                    <p className="text-sm text-sp-text-muted">{feature.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
              <InfoBox label="รูปแบบเกม" value="Time Attack" />
              <InfoBox label="เวลา" value="10s / 20s / 30s" />
              <InfoBox label="ผลลัพธ์หลัก" value="Score / Avg Reaction" />
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
