/**
 * 타이핑 엔진 유틸리티 — WPM / 정확도 계산
 * Story 3.4(WpmDisplay)에서 추가 함수 확장 예정
 */

/**
 * WPM 계산 (타수/분 — 한글 타이핑 기준, 개별 문자 카운트)
 * @param correctChars 정타 문자 수
 * @param elapsedMs 경과 시간 (ms)
 */
export function calculateWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  return Math.round(correctChars / (elapsedMs / 60_000))
}

/**
 * 정확도 계산 (0~100 정수)
 * @param correctCount 정타 수
 * @param totalCount 전체 입력 시도 수 (정타 + 오타)
 */
export function calculateAccuracy(correctCount: number, totalCount: number): number {
  if (totalCount === 0) return 100
  return Math.round((correctCount / totalCount) * 100)
}
