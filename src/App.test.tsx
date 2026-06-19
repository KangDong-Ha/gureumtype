import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'

vi.mock('./screens/GameScreen', () => ({
  GameScreen: ({
    onComplete,
  }: {
    onComplete: (wpm: number, accuracy: number) => void
  }) => (
    <button data-testid="mock-game-complete" onClick={() => onComplete(80, 95)}>
      Complete Stage
    </button>
  ),
}))

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
    expect(heading).toHaveClass('text-cloud-primary-dark')
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

  it('저장된 캐릭터가 있으면 LandingScreen을 거쳐 HomeScreen으로 진입한다', async () => {
    const user = userEvent.setup()
    localStorage.setItem('gureumtype:lastCharacterName', '구름이')
    localStorage.setItem(
      'gureumtype:character:구름이',
      JSON.stringify({ name: '구름이', level: 1, xp: 0, maxXp: 100 })
    )
    render(<App />)
    expect(screen.getByTestId('landing-screen')).toBeInTheDocument()
    await user.click(screen.getByTestId('landing-start'))
    expect(screen.getByTestId('home-screen')).toBeInTheDocument()
  })

  it('lastCharacterName은 있지만 캐릭터 데이터가 없으면 WelcomeScreen을 렌더링한다', () => {
    localStorage.setItem('gureumtype:lastCharacterName', '구름이')
    // character 데이터 없음
    render(<App />)
    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument()
  })

  it('이름 입력 및 난이도 선택 후 HomeScreen으로 전환된다', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument()
    await user.type(screen.getByTestId('name-input'), '구름이')
    await user.click(screen.getByRole('button', { name: '다음 →' }))
    await user.click(screen.getByTestId('difficulty-easy'))
    expect(screen.getByTestId('landing-screen')).toBeInTheDocument()
    await user.click(screen.getByTestId('landing-start'))
    expect(screen.getByTestId('home-screen')).toBeInTheDocument()
  })
})

describe('App 저장/복원', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('이름+난이도 선택 후 localStorage에 캐릭터가 저장된다', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('name-input'), '구름이')
    await user.click(screen.getByRole('button', { name: '다음 →' }))
    await user.click(screen.getByTestId('difficulty-easy'))
    const raw = localStorage.getItem('gureumtype:character:구름이')
    expect(raw).not.toBeNull()
    const saved = JSON.parse(raw!)
    expect(saved.name).toBe('구름이')
    expect(saved.difficulty).toBe('easy')
    expect(saved.level).toBe(1)
    expect(saved.xp).toBe(0)
  })

  it('이름+난이도 선택 후 lastCharacterName이 저장된다', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('name-input'), '구름이')
    await user.click(screen.getByRole('button', { name: '다음 →' }))
    await user.click(screen.getByTestId('difficulty-easy'))
    expect(localStorage.getItem('gureumtype:lastCharacterName')).toBe('구름이')
  })

  it('저장된 캐릭터로 재접속 시 HomeScreen에 캐릭터 이름이 표시된다', () => {
    localStorage.setItem('gureumtype:lastCharacterName', '구름이')
    localStorage.setItem(
      'gureumtype:character:구름이',
      JSON.stringify({ name: '구름이', level: 1, xp: 0, maxXp: 100, difficulty: 'hard' })
    )
    render(<App />)
    expect(screen.getByText('안녕, 구름이! 👋')).toBeInTheDocument()
  })

  it('저장된 캐릭터로 재접속 시 HomeScreen에 저장된 difficulty가 표시된다', async () => {
    const user = userEvent.setup()
    localStorage.setItem('gureumtype:lastCharacterName', '구름이')
    localStorage.setItem(
      'gureumtype:character:구름이',
      JSON.stringify({ name: '구름이', level: 1, xp: 0, maxXp: 100, difficulty: 'hard' })
    )
    render(<App />)
    await user.click(screen.getByTestId('landing-start'))
    expect(screen.getByTestId('difficulty-display')).toHaveTextContent('어려움')
  })
})

