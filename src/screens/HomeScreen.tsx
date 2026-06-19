import type { ScreenName, DifficultyLevel } from '../types/game'
import type { StageProgress, CharacterState } from '../types'
import { STAGES_PER_DIFFICULTY } from '../constants/game'
import { GrowthBar } from '../components/game/GrowthBar'
import { CloudCharacter } from '../components/character/CloudCharacter'
import { PrivacyBadge } from '../components/common/PrivacyBadge'

interface HomeScreenProps {
  onNavigate: (screen: ScreenName) => void
  onStartStage: (stageIndex: number) => void
  characterName: string
  difficulty: DifficultyLevel
  completedStages: StageProgress[]
  character: CharacterState | null
}

function HomeScreen({
  onNavigate: _onNavigate,
  onStartStage,
  characterName,
  difficulty,
  completedStages,
  character,
}: HomeScreenProps) {
  const currentStageIndex = completedStages.filter((s) => s.completed).length

  return (
    <div className="text-center" data-testid="home-screen">
      {characterName && (
        <p className="text-cloud-primary-dark font-noto font-semibold mb-2">
          안녕, {characterName}! 👋
        </p>
      )}
      <p
        className="text-cloud-text-light font-noto mb-4"
        data-testid="difficulty-display"
      >
        난이도: {difficulty === 'easy' ? '쉬움' : '어려움'}
      </p>

      {character && (
        <div className="flex flex-col items-center mt-4 mb-2">
          <CloudCharacter level={character.level} name={character.name} />
          <div className="w-full mt-2" data-testid="growth-bar-container">
            <p className="text-xs text-cloud-text-light font-noto mb-1 text-left">
              Lv.{character.level} {character.xp} / {character.maxXp} XP
            </p>
            <GrowthBar xp={character.xp} maxXp={character.maxXp} level={character.level} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-3 mt-4" data-testid="stage-map">
        {Array.from({ length: STAGES_PER_DIFFICULTY }, (_, index) => {
          const isCompleted = index < currentStageIndex
          const isCurrent = index === currentStageIndex
          const isLocked = index > currentStageIndex

          let bgClass = ''
          if (isCompleted) bgClass = 'bg-cloud-success text-white'
          else if (isCurrent) bgClass = 'bg-cloud-primary-dark text-white animate-pulse'
          else bgClass = 'bg-gray-200 opacity-50 text-gray-400'

          return (
            <button
              key={index}
              type="button"
              data-testid={`stage-btn-${index}`}
              disabled={isLocked}
              onClick={() => onStartStage(index)}
              className={`${bgClass} rounded-lg font-noto font-bold min-w-[44px] min-h-[44px] flex items-center justify-center mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2`}
            >
              {isCompleted ? '✓' : index + 1}
            </button>
          )
        })}
      </div>
      <PrivacyBadge />
    </div>
  )
}

export default HomeScreen
