import { useState, useCallback } from 'react'
import type { ScreenName, DifficultyLevel } from './types/game'
import {
  loadLastCharacterName,
  loadCharacter,
  saveCharacter,
  saveLastCharacterName,
  saveStageProgress,
  loadStageProgress,
} from './utils/storage'
import type { StageProgress, CharacterState } from './types'
import { useCharacter } from './hooks/useCharacter'
import { XP_PER_STAGE } from './constants/game'
import WelcomeScreen from './screens/WelcomeScreen'
import CharacterSelectScreen from './screens/CharacterSelectScreen'
import LandingScreen from './screens/LandingScreen'
import HomeScreen from './screens/HomeScreen'
import { GameScreen } from './screens/GameScreen'
import { ResultScreen } from './screens/ResultScreen'
import { LevelUpOverlay } from './components/character/LevelUpOverlay'
import { CelebrationOverlay } from './components/achievement/CelebrationOverlay'
import KeyboardNotice from './components/common/KeyboardNotice'

const DUMMY_CHARACTER: CharacterState = { name: '', level: 1, xp: 0, maxXp: 100, difficulty: 'easy' }

function getInitialAppData(): {
  screen: ScreenName
  characterName: string
  difficulty: DifficultyLevel
} {
  const lastName = loadLastCharacterName()
  if (!lastName) return { screen: 'welcome', characterName: '', difficulty: 'easy' }
  const character = loadCharacter(lastName)
  if (!character) return { screen: 'welcome', characterName: '', difficulty: 'easy' }
  return {
    screen: 'landing',
    characterName: character.name,
    difficulty: character.difficulty,
  }
}