describe('App 스테이지 진행상황 저장', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('gureumtype:lastCharacterName', '구름이')
    localStorage.setItem(
      'gureumtype:character:구름이',
      JSON.stringify({ name: '구름이', level: 1, xp: 0, maxXp: 100, difficulty: 'easy' })
    )
  })

  it('AC1+AC2: 스테이지 완료 시 localStorage에 진행상황이 저장된다', async () => {
    const user = userEvent.setup()
    render(<App />)
    // HomeScreen → 스테이지 0 시작
    await user.click(screen.getByTestId('landing-start'))
    await user.click(screen.getByTestId('stage-btn-0'))
    // (mock) GameScreen → 완료 트리거
    await user.click(screen.getByTestId('mock-game-complete'))
    // localStorage 확인
    const raw = localStorage.getItem('gureumtype:stageprogress:구름이')
    expect(raw).not.toBeNull()
    const progress = JSON.parse(raw!)
    expect(progress).toHaveLength(1)
    expect(progress[0]).toEqual({ stageIndex: 0, completed: true, bestWpm: 80 })
  })

  it('AC2: 동일 스테이지 재완료 시 더 높은 WPM으로 bestWpm이 업데이트된다', async () => {
    // 기존 진행상황: stageIndex=0, bestWpm=60
    localStorage.setItem(
      'gureumtype:stageprogress:구름이',
      JSON.stringify([{ stageIndex: 0, completed: true, bestWpm: 60 }])
    )
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('landing-start'))
    await user.click(screen.getByTestId('stage-btn-0'))
    await user.click(screen.getByTestId('mock-game-complete')) // onComplete(80, 95)
    const raw = localStorage.getItem('gureumtype:stageprogress:구름이')
    const progress = JSON.parse(raw!)
    expect(progress[0].bestWpm).toBe(80) // 60 → 80 (높은 쪽)
  })

  it('AC2: 동일 스테이지 재완료 시 더 낮은 WPM이면 bestWpm이 유지된다', async () => {
    // 기존 진행상황: stageIndex=0, bestWpm=100
    localStorage.setItem(
      'gureumtype:stageprogress:구름이',
      JSON.stringify([{ stageIndex: 0, completed: true, bestWpm: 100 }])
    )
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('landing-start'))
    await user.click(screen.getByTestId('stage-btn-0'))
    await user.click(screen.getByTestId('mock-game-complete')) // onComplete(80, 95)
    const raw = localStorage.getItem('gureumtype:stageprogress:구름이')
    const progress = JSON.parse(raw!)
    expect(progress[0].bestWpm).toBe(100) // 100 유지 (80보다 높음)
  })

  it('AC3: 저장된 진행상황으로 재시작 시 HomeScreen에 완료 스테이지가 반영된다', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      'gureumtype:stageprogress:구름이',
      JSON.stringify([{ stageIndex: 0, completed: true, bestWpm: 80 }])
    )
    render(<App />)
    await user.click(screen.getByTestId('landing-start'))
    // stage-btn-0: 완료(체크), stage-btn-1: 현재(강조)
    expect(screen.getByTestId('stage-btn-0')).toHaveTextContent('✓')
    expect(screen.getByTestId('stage-btn-1')).not.toBeDisabled()
  })
})

describe('App — AC(8.3): 캐릭터 선택 라우팅', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(
      'gureumtype:character:구름이',
      JSON.stringify({ name: '구름이', level: 1, xp: 0, maxXp: 100, difficulty: 'easy' })
    )
    localStorage.setItem(
      'gureumtype:character:햇살이',
      JSON.stringify({ name: '햇살이', level: 2, xp: 50, maxXp: 200, difficulty: 'hard' })
    )
    localStorage.setItem('gureumtype:lastCharacterName', '구름이')
  })

  it('랜딩의 "캐릭터 변경" 클릭 시 선택 화면이 표시된다', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('landing-restart'))
    expect(screen.getByTestId('character-select-screen')).toBeInTheDocument()
    expect(screen.getByTestId('character-card-구름이')).toBeInTheDocument()
    expect(screen.getByTestId('character-card-햇살이')).toBeInTheDocument()
  })

  it('다른 캐릭터 선택 시 해당 캐릭터로 전환되어 랜딩이 표시된다', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('landing-restart'))
    await user.click(screen.getByTestId('select-햇살이'))
    // 햇살이로 전환 → 랜딩에 인사말/레벨 반영
    expect(screen.getByTestId('landing-screen')).toBeInTheDocument()
    expect(screen.getByText('안녕, 햇살이! 👋')).toBeInTheDocument()
    expect(screen.getByTestId('landing-growth')).toHaveTextContent('Lv.2 50 / 200 XP')
    expect(localStorage.getItem('gureumtype:lastCharacterName')).toBe('햇살이')
  })

  it('선택 화면에서 "새 캐릭터 만들기" 클릭 시 WelcomeScreen으로 이동한다', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('landing-restart'))
    await user.click(screen.getByTestId('create-new-character'))
    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument()
  })

  it('활성 캐릭터 삭제 후 뒤로 가면 남은 캐릭터로 랜딩이 표시된다', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('landing-restart'))
    // 활성 캐릭터(구름이) 삭제
    await user.click(screen.getByTestId('delete-구름이'))
    await user.click(screen.getByTestId('delete-yes-구름이'))
    // 뒤로 → 남은 햇살이로 활성화되어 랜딩
    await user.click(screen.getByTestId('select-back'))
    expect(screen.getByTestId('landing-screen')).toBeInTheDocument()
    expect(screen.getByText('안녕, 햇살이! 👋')).toBeInTheDocument()
    expect(localStorage.getItem('gureumtype:lastCharacterName')).toBe('햇살이')
  })

  it('마지막 캐릭터까지 삭제 후 뒤로 가면 WelcomeScreen으로 이동한다', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('landing-restart'))
    await user.click(screen.getByTestId('delete-구름이'))
    await user.click(screen.getByTestId('delete-yes-구름이'))
    await user.click(screen.getByTestId('delete-햇살이'))
    await user.click(screen.getByTestId('delete-yes-햇살이'))
    await user.click(screen.getByTestId('select-back'))
    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument()
  })
})

describe('App — AC(7.2): 반응형 레이아웃', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('app-root에 overflow-x-hidden 클래스가 있다', () => {
    render(<App />)
    expect(screen.getByTestId('app-root').className).toMatch(/overflow-x-hidden/)
  })

  it('app-container에 max-w-[480px] mx-auto 클래스가 있다', () => {
    render(<App />)
    expect(screen.getByTestId('app-container').className).toMatch(/max-w-\[480px\]/)
    expect(screen.getByTestId('app-container').className).toMatch(/mx-auto/)
  })
})
