import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { gameReducer, INITIAL_STATE, useGameState } from './useGameState'
import type { GameState } from '../types/game'

// ──────────────────────────────────────────
// gameReducer 단위 테스트 (순수 함수 직접 테스트)
// ──────────────────────────────────────────

describe('gameReducer — INITIAL_STATE', () => {
  it('status idle, 모든 카운터 0, startTime null', () => {
    expect(INITIAL_STATE.status).toBe('idle')
    expect(INITIAL_STATE.currentIndex).toBe(0)
    expect(INITIAL_STATE.correctCount).toBe(0)
    expect(INITIAL_STATE.errorCount).toBe(0)
    expect(INITIAL_STATE.startTime).toBeNull()
    expect(INITIAL_STATE.goalReached).toBe(false)
    expect(INITIAL_STATE.accuracy).toBe(100)
  })
})

describe('gameReducer — START_STAGE', () => {
  it('AC1: status playing, currentText 설정, 카운터 초기화', () => {
    const next = gameReducer(INITIAL_STATE, {
      type: 'START_STAGE',
      payload: { text: '안녕하세요' },
    })
    expect(next.status).toBe('playing')
    expect(next.currentText).toBe('안녕하세요')
    expect(next.currentIndex).toBe(0)
    expect(next.correctCount).toBe(0)
    expect(next.errorCount).toBe(0)
    expect(next.userInput).toBe('')
    expect(next.startTime).not.toBeNull()
  })

  it('AC1: 이전 상태에서 재시작 시 완전 초기화', () => {
    const mid: GameState = {
      ...INITIAL_STATE,
      status: 'playing',
      currentText: '이전문장',
      currentIndex: 3,
      correctCount: 3,
      errorCount: 1,
      userInput: '이전문',
      goalReached: true,
    }
    const next = gameReducer(mid, {
      type: 'START_STAGE',
      payload: { text: '새문장' },
    })
    expect(next.currentText).toBe('새문장')
    expect(next.currentIndex).toBe(0)
    expect(next.correctCount).toBe(0)
    expect(next.errorCount).toBe(0)
    expect(next.userInput).toBe('')
    expect(next.goalReached).toBe(false)
  })
})

describe('gameReducer — KEY_INPUT', () => {
  const playingState = gameReducer(INITIAL_STATE, {
    type: 'START_STAGE',
    payload: { text: '안녕' },
  })

  it('AC2: 정타 → currentIndex 전진, correctCount 증가, userInput 누적', () => {
    const next = gameReducer(playingState, {
      type: 'KEY_INPUT',
      payload: { char: '안' },
    })
    expect(next.currentIndex).toBe(1)
    expect(next.correctCount).toBe(1)
    expect(next.errorCount).toBe(0)
    expect(next.userInput).toBe('안')
  })

  it('AC2: 오타 → currentIndex 유지, errorCount 증가, userInput 유지', () => {
    const next = gameReducer(playingState, {
      type: 'KEY_INPUT',
      payload: { char: 'x' },
    })
    expect(next.currentIndex).toBe(0)
    expect(next.correctCount).toBe(0)
    expect(next.errorCount).toBe(1)
    expect(next.userInput).toBe('')
  })

  it('AC2: status !== playing → 상태 변경 없음 (early return)', () => {
    const idleNext = gameReducer(INITIAL_STATE, {
      type: 'KEY_INPUT',
      payload: { char: '안' },
    })
    expect(idleNext).toBe(INITIAL_STATE) // 동일 참조
  })

  it('AC2: 불변성 — 새 state 객체 반환 (스프레드)', () => {
    const next = gameReducer(playingState, {
      type: 'KEY_INPUT',
      payload: { char: '안' },
    })
    expect(next).not.toBe(playingState)
  })

  it('AC2: wpm, accuracy 재계산됨 (0 이상)', () => {
    const next = gameReducer(playingState, {
      type: 'KEY_INPUT',
      payload: { char: '안' },
    })
    expect(next.wpm).toBeGreaterThanOrEqual(0)
    expect(next.accuracy).toBeGreaterThanOrEqual(0)
    expect(next.accuracy).toBeLessThanOrEqual(100)
  })
})

