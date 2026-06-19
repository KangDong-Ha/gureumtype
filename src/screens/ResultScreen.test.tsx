import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ResultScreen } from './ResultScreen'

vi.mock('../utils/contentLoader', () => ({
  getStageContent: vi.fn().mockReturnValue({
    id: 'test-001',
    text: '가는 말이 고와야 오는 말이 곱다',
    type: 'proverb',
    meaning: '자기가 남에게 좋게 해야 남도 자기에게 좋게 한다는 뜻',
  }),
}))

const defaultProps = {
  wpm: 72,
  accuracy: 95,
  stageIndex: 0,
  difficulty: 'easy' as const,
  character: null,
  onNextStage: vi.fn(),
  onRetry: vi.fn(),
  onHome: vi.fn(),
}

describe('ResultScreen — AC1: 결과 표시', () => {
  it('data-testid="result-screen"이 렌더링된다', () => {
    render(<ResultScreen {...defaultProps} />)
    expect(screen.getByTestId('result-screen')).toBeInTheDocument()
  })

  it('result-wpm에 wpm 값이 표시된다', () => {
    render(<ResultScreen {...defaultProps} wpm={72} />)
    expect(screen.getByTestId('result-wpm')).toHaveTextContent('72')
  })

  it('result-accuracy에 accuracy 값이 표시된다', () => {
    render(<ResultScreen {...defaultProps} accuracy={95} />)
    expect(screen.getByTestId('result-accuracy')).toHaveTextContent('95%')
  })
})

describe('ResultScreen — AC2: 다음 스테이지 진행', () => {
  it('마지막이 아닌 스테이지(index=0)에서 "다음 스테이지" 버튼이 표시된다', () => {
    render(<ResultScreen {...defaultProps} stageIndex={0} />)
    expect(screen.getByRole('button', { name: '다음 스테이지' })).toBeInTheDocument()
  })

  it('"다음 스테이지" 클릭 시 onNextStage가 호출된다', async () => {
    const user = userEvent.setup()
    const onNextStage = vi.fn()
    render(<ResultScreen {...defaultProps} stageIndex={0} onNextStage={onNextStage} />)
    await user.click(screen.getByRole('button', { name: '다음 스테이지' }))
    expect(onNextStage).toHaveBeenCalled()
  })
})

describe('ResultScreen — AC3: 다시 하기', () => {
  it('"다시 하기" 버튼이 항상 표시된다 (비-마지막 스테이지)', () => {
    render(<ResultScreen {...defaultProps} stageIndex={0} />)
    expect(screen.getByRole('button', { name: '다시 하기' })).toBeInTheDocument()
  })

  it('"다시 하기" 버튼이 항상 표시된다 (마지막 스테이지)', () => {
    render(<ResultScreen {...defaultProps} stageIndex={9} />)
    expect(screen.getByRole('button', { name: '다시 하기' })).toBeInTheDocument()
  })

  it('"다시 하기" 클릭 시 onRetry가 호출된다', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ResultScreen {...defaultProps} stageIndex={0} onRetry={onRetry} />)
    await user.click(screen.getByRole('button', { name: '다시 하기' }))
    expect(onRetry).toHaveBeenCalled()
  })
})

describe('ResultScreen — AC4: 마지막 스테이지 완료 시 홈으로', () => {
  it('마지막 스테이지(index=9)에서 "홈으로" 버튼이 표시된다', () => {
    render(<ResultScreen {...defaultProps} stageIndex={9} />)
    expect(screen.getByRole('button', { name: '홈으로' })).toBeInTheDocument()
  })

  it('마지막 스테이지(index=9)에서 "다음 스테이지" 버튼이 표시되지 않는다', () => {
    render(<ResultScreen {...defaultProps} stageIndex={9} />)
    expect(screen.queryByRole('button', { name: '다음 스테이지' })).not.toBeInTheDocument()
  })

  it('"홈으로" 클릭 시 onHome이 호출된다', async () => {
    const user = userEvent.setup()
    const onHome = vi.fn()
    render(<ResultScreen {...defaultProps} stageIndex={9} onHome={onHome} />)
    await user.click(screen.getByRole('button', { name: '홈으로' }))
    expect(onHome).toHaveBeenCalled()
  })
})

