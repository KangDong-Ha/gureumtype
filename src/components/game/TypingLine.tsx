import { useRef, useEffect } from 'react'
import { useKoreanIME } from '../../hooks/useKoreanIME'

export interface TypingLineProps {
  /** 표시할 문장 전체 */
  currentText: string
  /** 현재 커서 위치 (정타 후 전진) */
  currentIndex: number
  /** 정타만 누적된 입력 (gameState.userInput) */
  userInput: string
  /** 현재 커서 위치에서 오타 발생 중 */
  hasErrorAtCursor?: boolean
  /** IME 조합 완료 또는 영문 키 입력 시 호출 */
  onKeyCommit: (char: string) => void
  /** 입력 비활성화 (문장 완료 후) */
  disabled?: boolean
  className?: string
}

type CharState = 'pending' | 'correct' | 'cursor' | 'error'

function getCharState(
  index: number,
  currentIndex: number,
  hasErrorAtCursor: boolean,
  isComposing: boolean,
): CharState {
  if (index === currentIndex) {
    // 조합 중일 때는 cursor 상태 유지 (composingChar overlay로 표시)
    if (hasErrorAtCursor && !isComposing) return 'error'
    return 'cursor'
  }
  if (index < currentIndex) {
    return 'correct'
  }
  return 'pending'
}

const charStateClasses: Record<CharState, string> = {
  pending: 'text-cloud-text',
  correct: 'text-cloud-success',
  error: 'text-red-700 underline decoration-red-700 decoration-2 underline-offset-2',
  cursor: 'text-cloud-text',
}

export function TypingLine({
  currentText,
  currentIndex,
  hasErrorAtCursor = false,
  onKeyCommit,
  disabled = false,
  className = '',
}: TypingLineProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const { isComposing, composingChar, handlers } = useKoreanIME({
    onCommit: (char) => {
      onKeyCommit(char)
      if (inputRef.current) inputRef.current.value = ''
    },
    onKeyDown: (e) => {
      // 스페이스는 IME 조합 대상이 아니므로 keyDown에서 직접 commit
      if (e.key === ' ') {
        e.preventDefault()
        onKeyCommit(' ')
      }
    },
  })

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  return (
    <div className={`relative flex items-center justify-center w-full ${className}`} onClick={() => inputRef.current?.focus()}>
      {/* 숨겨진 input — IME 이벤트 수신, screen reader 접근 가능 */}
      <input
        ref={inputRef}
        aria-label="타이핑 연습 문장"
        className="sr-only"
        defaultValue=""
        disabled={disabled}
        {...handlers}
      />

      {/* 문장 표시 영역 — screen reader에 중복 노출 방지 */}
      <div
        className="text-typing font-noto tracking-wide select-none w-full text-center"
        aria-hidden="true"
      >
        {Array.from(currentText).map((char, index) => {
          const state = getCharState(
            index,
            currentIndex,
            hasErrorAtCursor,
            isComposing,
          )
          const isCursor = state === 'cursor' || state === 'error'

          return (
            <span
              key={index}
              data-testid="char-span"
              data-state={state}
              className={`relative inline-block ${charStateClasses[state]}`}
            >
              {isCursor && (
                <span
                  className={`absolute -left-0.5 top-0 h-full w-0.5 animate-blink ${state === 'error' ? 'bg-cloud-error' : 'bg-cloud-text'}`}
                  aria-hidden="true"
                />
              )}
              {/* 조합 중 글자 overlay */}
              {isCursor && composingChar ? (
                <span
                  data-composing="true"
                  className="opacity-60 text-cloud-text-light"
                >
                  {composingChar}
                </span>
              ) : (
                char === ' ' ? ' ' : char
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}
