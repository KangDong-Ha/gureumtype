import type { CharacterState } from '../types'
import { CloudCharacter } from '../components/character/CloudCharacter'
import { GrowthBar } from '../components/game/GrowthBar'
import { PrivacyBadge } from '../components/common/PrivacyBadge'

interface LandingScreenProps {
  character: CharacterState
  onStart: () => void
  onRestart: () => void
}

function LandingScreen({ character, onStart, onRestart }: LandingScreenProps) {
  return (
    <div className="text-center flex flex-col items-center" data-testid="landing-screen">
      <p className="text-2xl font-bold text-cloud-primary-dark font-noto mb-4">
        안녕, {character.name}! 👋
      </p>

      <CloudCharacter level={character.level} name={character.name} />

      <div className="w-full mt-6 mb-2" data-testid="landing-growth">
        <p className="text-sm text-cloud-text-light font-noto mb-1 text-left">
          Lv.{character.level} {character.xp} / {character.maxXp} XP
        </p>
        <GrowthBar xp={character.xp} maxXp={character.maxXp} level={character.level} />
      </div>

      <button
        type="button"
        data-testid="landing-start"
        onClick={onStart}
        className="w-full mt-6 bg-cloud-primary-dark text-white font-noto font-bold py-3 rounded-xl text-lg min-h-[44px] hover:opacity-90 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2"
      >
        시작하기 ▶
      </button>

      <button
        type="button"
        data-testid="landing-restart"
        onClick={onRestart}
        className="mt-3 text-sm text-cloud-text-light font-noto underline underline-offset-2 min-h-[44px] px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2 rounded"
      >
        캐릭터 변경
      </button>

      <PrivacyBadge />
    </div>
  )
}

export default LandingScreen