describe('ResultScreen — AC4(StageCard 통합): 콘텐츠 표시', () => {
  it('StageCard가 렌더링된다 (stage-card testid)', () => {
    render(<ResultScreen {...defaultProps} />)
    expect(screen.getByTestId('stage-card')).toBeInTheDocument()
  })

  it('stage-card-text에 콘텐츠 텍스트가 표시된다', () => {
    render(<ResultScreen {...defaultProps} />)
    expect(screen.getByTestId('stage-card-text')).toHaveTextContent('가는 말이 고와야 오는 말이 곱다')
  })

  it('meaning 있는 경우 stage-card-meaning이 표시된다', () => {
    render(<ResultScreen {...defaultProps} />)
    expect(screen.getByTestId('stage-card-meaning')).toBeInTheDocument()
  })

  it('meaning=null인 경우 stage-card-meaning이 표시되지 않는다', async () => {
    const { getStageContent } = await import('../utils/contentLoader')
    vi.mocked(getStageContent).mockReturnValueOnce({
      id: 'test-002',
      text: '산은 높고 바다는 넓다',
      type: 'poem',
      meaning: null,
    })
    render(<ResultScreen {...defaultProps} />)
    expect(screen.queryByTestId('stage-card-meaning')).not.toBeInTheDocument()
  })
})

describe('ResultScreen — AC(6.4): XP 표시 및 진행 현황', () => {
  const characterProp = { name: '구름이', level: 1 as const, xp: 40, maxXp: 100, difficulty: 'easy' as const }

  it('character + xpGained=20 → xp-gained에 "+20 XP" 표시', () => {
    render(<ResultScreen {...defaultProps} character={characterProp} xpGained={20} />)
    expect(screen.getByTestId('xp-gained')).toHaveTextContent('+20 XP')
  })

  it('character=null이면 xpGained 있어도 xp-gained가 표시되지 않는다', () => {
    render(<ResultScreen {...defaultProps} character={null} xpGained={20} />)
    expect(screen.queryByTestId('xp-gained')).toBeNull()
  })

  it('xpGained prop 없으면 xp-gained가 표시되지 않는다', () => {
    render(<ResultScreen {...defaultProps} character={characterProp} />)
    expect(screen.queryByTestId('xp-gained')).toBeNull()
  })

  it('completedStagesCount=3 → stage-progress에 "스테이지 3 / 10 완료" 표시', () => {
    render(<ResultScreen {...defaultProps} completedStagesCount={3} />)
    expect(screen.getByTestId('stage-progress')).toHaveTextContent('스테이지 3 / 10 완료')
  })

  it('completedStagesCount prop 없으면 stage-progress가 표시되지 않는다', () => {
    render(<ResultScreen {...defaultProps} />)
    expect(screen.queryByTestId('stage-progress')).toBeNull()
  })
})

describe('ResultScreen — AC(5.2): GrowthBar 통합', () => {
  it('character prop이 있으면 growth-bar-container가 렌더링된다', () => {
    render(
      <ResultScreen
        {...defaultProps}
        character={{ name: '구름이', level: 1, xp: 30, maxXp: 100, difficulty: 'easy' }}
      />,
    )
    expect(screen.getByTestId('growth-bar-container')).toBeInTheDocument()
    expect(screen.getByTestId('growth-bar')).toBeInTheDocument()
  })

  it('character=null이면 growth-bar-container가 렌더링되지 않는다', () => {
    render(<ResultScreen {...defaultProps} character={null} />)
    expect(screen.queryByTestId('growth-bar-container')).toBeNull()
  })

  it('character의 xp/maxXp/level이 GrowthBar에 전달된다', () => {
    render(
      <ResultScreen
        {...defaultProps}
        character={{ name: '구름이', level: 1, xp: 30, maxXp: 100, difficulty: 'easy' }}
      />,
    )
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '30')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })
})
