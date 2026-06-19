import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TypingLine } from './TypingLine'

describe('TypingLine — AC1: 문장 표시 및 글자 상태 시각화', () => {
  const baseProps = {
    currentText: '안녕하세요',
    currentIndex: 0,
    userInput: '',
    onKeyCommit: vi.fn(),
  }

  it('문장 글자 수만큼 글자 span 렌더링', () => {
    const { container } = render(<TypingLine {...baseProps} />)
    // aria-hidden 문장 표시 영역의 자식 span 수 확인
    const charSpans = container.querySelectorAll('[data-testid="char-span"]')
    expect(charSpans).toHaveLength(5) // '안녕하세요'
  })

  it('currentIndex=0 → 첫 번째 글자에 cursor 클래스 적용', () => {
    const { container } = render(<TypingLine {...baseProps} currentIndex={0} />)
    const charSpans = container.querySelectorAll('[data-testid="char-span"]')
    expect(charSpans[0].getAttribute('data-state')).toBe('cursor')
  })

  it('currentIndex=2, userInput="안녕" → 0,1은 correct, 2는 cursor, 3,4는 pending', () => {
    const { container } = render(
      <TypingLine {...baseProps} currentIndex={2} userInput="안녕" />
    )
    const charSpans = container.querySelectorAll('[data-testid="char-span"]')
    expect(charSpans[0].getAttribute('data-state')).toBe('correct')
    expect(charSpans[1].getAttribute('data-state')).toBe('correct')
    expect(charSpans[2].getAttribute('data-state')).toBe('cursor')
    expect(charSpans[3].getAttribute('data-state')).toBe('pending')
    expect(charSpans[4].getAttribute('data-state')).toBe('pending')
  })

  it('문장 끝(currentIndex=5) → 모두 correct, cursor 없음', () => {
    const { container } = render(
      <TypingLine {...baseProps} currentIndex={5} userInput="안녕하세요" />
    )
    const charSpans = container.querySelectorAll('[data-testid="char-span"]')
    charSpans.forEach((span) => {
      expect(span.getAttribute('data-state')).toBe('correct')
    })
  })
})

describe('TypingLine — AC2: 오타 처리', () => {
  const baseProps = {
    currentText: '안녕',
    currentIndex: 0,
    userInput: '',
    onKeyCommit: vi.fn(),
  }

  it('hasErrorAtCursor=true → cursor 위치 글자에 error 상태', () => {
    const { container } = render(
      <TypingLine {...baseProps} hasErrorAtCursor={true} />
    )
    const charSpans = container.querySelectorAll('[data-testid="char-span"]')
    // cursor 위치(currentIndex=0)가 오타 발생 중이면 error
    expect(charSpans[0].getAttribute('data-state')).toBe('error')
  })

  it('hasErrorAtCursor=false(기본값) → cursor 위치 글자는 cursor 상태', () => {
    const { container } = render(<TypingLine {...baseProps} />)
    const charSpans = container.querySelectorAll('[data-testid="char-span"]')
    expect(charSpans[0].getAttribute('data-state')).toBe('cursor')
  })
})

describe('TypingLine — AC3: 숨겨진 input 및 포커스 유지', () => {
  it('input 요소 존재 + aria-label 확인', () => {
    render(
      <TypingLine
        currentText="안녕"
        currentIndex={0}
        userInput=""
        onKeyCommit={vi.fn()}
      />
    )
    const input = screen.getByLabelText('타이핑 연습 문장')
    expect(input).toBeTruthy()
    expect(input.tagName).toBe('INPUT')
  })

  it('마운트 시 input에 포커스', () => {
    render(
      <TypingLine
        currentText="안녕"
        currentIndex={0}
        userInput=""
        onKeyCommit={vi.fn()}
      />
    )
    const input = screen.getByLabelText('타이핑 연습 문장')
    expect(document.activeElement).toBe(input)
  })
})

describe('TypingLine — AC4: 한글 IME 조합 중 상태 표시', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('compositionend(char) → onKeyCommit 호출', () => {
    const onKeyCommit = vi.fn()
    render(
      <TypingLine
        currentText="안녕"
        currentIndex={0}
        userInput=""
        onKeyCommit={onKeyCommit}
      />
    )
    const input = screen.getByLabelText('타이핑 연습 문장')
    fireEvent.compositionStart(input)
    fireEvent.compositionUpdate(input, { data: '안' })
    fireEvent.compositionEnd(input, { data: '안' })
    expect(onKeyCommit).toHaveBeenCalledWith('안')
    expect(onKeyCommit).toHaveBeenCalledTimes(1)
  })

  it('compositionend(empty string) → onKeyCommit 미호출 (Escape 취소 가드)', () => {
    const onKeyCommit = vi.fn()
    render(
      <TypingLine
        currentText="안녕"
        currentIndex={0}
        userInput=""
        onKeyCommit={onKeyCommit}
      />
    )
    const input = screen.getByLabelText('타이핑 연습 문장')
    fireEvent.compositionStart(input)
    fireEvent.compositionEnd(input, { data: '' })
    expect(onKeyCommit).not.toHaveBeenCalled()
  })

  it('compositionupdate 후 조합 중 글자 span 표시 (data-composing 속성)', () => {
    render(
      <TypingLine
        currentText="안녕"
        currentIndex={0}
        userInput=""
        onKeyCommit={vi.fn()}
      />
    )
    const input = screen.getByLabelText('타이핑 연습 문장')
    fireEvent.compositionStart(input)
    fireEvent.compositionUpdate(input, { data: '아' })
    // 조합 중 글자가 표시되는 span 확인
    const composingSpan = document.querySelector('[data-composing="true"]')
    expect(composingSpan).toBeTruthy()
    expect(composingSpan?.textContent).toBe('아')
  })
})

