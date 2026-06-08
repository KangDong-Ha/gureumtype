import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveCharacter,
  loadCharacter,
  clearCharacter,
  saveStageProgress,
  loadStageProgress,
  saveLastCharacterName,
  loadLastCharacterName,
} from './storage'
import type { CharacterState, StageProgress } from '../types'

const mockCharacter: CharacterState = {
  name: '구름이',
  level: 1,
  xp: 0,
  maxXp: 100,
  difficulty: 'easy',
}

const mockProgress: StageProgress[] = [
  { stageIndex: 0, completed: true, bestWpm: 85 },
  { stageIndex: 1, completed: false, bestWpm: 0 },
]

describe('storage — 캐릭터', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('saveCharacter → loadCharacter 라운드트립', () => {
    saveCharacter(mockCharacter)
    const loaded = loadCharacter('구름이')
    expect(loaded).toEqual(mockCharacter)
  })

  it('키 형식이 gureumtype:character:{name}을 따른다', () => {
    saveCharacter(mockCharacter)
    const raw = localStorage.getItem('gureumtype:character:구름이')
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toEqual(mockCharacter)
  })

  it('clearCharacter 후 loadCharacter는 null 반환', () => {
    saveCharacter(mockCharacter)
    clearCharacter('구름이')
    expect(loadCharacter('구름이')).toBeNull()
  })

  it('존재하지 않는 캐릭터 로드 시 null 반환', () => {
    expect(loadCharacter('없는캐릭터')).toBeNull()
  })

  it('saveCharacter — localStorage 실패 시 예외 미발생', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => saveCharacter(mockCharacter)).not.toThrow()
  })

  it('loadCharacter — 손상된 JSON 시 null 반환', () => {
    localStorage.setItem('gureumtype:character:구름이', '{ invalid json }')
    expect(loadCharacter('구름이')).toBeNull()
  })

  it('loadCharacter — JSON null 저장 시 null 반환', () => {
    localStorage.setItem('gureumtype:character:구름이', 'null')
    expect(loadCharacter('구름이')).toBeNull()
  })

  it('clearCharacter — localStorage 실패 시 예외 미발생', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => clearCharacter('구름이')).not.toThrow()
  })
})

describe('storage — 스테이지 진행 현황', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('saveStageProgress → loadStageProgress 라운드트립', () => {
    saveStageProgress('구름이', mockProgress)
    const loaded = loadStageProgress('구름이')
    expect(loaded).toEqual(mockProgress)
  })

  it('키 형식이 gureumtype:stageprogress:{name}을 따른다', () => {
    saveStageProgress('구름이', mockProgress)
    const raw = localStorage.getItem('gureumtype:stageprogress:구름이')
    expect(raw).not.toBeNull()
  })

  it('저장된 데이터 없으면 빈 배열 반환', () => {
    expect(loadStageProgress('없는캐릭터')).toEqual([])
  })

  it('saveStageProgress — localStorage 실패 시 예외 미발생', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => saveStageProgress('구름이', mockProgress)).not.toThrow()
  })

  it('loadStageProgress — 손상된 JSON 시 빈 배열 반환', () => {
    localStorage.setItem('gureumtype:stageprogress:구름이', '{ bad }')
    expect(loadStageProgress('구름이')).toEqual([])
  })

  it('loadStageProgress — JSON null 저장 시 빈 배열 반환', () => {
    localStorage.setItem('gureumtype:stageprogress:구름이', 'null')
    expect(loadStageProgress('구름이')).toEqual([])
  })
})

describe('lastCharacterName', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('saveLastCharacterName — 이름을 저장한다', () => {
    saveLastCharacterName('구름이')
    expect(localStorage.getItem('gureumtype:lastCharacterName')).toBe('구름이')
  })

  it('loadLastCharacterName — 저장된 이름을 반환한다', () => {
    localStorage.setItem('gureumtype:lastCharacterName', '구름이')
    expect(loadLastCharacterName()).toBe('구름이')
  })

  it('loadLastCharacterName — 저장된 이름이 없으면 null 반환', () => {
    expect(loadLastCharacterName()).toBeNull()
  })

  it('saveLastCharacterName — localStorage 실패 시 예외 미발생', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => saveLastCharacterName('구름이')).not.toThrow()
  })

  it('loadLastCharacterName — localStorage 실패 시 null 반환', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(loadLastCharacterName()).toBeNull()
  })
})
