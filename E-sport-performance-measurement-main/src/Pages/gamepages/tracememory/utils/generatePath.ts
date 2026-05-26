export type Point = {
  x: number
  y: number
}

type LevelConfig = {
  points: number
  segmentLength: number
  angleVariation: number
}

const LEVELS: LevelConfig[] = [
  { points: 3, segmentLength: 120, angleVariation: 1 },
  { points: 4, segmentLength: 130, angleVariation: 1.2 },
  { points: 5, segmentLength: 140, angleVariation: 1.3 },
  { points: 5, segmentLength: 150, angleVariation: 1.5 },
  { points: 6, segmentLength: 160, angleVariation: 1.7 },
  { points: 6, segmentLength: 170, angleVariation: 2 },
  { points: 7, segmentLength: 180, angleVariation: 2.2 },
  { points: 7, segmentLength: 190, angleVariation: 2.5 },
  { points: 8, segmentLength: 200, angleVariation: 2.8 },
  { points: 9, segmentLength: 210, angleVariation: 3 },
]

export function generatePath(level: number, width: number, height: number): Point[] {
  const config = LEVELS[Math.min(level - 1, LEVELS.length - 1)]
  const SAFE_TOP = 80
  const SAFE_MARGIN = 50

  const points: Point[] = []
  let currentX = SAFE_MARGIN + Math.random() * (width - SAFE_MARGIN * 2)
  let currentY = SAFE_TOP + Math.random() * (height - SAFE_TOP - SAFE_MARGIN)
  points.push({ x: currentX, y: currentY })

  let previousAngle = Math.random() * Math.PI * 2
  for (let i = 1; i < config.points; i++) {
    let valid = false
    let attempts = 0
    while (!valid && attempts < 60) {
      attempts++
      const angle =
        previousAngle +
        (Math.random() - 0.5) * config.angleVariation * Math.PI
      const newX = currentX + Math.cos(angle) * config.segmentLength
      const newY = currentY + Math.sin(angle) * config.segmentLength
      const insideBounds =
        newX > SAFE_MARGIN &&
        newX < width - SAFE_MARGIN &&
        newY > SAFE_TOP &&
        newY < height - SAFE_MARGIN
      if (insideBounds) {
        currentX = newX
        currentY = newY
        previousAngle = angle
        points.push({ x: currentX, y: currentY })
        valid = true
      }
    }
    if (!valid) {
      currentX = Math.max(SAFE_MARGIN, Math.min(width - SAFE_MARGIN, currentX))
      currentY = Math.max(SAFE_TOP, Math.min(height - SAFE_MARGIN, currentY))
      points.push({ x: currentX, y: currentY })
    }
  }

  return points
}
