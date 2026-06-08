interface WelcomeScreenProps {
  onNext: () => void
}

function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="text-center" data-testid="welcome-screen">
      <div className="text-6xl mb-4">🌤️</div>
      <h1 className="text-3xl font-bold text-cloud-primary font-noto mb-2">
        구름 타자연습기
      </h1>
      <p className="text-cloud-text-light text-base font-noto mb-8">
        게임처럼 즐기는 한글 타자 연습
      </p>
      <button
        onClick={onNext}
        className="bg-cloud-primary text-white font-noto font-semibold px-8 py-3 rounded-xl text-lg hover:opacity-90 active:scale-95 transition-all"
      >
        시작하기
      </button>
    </div>
  )
}

export default WelcomeScreen
