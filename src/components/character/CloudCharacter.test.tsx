import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CloudCharacter } from './CloudCharacter'

describe('CloudCharacter — AC1: 레벨별 외형', () => {
  it('level=1 → cloud-level-1 렌더링, 나머지 미표시', () => {
    render(<CloudCharacter level={1} name="구름이" />)
    expect(screen.getByTestId('cloud-level-1')).toBeInTheDocument()
    expect(screen.queryByTestId('cloud-level-2')).not.toBeInTheDocument()
    expect(screen.queryByTestId('cloud-level-3')).not.toBeInTheDocument()
  })

  it('level=2 → cloud-level-2 렌더링, 나머지 미표시', () => {
    render(<CloudCharacter level={2} name="구름이" />)
    expect(screen.getByTestId('cloud-level-2')).toBeInTheDocument()
    expect(screen.queryByTestId('cloud-level-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('cloud-level-3')).not.toBeInTheDocument()
  })

  it('level=3 → cloud-level-3 렌더링, 나머지 미표시', () => {
    render(<CloudCharacter level={3} name="구름이" />)
    expect(screen.getByTestId('cloud-level-3')).toBeInTheDocument()
    expect(screen.queryByTestId('cloud-level-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('cloud-level-2')).not.toBeInTheDocument()
  })
})

describe('CloudCharacter — AC2: float 애니메이션', () => {
  it('animate-[float...] 클래스가 존재한다', () => {
    render(<CloudCharacter level={1} name="구름이" />)
    expect(screen.getByTestId('cloud-character').className).toMatch(/animate-\[float/)
  })

  it('level=2에도 float 애니메이션 클래스 존재', () => {
    render(<CloudCharacter level={2} name="구름이" />)
    expect(screen.getByTestId('cloud-character').className).toMatch(/animate-\[float/)
  })

  it('level=3에도 float 애니메이션 클래스 존재', () => {
    render(<CloudCharacter level={3} name="구름이" />)
    expect(screen.getByTestId('cloud-character').className).toMatch(/animate-\[float/)
  })
})

describe('CloudCharacter — AC3: prefers-reduced-motion', () => {
  it('motion-reduce:animate-none 클래스가 존재한다', () => {
    render(<CloudCharacter level={1} name="구름이" />)
    expect(screen.getByTestId('cloud-character').className).toContain('motion-reduce:animate-none')
  })
})

describe('CloudCharacter — AC(5.4): emotion prop', () => {
  it('emotion 미전달 시 data-emotion="idle" (기본값)', () => {
    render(<CloudCharacter level={1} name="구름이" />)
    expect(screen.getByTestId('cloud-character')).toHaveAttribute('data-emotion', 'idle')
  })

  it('emotion="typing-fast" 시 data-emotion 속성 반영', () => {
    render(<CloudCharacter level={1} name="구름이" emotion="typing-fast" />)
    expect(screen.getByTestId('cloud-character')).toHaveAttribute('data-emotion', 'typing-fast')
  })

  it('emotion="typing-slow" 시 data-emotion 속성 반영', () => {
    render(<CloudCharacter level={2} name="구름이" emotion="typing-slow" />)
    expect(screen.getByTestId('cloud-character')).toHaveAttribute('data-emotion', 'typing-slow')
  })

  it('emotion="typing-fast" 시 bounce-fast 애니메이션 클래스 적용', () => {
    render(<CloudCharacter level={1} name="구름이" emotion="typing-fast" />)
    expect(screen.getByTestId('cloud-character').className).toMatch(/animate-\[bounce-fast/)
  })

  it('emotion="typing-slow" 시 wobble 애니메이션 클래스 적용', () => {
    render(<CloudCharacter level={1} name="구름이" emotion="typing-slow" />)
    expect(screen.getByTestId('cloud-character').className).toMatch(/animate-\[wobble/)
  })

  it('emotion="idle" 시 float 애니메이션 클래스 유지', () => {
    render(<CloudCharacter level={1} name="구름이" emotion="idle" />)
    expect(screen.getByTestId('cloud-character').className).toMatch(/animate-\[float/)
  })

  it('transition-all duration-300 클래스 존재 (0.3초 전환)', () => {
    render(<CloudCharacter level={1} name="구름이" />)
    const el = screen.getByTestId('cloud-character')
    expect(el.className).toContain('transition-all')
    expect(el.className).toContain('duration-300')
  })

  it('motion-reduce:animate-none 클래스 유지 (emotion 변경 시에도)', () => {
    render(<CloudCharacter level={1} name="구름이" emotion="typing-fast" />)
    expect(screen.getByTestId('cloud-character').className).toContain('motion-reduce:animate-none')
  })

  it('motion-reduce:transition-none 클래스 존재 (transition도 reduced-motion 억제)', () => {
    render(<CloudCharacter level={1} name="구름이" />)
    expect(screen.getByTestId('cloud-character').className).toContain('motion-reduce:transition-none')
  })
})

describe('CloudCharacter — AC4: aria-label 접근성', () => {
  it('level=1, 이름 포함 aria-label', () => {
    render(<CloudCharacter level={1} name="구름이" />)
    expect(screen.getByTestId('cloud-character')).toHaveAttribute(
      'aria-label',
      '구름이 캐릭터, 현재 레벨 1',
    )
  })

  it('level=2, 이름 포함 aria-label', () => {
    render(<CloudCharacter level={2} name="구름이" />)
    expect(screen.getByTestId('cloud-character')).toHaveAttribute(
      'aria-label',
      '구름이 캐릭터, 현재 레벨 2',
    )
  })

  it('level=3, 이름 포함 aria-label', () => {
    render(<CloudCharacter level={3} name="구름이" />)
    expect(screen.getByTestId('cloud-character')).toHaveAttribute(
      'aria-label',
      '구름이 캐릭터, 현재 레벨 3',
    )
  })

  it('캐릭터 이름이 다를 때 aria-label에 반영된다', () => {
    render(<CloudCharacter level={2} name="솜사탕" />)
    expect(screen.getByTestId('cloud-character')).toHaveAttribute(
      'aria-label',
      '솜사탕 캐릭터, 현재 레벨 2',
    )
  })
})
