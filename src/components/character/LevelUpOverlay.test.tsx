import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { LevelUpOverlay } from './LevelUpOverlay'

describe('LevelUpOverlay — AC2: 기본 렌더링', () => {
  it('data-testid="levelup-overlay"가 렌더링된다', () => {
    render(<LevelUpOverlay level={2} name="구름이" onDismiss={vi.fn()} />)
    expect(screen.getByTestId('levelup-overlay')).toBeInTheDocument()
  })

  it('"레벨 2로 성장했어요!" 텍스트가 표시된다', () => {
    render(<LevelUpOverlay level={2} name="구름이" onDismiss={vi.fn()} />)
    expect(screen.getByTestId('levelup-message')).toHaveTextContent('레벨 2로 성장했어요!')
  })

  it('레벨 3으로 성장 시 텍스트에 3이 표시된다', () => {
    render(<LevelUpOverlay level={3} name="구름이" onDismiss={vi.fn()} />)
    expect(screen.getByTestId('levelup-message')).toHaveTextContent('레벨 3로 성장했어요!')
  })

  it('CloudCharacter가 level=2, emotion="level-up"으로 렌더링된다', () => {
    render(<LevelUpOverlay level={2} name="구름이" onDismiss={vi.fn()} />)
    expect(screen.getByTestId('cloud-character')).toHaveAttribute('data-emotion', 'level-up')
    expect(screen.getByTestId('cloud-level-2')).toBeInTheDocument()
  })
})

describe('LevelUpOverlay — AC3: 자동 종료', () => {
  it('2초 후 onDismiss가 호출된다', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<LevelUpOverlay level={2} name="구름이" onDismiss={onDismiss} />)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(onDismiss).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('1999ms에는 onDismiss가 호출되지 않는다', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<LevelUpOverlay level={2} name="구름이" onDismiss={onDismiss} />)
    act(() => { vi.advanceTimersByTime(1999) })
    expect(onDismiss).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})

describe('LevelUpOverlay — AC4: 클릭 스킵', () => {
  it('오버레이 클릭 시 onDismiss가 즉시 호출된다', () => {
    const onDismiss = vi.fn()
    render(<LevelUpOverlay level={2} name="구름이" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByTestId('levelup-overlay'))
    expect(onDismiss).toHaveBeenCalled()
  })
})

describe('LevelUpOverlay — AC5: 접근성', () => {
  it('aria-live="polite" 영역에 레벨업 메시지가 포함된다', () => {
    render(<LevelUpOverlay level={2} name="구름이" onDismiss={vi.fn()} />)
    const liveRegion = document.querySelector('[aria-live="polite"]')
    expect(liveRegion).toBeInTheDocument()
    expect(liveRegion?.textContent).toContain('레벨 2')
  })

  it('aria-live 영역에 캐릭터 이름이 포함된다', () => {
    render(<LevelUpOverlay level={2} name="구름이" onDismiss={vi.fn()} />)
    const liveRegion = document.querySelector('[aria-live="polite"]')
    expect(liveRegion?.textContent).toContain('구름이')
  })

  it('role="dialog", aria-modal="true" 속성이 있다', () => {
    render(<LevelUpOverlay level={2} name="구름이" onDismiss={vi.fn()} />)
    const overlay = screen.getByTestId('levelup-overlay')
    expect(overlay).toHaveAttribute('role', 'dialog')
    expect(overlay).toHaveAttribute('aria-modal', 'true')
  })
})

describe('LevelUpOverlay — AC6: prefers-reduced-motion', () => {
  it('파티클 요소에 motion-reduce:animate-none 클래스가 존재한다', () => {
    render(<LevelUpOverlay level={2} name="구름이" onDismiss={vi.fn()} />)
    const overlay = screen.getByTestId('levelup-overlay')
    const particles = overlay.querySelectorAll('.motion-reduce\\:animate-none')
    expect(particles.length).toBeGreaterThanOrEqual(3)
  })
})
