import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, afterEach } from 'vitest'
import KeyboardNotice from './KeyboardNotice'

describe('KeyboardNotice', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      writable: true,
      configurable: true,
    })
  })

  it('터치 기기가 아닌 경우 배너가 표시되지 않는다', () => {
    // jsdom 기본: navigator.maxTouchPoints === 0
    render(<KeyboardNotice />)
    expect(screen.queryByTestId('keyboard-notice')).not.toBeInTheDocument()
  })

  it('터치 기기인 경우 배너가 표시된다', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    })
    render(<KeyboardNotice />)
    expect(screen.getByTestId('keyboard-notice')).toBeInTheDocument()
    expect(screen.getByTestId('keyboard-notice')).toHaveTextContent('키보드 연결이 필요해요')
  })

  it('닫기 버튼 클릭 시 배너가 사라진다', async () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    })
    const user = userEvent.setup()
    render(<KeyboardNotice />)
    expect(screen.getByTestId('keyboard-notice')).toBeInTheDocument()
    await user.click(screen.getByTestId('keyboard-notice-dismiss'))
    expect(screen.queryByTestId('keyboard-notice')).not.toBeInTheDocument()
  })

  it('닫기 버튼에 aria-label="키보드 안내 닫기"가 있다', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    })
    render(<KeyboardNotice />)
    expect(screen.getByRole('button', { name: '키보드 안내 닫기' })).toBeInTheDocument()
  })
})
