import { describe, it, expect } from 'vitest'
import { calculateWpm, calculateAccuracy } from './typingEngine'

describe('calculateWpm', () => {
  it('60초에 60타 → 60 WPM', () => {
    expect(calculateWpm(60, 60_000)).toBe(60)
  })

  it('30초에 30타 → 60 WPM', () => {
    expect(calculateWpm(30, 30_000)).toBe(60)
  })

  it('elapsedMs = 0 → 0 반환 (0으로 나누기 방지)', () => {
    expect(calculateWpm(100, 0)).toBe(0)
  })

  it('elapsedMs 음수 → 0 반환', () => {
    expect(calculateWpm(10, -1)).toBe(0)
  })

  it('correctChars = 0 → 0 WPM', () => {
    expect(calculateWpm(0, 60_000)).toBe(0)
  })
})

describe('calculateAccuracy', () => {
  it('10정타 / 12시도 → 83%', () => {
    expect(calculateAccuracy(10, 12)).toBe(83)
  })

  it('전부 정타 → 100%', () => {
    expect(calculateAccuracy(5, 5)).toBe(100)
  })

  it('totalCount = 0 → 100 반환 (0으로 나누기 방지)', () => {
    expect(calculateAccuracy(0, 0)).toBe(100)
  })

  it('correctCount = 0, totalCount > 0 → 0%', () => {
    expect(calculateAccuracy(0, 5)).toBe(0)
  })

  it('반올림 처리: 1/3 → 33%', () => {
    expect(calculateAccuracy(1, 3)).toBe(33)
  })
})
