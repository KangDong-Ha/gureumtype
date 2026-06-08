import type { DifficultyLevel } from './game'

// 캐릭터 레벨 — 1→2→3 순서 진화
export type CharacterLevel = 1 | 2 | 3

// 캐릭터 감정 상태 — CloudCharacter 컴포넌트에서 사용
export type CharacterEmotion =
  | 'idle'          // 기본 floating 상태
  | 'typing-fast'   // WPM 목표 80% 이상
  | 'typing-slow'   // WPM 낮을 때 응원
  | 'level-up'      // 레벨업 연출 중
  | 'celebrate'     // 100타 달성 축하

// 캐릭터 핵심 상태 — localStorage에 저장
export interface CharacterState {
  name: string
  level: CharacterLevel
  xp: number
  maxXp: number
  difficulty: DifficultyLevel
}

// 스테이지별 진행 현황
export interface StageProgress {
  stageIndex: number
  completed: boolean
  bestWpm: number
}
