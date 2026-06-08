import type { DifficultyLevel } from './game'

// 콘텐츠 종류 — content-ko.json의 type 필드
export type ContentType =
  | 'proverb'  // 속담 (hard)
  | 'quote'    // 명언 (easy/hard)
  | 'poem'     // 동시 (easy)

// 언어 모드 — Phase 2 한글/영문 전환 대비
export type LanguageMode = 'ko' | 'en'

// 콘텐츠 단일 항목 — content-ko.json의 배열 요소
export interface ContentItem {
  id: string             // 고유 식별자 (예: "ko-easy-001")
  text: string           // 타이핑 대상 문장
  type: ContentType      // 콘텐츠 종류
  meaning: string | null // 속담/명언 뜻 (동시는 null)
}

// 전체 콘텐츠 컬렉션 — DifficultyLevel 키로 타입 강제
// DifficultyLevel이 확장되면 ContentCollection도 자동으로 강제됨
export type ContentCollection = Record<DifficultyLevel, ContentItem[]>