function App() {
  const [screen, setScreen] = useState<ScreenName>(() => getInitialAppData().screen)
  const [pendingCharacterName, setPendingCharacterName] = useState<string>(
    () => getInitialAppData().characterName
  )
  const [pendingDifficulty, setPendingDifficulty] = useState<DifficultyLevel>(
    () => getInitialAppData().difficulty
  )
  const [pendingStageIndex, setPendingStageIndex] = useState(0)
  const [pendingResult, setPendingResult] = useState({ wpm: 0, accuracy: 100 })
  const [pendingStageProgress, setPendingStageProgress] = useState<StageProgress[]>(() => {
    const lastName = loadLastCharacterName()
    if (!lastName) return []
    return loadStageProgress(lastName)
  })
  const [pendingCharacter, setPendingCharacter] = useState<CharacterState | null>(() => {
    const lastName = loadLastCharacterName()
    if (!lastName) return null
    return loadCharacter(lastName)
  })

  const { character: liveCharacter, addXp, didLevelUp, clearLevelUp } = useCharacter(
    pendingCharacter ?? DUMMY_CHARACTER
  )

  const [showCelebration, setShowCelebration] = useState(false)

  // 저장된 캐릭터를 활성화(마지막 캐릭터로 지정)하고 관련 상태를 모두 동기화
  const activateCharacter = useCallback((name: string): boolean => {
    const character = loadCharacter(name)
    if (!character) return false
    saveLastCharacterName(name)
    setPendingCharacter(character)
    setPendingCharacterName(name)
    setPendingDifficulty(character.difficulty)
    setPendingStageProgress(loadStageProgress(name))
    setPendingStageIndex(0)
    return true
  }, [])

  // 환영 흐름(이름입력·랜딩·캐릭터선택)에만 배경 이미지, 게임/홈/결과는 가독성을 위해 기존 배경 유지
  const showBackdrop = screen === 'welcome' || screen === 'landing' || screen === 'select'

  const handleGoalReached = useCallback(() => setShowCelebration(true), [])
  const handleCelebrationDismiss = useCallback(() => setShowCelebration(false), [])
  const handleGameComplete = useCallback(
    (wpm: number, accuracy: number) => {
      const existingEntry = pendingStageProgress.find(
        (s) => s.stageIndex === pendingStageIndex
      )
      const newEntry: StageProgress = {
        stageIndex: pendingStageIndex,
        completed: true,
        bestWpm: existingEntry ? Math.max(existingEntry.bestWpm, wpm) : wpm,
      }
      const newProgress = existingEntry
        ? pendingStageProgress.map((s) =>
            s.stageIndex === pendingStageIndex ? newEntry : s
          )
        : [...pendingStageProgress, newEntry]
      saveStageProgress(pendingCharacterName, newProgress)
      setPendingStageProgress(newProgress)
      setPendingResult({ wpm, accuracy })
      addXp(XP_PER_STAGE)
      setShowCelebration(false)
      setScreen('result')
    },
    [pendingStageProgress, pendingStageIndex, pendingCharacterName, addXp],
  )

  return (
    <div
      className="min-h-screen bg-cloud-sky bg-cover bg-center bg-no-repeat overflow-x-hidden"
      style={showBackdrop ? { backgroundImage: "url('/background.jpg')" } : undefined}
      data-testid="app-root"
    >
      <div className="max-w-[480px] mx-auto px-5 py-6" data-testid="app-container">
        <KeyboardNotice />
        {didLevelUp && pendingCharacter && (
          <LevelUpOverlay
            level={liveCharacter.level}
            name={liveCharacter.name}
            onDismiss={clearLevelUp}
          />
        )}
        {showCelebration && (
          <CelebrationOverlay onDismiss={handleCelebrationDismiss} />
        )}
        {screen === 'welcome' && (
          <WelcomeScreen
            onNext={(name, difficulty) => {
              const character = { name, level: 1 as const, xp: 0, maxXp: 100, difficulty }
              saveCharacter(character)
              saveLastCharacterName(name)
              saveStageProgress(name, [])
              setPendingCharacter(character)
              setPendingCharacterName(name)
              setPendingDifficulty(difficulty)
              setPendingStageProgress([])
              setPendingStageIndex(0)
              setScreen('landing')
            }}
          />
        )}
        {screen === 'landing' && pendingCharacter && (
          <LandingScreen
            character={liveCharacter}
            onStart={() => setScreen('home')}
            onRestart={() => setScreen('select')}
          />
        )}
        {screen === 'select' && (
          <CharacterSelectScreen
            onSelect={(name) => {
              if (activateCharacter(name)) setScreen('landing')
            }}
            onCreateNew={() => setScreen('welcome')}
            onBack={() => {
              // 뒤로: 활성 캐릭터를 저장소에서 재로드 (선택 화면에서 삭제가 있었을 수 있음)
              const name = loadLastCharacterName()
              if (name && activateCharacter(name)) {
                setScreen('landing')
              } else {
                setScreen('welcome')
              }
            }}
          />
        )}
        {screen === 'home' && (
          <HomeScreen
            onNavigate={setScreen}
            onStartStage={(idx) => {
              setPendingStageIndex(idx)
              setScreen('game')
            }}
            characterName={pendingCharacterName}
            difficulty={pendingDifficulty}
            completedStages={pendingStageProgress}
            character={pendingCharacter}
          />
        )}
        {screen === 'game' && (
          <GameScreen
            onComplete={handleGameComplete}
            onGoalReached={handleGoalReached}
            difficulty={pendingDifficulty}
            stageIndex={pendingStageIndex}
            character={pendingCharacter}
          />
        )}
        {screen === 'result' && (
          <ResultScreen
            wpm={pendingResult.wpm}
            accuracy={pendingResult.accuracy}
            stageIndex={pendingStageIndex}
            difficulty={pendingDifficulty}
            character={pendingCharacter ? liveCharacter : null}
            xpGained={XP_PER_STAGE}
            completedStagesCount={pendingStageProgress.filter((s) => s.completed).length}
            onNextStage={() => {
              setPendingStageIndex((prev) => Math.min(prev + 1, 9))
              setScreen('game')
            }}
            onRetry={() => setScreen('game')}
            onHome={() => setScreen('home')}
          />
        )}
      </div>
    </div>
  )
}

export default App
