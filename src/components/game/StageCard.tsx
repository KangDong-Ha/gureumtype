import { useState, useEffect } from 'react'

interface StageCardProps {
  text: string
  meaning: string | null
}

export function StageCard({ text, meaning }: StageCardProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (meaning !== null) setVisible(true)
  }, [meaning])

  return (
    <div data-testid="stage-card" className="w-full max-w-xs text-center">
      <p
        data-testid="stage-card-text"
        className="text-lg font-noto font-semibold text-cloud-text mb-3"
      >
        {text}
      </p>
      {meaning !== null && (
        <div className="overflow-hidden">
          <div
            data-testid="stage-card-meaning"
            className={`transition-transform duration-300 ease-out ${
              visible ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="bg-cloud-secondary rounded-xl px-4 py-3">
              <p className="text-sm font-noto text-cloud-text leading-relaxed">{meaning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
