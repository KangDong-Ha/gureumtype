import type { DifficultyLevel } from '../types/game'
import type { CharacterState } from '../types'
import { STAGES_PER_DIFFICULTY } from '../constants/game'
import { getStageContent } from '../utils/contentLoader'
import { StageCard } from '../components/game/StageCard'
import { GrowthBar } from '../components/game/GrowthBar'

interface ResultScreenProps {
  wpm: number
  accuracy: number
  stageIndex: number
  difficulty: DifficultyLevel
  character: CharacterState | null
  xpGained?: number
  completedStagesCount?: number
  onNextStage: () => void
  onRetry: () => void
  onHome: () => void
}

export function ResultScreen({
  wpm,
  accuracy,
  stageIndex,
  difficulty,
  character,
  xpGained,
  completedStagesCount,
  onNextStage,
  onRetry,
  onHome,
}: ResultScreenProps) {
  const isLastStage = stageIndex === STAGES_PER_DIFFICULTY - 1
  const item = getStageContent(difficulty, stageIndex)

  return (
    <div className="text-center flex flex-col items-center gap-6 py-8" data-testid="result-screen">
      <h2 className="text-2xl font-noto font-bold text-cloud-primary-dark">스테이지 완료! 🎉</h2>

      <div className="flex gap-8">
        <div className="flex flex-col items-center">
          <span className="text-cloud-text-light font-noto text-sm mb-1">타수</span>
          <span
            className="text-4xl font-bold font-noto text-cloud-primary-dark"
            data-testid="result-wpm"
          >
            {wpm}
          </span>
          <span className="text-cloud-text-light font-noto text-xs">WPM</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-cloud-text-light font-noto text-sm mb-1">정확도</span>
          <span
            className="text-4xl font-bold font-noto text-cloud-success"
            data-testid="result-accuracy"
          >
            {accuracy}%
          </span>
        </div>
      </div>

      <StageCard text={item?.text ?? ''} meaning={item?.meaning ?? null} />

      {completedStagesCount !== undefined && (
        <p data-testid="stage-progress" className="text-xs text-cloud-text-light font-noto">
          스테이지 {completedStagesCount} / {STAGES_PER_DIFFICULTY} 완료
        </p>
      )}

      {character && (
        <div className="w-full max-w-xs" data-testid="growth-bar-container">
          <p className="text-xs text-cloud-text-light font-noto mb-1 text-left">
            Lv.{character.level} {character.xp} / {character.maxXp} XP
          </p>
          {xpGained !== undefined && xpGained > 0 && (
            <p data-testid="xp-gained" className="text-sm font-bold text-cloud-primary-dark font-noto mb-1">
              +{xpGained} XP
            </p>
          )}
          <GrowthBar xp={character.xp} maxXp={character.maxXp} level={character.level} animateEntry />
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {isLastStage ? (
          <button
            type="button"
            onClick={onHome}
            className="bg-gray-200 text-gray-700 font-noto font-semibold py-3 px-6 rounded-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2"
          >
            홈으로
          </button>
        ) : (
          <button
            type="button"
            onClick={onNextStage}
            className="bg-cloud-primary-dark text-white font-noto font-semibold py-3 px-6 rounded-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2"
          >
            다음 스테이지
          </button>
        )}
        <button
          type="button"
          onClick={onRetry}
          className="bg-cloud-secondary text-cloud-text font-noto font-semibold py-3 px-6 rounded-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2"
        >
          다시 하기
        </button>
      </div>
    </div>
  )
}
