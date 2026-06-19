import type { CharacterState, StageProgress } from '../types'

// localStorage 키 네이밍 규칙: gureumtype:{entity}:{identifier}
const STORAGE_KEYS = {
  character: (name: string) => `gureumtype:character:${name}`,
  stageProgress: (characterName: string) => `gureumtype:stageprogress:${characterName}`,
  lastCharacterName: 'gureumtype:lastCharacterName',
} as const

// ── 캐릭터 저장/불러오기/삭제 ──────────────────────────────────────────────

export function saveCharacter(data: CharacterState): void {
  // 빈 이름(DUMMY 등)은 고스트 캐릭터 키를 만들 수 있으므로 저장하지 않음
  if (!data.name) return
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

// 저장된 모든 캐릭터 이름 열거 — localStorage 키 스캔 (인덱스 불필요, 레거시 데이터 안전)
export function loadAllCharacterNames(): string[] {
  try {
    const prefix = 'gureumtype:character:'
    const names: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        names.push(key.slice(prefix.length))
      }
    }
    return names.sort()
  } catch {
    console.warn('[storage] loadAllCharacterNames 실패')
    return []
  }
}

// 저장된 모든 캐릭터 객체 — 손상/누락 항목은 제외
export function loadAllCharacters(): CharacterState[] {
  return loadAllCharacterNames()
    .map((name) => loadCharacter(name))
    .filter((c): c is CharacterState => c !== null)
}

// 캐릭터 완전 삭제 — 캐릭터 + 진행현황 제거, 활성 캐릭터였으면 lastCharacterName도 정리
export function deleteCharacter(name: string): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.character(name))
    localStorage.removeItem(STORAGE_KEYS.stageProgress(name))
    if (loadLastCharacterName() === name) {
      const remaining = loadAllCharacterNames()
      if (remaining.length > 0) {
        saveLastCharacterName(remaining[0])
      } else {
        localStorage.removeItem(STORAGE_KEYS.lastCharacterName)
      }
    }
  } catch {
    console.warn('[storage] deleteCharacter 실패:', name)
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
