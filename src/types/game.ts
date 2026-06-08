// 화면 라우팅 — App.tsx에서 useState<ScreenName>으로 사용
export type ScreenName = 'welcome' | 'home' | 'game' | 'result'

// 난이도 — 콘텐츠 JSON 필터링, 캐릭터 저장에 사용
export type DifficultyLevel = 'easy' | 'hard'

// 게임 진행 상태
export type GameStatus = 'idle' | 'playing' | 'completed'

// 게임 상태 — useGameState 훅의 state 타입
export interface GameState {
  status: GameStatus
  currentText: string       // 현재 타이핑 대상 문장
  userInput: string         // 사용자 입력 누적
  currentIndex: number      // 현재 판정 위치
  correctCount: number      // 정타 수
  errorCount: number        // 오타 수
  startTime: number | null  // 게임 시작 타임스탬프 (ms)
  wpm: number               // 현재 WPM
  accuracy: number          // 현재 정확도 (0~100)
  goalReached: boolean      // 100타 달성 여부 (한 스테이지 내 1회 트리거)
}

// 게임 액션 — discriminated union, useReducer에서 사용
export type GameAction =
  | { type: 'START_STAGE'; payload: { text: string } }
  | { type: 'KEY_INPUT'; payload: { char: string } } // isCorrect는 reducer 내부에서 currentText[currentIndex]와 비교하여 계산
  | { type: 'COMPLETE_STAGE' }
  | { type: 'GOAL_REACHED' }
  | { type: 'RESET' }
