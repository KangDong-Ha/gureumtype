import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { GrowthBar } from './GrowthBar'

describe('GrowthBar — AC1: 게이지 비율 표시', () => {
  it('xp=50, maxXp=100 → fill width 50%', () => {
    render(<GrowthBar xp={50} maxXp={100} level={1} />)
    const fill = screen.getByTestId('growth-bar-fill')
    expect(fill).toHaveStyle({ width: '50%' })
  })

  it('xp=0 → fill width 0%', () => {
    render(<GrowthBar xp={0} maxXp={100} level={1} />)
    expect(screen.getByTestId('growth-bar-fill')).toHaveStyle({ width: '0%' })
  })

  it('xp=200, maxXp=200 → fill width 100%', () => {
    render(<GrowthBar xp={200} maxXp={200} level={2} />)
    expect(screen.getByTestId('growth-bar-fill')).toHaveStyle({ width: '100%' })
  })

  it('xp=75, maxXp=100 → fill width 75%', () => {
    render(<GrowthBar xp={75} maxXp={100} level={1} />)
    expect(screen.getByTestId('growth-bar-fill')).toHaveStyle({ width: '75%' })
  })
})

describe('GrowthBar — AC2: 애니메이션', () => {
  it('fill div에 duration-500 클래스가 있다', () => {
    render(<GrowthBar xp={50} maxXp={100} level={1} />)
    const fill = screen.getByTestId('growth-bar-fill')
    expect(fill.className).toMatch(/duration-500/)
  })
})

describe('GrowthBar — AC3: 레벨업 후 게이지 리셋', () => {
  it('레벨업 후 xp=0으로 렌더링 시 fill width 0%', () => {
    render(<GrowthBar xp={0} maxXp={200} level={2} />)
    expect(screen.getByTestId('growth-bar-fill')).toHaveStyle({ width: '0%' })
  })

  it('level=3이면 xp=0이더라도 fill width 100% (MAX 상태)', () => {
    render(<GrowthBar xp={0} maxXp={300} level={3} />)
    expect(screen.getByTestId('growth-bar-fill')).toHaveStyle({ width: '100%' })
  })
})

describe('GrowthBar — AC4: aria 접근성 속성', () => {
  it('role=progressbar 설정', () => {
    render(<GrowthBar xp={50} maxXp={100} level={1} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('aria-valuenow 설정', () => {
    render(<GrowthBar xp={50} maxXp={100} level={1} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
  })

  it('aria-valuemin=0 설정', () => {
    render(<GrowthBar xp={50} maxXp={100} level={1} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemin', '0')
  })

  it('aria-valuemax 설정', () => {
    render(<GrowthBar xp={50} maxXp={100} level={1} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100')
  })
})

describe('GrowthBar — AC(6.4): animateEntry', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('animateEntry 미전달(기본) 시 fill이 즉시 실제 width로 렌더링된다', () => {
    render(<GrowthBar xp={50} maxXp={100} level={1} />)
    expect(screen.getByTestId('growth-bar-fill')).toHaveStyle({ width: '50%' })
  })

  it('animateEntry=true 시 setTimeout flush 후 fill이 최종 xp 비율로 렌더링된다', () => {
    vi.useFakeTimers()
    render(<GrowthBar xp={50} maxXp={100} level={1} animateEntry />)
    act(() => { vi.advanceTimersByTime(0) })
    expect(screen.getByTestId('growth-bar-fill')).toHaveStyle({ width: '50%' })
  })

  it('animateEntry=true + level=3 → MAX 상태 유지', () => {
    vi.useFakeTimers()
    render(<GrowthBar xp={300} maxXp={300} level={3} animateEntry />)
    act(() => { vi.advanceTimersByTime(0) })
    expect(screen.getByTestId('growth-bar-fill')).toHaveStyle({ width: '100%' })
    expect(screen.getByTestId('growth-bar-max')).toBeInTheDocument()
  })
})

describe('GrowthBar — AC5: 레벨 3 MAX 표시', () => {
  it('level=3 → "MAX" 텍스트 표시', () => {
    render(<GrowthBar xp={300} maxXp={300} level={3} />)
    expect(screen.getByTestId('growth-bar-max')).toHaveTextContent('MAX')
  })

  it('level=3 → fill width 100%', () => {
    render(<GrowthBar xp={300} maxXp={300} level={3} />)
    expect(screen.getByTestId('growth-bar-fill')).toHaveStyle({ width: '100%' })
  })

  it('level=1 → MAX 텍스트 없음', () => {
    render(<GrowthBar xp={50} maxXp={100} level={1} />)
    expect(screen.queryByTestId('growth-bar-max')).toBeNull()
  })

  it('level=2 → MAX 텍스트 없음', () => {
    render(<GrowthBar xp={100} maxXp={200} level={2} />)
    expect(screen.queryByTestId('growth-bar-max')).toBeNull()
  })
})
