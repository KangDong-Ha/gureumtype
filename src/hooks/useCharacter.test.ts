import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCharacter } from './useCharacter'
import type { CharacterState } from '../types'

vi.mock('../utils/storage', () => ({
  saveCharacter: vi.fn(),
}))

const makeCharacter = (overrides: Partial<CharacterState> = {}): CharacterState => ({
  name: '구름이',
  level: 1,
  xp: 0,
  maxXp: 100,
  difficulty: 'easy',
  ...overrides,
})

describe('useCharacter — AC1: XP 증가', () => {
  beforeEach(() => vi.clearAllMocks())

  it('addXp(30) 호출 시 xp가 30 증가한다', () => {
    const { result } = renderHook(() => useCharacter(makeCharacter()))
    act(() => { result.current.addXp(30) })
    expect(result.current.character.xp).toBe(30)
    expect(result.current.character.level).toBe(1)
  })

  it('addXp를 여러 번 호출하면 누적된다', () => {
    const { result } = renderHook(() => useCharacter(makeCharacter()))
    act(() => { result.current.addXp(30) })
    act(() => { result.current.addXp(20) })
    expect(result.current.character.xp).toBe(50)
  })

  it('xp가 maxXp 미만이면 레벨 변화 없음', () => {
    const { result } = renderHook(() => useCharacter(makeCharacter({ xp: 50 })))
    act(() => { result.current.addXp(30) })
    expect(result.current.character.level).toBe(1)
    expect(result.current.character.xp).toBe(80)
  })
})

describe('useCharacter — AC2: 레벨업 판정', () => {
  beforeEach(() => vi.clearAllMocks())

  it('xp + amount >= maxXp 시 레벨업 — level 1→2, xp 0으로 리셋', () => {
    const { result } = renderHook(() => useCharacter(makeCharacter({ xp: 0 })))
    act(() => { result.current.addXp(100) })
    expect(result.current.character.level).toBe(2)
    expect(result.current.character.xp).toBe(0)
    expect(result.current.character.maxXp).toBe(200)
  })

  it('xp=80에서 addXp(30) → 110 >= 100 → 레벨업, xp=0', () => {
    const { result } = renderHook(() => useCharacter(makeCharacter({ xp: 80 })))
    act(() => { result.current.addXp(30) })
    expect(result.current.character.level).toBe(2)
    expect(result.current.character.xp).toBe(0)
  })

  it('레벨 2에서 addXp(200) → level 2→3, xp 0, maxXp 300', () => {
    const { result } = renderHook(() =>
      useCharacter(makeCharacter({ level: 2, xp: 0, maxXp: 200 }))
    )
    act(() => { result.current.addXp(200) })
    expect(result.current.character.level).toBe(3)
    expect(result.current.character.xp).toBe(0)
    expect(result.current.character.maxXp).toBe(300)
  })

  it('레벨업 후 saveCharacter가 새 상태로 호출된다', async () => {
    const { saveCharacter } = await import('../utils/storage')
    const { result } = renderHook(() => useCharacter(makeCharacter()))
    act(() => { result.current.addXp(100) })
    expect(vi.mocked(saveCharacter)).toHaveBeenCalledWith(
      expect.objectContaining({ level: 2, xp: 0, maxXp: 200 })
    )
  })
})

describe('useCharacter — AC3: 레벨 3 상한', () => {
  beforeEach(() => vi.clearAllMocks())

  it('레벨 3에서 addXp 호출해도 레벨 유지', () => {
    const { result } = renderHook(() =>
      useCharacter(makeCharacter({ level: 3, xp: 0, maxXp: 300 }))
    )
    act(() => { result.current.addXp(300) })
    expect(result.current.character.level).toBe(3)
  })

  it('레벨 3에서 xp는 maxXp(300)에서 cap된다', () => {
    const { result } = renderHook(() =>
      useCharacter(makeCharacter({ level: 3, xp: 280, maxXp: 300 }))
    )
    act(() => { result.current.addXp(100) })
    expect(result.current.character.xp).toBe(300)
  })

  it('레벨 3에서 xp가 maxXp 미만이면 정상 증가', () => {
    const { result } = renderHook(() =>
      useCharacter(makeCharacter({ level: 3, xp: 0, maxXp: 300 }))
    )
    act(() => { result.current.addXp(50) })
    expect(result.current.character.xp).toBe(50)
    expect(result.current.character.level).toBe(3)
  })
})

