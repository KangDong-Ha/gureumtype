import { useEffect } from 'react'

interface StageClearEffectProps {
  onComplete: () => void
}

export function StageClearEffect({ onComplete }: StageClearEffectProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      data-testid="stage-clear-effect"
      className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
      aria-hidden="true"
    >
      <div className="relative">
        <div className="absolute -top-12 -left-12 text-3xl animate-[sparkle_0.8s_ease-out] motion-reduce:animate-none">⭐</div>
        <div className="absolute -top-16 left-4 text-2xl animate-[sparkle_0.8s_ease-out_0.1s] motion-reduce:animate-none">✨</div>
        <div className="absolute -top-12 right-0 text-3xl animate-[sparkle_0.8s_ease-out_0.2s] motion-reduce:animate-none">⭐</div>
        <div className="absolute top-0 -right-14 text-2xl animate-[sparkle_0.8s_ease-out_0.15s] motion-reduce:animate-none">✨</div>
        <div className="absolute top-0 -left-14 text-2xl animate-[sparkle_0.8s_ease-out_0.05s] motion-reduce:animate-none">✨</div>
        <div className="text-6xl animate-[level-up-bounce_0.5s_ease-out] motion-reduce:animate-none">⭐</div>
      </div>
    </div>
  )
}
