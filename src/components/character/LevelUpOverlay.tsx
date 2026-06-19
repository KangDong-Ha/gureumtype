import { useEffect } from 'react'
import type { CharacterLevel } from '../../types'
import { CloudCharacter } from './CloudCharacter'

interface LevelUpOverlayProps {
  level: CharacterLevel
  name: string
  onDismiss: () => void
}

export function LevelUpOverlay({ level, name, onDismiss }: LevelUpOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      data-testid="levelup-overlay"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-white/80"
      onClick={onDismiss}
    >
      <div aria-live="polite" className="sr-only">
        {name} 캐릭터가 레벨 {level}로 성장했어요!
      </div>

      <div className="relative" aria-hidden="true">
        <div className="absolute -top-8 -left-8 w-4 h-4 bg-yellow-400 rounded-full animate-[sparkle_1s_ease-out_infinite] motion-reduce:animate-none" />
        <div className="absolute -top-4 right-0 w-3 h-3 bg-pink-400 rounded-full animate-[sparkle_1s_ease-out_0.3s_infinite] motion-reduce:animate-none" />
        <div className="absolute top-0 -right-8 w-4 h-4 bg-blue-400 rounded-full animate-[sparkle_1s_ease-out_0.6s_infinite] motion-reduce:animate-none" />
        <CloudCharacter level={level} name={name} emotion="level-up" />
      </div>

      <p
        data-testid="levelup-message"
        className="mt-6 text-xl font-bold font-noto text-cloud-primary-dark animate-[level-up-bounce_0.5s_ease-out] motion-reduce:animate-none"
      >
        레벨 {level}로 성장했어요!
      </p>
      <p className="text-sm text-cloud-text-light font-noto mt-2">탭하여 계속하기</p>
    </div>
  )
}