describe('gameReducer — COMPLETE_STAGE', () => {
  it('AC3: status completed 전환', () => {
    const playing = gameReducer(INITIAL_STATE, {
      type: 'START_STAGE',
      payload: { text: '테스트' },
    })
    const next = gameReducer(playing, { type: 'COMPLETE_STAGE' })
    expect(next.status).toBe('completed')
  })

  it('AC3: COMPLETE_STAGE wpm/accuracy가 마지막 KEY_INPUT 값과 동일', () => {
    const playing = gameReducer(INITIAL_STATE, {
      type: 'START_STAGE',
      payload: { text: '테스트' },
    })
    const afterInput = gameReducer(playing, {
      type: 'KEY_INPUT',
      payload: { char: '테' },
    })
    const completed = gameReducer(afterInput, { type: 'COMPLETE_STAGE' })
    // P1 patch: COMPLETE_STAGE는 마지막 KEY_INPUT wpm/accuracy를 그대로 유지
    expect(completed.wpm).toBe(afterInput.wpm)
    expect(completed.accuracy).toBe(afterInput.accuracy)
    expect(completed.status).toBe('completed')
  })

  it('AC3: status !== playing → 상태 변경 없음', () => {
    const result = gameReducer(INITIAL_STATE, { type: 'COMPLETE_STAGE' })
    expect(result).toBe(INITIAL_STATE)
  })

  it('P2: KEY_INPUT currentIndex overflow 가드 — 문장 완료 후 추가 입력 무시', () => {
    // currentIndex가 currentText.length와 같을 때 (문장 끝)
    const atEnd: GameState = {
      ...INITIAL_STATE,
      status: 'playing',
      currentText: '안',
      currentIndex: 1, // length === 1, overflow
      correctCount: 1,
      errorCount: 0,
      userInput: '안',
      startTime: Date.now() - 10_000,
      wpm: 6,
      accuracy: 100,
    }
    const next = gameReducer(atEnd, { type: 'KEY_INPUT', payload: { char: '녕' } })
    expect(next).toBe(atEnd) // 동일 참조 — 상태 변경 없음
  })
})

describe('gameReducer — GOAL_REACHED / goalReached one-shot', () => {
  it('AC4: GOAL_REACHED 액션 → goalReached true', () => {
    const playing = gameReducer(INITIAL_STATE, {
      type: 'START_STAGE',
      payload: { text: '테스트' },
    })
    const next = gameReducer(playing, { type: 'GOAL_REACHED' })
    expect(next.goalReached).toBe(true)
  })

  it('AC4: KEY_INPUT wpm >= 100 → goalReached true (one-shot)', () => {
    // startTime을 1분 전으로 설정, correctCount 99 → 100번째 정타 시 wpm=100
    const stateNearGoal: GameState = {
      ...INITIAL_STATE,
      status: 'playing',
      currentText: 'ㄱ',
      currentIndex: 0,
      correctCount: 99,
      errorCount: 0,
      startTime: Date.now() - 60_000, // 1분 경과 → 100타 → 100 WPM
      goalReached: false,
      userInput: '',
      wpm: 0,
      accuracy: 100,
    }
    const next = gameReducer(stateNearGoal, {
      type: 'KEY_INPUT',
      payload: { char: 'ㄱ' },
    })
    expect(next.goalReached).toBe(true)
  })

  it('AC4: goalReached already true → KEY_INPUT 후에도 true (중복 트리거 없음)', () => {
    const stateAlreadyReached: GameState = {
      ...INITIAL_STATE,
      status: 'playing',
      currentText: 'ㄱㄴ',
      currentIndex: 0,
      correctCount: 100,
      errorCount: 0,
      startTime: Date.now() - 60_000,
      goalReached: true,
      userInput: '',
      wpm: 100,
      accuracy: 100,
    }
    const next = gameReducer(stateAlreadyReached, {
      type: 'KEY_INPUT',
      payload: { char: 'ㄱ' },
    })
    expect(next.goalReached).toBe(true)
  })
})

describe('gameReducer — RESET', () => {
  it('AC4: RESET → INITIAL_STATE 완전 복원', () => {
    const playing = gameReducer(INITIAL_STATE, {
      type: 'START_STAGE',
      payload: { text: '테스트' },
    })
    const reset = gameReducer(playing, { type: 'RESET' })
    expect(reset).toBe(INITIAL_STATE) // 동일 참조 (INITIAL_STATE 그대로 반환)
  })
})

// ──────────────────────────────────────────
// useGameState Hook smoke test
// ──────────────────────────────────────────

describe('useGameState hook', () => {
  it('초기 state.status === idle', () => {
    const { result } = renderHook(() => useGameState())
    expect(result.current.state.status).toBe('idle')
  })

  it('dispatch START_STAGE → state.status playing', () => {
    const { result } = renderHook(() => useGameState())
    act(() => {
      result.current.dispatch({
        type: 'START_STAGE',
        payload: { text: '테스트' },
      })
    })
    expect(result.current.state.status).toBe('playing')
    expect(result.current.state.currentText).toBe('테스트')
  })
})
