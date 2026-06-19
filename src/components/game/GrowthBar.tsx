import { useState, useEffect } from 'react'
import type { CharacterLevel } from '../../types'

interface GrowthBarProps {
  xp: number
  maxXp: number
  level: CharacterLevel
  animateEntry?: boolean
}

export function GrowthBar({ xp, maxXp, level, animateEntry = false }: GrowthBarProps) {
  const isMax = level === 3
  const finalPercent = isMax ? 100 : maxXp > 0 ? Math.min((xp / maxXp) * 100, 100) : 0

  const [displayPercent, setDisplayPercent] = useState(animateEntry ? 0 : finalPercent)

  useEffect(() => {
    if (!animateEntry) return
    const timer = setTimeout(() => {
      setDisplayPercent(finalPercent)
    }, 0)
    return () => clearTimeout(timer)
  }, [animateEntry, finalPercent])

  return (
    <div
      role="progressbar"
      aria-valuenow={xp}
      aria-valuemin={0}
      aria-valuemax={maxXp}
      aria-label="캐릭터 성장 게이지"
      data-testid="growth-bar"
      className="w-full bg-gray-200 rounded-full h-4 overflow-hidden"
    >
      <div
        data-testid="growth-bar-fill"
        className="h-full bg-cloud-primary rounded-full transition-[width] duration-500 ease-in-out relative"
        style={{ width: `${displayPercent}%` }}
      >
        {isMax && (
          <span
            data-testid="growth-bar-max"
            className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold font-noto"
          >
            MAX
          </span>
        )}
      </div>
    </div>
  )
}
