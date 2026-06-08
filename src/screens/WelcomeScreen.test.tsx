import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import WelcomeScreen from './WelcomeScreen'

describe('WelcomeScreen', () => {
  it('data-testid="welcome-screen"이 렌더링된다', () => {
    render(<WelcomeScreen onNext={() => {}} />)
    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument()
  })

  it('제목 "구름 타자연습기"가 표시된다', () => {
    render(<WelcomeScreen onNext={() => {}} />)
    expect(screen.getByRole('heading', { level: 1, name: '구름 타자연습기' })).toBeInTheDocument()
  })

  it('부제목 텍스트가 표시된다', () => {
    render(<WelcomeScreen onNext={() => {}} />)
    expect(screen.getByText('게임처럼 즐기는 한글 타자 연습')).toBeInTheDocument()
  })

  it('"시작하기" 버튼이 렌더링된다', () => {
    render(<WelcomeScreen onNext={() => {}} />)
    expect(screen.getByRole('button', { name: '시작하기' })).toBeInTheDocument()
  })

  it('"시작하기" 버튼 클릭 시 onNext가 호출된다', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<WelcomeScreen onNext={onNext} />)
    await user.click(screen.getByRole('button', { name: '시작하기' }))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('제목에 text-cloud-primary 클래스가 적용된다', () => {
    render(<WelcomeScreen onNext={() => {}} />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-cloud-primary')
    expect(heading).toHaveClass('font-noto')
  })
})
