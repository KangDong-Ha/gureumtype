import { useState } from 'react'
import type { ScreenName } from './types/game'
import { loadLastCharacterName, loadCharacter } from './utils/storage'
import WelcomeScreen from './screens/WelcomeScreen'
import HomeScreen from './screens/HomeScreen'

function getInitialScreen(): ScreenName {
  const lastName = loadLastCharacterName()
  if (!lastName) return 'welcome'
  const character = loadCharacter(lastName)
  return character ? 'home' : 'welcome'
}

function App() {
  const [screen, setScreen] = useState<ScreenName>(getInitialScreen)

  return (
    <div className="min-h-screen bg-cloud-sky" data-testid="app-root">
      <div className="max-w-[480px] mx-auto px-5 py-6" data-testid="app-container">
        {screen === 'welcome' && (
          <WelcomeScreen onNext={() => setScreen('home')} />
        )}
        {screen === 'home' && (
          <HomeScreen onNavigate={setScreen} />
        )}
        {screen === 'game' && (
          <div data-testid="game-screen">게임 화면 (개발 중)</div>
        )}
        {screen === 'result' && (
          <div data-testid="result-screen">결과 화면 (개발 중)</div>
        )}
      </div>
    </div>
  )
}

export default App
