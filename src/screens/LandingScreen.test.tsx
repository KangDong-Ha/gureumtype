import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import LandingScreen from './LandingScreen'
import type { CharacterState } from '../types'

const character: CharacterState = {
  name: '구름이',
  level: 2,
  xp: 160,
  maxXp: 200,
  difficulty: 'easy',
}

describe('LandingScreen', () => {
  it('landing-screen이 렌더링된다', () => {
    render(<LandingScreen character={character} onStart={() => {}} onRestart={() => {}} />)
    expect(screen.getByTestId('landing-screen')).toBeInTheDocument()
  })

  it('캐릭터 이름이 포함된 인사말이 표시된다', () => {
    render(<LandingScreen character={character} onStart={() => {}} onRestart={() => {}} />)
    expect(screen.getByText('안녕, 구름이! 👋')).toBeInTheDocument()
  })

  it('레벨과 XP 진행도가 표시된다', () => {
    render(<LandingScreen character={character} onStart={() => {}} onRestart={() => {}} />)
    expect(screen.getByTestId('landing-growth')).toHaveTextContent('Lv.2 160 / 200 XP')
    expect(screen.getByTestId('growth-bar')).toBeInTheDocument()
  })

  it('시작하기 버튼 클릭 시 onStart가 호출된다', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<LandingScreen character={character} onStart={onStart} onRestart={() => {}} />)
    await user.click(screen.getByTestId('landing-start'))
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('처음부터 버튼 클릭 시 onRestart가 호출된다', async () => {
    const user = userEvent.setup()
    const onRestart = vi.fn()
    render(<LandingScreen character={character} onStart={() => {}} onRestart={onRestart} />)
    await user.click(screen.getByTestId('landing-restart'))
    expect(onRestart).toHaveBeenCalledTimes(1)
  })

  it('시작하기 버튼에 focus-visible 및 min-h-[44px] 클래스가 있다', () => {
    render(<LandingScreen character={character} onStart={() => {}} onRestart={() => {}} />)
    const startBtn = screen.getByTestId('landing-start')
    expect(startBtn.className).toMatch(/focus-visible/)
    expect(startBtn.className).toMatch(/min-h-\[44px\]/)
  })

  it('privacy-badge가 표시된다', () => {
    render(<LandingScreen character={character} onStart={() => {}} onRestart={() => {}} />)
    expect(screen.getByTestId('privacy-badge')).toBeInTheDocument()
  })
})