describe('useCharacter — AC(5.5): didLevelUp / clearLevelUp', () => {
  beforeEach(() => vi.clearAllMocks())

  it('초기 didLevelUp=false', () => {
    const { result } = renderHook(() => useCharacter(makeCharacter()))
    expect(result.current.didLevelUp).toBe(false)
  })

  it('addXp로 레벨업 시 didLevelUp=true', () => {
    const { result } = renderHook(() => useCharacter(makeCharacter({ xp: 90, maxXp: 100 })))
    act(() => { result.current.addXp(10) })
    expect(result.current.didLevelUp).toBe(true)
    expect(result.current.character.level).toBe(2)
  })

  it('clearLevelUp() 호출 시 didLevelUp=false로 리셋', () => {
    const { result } = renderHook(() => useCharacter(makeCharacter({ xp: 90, maxXp: 100 })))
    act(() => { result.current.addXp(10) })
    expect(result.current.didLevelUp).toBe(true)
    act(() => { result.current.clearLevelUp() })
    expect(result.current.didLevelUp).toBe(false)
  })

  it('레벨업 없는 addXp에선 didLevelUp=false 유지', () => {
    const { result } = renderHook(() => useCharacter(makeCharacter({ xp: 0 })))
    act(() => { result.current.addXp(50) })
    expect(result.current.didLevelUp).toBe(false)
  })

  it('레벨 3에서 addXp 시에도 didLevelUp=false 유지 (최대 레벨)', () => {
    const { result } = renderHook(() =>
      useCharacter(makeCharacter({ level: 3, xp: 0, maxXp: 300 }))
    )
    act(() => { result.current.addXp(300) })
    expect(result.current.didLevelUp).toBe(false)
  })
})

describe('useCharacter — AC4: localStorage 동기화', () => {
  beforeEach(() => vi.clearAllMocks())

  it('addXp 호출마다 saveCharacter가 1회 호출된다', async () => {
    const { saveCharacter } = await import('../utils/storage')
    const { result } = renderHook(() => useCharacter(makeCharacter()))
    act(() => { result.current.addXp(30) })
    expect(vi.mocked(saveCharacter)).toHaveBeenCalledTimes(1)
    act(() => { result.current.addXp(20) })
    expect(vi.mocked(saveCharacter)).toHaveBeenCalledTimes(2)
  })

  it('saveCharacter가 최신 character 상태로 호출된다', async () => {
    const { saveCharacter } = await import('../utils/storage')
    const { result } = renderHook(() => useCharacter(makeCharacter()))
    act(() => { result.current.addXp(30) })
    expect(vi.mocked(saveCharacter)).toHaveBeenCalledWith(
      expect.objectContaining({ name: '구름이', xp: 30, level: 1 })
    )
  })
})

describe('useCharacter — AC(8.3): 캐릭터 전환', () => {
  beforeEach(() => vi.clearAllMocks())

  it('initialCharacter 이름이 바뀌면 상태가 새 캐릭터로 재설정된다', () => {
    const { result, rerender } = renderHook(
      ({ char }) => useCharacter(char),
      { initialProps: { char: makeCharacter({ name: '구름이', xp: 0 }) } }
    )
    act(() => { result.current.addXp(30) })
    expect(result.current.character.xp).toBe(30)

    rerender({ char: makeCharacter({ name: '햇살이', level: 2, xp: 50, maxXp: 200 }) })
    expect(result.current.character.name).toBe('햇살이')
    expect(result.current.character.level).toBe(2)
    expect(result.current.character.xp).toBe(50)
  })

  it('같은 이름이면 in-session XP가 보존된다 (리렌더로 reset 안 됨)', () => {
    const { result, rerender } = renderHook(
      ({ char }) => useCharacter(char),
      { initialProps: { char: makeCharacter({ name: '구름이', xp: 0 }) } }
    )
    act(() => { result.current.addXp(40) })
    expect(result.current.character.xp).toBe(40)
    // 동일 이름의 새 객체로 리렌더 — xp 유지되어야 함
    rerender({ char: makeCharacter({ name: '구름이', xp: 0 }) })
    expect(result.current.character.xp).toBe(40)
  })
})
