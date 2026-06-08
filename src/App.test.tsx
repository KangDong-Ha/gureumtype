import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // AC 기본 렌더링 — WelcomeScreen이 제목/부제목 보유
  it('구름 타자연습기 제목이 표시된다', () => {
    render(<App />)
    expect(screen.getByText('구름 타자연습기')).toBeInTheDocument()
  })

  it('부제목 텍스트가 표시된다', () => {
    render(<App />)
    expect(screen.getByText('게임처럼 즐기는 한글 타자 연습')).toBeInTheDocument()
  })

  // AC4: 배경 그라데이션 (bg-cloud-sky 클래스)
  it('루트 컨테이너에 bg-cloud-sky 그라데이션 클래스가 적용된다', () => {
    render(<App />)
    const root = screen.getByTestId('app-root')
    expect(root).toHaveClass('bg-cloud-sky')
    expect(root).toHaveClass('min-h-screen')
  })

  // AC5: max-width 480px 컨테이너 (data-testid 기반)
  it('max-width 480px 중앙 정렬 컨테이너가 렌더링된다', () => {
    render(<App />)
    const container = screen.getByTestId('app-container')
    expect(container).toHaveClass('max-w-[480px]')
    expect(container).toHaveClass('mx-auto')
  })

  // AC2: Noto Sans KR 폰트 클래스 적용
  it('제목에 font-noto 클래스가 적용된다', () => {
    render(<App />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('font-noto')
  })

  // AC1: cloud-primary 색상 클래스 적용
  it('제목에 cloud-primary 색상 클래스가 적용된다', () => {
    render(<App />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-cloud-primary')
  })
})

describe('App 라우팅', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('저장된 캐릭터가 없으면 WelcomeScreen을 렌더링한다', () => {
    render(<App />)
    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument()
  })

  it('저장된 캐릭터가 있으면 HomeScreen을 렌더링한다', () => {
    localStorage.setItem('gureumtype:lastCharacterName', '구름이')
    localStorage.setItem(
      'gureumtype:character:구름이',
      JSON.stringify({ name: '구름이', level: 1, xp: 0, maxXp: 100 })
    )
    render(<App />)
    expect(screen.getByTestId('home-screen')).toBeInTheDocument()
  })

  it('lastCharacterName은 있지만 캐릭터 데이터가 없으면 WelcomeScreen을 렌더링한다', () => {
    localStorage.setItem('gureumtype:lastCharacterName', '구름이')
    // character 데이터 없음
    render(<App />)
    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument()
  })

  it('WelcomeScreen "시작하기" 버튼 클릭 시 HomeScreen으로 전환된다', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '시작하기' }))
    expect(screen.getByTestId('home-screen')).toBeInTheDocument()
  })
})
