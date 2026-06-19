import { useState, useRef } from 'react'

export interface UseKoreanIMEOptions {
  onCommit?: (char: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export interface IMEHandlers {
  onCompositionStart: (e: React.CompositionEvent<HTMLInputElement>) => void
  onCompositionUpdate: (e: React.CompositionEvent<HTMLInputElement>) => void
  onCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export interface UseKoreanIMEReturn {
  isComposing: boolean
  composingChar: string
  handlers: IMEHandlers
}

/**
 * 한글 IME 조합 입력 처리 훅
 *
 * isComposingRef: 동기 추적 — 이벤트 핸들러 내에서 즉각 참조 가능
 * isComposing (useState): UI 반응용 — 조합 중 시각적 피드백 트리거
 *
 * 브라우저별 composition 이벤트 순서 차이:
 *   Chrome: compositionend → onChange
 *   Firefox: onChange → compositionend (역순)
 * → onCommit은 반드시 onCompositionEnd에서만 호출
 */
export function useKoreanIME(options?: UseKoreanIMEOptions): UseKoreanIMEReturn {
  // 동기 참조: 이벤트 핸들러 내에서 setState 비동기 지연 없이 즉각 읽기
  const isComposingRef = useRef(false)
  // UI 상태: 컴포넌트가 조합 중임을 알고 시각적으로 반응
  const [isComposing, setIsComposing] = useState(false)
  const [composingChar, setComposingChar] = useState('')

  const handleCompositionStart = (_e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = true
    setIsComposing(true)
  }

  const handleCompositionUpdate = (e: React.CompositionEvent<HTMLInputElement>) => {
    setComposingChar(e.data)
  }

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false
    setIsComposing(false)
    setComposingChar('')
    // e.data === '' 는 Escape 취소 케이스 — 빈 문자열 commit 방지
    if (e.data) {
      options?.onCommit?.(e.data)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Safari: IME 조합 완료 후 keyCode 229가 여전히 전달될 수 있어 isComposing 체크 병행
    if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) {
      return
    }
    options?.onKeyDown?.(e)
  }

  return {
    isComposing,
    composingChar,
    handlers: {
      onCompositionStart: handleCompositionStart,
      onCompositionUpdate: handleCompositionUpdate,
      onCompositionEnd: handleCompositionEnd,
      onKeyDown: handleKeyDown,
    },
  }
}
