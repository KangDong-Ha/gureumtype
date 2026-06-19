import { describe, it, expect } from 'vitest'
import { getStageContent } from './contentLoader'

describe('getStageContent — AC3: 정상 반환', () => {
  it('easy 첫 번째 항목을 반환한다', () => {
    const result = getStageContent('easy', 0)
    expect(result).not.toBeNull()
    expect(result?.id).toMatch(/^ko-easy-/)
  })

  it('hard 첫 번째 항목을 반환한다', () => {
    const result = getStageContent('hard', 0)
    expect(result).not.toBeNull()
    expect(result?.id).toMatch(/^ko-hard-/)
  })

  it('반환된 항목은 id/text/type/meaning 구조를 가진다', () => {
    const result = getStageContent('easy', 0)
    expect(result).toMatchObject({
      id: expect.any(String),
      text: expect.any(String),
      type: expect.stringMatching(/^(poem|quote|proverb)$/),
    })
    expect(result).toHaveProperty('meaning')
  })

  it('poem 항목의 meaning은 null이다', () => {
    const result = getStageContent('easy', 0)
    expect(result?.type).toBe('poem')
    expect(result?.meaning).toBeNull()
  })

  it('quote 항목의 meaning은 non-null string이다', () => {
    const result = getStageContent('easy', 30)
    expect(result?.type).toBe('quote')
    expect(result?.meaning).toEqual(expect.any(String))
  })

  it('easy 마지막 유효 인덱스(59)를 반환한다', () => {
    const result = getStageContent('easy', 59)
    expect(result).not.toBeNull()
    expect(result?.id).toBe('ko-easy-060')
  })

  it('hard 마지막 유효 인덱스(79)를 반환한다', () => {
    const result = getStageContent('hard', 79)
    expect(result).not.toBeNull()
    expect(result?.id).toBe('ko-hard-080')
  })
})

describe('getStageContent — AC4: 범위 초과 시 null 반환', () => {
  it('easy stageIndex=999 → null', () => {
    expect(getStageContent('easy', 999)).toBeNull()
  })

  it('easy stageIndex=-1 → null', () => {
    expect(getStageContent('easy', -1)).toBeNull()
  })

  it('hard stageIndex=999 → null', () => {
    expect(getStageContent('hard', 999)).toBeNull()
  })
})
