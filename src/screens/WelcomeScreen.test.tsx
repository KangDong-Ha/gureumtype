import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import WelcomeScreen from './WelcomeScreen'

// 다른 테스트가 남긴 캐릭터가 중복 이름 가드를 건드리지 않도록 매 테스트 전 초기화
beforeEach(() => {
  localStorage.clear()
})

describe('WelcomeScreen', () => {
  // ─── step 1: 이름 입력 ───────────────────────────────────────

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

  it('제목에 text-cloud-primary-dark 클래스가 적용된다', () => {
    render(<WelcomeScreen onNext={() => {}} />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-cloud-primary-dark')
    expect(heading).toHaveClass('font-noto')
  })

  it('이름 입력 필드가 렌더링된다', () => {
    render(<WelcomeScreen onNext={() => {}} />)
    expect(screen.getByTestId('name-input')).toBeInTheDocument()
  })

  it('초기 상태에서 "다음 →" 버튼이 비활성화된다', () => {
    render(<WelcomeScreen onNext={() => {}} />)
    expect(screen.getByRole('button', { name: '다음 →' })).toBeDisabled()
  })

  it('이름 입력 시 "다음 →" 버튼이 활성화된다', async () => {
    const user = userEvent.setup()
    render(<WelcomeScreen onNext={() => {}} />)
    await user.type(screen.getByTestId('name-input'), '구름이')
    expect(screen.getByRole('button', { name: '다음 →' })).toBeEnabled()
  })

  it('이름 입력 후 "다음 →" 클릭 시 난이도 선택 화면이 표시된다', async () => {
    const user = userEvent.setup()
    render(<WelcomeScreen onNext={() => {}} />)
    await user.type(screen.getByTestId('name-input'), '구름이')
    await user.click(screen.getByRole('button', { name: '다음 →' }))
    expect(screen.getByTestId('difficulty-screen')).toBeInTheDocument()
  })

  it('이름은 최대 10자로 제한된다', async () => {
    const user = userEvent.setup()
    render(<WelcomeScreen onNext={() => {}} />)
    await user.type(screen.getByTestId('name-input'), '12345678901234')
    expect(screen.getByTestId('name-input')).toHaveValue('1234567890')
  })

  it('공백만 입력 후 폼 제출 시 오류 메시지가 표시된다', async () => {
    const user = userEvent.setup()
    render(<WelcomeScreen onNext={() => {}} />)
    const input = screen.getByTestId('name-input')
    await user.type(input, '  ')
    fireEvent.submit(input.closest('form')!)
    expect(screen.getByTestId('name-error')).toBeInTheDocument()
    expect(screen.getByTestId('name-error')).toHaveTextContent('이름을 입력해줘!')
  })

  it('오류 메시지는 role="alert"를 가진다', async () => {
    const user = userEvent.setup()
    render(<WelcomeScreen onNext={() => {}} />)
    const input = screen.getByTestId('name-input')
    await user.type(input, ' ')
    fireEvent.submit(input.closest('form')!)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('오류 발생 후 재입력 시 오류 메시지가 사라진다', async () => {
    const user = userEvent.setup()
    render(<WelcomeScreen onNext={() => {}} />)
    const input = screen.getByTestId('name-input')
    await user.type(input, ' ')
    fireEvent.submit(input.closest('form')!)
    expect(screen.getByTestId('name-error')).toBeInTheDocument()
    await user.clear(input)
    await user.type(input, '구름이')
    expect(screen.queryByTestId('name-error')).not.toBeInTheDocument()
  })

  // ─── step 2: 난이도 선택 ──────────────────────────────────────

  it('난이도 선택 화면에 쉬움과 어려움 옵션이 표시된다', async () => {
    const user = userEvent.setup()
    render(<WelcomeScreen onNext={() => {}} />)
    await user.type(screen.getByTestId('name-input'), '구름이')
    await user.click(screen.getByRole('button', { name: '다음 →' }))
    expect(screen.getByTestId('difficulty-easy')).toBeInTheDocument()
    expect(screen.getByTestId('difficulty-hard')).toBeInTheDocument()
  })

  it('쉬움 선택 시 onNext(name, "easy")가 호출된다', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<WelcomeScreen onNext={onNext} />)
    await user.type(screen.getByTestId('name-input'), '구름이')
    await user.click(screen.getByRole('button', { name: '다음 →' }))
    await user.click(screen.getByTestId('difficulty-easy'))
    expect(onNext).toHaveBeenCalledWith('구름이', 'easy')
  })

  it('어려움 선택 시 onNext(name, "hard")가 호출된다', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<WelcomeScreen onNext={onNext} />)
    await user.type(screen.getByTestId('name-input'), '구름이')
    await user.click(screen.getByRole('button', { name: '다음 →' }))
    await user.click(screen.getByTestId('difficulty-hard'))
    expect(onNext).toHaveBeenCalledWith('구름이', 'hard')
  })

  it('이름 앞뒤 공백은 trim되어 onNext에 전달된다', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<WelcomeScreen onNext={onNext} />)
    await user.type(screen.getByTestId('name-input'), '  구름이  ')
    await user.click(screen.getByRole('button', { name: '다음 →' }))
    await user.click(screen.getByTestId('difficulty-easy'))
    expect(onNext).toHaveBeenCalledWith('구름이', 'easy')
  })

  it('이름 입력 화면에 기기 전환 안내 메시지가 표시된다', () => {
    render(<WelcomeScreen onNext={() => {}} />)
    expect(screen.getByTestId('new-device-notice')).toBeInTheDocument()
    expect(screen.getByTestId('new-device-notice')).toHaveTextContent(
      '이 기기에 저장된 캐릭터가 없어요'
    )
  })

  it('난이도 선택 화면에서 data-testid="welcome-screen"이 유지된다', async () => {
    const user = userEvent.setup()
    render(<WelcomeScreen onNext={() => {}} />)
    await user.type(screen.getByTestId('name-input'), '구름이')
    await user.click(screen.getByRole('button', { name: '다음 →' }))
    // step 2에서도 welcome-screen testid 유지 (App.test.tsx 호환)
    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument()
  })
})

