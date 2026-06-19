import { useState, useEffect } from 'react'

function KeyboardNotice() {
  const [isTouch, setIsTouch] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setIsTouch(navigator.maxTouchPoints > 0)
  }, [])

  if (!isTouch || dismissed) return null

  return (
    <div
      data-testid="keyboard-notice"
      className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-4 flex items-center justify-between font-noto text-sm text-amber-800"
    >
      <span>⌨️ 타자 연습을 위해 키보드 연결이 필요해요</span>
      <button
        type="button"
        data-testid="keyboard-notice-dismiss"
        onClick={() => setDismissed(true)}
        className="ml-3 text-amber-600 hover:text-amber-900 font-bold"
        aria-label="키보드 안내 닫기"
      >
        ✕
      </button>
    </div>
  )
}

export default KeyboardNotice
