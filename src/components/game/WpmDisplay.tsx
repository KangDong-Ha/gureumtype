export interface WpmDisplayProps {
  wpm: number
  accuracy: number
  goalReached?: boolean
  className?: string
}

type DisplayState = 'normal' | 'approaching' | 'goal'

function getDisplayState(wpm: number, goalReached: boolean): DisplayState {
  if (wpm >= 100 || goalReached) return 'goal'
  if (wpm >= 80) return 'approaching'
  return 'normal'
}

const colorClasses: Record<DisplayState, string> = {
  normal:     'text-cloud-primary',
  approaching: 'text-cloud-secondary',
  goal:       'text-cloud-success',
}

export function WpmDisplay({ wpm, accuracy, goalReached = false, className = '' }: WpmDisplayProps) {
  const state = getDisplayState(wpm, goalReached)
  const colorClass = colorClasses[state]
  const animClass = state === 'goal' ? 'animate-pulse' : ''

  return (
    <div className={`flex gap-6 items-center ${className}`}>
      <div className="flex flex-col items-center">
        <span className="text-xs text-cloud-text-light">타수</span>
        <span
          data-testid="wpm-value"
          aria-label={`타수 ${wpm}타`}
          className={`text-2xl font-semibold ${colorClass} ${animClass}`}
        >
          {wpm}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-cloud-text-light">정확도</span>
        <span
          data-testid="accuracy-value"
          aria-label={`정확도 ${accuracy}%`}
          className={`text-2xl font-semibold ${colorClass} ${animClass}`}
        >
          {accuracy}%
        </span>
      </div>
    </div>
  )
}
