import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { CelebrationOverlay } from './CelebrationOverlay'

describe('CelebrationOverlay — AC2: 기본 렌더링', () => {
  it('data-testid="celebration-overlay"가 렌더링된다', () => {
    render(<CelebrationOverlay onDismiss={vi.fn()} />)
    expect(screen.getByTestId('celebration-overlay')).toBeInTheDocument()
  })

  it('"100타 달성!" 텍스트가 표시된다', () => {
    render(<CelebrationOverlay onDismiss={vi.fn()} />)
    expect(screen.getByTestId('celebration-message')).toHaveTextContent('100타 달성!')
  })

  it('파티클 요소가 5개 이상 렌더링된다', () => {
    render(<CelebrationOverlay onDismiss={vi.fn()} />)
    const overlay = screen.getByTestId('celebration-overlay')
    const particles = overlay.querySelectorAll('.rounded-full')
    expect(particles.length).toBeGreaterThanOrEqual(5)
  })
})

describe('CelebrationOverlay — AC3: 자동 종료', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('2500ms 후 onDismiss가 호출된다', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<CelebrationOverlay onDismiss={onDismiss} />)
    act(() => { vi.advanceTimersByTime(2500) })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('2499ms에는 onDismiss가 호출되지 않는다', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<CelebrationOverlay onDismiss={onDismiss} />)
    act(() => { vi.advanceTimersByTime(2499) })
    expect(onDismiss).not.toHaveBeenCalled()
  })
})

describe('CelebrationOverlay — AC4: 클릭 스킵', () => {
  it('오버레이 클릭 시 onDismiss가 즉시 호출된다', () => {
    const onDismiss = vi.fn()
    render(<CelebrationOverlay onDismiss={onDismiss} />)
    fireEvent.click(screen.getByTestId('celebration-overlay'))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

describe('CelebrationOverlay — AC5: 접근성', () => {
  it('aria-live="assertive" 영역에 달성 메시지가 포함된다', () => {
    render(<CelebrationOverlay onDismiss={vi.fn()} />)
    const liveRegion = document.querySelector('[aria-live="assertive"]')
    expect(liveRegion).toBeInTheDocument()
    expect(liveRegion?.textContent).toContain('100타')
  })

  it('role="dialog", aria-modal="true" 속성이 있다', () => {
    render(<CelebrationOverlay onDismiss={vi.fn()} />)
    const overlay = screen.getByTestId('celebration-overlay')
    expect(overlay).toHaveAttribute('role', 'dialog')
    expect(overlay).toHaveAttribute('aria-modal', 'true')
  })
})

describe('CelebrationOverlay — AC6: prefers-reduced-motion', () => {
  it('파티클 요소에 motion-reduce:animate-none 클래스가 존재한다', () => {
    render(<CelebrationOverlay onDismiss={vi.fn()} />)
    const overlay = screen.getByTestId('celebration-overlay')
    const reducedElements = overlay.querySelectorAll('.motion-reduce\\:animate-none')
    expect(reducedElements.length).toBeGreaterThanOrEqual(5)
  })
})
