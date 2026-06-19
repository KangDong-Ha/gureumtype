import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { StageClearEffect } from './StageClearEffect'

describe('StageClearEffect — AC1: 렌더링', () => {
  it('data-testid="stage-clear-effect"가 렌더링된다', () => {
    render(<StageClearEffect onComplete={vi.fn()} />)
    expect(screen.getByTestId('stage-clear-effect')).toBeInTheDocument()
  })

  it('aria-hidden="true" 속성이 있다', () => {
    render(<StageClearEffect onComplete={vi.fn()} />)
    expect(screen.getByTestId('stage-clear-effect')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('StageClearEffect — AC3: 자동 완료', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('800ms 후 onComplete가 호출된다', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<StageClearEffect onComplete={onComplete} />)
    act(() => { vi.advanceTimersByTime(800) })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('799ms에는 onComplete가 호출되지 않는다', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<StageClearEffect onComplete={onComplete} />)
    act(() => { vi.advanceTimersByTime(799) })
    expect(onComplete).not.toHaveBeenCalled()
  })
})

describe('StageClearEffect — AC4: prefers-reduced-motion', () => {
  it('파티클 요소에 motion-reduce:animate-none이 적용된다 (5개 이상)', () => {
    render(<StageClearEffect onComplete={vi.fn()} />)
    const overlay = screen.getByTestId('stage-clear-effect')
    const reduced = overlay.querySelectorAll('.motion-reduce\\:animate-none')
    expect(reduced.length).toBeGreaterThanOrEqual(5)
  })
})
