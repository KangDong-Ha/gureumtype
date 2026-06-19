import { useState, useEffect, useCallback, useRef } from 'react'
import type { DifficultyLevel } from '../types/game'
import type { CharacterState, CharacterEmotion } from '../types'
import { useGameState } from '../hooks/useGameState'
import { TypingLine } from '../components/game/TypingLine'
import { WpmDisplay } from '../components/game/WpmDisplay'
import { CloudCharacter } from '../components/character/CloudCharacter'
import { StageClearEffect } from '../components/achievement/StageClearEffect'
import { getStageContent } from '../utils/contentLoader'
import { GOAL_WPM } from '../constants/game'

const IDLE_TIMEOUT_MS = 2000

export interface GameScreenProps {
  onComplete: (wpm: number, accuracy: number) => void
  onGoalReached?: () => void
  difficulty: DifficultyLevel
  stageIndex: number
  character?: CharacterState | null
  className?: string
}

export function GameScreen({ onComplete, onGoalReached, difficulty, stageIndex, character, className = '' }: GameScreenProps) {
  const { state, dispatch } = useGameState()
  const [hasErrorAtCursor, setHasErrorAtCursor] = useState(false)
  const [emotion, setEmotion] = useState<CharacterEmotion>('idle')
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearEffectStartedRef = useRef(false)
  const [showClearEffect, setShowClearEffect] = useState(false)

  const currentText = getStageContent(difficulty, stageIndex)?.text ?? ''

  useEffect(() => {
    dispatch({ type: 'START_STAGE', payload: { text: currentText } })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyCommit = useCallback(
    (char: string) => {
      if (state.status !== 'playing') return
      if (state.currentIndex >= state.currentText.length) return
      const expected = state.currentText[state.currentIndex]
      setHasErrorAtCursor(char !== expected)
      dispatch({ type: 'KEY_INPUT', payload: { char } })
    },
    [state, dispatch],
  )

  useEffect(() => {
    if (
      state.status === 'playing' &&
      state.currentText.length > 0 &&
      state.currentIndex >= state.currentText.length
    ) {
      setHasErrorAtCursor(false)
      dispatch({ type: 'COMPLETE_STAGE' })
    }
  }, [state.currentIndex, state.currentText.length, state.status, dispatch])

  useEffect(() => {
    if (state.status === 'completed' && !clearEffectStartedRef.current) {
      clearEffectStartedRef.current = true
      setShowClearEffect(true)
    }
  }, [state.status])

  const handleClearEffectComplete = useCallback(() => {
    setShowClearEffect(false)
    onComplete(state.wpm, state.accuracy)
  }, [onComplete, state.wpm, state.accuracy])

  const onGoalReachedRef = useRef(onGoalReached)
  useEffect(() => { onGoalReachedRef.current = onGoalReached })
  useEffect(() => {
    if (state.goalReached) onGoalReachedRef.current?.()
  }, [state.goalReached])

  useEffect(() => {
    if (state.status !== 'playing') {
      setEmotion('idle')
      return
    }
    if (state.wpm >= GOAL_WPM * 0.8) {
      setEmotion('typing-fast')
    } else if (state.wpm > 0) {
      setEmotion('typing-slow')
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => setEmotion('idle'), IDLE_TIMEOUT_MS)
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [state.wpm, state.status])

  return (
    <div data-testid="game-screen" className={`flex flex-col items-center gap-8 py-8 ${className}`}>
      {character && (
        <CloudCharacter level={character.level} name={character.name} emotion={emotion} />
      )}
      {state.currentText && (
        <TypingLine
          key="stage-0"
          currentText={state.currentText}
          currentIndex={state.currentIndex}
          userInput={state.userInput}
          hasErrorAtCursor={hasErrorAtCursor}
          onKeyCommit={handleKeyCommit}
          disabled={state.status !== 'playing'}
        />
      )}
      <WpmDisplay
        wpm={state.wpm}
        accuracy={state.accuracy}
        goalReached={state.goalReached}
      />
      {showClearEffect && (
        <StageClearEffect onComplete={handleClearEffectComplete} />
      )}
    </div>
  )
}
