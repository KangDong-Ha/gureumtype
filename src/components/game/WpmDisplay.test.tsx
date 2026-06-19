import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { WpmDisplay } from './WpmDisplay'

describe('WpmDisplay', () => {
  describe('AC1 — 실시간 수치 표시', () => {
    it('wpm 수치가 화면에 표시된다', () => {
      render(<WpmDisplay wpm={42} accuracy={95} />)
      expect(screen.getByTestId('wpm-value')).toHaveTextContent('42')
    })

    it('accuracy 수치가 % 형식으로 화면에 표시된다', () => {
      render(<WpmDisplay wpm={42} accuracy={95} />)
      expect(screen.getByTestId('accuracy-value')).toHaveTextContent('95%')
    })

    it('wpm prop 변경 시 수치가 즉시 업데이트된다', () => {
      const { rerender } = render(<WpmDisplay wpm={50} accuracy={90} />)
      expect(screen.getByTestId('wpm-value')).toHaveTextContent('50')
      rerender(<WpmDisplay wpm={85} accuracy={90} />)
      expect(screen.getByTestId('wpm-value')).toHaveTextContent('85')
    })
  })

  describe('AC2 — 3단계 색상 피드백', () => {
    it('wpm < 80이면 text-cloud-primary(normal) 클래스가 적용된다', () => {
      render(<WpmDisplay wpm={50} accuracy={90} />)
      expect(screen.getByTestId('wpm-value')).toHaveClass('text-cloud-primary')
    })

    it('80 ≤ wpm < 100이면 text-cloud-secondary(approaching) 클래스가 적용된다', () => {
      render(<WpmDisplay wpm={85} accuracy={90} />)
      expect(screen.getByTestId('wpm-value')).toHaveClass('text-cloud-secondary')
    })

    it('wpm ≥ 100이면 text-cloud-success(goal) 클래스가 적용된다', () => {
      render(<WpmDisplay wpm={100} accuracy={95} />)
      expect(screen.getByTestId('wpm-value')).toHaveClass('text-cloud-success')
    })

    it('wpm ≥ 100이면 animate-pulse 클래스가 적용된다', () => {
      render(<WpmDisplay wpm={110} accuracy={95} />)
      expect(screen.getByTestId('wpm-value')).toHaveClass('animate-pulse')
    })

    it('goalReached=true이면 wpm이 낮아도 text-cloud-success가 적용된다 (latch)', () => {
      render(<WpmDisplay wpm={60} accuracy={80} goalReached={true} />)
      expect(screen.getByTestId('wpm-value')).toHaveClass('text-cloud-success')
    })

    it('goalReached=true이면 animate-pulse가 적용된다', () => {
      render(<WpmDisplay wpm={60} accuracy={80} goalReached={true} />)
      expect(screen.getByTestId('wpm-value')).toHaveClass('animate-pulse')
    })

    it('normal 상태에서는 animate-pulse가 없다', () => {
      render(<WpmDisplay wpm={50} accuracy={90} />)
      expect(screen.getByTestId('wpm-value')).not.toHaveClass('animate-pulse')
    })

    it('wpm 경계값 80: approaching 상태로 처리된다', () => {
      render(<WpmDisplay wpm={80} accuracy={90} />)
      expect(screen.getByTestId('wpm-value')).toHaveClass('text-cloud-secondary')
    })
  })

  describe('AC3 — 초기/idle 상태 정상 렌더링', () => {
    it('wpm=0, accuracy=100 초기 상태가 정상 렌더링된다', () => {
      render(<WpmDisplay wpm={0} accuracy={100} />)
      expect(screen.getByTestId('wpm-value')).toHaveTextContent('0')
      expect(screen.getByTestId('accuracy-value')).toHaveTextContent('100%')
    })

    it('wpm=0은 normal(하늘색) 상태로 표시된다', () => {
      render(<WpmDisplay wpm={0} accuracy={100} />)
      expect(screen.getByTestId('wpm-value')).toHaveClass('text-cloud-primary')
    })
  })

  describe('AC4 — 접근성', () => {
    it('wpm 수치에 "타수 N타" 형식의 aria-label이 제공된다', () => {
      render(<WpmDisplay wpm={42} accuracy={95} />)
      expect(screen.getByLabelText('타수 42타')).toBeInTheDocument()
    })

    it('accuracy 수치에 "정확도 N%" 형식의 aria-label이 제공된다', () => {
      render(<WpmDisplay wpm={42} accuracy={95} />)
      expect(screen.getByLabelText('정확도 95%')).toBeInTheDocument()
    })
  })
})
