import { useReducer } from 'react'
import type { GameState, GameAction } from '../types/game'
import { calculateWpm, calculateAccuracy } from '../utils/typingEngine'

export const INITIAL_STATE: GameState = {
  status: 'idle',
  currentText: '',
  userInput: '',
  currentIndex: 0,
  correctCount: 0,
  errorCount: 0,
  startTime: null,
  wpm: 0,
  accuracy: 100,
  goalReached: false,
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_STAGE':
      return {
        ...INITIAL_STATE,
        status: 'playing',
        currentText: action.payload.text,
        startTime: Date.now(),
      }

    case 'KEY_INPUT': {
      if (state.status !== 'playing') return state
      // P2: currentIndex overflow 가드 — 문장 완료 후 IME 잔류 commit 등이 들어와도 오염 방지
      if (state.currentIndex >= state.currentText.length) return state

      const { char } = action.payload
      const expected = state.currentText[state.currentIndex]
      const isCorrect = char === expected

      const newCorrectCount = isCorrect ? state.correctCount + 1 : state.correctCount
      const newErrorCount   = isCorrect ? state.errorCount : state.errorCount + 1
      const newIndex        = isCorrect ? state.currentIndex + 1 : state.currentIndex
      const newUserInput    = isCorrect ? state.userInput + char : state.userInput

      const elapsedMs     = state.startTime ? Date.now() - state.startTime : 0
      const totalAttempts = newCorrectCount + newErrorCount
      const wpm           = calculateWpm(newCorrectCount, elapsedMs)
      const accuracy      = calculateAccuracy(newCorrectCount, totalAttempts)
      // goalReached: 한 스테이지 내 최초 1회만 — one-shot 플래그
      const goalReached   = state.goalReached || wpm >= 100

      return {
        ...state,
        currentIndex: newIndex,
        correctCount: newCorrectCount,
        errorCount:   newErrorCount,
        userInput:    newUserInput,
        wpm,
        accuracy,
        goalReached,
      }
    }

    case 'COMPLETE_STAGE': {
      if (state.status !== 'playing') return state
      // P1: 마지막 KEY_INPUT에서 계산된 wpm/accuracy를 그대로 사용
      // → COMPLETE_STAGE 시점의 fresh Date.now()로 재계산 시 표시값보다 낮아지는 버그 방지
      return {
        ...state,
        status: 'completed',
      }
    }

    case 'GOAL_REACHED':
      return { ...state, goalReached: true }

    case 'RESET':
      return INITIAL_STATE

    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)
  return { state, dispatch }
}
