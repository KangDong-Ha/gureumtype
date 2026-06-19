import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StageCard } from './StageCard'

describe('StageCard — AC1: 문장 표시', () => {
  it('data-testid="stage-card"이 렌더링된다', () => {
    render(<StageCard text="가는 말이 고와야 오는 말이 곱다" meaning={null} />)
    expect(screen.getByTestId('stage-card')).toBeInTheDocument()
  })

  it('stage-card-text에 text props가 표시된다', () => {
    render(<StageCard text="가는 말이 고와야 오는 말이 곱다" meaning={null} />)
    expect(screen.getByTestId('stage-card-text')).toHaveTextContent(
      '가는 말이 고와야 오는 말이 곱다',
    )
  })
})

describe('StageCard — AC2: meaning 있는 경우 뜻 카드 표시', () => {
  it('meaning이 있으면 stage-card-meaning이 표시된다', () => {
    render(
      <StageCard
        text="가는 말이 고와야 오는 말이 곱다"
        meaning="자기가 남에게 좋게 해야 남도 자기에게 좋게 한다는 뜻"
      />,
    )
    expect(screen.getByTestId('stage-card-meaning')).toBeInTheDocument()
  })

  it('stage-card-meaning에 meaning 텍스트가 표시된다', () => {
    const meaning = '자기가 남에게 좋게 해야 남도 자기에게 좋게 한다는 뜻'
    render(<StageCard text="가는 말이 고와야 오는 말이 곱다" meaning={meaning} />)
    expect(screen.getByTestId('stage-card-meaning')).toHaveTextContent(meaning)
  })

  it('meaning 있을 때 translate-y-0 클래스가 적용된다 (visible 상태)', () => {
    render(
      <StageCard
        text="가는 말이 고와야 오는 말이 곱다"
        meaning="자기가 남에게 좋게 해야 남도 자기에게 좋게 한다는 뜻"
      />,
    )
    const meaning = screen.getByTestId('stage-card-meaning')
    expect(meaning.className).toContain('translate-y-0')
  })
})

describe('StageCard — AC3: meaning null인 경우 뜻 카드 미표시', () => {
  it('meaning=null이면 stage-card-meaning이 없다', () => {
    render(<StageCard text="산은 높고 바다는 넓다" meaning={null} />)
    expect(screen.queryByTestId('stage-card-meaning')).not.toBeInTheDocument()
  })
})
