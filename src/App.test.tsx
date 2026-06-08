import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  // AC 기본 렌더링
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
