import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveCharacter,
  loadCharacter,
  clearCharacter,
  saveStageProgress,
  loadStageProgress,
  saveLastCharacterName,
  loadLastCharacterName,
  loadAllCharacterNames,
  loadAllCharacters,
  deleteCharacter,
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

  it('saveCharacter — 빈 이름은 저장하지 않는다 (고스트 캐릭터 방지)', () => {
    saveCharacter({ name: '', level: 1, xp: 0, maxXp: 100, difficulty: 'easy' })
    expect(localStorage.getItem('gureumtype:character:')).toBeNull()
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

describe('storage — 다중 캐릭터 (AC 8.3)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('loadAllCharacterNames — 저장된 모든 캐릭터 이름을 반환한다', () => {
    saveCharacter({ name: '구름이', level: 1, xp: 0, maxXp: 100, difficulty: 'easy' })
    saveCharacter({ name: '햇살이', level: 2, xp: 50, maxXp: 200, difficulty: 'hard' })
    expect(loadAllCharacterNames()).toEqual(['구름이', '햇살이'])
  })

  it('loadAllCharacterNames — 캐릭터가 없으면 빈 배열', () => {
    expect(loadAllCharacterNames()).toEqual([])
  })

  it('loadAllCharacters — 저장된 캐릭터 객체 목록을 반환한다', () => {
    saveCharacter({ name: '구름이', level: 1, xp: 0, maxXp: 100, difficulty: 'easy' })
    saveCharacter({ name: '햇살이', level: 2, xp: 50, maxXp: 200, difficulty: 'hard' })
    const all = loadAllCharacters()
    expect(all).toHaveLength(2)
    expect(all.map((c) => c.name)).toEqual(['구름이', '햇살이'])
  })

  it('deleteCharacter — 캐릭터와 진행현황을 모두 제거한다', () => {
    saveCharacter({ name: '구름이', level: 1, xp: 0, maxXp: 100, difficulty: 'easy' })
    saveStageProgress('구름이', [{ stageIndex: 0, completed: true, bestWpm: 80 }])
    deleteCharacter('구름이')
    expect(loadCharacter('구름이')).toBeNull()
    expect(loadStageProgress('구름이')).toEqual([])
    expect(loadAllCharacterNames()).toEqual([])
  })

  it('deleteCharacter — 활성 캐릭터 삭제 시 lastCharacterName이 남은 캐릭터로 변경된다', () => {
    saveCharacter({ name: '구름이', level: 1, xp: 0, maxXp: 100, difficulty: 'easy' })
    saveCharacter({ name: '햇살이', level: 2, xp: 50, maxXp: 200, difficulty: 'hard' })
    saveLastCharacterName('구름이')
    deleteCharacter('구름이')
    expect(loadLastCharacterName()).toBe('햇살이')
  })

  it('deleteCharacter — 마지막 캐릭터 삭제 시 lastCharacterName이 제거된다', () => {
    saveCharacter({ name: '구름이', level: 1, xp: 0, maxXp: 100, difficulty: 'easy' })
    saveLastCharacterName('구름이')
    deleteCharacter('구름이')
    expect(loadLastCharacterName()).toBeNull()
  })

  it('deleteCharacter — 비활성 캐릭터 삭제 시 lastCharacterName은 유지된다', () => {
    saveCharacter({ name: '구름이', level: 1, xp: 0, maxXp: 100, difficulty: 'easy' })
    saveCharacter({ name: '햇살이', level: 2, xp: 50, maxXp: 200, difficulty: 'hard' })
    saveLastCharacterName('구름이')
    deleteCharacter('햇살이')
    expect(loadLastCharacterName()).toBe('구름이')
  })
})