describe('WelcomeScreen — AC(7.1): PrivacyBadge', () => {
  it('이름 입력 step에서 privacy-badge가 표시된다', () => {
    render(<WelcomeScreen onNext={() => {}} />)
    expect(screen.getByTestId('privacy-badge')).toBeInTheDocument()
  })

  it('난이도 선택 step에서도 privacy-badge가 표시된다', async () => {
    const user = userEvent.setup()
    render(<WelcomeScreen onNext={() => {}} />)
    await user.type(screen.getByTestId('name-input'), '구름이')
    await user.click(screen.getByRole('button', { name: '다음 →' }))
    expect(screen.getByTestId('privacy-badge')).toBeInTheDocument()
  })
})

describe('WelcomeScreen — AC(8.3): 중복 이름 차단', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(
      'gureumtype:character:구름이',
      JSON.stringify({ name: '구름이', level: 1, xp: 0, maxXp: 100, difficulty: 'easy' })
    )
  })

  it('이미 있는 이름 입력 시 오류 메시지가 표시되고 난이도 화면으로 넘어가지 않는다', async () => {
    const user = userEvent.setup()
    render(<WelcomeScreen onNext={() => {}} />)
    await user.type(screen.getByTestId('name-input'), '구름이')
    await user.click(screen.getByRole('button', { name: '다음 →' }))
    expect(screen.getByTestId('name-error')).toHaveTextContent('이미 있는 이름이야')
    expect(screen.queryByTestId('difficulty-screen')).not.toBeInTheDocument()
  })

  it('새로운 이름은 정상적으로 난이도 화면으로 넘어간다', async () => {
    const user = userEvent.setup()
    render(<WelcomeScreen onNext={() => {}} />)
    await user.type(screen.getByTestId('name-input'), '햇살이')
    await user.click(screen.getByRole('button', { name: '다음 →' }))
    expect(screen.getByTestId('difficulty-screen')).toBeInTheDocument()
  })
})

describe('WelcomeScreen — AC(7.4): Focus 링', () => {
  it('다음 버튼에 focus-visible 클래스가 있다', () => {
    render(<WelcomeScreen onNext={() => {}} />)
    const nextBtn = screen.getByRole('button', { name: '다음 →' })
    expect(nextBtn.className).toMatch(/focus-visible/)
  })

  it('난이도 선택 버튼에 focus-visible 클래스가 있다', async () => {
    const user = userEvent.setup()
    render(<WelcomeScreen onNext={() => {}} />)
    await user.type(screen.getByTestId('name-input'), '구름이')
    await user.click(screen.getByRole('button', { name: '다음 →' }))
    const easyBtn = screen.getByTestId('difficulty-easy')
    expect(easyBtn.className).toMatch(/focus-visible/)
  })
})
