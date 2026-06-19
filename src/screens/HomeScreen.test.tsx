import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import HomeScreen from './HomeScreen'
import type { StageProgress } from '../types'

const defaultProps = {
  onNavigate: vi.fn(),
  onStartStage: vi.fn(),
  characterName: '',
  difficulty: 'easy' as const,
  completedStages: [] as StageProgress[],
  character: null,
}

describe('HomeScreen — AC1: 캐릭터 정보 표시', () => {
  it('data-testid="home-screen"이 렌더링된다', () => {
    render(<HomeScreen {...defaultProps} />)
    expect(screen.getByTestId('home-screen')).toBeInTheDocument()
  })

  it('characterName이 주어지면 인사 메시지가 표시된다', () => {
    render(<HomeScreen {...defaultProps} characterName="구름이" />)
    expect(screen.getByText('안녕, 구름이! 👋')).toBeInTheDocument()
  })

  it('characterName이 빈 문자열이면 인사 메시지가 표시되지 않는다', () => {
    render(<HomeScreen {...defaultProps} characterName="" />)
    expect(screen.queryByText(/안녕,/)).not.toBeInTheDocument()
  })

  it('difficulty="easy"가 주어지면 "쉬움"이 표시된다', () => {
    render(<HomeScreen {...defaultProps} characterName="구름이" difficulty="easy" />)
    expect(screen.getByTestId('difficulty-display')).toHaveTextContent('쉬움')
  })

  it('difficulty="hard"가 주어지면 "어려움"이 표시된다', () => {
    render(<HomeScreen {...defaultProps} characterName="구름이" difficulty="hard" />)
    expect(screen.getByTestId('difficulty-display')).toHaveTextContent('어려움')
  })
})

describe('HomeScreen — AC2: 스테이지 맵 표시', () => {
  it('스테이지 맵에 10개의 버튼이 렌더링된다', () => {
    render(<HomeScreen {...defaultProps} />)
    const buttons = screen.getAllByTestId(/^stage-btn-\d+$/)
    expect(buttons).toHaveLength(10)
  })

  it('stage-btn-0 ~ stage-btn-9 data-testid가 모두 존재한다', () => {
    render(<HomeScreen {...defaultProps} />)
    for (let i = 0; i < 10; i++) {
      expect(screen.getByTestId(`stage-btn-${i}`)).toBeInTheDocument()
    }
  })

  it('0개 완료 시 stage-btn-0이 현재 스테이지(disabled=false)', () => {
    render(<HomeScreen {...defaultProps} completedStages={[]} />)
    expect(screen.getByTestId('stage-btn-0')).not.toBeDisabled()
  })

  it('0개 완료 시 stage-btn-1 이후는 잠금(disabled=true)', () => {
    render(<HomeScreen {...defaultProps} completedStages={[]} />)
    expect(screen.getByTestId('stage-btn-1')).toBeDisabled()
    expect(screen.getByTestId('stage-btn-9')).toBeDisabled()
  })
})

describe('HomeScreen — AC3: 스테이지 선택 및 GameScreen 전환', () => {
  it('현재 스테이지(stage-btn-0) 클릭 시 onStartStage(0)이 호출된다', async () => {
    const user = userEvent.setup()
    const onStartStage = vi.fn()
    render(<HomeScreen {...defaultProps} onStartStage={onStartStage} completedStages={[]} />)
    await user.click(screen.getByTestId('stage-btn-0'))
    expect(onStartStage).toHaveBeenCalledWith(0)
  })

  it('완료된 스테이지(stage-btn-0) 클릭 시 onStartStage(0)이 호출된다', async () => {
    const user = userEvent.setup()
    const onStartStage = vi.fn()
    const completedStages: StageProgress[] = [{ stageIndex: 0, completed: true, bestWpm: 80 }]
    render(
      <HomeScreen
        {...defaultProps}
        onStartStage={onStartStage}
        completedStages={completedStages}
      />,
    )
    await user.click(screen.getByTestId('stage-btn-0'))
    expect(onStartStage).toHaveBeenCalledWith(0)
  })
})

