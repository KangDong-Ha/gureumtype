import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useKoreanIME } from './useKoreanIME'

// 훅을 실제 input에 연결하는 헬퍼 컴포넌트
function TestInput({
  onCommit,
  onKeyDown,
}: {
  onCommit?: (char: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}) {
  const { isComposing, composingChar, handlers } = useKoreanIME({ onCommit, onKeyDown })
  return (
    <div>
      <span data-testid="is-composing">{isComposing ? 'true' : 'false'}</span>
      <span data-testid="composing-char">{composingChar}</span>
      <input data-testid="ime-input" {...handlers} defaultValue="" />
    </div>
  )
}

describe('useKoreanIME', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('초기 상태: isComposing false, composingChar 빈 문자열', () => {
    render(<TestInput />)
    expect(screen.getByTestId('is-composing')).toHaveTextContent('false')
    expect(screen.getByTestId('composing-char')).toHaveTextContent('')
  })

  it('AC1: compositionstart → isComposing true', () => {
    render(<TestInput />)
    const input = screen.getByTestId('ime-input')
    fireEvent.compositionStart(input)
    expect(screen.getByTestId('is-composing')).toHaveTextContent('true')
  })

  it('AC1: compositionstart → onCommit 미호출 (판정 보류)', () => {
    const onCommit = vi.fn()
    render(<TestInput onCommit={onCommit} />)
    const input = screen.getByTestId('ime-input')
    fireEvent.compositionStart(input)
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('AC3: compositionupdate → composingChar 업데이트', () => {
    render(<TestInput />)
    const input = screen.getByTestId('ime-input')
    fireEvent.compositionStart(input)
    fireEvent.compositionUpdate(input, { data: '하' })
    expect(screen.getByTestId('composing-char')).toHaveTextContent('하')
  })

  it('AC3: compositionupdate → onCommit 미호출', () => {
    const onCommit = vi.fn()
    render(<TestInput onCommit={onCommit} />)
    const input = screen.getByTestId('ime-input')
    fireEvent.compositionStart(input)
    fireEvent.compositionUpdate(input, { data: '하' })
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('AC2: compositionend → isComposing false', () => {
    render(<TestInput />)
    const input = screen.getByTestId('ime-input')
    fireEvent.compositionStart(input)
    fireEvent.compositionEnd(input, { data: '한' })
    expect(screen.getByTestId('is-composing')).toHaveTextContent('false')
  })

  it('AC2: compositionend → onCommit 호출 (완성 글자 전달)', () => {
    const onCommit = vi.fn()
    render(<TestInput onCommit={onCommit} />)
    const input = screen.getByTestId('ime-input')
    fireEvent.compositionStart(input)
    fireEvent.compositionEnd(input, { data: '한' })
    expect(onCommit).toHaveBeenCalledWith('한')
    expect(onCommit).toHaveBeenCalledTimes(1)
  })

  it('AC2: compositionend → composingChar 초기화', () => {
    render(<TestInput />)
    const input = screen.getByTestId('ime-input')
    fireEvent.compositionStart(input)
    fireEvent.compositionUpdate(input, { data: '한' })
    fireEvent.compositionEnd(input, { data: '한' })
    expect(screen.getByTestId('composing-char')).toHaveTextContent('')
  })

  it('AC4: keyCode 229 keyDown → onKeyDown 미전달 (Safari IME 가드)', () => {
    const onKeyDown = vi.fn()
    render(<TestInput onKeyDown={onKeyDown} />)
    const input = screen.getByTestId('ime-input')
    fireEvent.keyDown(input, { keyCode: 229 })
    expect(onKeyDown).not.toHaveBeenCalled()
  })

  it('AC4: isComposing 아닐 때 일반 keyDown → onKeyDown 정상 전달', () => {
    const onKeyDown = vi.fn()
    render(<TestInput onKeyDown={onKeyDown} />)
    const input = screen.getByTestId('ime-input')
    fireEvent.keyDown(input, { key: 'a', keyCode: 65 })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })

  it('IME 취소(Escape): compositionend data="" → onCommit 미호출, isComposing 초기화', () => {
    const onCommit = vi.fn()
    render(<TestInput onCommit={onCommit} />)
    const input = screen.getByTestId('ime-input')
    fireEvent.compositionStart(input)
    fireEvent.compositionUpdate(input, { data: '하' })
    // Escape 취소 — e.data === ''
    fireEvent.compositionEnd(input, { data: '' })
    expect(onCommit).not.toHaveBeenCalled()
    // isComposing은 정상 초기화되어야 함
    expect(screen.getByTestId('is-composing')).toHaveTextContent('false')
    expect(screen.getByTestId('composing-char')).toHaveTextContent('')
  })

  it('전체 흐름: compositionstart → update → end 순서 통합', () => {
    const onCommit = vi.fn()
    render(<TestInput onCommit={onCommit} />)
    const input = screen.getByTestId('ime-input')

    // 조합 시작
    fireEvent.compositionStart(input)
    expect(screen.getByTestId('is-composing')).toHaveTextContent('true')

    // 중간 업데이트 (ㅎ → 하 → 한)
    fireEvent.compositionUpdate(input, { data: 'ㅎ' })
    expect(screen.getByTestId('composing-char')).toHaveTextContent('ㅎ')
    fireEvent.compositionUpdate(input, { data: '하' })
    expect(screen.getByTestId('composing-char')).toHaveTextContent('하')
    fireEvent.compositionUpdate(input, { data: '한' })
    expect(screen.getByTestId('composing-char')).toHaveTextContent('한')

    // onCommit은 아직 호출되지 않아야 함
    expect(onCommit).not.toHaveBeenCalled()

    // 조합 완료
    fireEvent.compositionEnd(input, { data: '한' })
    expect(screen.getByTestId('is-composing')).toHaveTextContent('false')
    expect(screen.getByTestId('composing-char')).toHaveTextContent('')
    expect(onCommit).toHaveBeenCalledWith('한')
    expect(onCommit).toHaveBeenCalledTimes(1)
  })
})

describe('useKoreanIME — AC(7.3): 크로스 브라우저 IME 호환성', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // AC2: Safari nativeEvent.isComposing guard
  it('AC2: nativeEvent.isComposing=true keyDown → onKeyDown 미전달 (Safari guard)', () => {
    const onKeyDown = vi.fn()
    render(<TestInput onKeyDown={onKeyDown} />)
    const input = screen.getByTestId('ime-input')
    // JSDOM에서 nativeEvent.isComposing 시뮬레이션
    // dispatchEvent로 직접 DOM 이벤트를 발생시켜 isComposing 속성 제어
    const domEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      isComposing: true,
    })
    input.dispatchEvent(domEvent)
    expect(onKeyDown).not.toHaveBeenCalled()
  })

  // AC3: Firefox 역순 이벤트 — onChange가 compositionEnd보다 먼저 와도 이중 커밋 없음
  it('AC3: Firefox 역순(onChange→compositionEnd) — onCommit 1회만 호출', () => {
    const onCommit = vi.fn()
    render(<TestInput onCommit={onCommit} />)
    const input = screen.getByTestId('ime-input')

    fireEvent.compositionStart(input)
    fireEvent.compositionUpdate(input, { data: '한' })
    // Firefox: onChange가 compositionEnd보다 먼저 발생
    // TestInput의 onChange는 연결 없음 (defaultValue 방식)
    // TypingLine의 경우 onChange={() => {}} no-op
    fireEvent.change(input, { target: { value: '한' } })
    expect(onCommit).not.toHaveBeenCalled()
    // 이후 compositionEnd에서 1회 호출
    fireEvent.compositionEnd(input, { data: '한' })
    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith('한')
  })

  // AC4: 빠른 연속 조합 — 2글자 연속 입력, 각각 1회씩 커밋
  it('AC4: 연속 2글자 조합 — 각각 1회씩 커밋', () => {
    const onCommit = vi.fn()
    render(<TestInput onCommit={onCommit} />)
    const input = screen.getByTestId('ime-input')

    // 첫 번째 글자: '한'
    fireEvent.compositionStart(input)
    fireEvent.compositionUpdate(input, { data: '한' })
    fireEvent.compositionEnd(input, { data: '한' })

    // 두 번째 글자: '글' (즉시 연속)
    fireEvent.compositionStart(input)
    fireEvent.compositionUpdate(input, { data: '글' })
    fireEvent.compositionEnd(input, { data: '글' })

    expect(onCommit).toHaveBeenCalledTimes(2)
    expect(onCommit).toHaveBeenNthCalledWith(1, '한')
    expect(onCommit).toHaveBeenNthCalledWith(2, '글')
  })

  // AC4: 첫 번째 compositionEnd 후 isComposing 즉시 리셋
  it('AC4: compositionEnd 후 isComposing 즉시 false — 다음 조합 준비 완료', () => {
    render(<TestInput />)
    const input = screen.getByTestId('ime-input')

    fireEvent.compositionStart(input)
    fireEvent.compositionUpdate(input, { data: '한' })
    fireEvent.compositionEnd(input, { data: '한' })

    // 첫 번째 글자 완료 직후 isComposing false
    expect(screen.getByTestId('is-composing')).toHaveTextContent('false')
    expect(screen.getByTestId('composing-char')).toHaveTextContent('')
  })
})
