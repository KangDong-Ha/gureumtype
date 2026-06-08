import type { ScreenName } from '../types/game'

interface HomeScreenProps {
  onNavigate: (screen: ScreenName) => void
}

function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="text-center" data-testid="home-screen">
      <p className="text-cloud-text-light font-noto mb-4">홈 화면 (개발 중)</p>
      <button
        onClick={() => onNavigate('game')}
        className="bg-cloud-primary text-white font-noto px-6 py-2 rounded-lg"
      >
        게임 시작
      </button>
    </div>
  )
}

export default HomeScreen
