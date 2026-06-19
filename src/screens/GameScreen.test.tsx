import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { GameScreen } from './GameScreen'
import * as useGameStateModule from '../hooks/useGameState'

describe('GameScreen — AC1: 컴포넌트 배치 및 초기 상태', () => {
  it('data-testid="game-screen"이 렌더링된다', () => {
    render(<GameScreen onComplete={vi.fn()} difficulty="easy" stageIndex={0} />)
    expect(screen.getByTestId('game-screen')).toBeInTheDocument()
  })

  it('TypingLine이 렌더링된다 (typing-line input 존재)', () => {
    render(<GameScreen onComplete={vi.fn()} difficulty="easy" stageIndex={0} />)
    const input = document.querySelector('input.sr-only')
    expect(input).toBeInTheDocument()
  })

  it('WpmDisplay가 렌더링된다', () => {
    render(<GameScreen onComplete={vi.fn()} difficulty="easy" stageIndex={0} />)
    expect(screen.getByTestId('wpm-value')).toBeInTheDocument()
    expect(screen.getByTestId('accuracy-value')).toBeInTheDocument()
  })

  it('초기 WPM=0, 정확도=100%가 표시된다', () => {
    render(<GameScreen onComplete={vi.fn()} difficulty="easy" stageIndex={0} />)
    expect(screen.getByTestId('wpm-value').textContent).toBe('0')
    expect(screen.getByTestId('accuracy-value').textContent).toBe('100%')
  })

  it('easy 난이도에서 첫 번째 콘텐츠 문장이 표시된다', () => {
    render(<GameScreen onComplete={vi.fn()} difficulty="easy" stageIndex={0} />)
    expect(screen.getByText('산', { selector: '[data-testid="char-span"]' })).toBeInTheDocument()
  })

  it('hard 난이도에서 첫 번째 콘텐츠 문장이 표시된다', () => {
    render(<GameScreen onComplete={vi.fn()} difficulty="hard" stageIndex={0} />)
    expect(screen.getByText('가', { selector: '[data-testid="char-span"]' })).toBeInTheDocument()
  })
})

describe('GameScreen — AC3: 오타 상태 관리', () => {
  it('틀린 글자 입력 시 hasErrorAtCursor=true → error 상태 span 존재', () => {
    render(<GameScreen onComplete={vi.fn()} difficulty="easy" stageIndex={0} />)
    const input = document.querySelector('input.sr-only') as HTMLInputElement

    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ㅈ', bubbles: true }))
    })

    const charSpans = document.querySelectorAll('[data-testid="char-span"]')
    expect(charSpans[0].getAttribute('data-state')).toMatch(/cursor|error/)
  })
})

describe('GameScreen — AC5: 문장 완료 후 입력 차단', () => {
  it('모든 글자 입력 완료 시 input이 disabled된다', () => {
    const onComplete = vi.fn()
    render(<GameScreen onComplete={onComplete} difficulty="easy" stageIndex={0} />)
    const input = document.querySelector('input.sr-only') as HTMLInputElement

    const chars = Array.from('산은 높고 바다는 넓다')
    for (const char of chars) {
      act(() => {
        input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
        input.dispatchEvent(new CompositionEvent('compositionend', { data: char, bubbles: true }))
      })
    }

    expect(input.disabled).toBe(true)
  })
})

describe('GameScreen — AC4: 문장 완료 → onComplete 호출', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('모든 글자 입력 완료 시 onComplete가 호출된다 (800ms 후)', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<GameScreen onComplete={onComplete} difficulty="easy" stageIndex={0} />)
    const input = document.querySelector('input.sr-only') as HTMLInputElement

    const chars = Array.from('산은 높고 바다는 넓다')
    for (const char of chars) {
      act(() => {
        input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
        input.dispatchEvent(new CompositionEvent('compositionend', { data: char, bubbles: true }))
      })
    }

    act(() => { vi.advanceTimersByTime(800) })
    expect(onComplete).toHaveBeenCalled()
  })

  it('모든 글자 입력 완료 시 onComplete에 wpm(number)과 accuracy(number)가 전달된다', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<GameScreen onComplete={onComplete} difficulty="easy" stageIndex={0} />)
    const input = document.querySelector('input.sr-only') as HTMLInputElement

    const chars = Array.from('산은 높고 바다는 넓다')
    for (const char of chars) {
      act(() => {
        input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
        input.dispatchEvent(new CompositionEvent('compositionend', { data: char, bubbles: true }))
      })
    }

    act(() => { vi.advanceTimersByTime(800) })
    expect(onComplete).toHaveBeenCalledWith(expect.any(Number), expect.any(Number))
  })
})

