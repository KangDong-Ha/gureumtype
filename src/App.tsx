function App() {
  return (
    <div
      className="min-h-screen bg-cloud-sky"
      data-testid="app-root"
    >
      <div
        className="max-w-[480px] mx-auto px-5 py-6"
        data-testid="app-container"
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🌤️</div>
          <h1 className="text-3xl font-bold text-cloud-primary font-noto mb-2">
            구름 타자연습기
          </h1>
          <p className="text-cloud-text-light text-base font-noto">
            게임처럼 즐기는 한글 타자 연습
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