describe('TypingLine — AC5: 접근성', () => {
  it('input에 aria-label="타이핑 연습 문장" 존재', () => {
    render(
      <TypingLine
        currentText="테스트"
        currentIndex={0}
        userInput=""
        onKeyCommit={vi.fn()}
      />
    )
    expect(screen.getByLabelText('타이핑 연습 문장')).toBeTruthy()
  })

  it('문장 표시 영역에 aria-hidden 적용', () => {
    const { container } = render(
      <TypingLine
        currentText="테스트"
        currentIndex={0}
        userInput=""
        onKeyCommit={vi.fn()}
      />
    )
    const ariaHiddenEl = container.querySelector('[aria-hidden="true"]')
    expect(ariaHiddenEl).toBeTruthy()
  })
})

describe('TypingLine — AC(7.2): 반응형 레이아웃', () => {
  it('외부 div에 w-full 클래스가 적용된다', () => {
    const { container } = render(
      <TypingLine currentText="안녕" currentIndex={0} userInput="" onKeyCommit={() => {}} />
    )
    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv.className).toMatch(/w-full/)
  })

  it('텍스트 표시 div에 w-full text-center가 적용된다', () => {
    const { container } = render(
      <TypingLine currentText="안녕" currentIndex={0} userInput="" onKeyCommit={() => {}} />
    )
    const textDiv = container.querySelector('[aria-hidden="true"]') as HTMLElement
    expect(textDiv.className).toMatch(/w-full/)
    expect(textDiv.className).toMatch(/text-center/)
  })
})

describe('TypingLine — AC(7.4): 오타 접근성', () => {
  it('error 상태 글자에 text-red-700 클래스가 적용된다', () => {
    render(
      <TypingLine
        currentText="한"
        currentIndex={0}
        userInput=""
        hasErrorAtCursor={true}
        onKeyCommit={() => {}}
      />
    )
    const errorSpan = document.querySelector('[data-state="error"]') as HTMLElement
    expect(errorSpan.className).toMatch(/text-red-700/)
  })

  it('error 상태 글자에 decoration-red-700 underline 클래스가 있다', () => {
    render(
      <TypingLine
        currentText="한"
        currentIndex={0}
        userInput=""
        hasErrorAtCursor={true}
        onKeyCommit={() => {}}
      />
    )
    const errorSpan = document.querySelector('[data-state="error"]') as HTMLElement
    expect(errorSpan.className).toMatch(/underline/)
    expect(errorSpan.className).toMatch(/decoration-red-700/)
  })
})

describe('TypingLine — AC(8.2): 스페이스 입력 및 공백 표시', () => {
  it('스페이스 키 입력 시 onKeyCommit(" ")가 호출된다', () => {
    const onKeyCommit = vi.fn()
    render(
      <TypingLine
        currentText="산은 높고"
        currentIndex={2}
        userInput="산은"
        onKeyCommit={onKeyCommit}
      />
    )
    const input = screen.getByLabelText('타이핑 연습 문장')
    fireEvent.keyDown(input, { key: ' ' })
    expect(onKeyCommit).toHaveBeenCalledWith(' ')
  })

  it('조합 중(IME)에는 스페이스 keyDown이 commit되지 않는다', () => {
    const onKeyCommit = vi.fn()
    render(
      <TypingLine
        currentText="산은 높고"
        currentIndex={0}
        userInput=""
        onKeyCommit={onKeyCommit}
      />
    )
    const input = screen.getByLabelText('타이핑 연습 문장')
    fireEvent.keyDown(input, { key: ' ', isComposing: true })
    expect(onKeyCommit).not.toHaveBeenCalled()
  })

  it('문장의 공백 문자가 non-breaking space로 시각 표시된다', () => {
    render(
      <TypingLine
        currentText="산은 높고"
        currentIndex={0}
        userInput=""
        onKeyCommit={() => {}}
      />
    )
    // index 2가 공백 — 해당 char-span 텍스트가 nbsp( )로 렌더링됨
    const spans = screen.getAllByTestId('char-span')
    expect(spans[2].textContent).toBe(' ')
  })
})
