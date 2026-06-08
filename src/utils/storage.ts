import type { CharacterState, StageProgress } from '../types'

// localStorage 키 네이밍 규칙: gureumtype:{entity}:{identifier}
const STORAGE_KEYS = {
  character: (name: string) => `gureumtype:character:${name}`,
  stageProgress: (characterName: string) => `gureumtype:stageprogress:${characterName}`,
  lastCharacterName: 'gureumtype:lastCharacterName',
} as const

// ── 캐릭터 저장/불러오기/삭제 ──────────────────────────────────────────────

export function saveCharacter(data: CharacterState): void {
  try {
    const key = STORAGE_KEYS.character(data.name)
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // localStorage 실패 시 조용히 처리 — 게임 진행 방해 금지
    console.warn('[storage] saveCharacter 실패:', data.name)
  }
}

export function loadCharacter(name: string): CharacterState | null {
  try {
    const key = STORAGE_KEYS.character(name)
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as CharacterState
  } catch {
    console.warn('[storage] loadCharacter 실패:', name)
    return null
  }
}

export function clearCharacter(name: string): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.character(name))
  } catch {
    console.warn('[storage] clearCharacter 실패:', name)
  }
}

// ── 스테이지 진행 현황 저장/불러오기 ───────────────────────────────────────

export function saveStageProgress(characterName: string, progress: StageProgress[]): void {
  try {
    const key = STORAGE_KEYS.stageProgress(characterName)
    localStorage.setItem(key, JSON.stringify(progress))
  } catch {
    console.warn('[storage] saveStageProgress 실패:', characterName)
  }
}

export function loadStageProgress(characterName: string): StageProgress[] {
  try {
    const key = STORAGE_KEYS.stageProgress(characterName)
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as StageProgress[]
  } catch {
    console.warn('[storage] loadStageProgress 실패:', characterName)
    return []
  }
}

// ── 마지막 캐릭터 이름 저장/불러오기 ───────────────────────────────────────
// 앱 최초 로드 시 저장된 캐릭터 존재 여부 확인에 사용

export function saveLastCharacterName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.lastCharacterName, name)
  } catch {
    console.warn('[storage] saveLastCharacterName 실패')
  }
}

export function loadLastCharacterName(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.lastCharacterName)
  } catch {
    return null
  }
}