describe('HomeScreen — AC4: 잠긴 스테이지 클릭 불가', () => {
  it('잠긴 스테이지(index > current)는 disabled 상태이다', () => {
    render(<HomeScreen {...defaultProps} completedStages={[]} />)
    expect(screen.getByTestId('stage-btn-2')).toBeDisabled()
  })

  it('잠긴 스테이지는 클릭해도 onStartStage가 호출되지 않는다', async () => {
    const user = userEvent.setup()
    const onStartStage = vi.fn()
    render(<HomeScreen {...defaultProps} onStartStage={onStartStage} completedStages={[]} />)
    await user.click(screen.getByTestId('stage-btn-2')).catch(() => {})
    expect(onStartStage).not.toHaveBeenCalled()
  })
})

describe('HomeScreen — AC5: 진행 현황 정확성', () => {
  it('1개 완료 시 stage-btn-0에 ✓가 표시된다', () => {
    const completedStages: StageProgress[] = [{ stageIndex: 0, completed: true, bestWpm: 80 }]
    render(<HomeScreen {...defaultProps} completedStages={completedStages} />)
    expect(screen.getByTestId('stage-btn-0')).toHaveTextContent('✓')
  })

  it('1개 완료 시 stage-btn-1이 현재 스테이지(disabled=false)', () => {
    const completedStages: StageProgress[] = [{ stageIndex: 0, completed: true, bestWpm: 80 }]
    render(<HomeScreen {...defaultProps} completedStages={completedStages} />)
    expect(screen.getByTestId('stage-btn-1')).not.toBeDisabled()
  })

  it('1개 완료 시 stage-btn-2는 잠금(disabled=true)', () => {
    const completedStages: StageProgress[] = [{ stageIndex: 0, completed: true, bestWpm: 80 }]
    render(<HomeScreen {...defaultProps} completedStages={completedStages} />)
    expect(screen.getByTestId('stage-btn-2')).toBeDisabled()
  })

  it('0개 완료 시 stage-btn-0이 현재 스테이지로 강조된다(animate-pulse 클래스)', () => {
    render(<HomeScreen {...defaultProps} completedStages={[]} />)
    expect(screen.getByTestId('stage-btn-0').className).toContain('animate-pulse')
  })
})

describe('HomeScreen — AC(5.3): CloudCharacter 통합', () => {
  it('character prop이 있으면 cloud-character가 렌더링된다', () => {
    render(
      <HomeScreen
        {...defaultProps}
        character={{ name: '구름이', level: 1, xp: 0, maxXp: 100, difficulty: 'easy' }}
      />,
    )
    expect(screen.getByTestId('cloud-character')).toBeInTheDocument()
  })

  it('character=null이면 cloud-character가 렌더링되지 않는다', () => {
    render(<HomeScreen {...defaultProps} character={null} />)
    expect(screen.queryByTestId('cloud-character')).not.toBeInTheDocument()
  })

  it('character.level=2이면 cloud-level-2가 표시된다', () => {
    render(
      <HomeScreen
        {...defaultProps}
        character={{ name: '구름이', level: 2, xp: 100, maxXp: 200, difficulty: 'easy' }}
      />,
    )
    expect(screen.getByTestId('cloud-level-2')).toBeInTheDocument()
  })
})

describe('HomeScreen — AC(5.2): GrowthBar 통합', () => {
  it('character prop이 있으면 growth-bar-container가 렌더링된다', () => {
    render(
      <HomeScreen
        {...defaultProps}
        character={{ name: '구름이', level: 1, xp: 50, maxXp: 100, difficulty: 'easy' }}
      />,
    )
    expect(screen.getByTestId('growth-bar-container')).toBeInTheDocument()
    expect(screen.getByTestId('growth-bar')).toBeInTheDocument()
  })

  it('character=null이면 growth-bar-container가 렌더링되지 않는다', () => {
    render(<HomeScreen {...defaultProps} character={null} />)
    expect(screen.queryByTestId('growth-bar-container')).toBeNull()
  })

  it('character의 xp/maxXp/level이 GrowthBar에 전달된다', () => {
    render(
      <HomeScreen
        {...defaultProps}
        character={{ name: '구름이', level: 2, xp: 100, maxXp: 200, difficulty: 'easy' }}
      />,
    )
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '100')
    expect(bar).toHaveAttribute('aria-valuemax', '200')
  })
})

describe('HomeScreen — AC(7.1): PrivacyBadge', () => {
  it('privacy-badge가 표시된다', () => {
    render(<HomeScreen {...defaultProps} />)
    expect(screen.getByTestId('privacy-badge')).toBeInTheDocument()
  })
})
