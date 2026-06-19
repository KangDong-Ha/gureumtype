import { useEffect } from 'react'

interface CelebrationOverlayProps {
  onDismiss: () => void
}

export function CelebrationOverlay({ onDismiss }: CelebrationOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      data-testid="celebration-overlay"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-white/90"
      onClick={onDismiss}
    >
      <div aria-live="assertive" className="sr-only">
        100타 달성! 정말 대단해요!
      </div>
      <div className="relative" aria-hidden="true">
        <div className="absolute -top-10 -left-10 w-5 h-5 bg-yellow-400 rounded-full animate-[sparkle_1s_ease-out_infinite] motion-reduce:animate-none" />
        <div className="absolute -top-6 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-[sparkle_1s_ease-out_0.2s_infinite] motion-reduce:animate-none" />
        <div className="absolute top-0 -right-10 w-5 h-5 bg-pink-400 rounded-full animate-[sparkle_1s_ease-out_0.4s_infinite] motion-reduce:animate-none" />
        <div className="absolute bottom-0 -left-8 w-4 h-4 bg-green-400 rounded-full animate-[sparkle_1s_ease-out_0.1s_infinite] motion-reduce:animate-none" />
        <div className="absolute -bottom-4 right-4 w-3 h-3 bg-orange-400 rounded-full animate-[sparkle_1s_ease-out_0.5s_infinite] motion-reduce:animate-none" />
        <div className="text-8xl animate-[celebrate-entrance_0.5s_ease-out] motion-reduce:animate-none">
          🏆
        </div>
      </div>
      <p
        data-testid="celebration-message"
        className="mt-6 text-2xl font-bold text-cloud-secondary animate-[level-up-bounce_0.5s_ease-out] motion-reduce:animate-none"
      >
        100타 달성!
      </p>
      <p className="text-sm text-cloud-text-light mt-2">탭하여 계속하기</p>
    </div>
  )
}