describe('GameScreen — AC(6.1): onGoalReached 콜백', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('onGoalReached prop 없이도 에러 없이 렌더링된다', () => {
    expect(() => {
      render(<GameScreen onComplete={vi.fn()} difficulty="easy" stageIndex={0} />)
    }).not.toThrow()
  })

  it('state.goalReached=true 전환 시 onGoalReached가 호출된다', () => {
    vi.spyOn(useGameStateModule, 'useGameState').mockReturnValue({
      state: {
        ...useGameStateModule.INITIAL_STATE,
        status: 'playing',
        currentText: '산은 높고 바다는 넓다',
        goalReached: true,
      },
      dispatch: vi.fn(),
    })

    const onGoalReached = vi.fn()
    render(
      <GameScreen
        onComplete={vi.fn()}
        onGoalReached={onGoalReached}
        difficulty="easy"
        stageIndex={0}
      />,
    )

    expect(onGoalReached).toHaveBeenCalledTimes(1)
  })

  it('state.goalReached=false 시 onGoalReached가 호출되지 않는다', () => {
    vi.spyOn(useGameStateModule, 'useGameState').mockReturnValue({
      state: {
        ...useGameStateModule.INITIAL_STATE,
        status: 'playing',
        currentText: '산은 높고 바다는 넓다',
        goalReached: false,
      },
      dispatch: vi.fn(),
    })

    const onGoalReached = vi.fn()
    render(
      <GameScreen
        onComplete={vi.fn()}
        onGoalReached={onGoalReached}
        difficulty="easy"
        stageIndex={0}
      />,
    )

    expect(onGoalReached).not.toHaveBeenCalled()
  })

  it('goalReached false→true 전환 시 onGoalReached가 정확히 1회 호출된다', () => {
    const mockState = {
      ...useGameStateModule.INITIAL_STATE,
      status: 'playing' as const,
      currentText: '산은 높고 바다는 넓다',
      goalReached: false,
    }
    const spy = vi.spyOn(useGameStateModule, 'useGameState').mockReturnValue({
      state: mockState,
      dispatch: vi.fn(),
    })

    const onGoalReached = vi.fn()
    const { rerender } = render(
      <GameScreen onComplete={vi.fn()} onGoalReached={onGoalReached} difficulty="easy" stageIndex={0} />,
    )
    expect(onGoalReached).not.toHaveBeenCalled()

    spy.mockReturnValue({
      state: { ...mockState, goalReached: true },
      dispatch: vi.fn(),
    })
    rerender(
      <GameScreen onComplete={vi.fn()} onGoalReached={onGoalReached} difficulty="easy" stageIndex={0} />,
    )
    expect(onGoalReached).toHaveBeenCalledTimes(1)
  })
})

describe('GameScreen — AC(5.4): CloudCharacter 통합', () => {
  const testCharacter = { name: '구름이', level: 1 as const, xp: 0, maxXp: 100, difficulty: 'easy' as const }

  it('character prop이 있으면 cloud-character가 렌더링된다', () => {
    render(
      <GameScreen onComplete={vi.fn()} difficulty="easy" stageIndex={0} character={testCharacter} />,
    )
    expect(screen.getByTestId('cloud-character')).toBeInTheDocument()
  })

  it('character=null이면 cloud-character가 렌더링되지 않는다', () => {
    render(<GameScreen onComplete={vi.fn()} difficulty="easy" stageIndex={0} character={null} />)
    expect(screen.queryByTestId('cloud-character')).not.toBeInTheDocument()
  })

  it('character prop 없이도 GameScreen이 렌더링된다 (기존 호환)', () => {
    render(<GameScreen onComplete={vi.fn()} difficulty="easy" stageIndex={0} />)
    expect(screen.getByTestId('game-screen')).toBeInTheDocument()
    expect(screen.queryByTestId('cloud-character')).not.toBeInTheDocument()
  })

  it('초기 렌더링 시 emotion="idle"이다', () => {
    render(
      <GameScreen onComplete={vi.fn()} difficulty="easy" stageIndex={0} character={testCharacter} />,
    )
    expect(screen.getByTestId('cloud-character')).toHaveAttribute('data-emotion', 'idle')
  })
})

describe('GameScreen — AC(6.3): StageClearEffect 통합', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('status=completed 시 stage-clear-effect가 렌더링된다', () => {
    vi.spyOn(useGameStateModule, 'useGameState').mockReturnValue({
      state: {
        ...useGameStateModule.INITIAL_STATE,
        status: 'completed',
        currentText: '산은 높고 바다는 넓다',
        wpm: 80,
        accuracy: 95,
      },
      dispatch: vi.fn(),
    })

    render(<GameScreen onComplete={vi.fn()} difficulty="easy" stageIndex={0} />)
    expect(screen.getByTestId('stage-clear-effect')).toBeInTheDocument()
  })

  it('status=playing 시 stage-clear-effect가 렌더링되지 않는다', () => {
    vi.spyOn(useGameStateModule, 'useGameState').mockReturnValue({
      state: {
        ...useGameStateModule.INITIAL_STATE,
        status: 'playing',
        currentText: '산은 높고 바다는 넓다',
      },
      dispatch: vi.fn(),
    })

    render(<GameScreen onComplete={vi.fn()} difficulty="easy" stageIndex={0} />)
    expect(screen.queryByTestId('stage-clear-effect')).not.toBeInTheDocument()
  })
})
