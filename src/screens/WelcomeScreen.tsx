import { useState, useRef, useEffect } from 'react'
import type { DifficultyLevel } from '../types/game'
import { PrivacyBadge } from '../components/common/PrivacyBadge'
import { loadAllCharacterNames } from '../utils/storage'

interface WelcomeScreenProps {
  onNext: (name: string, difficulty: DifficultyLevel) => void
}

function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const [step, setStep] = useState<'name' | 'difficulty'>('name')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'name') inputRef.current?.focus()
  }, [step])

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length === 0) {
      setError('이름을 입력해줘!')
      return
    }
    // 중복 이름 차단 — 같은 이름으로 만들면 기존 캐릭터가 덮어써지므로 방지
    if (loadAllCharacterNames().includes(trimmed)) {
      setError('이미 있는 이름이야. 다른 이름을 지어줘!')
      return
    }
    setStep('difficulty')
  }

  function handleDifficultySelect(difficulty: DifficultyLevel) {
    onNext(name.trim(), difficulty)
  }

  if (step === 'difficulty') {
    return (
      <div className="text-center" data-testid="welcome-screen">
        <div className="text-6xl mb-4">🌤️</div>
        <h2 className="text-xl font-bold text-cloud-primary-dark font-noto mb-2">
          {name.trim()}의 구름, 난이도를 선택해!
        </h2>
        <p className="text-cloud-text-light text-sm font-noto mb-6">
          나중에 바꿀 수 있어요
        </p>
        <div data-testid="difficulty-screen" className="flex flex-col gap-4">
          <button
            type="button"
            data-testid="difficulty-easy"
            onClick={() => handleDifficultySelect('easy')}
            className="w-full bg-white border-2 border-cloud-primary-dark rounded-2xl px-6 py-5 min-h-[44px] text-left hover:bg-cloud-primary-dark group transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2"
          >
            <div className="text-2xl mb-1">⭐</div>
            <div className="font-noto font-bold text-lg text-cloud-primary-dark group-hover:text-white">쉬움</div>
            <div className="font-noto text-sm text-cloud-text-light group-hover:text-white">동시·짧은 명언</div>
          </button>
          <button
            type="button"
            data-testid="difficulty-hard"
            onClick={() => handleDifficultySelect('hard')}
            className="w-full bg-white border-2 border-cloud-primary-dark rounded-2xl px-6 py-5 min-h-[44px] text-left hover:bg-cloud-primary-dark group transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2"
          >
            <div className="text-2xl mb-1">⚡</div>
            <div className="font-noto font-bold text-lg text-cloud-primary-dark group-hover:text-white">어려움</div>
            <div className="font-noto text-sm text-cloud-text-light group-hover:text-white">속담·시·명언</div>
          </button>
        </div>
        <PrivacyBadge />
      </div>
    )
  }

  return (
    <div className="text-center" data-testid="welcome-screen">
      <div className="text-6xl mb-4">🌤️</div>
      <h1 className="text-3xl font-bold text-cloud-primary-dark font-noto mb-2">
        구름 타자연습기
      </h1>
      <p className="text-cloud-text-light text-base font-noto mb-6">
        게임처럼 즐기는 한글 타자 연습
      </p>
      <div
        data-testid="new-device-notice"
        className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm font-noto text-blue-700 text-left"
      >
        이 기기에 저장된 캐릭터가 없어요. 새로 시작하거나 이전 기기에서 계속하세요.
      </div>
      <form onSubmit={handleNameSubmit} className="text-left">
        <label
          htmlFor="character-name"
          className="block text-cloud-primary-dark font-noto font-semibold mb-2 text-center"
        >
          이름을 지어줘!
        </label>
        <input
          ref={inputRef}
          id="character-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (error && e.target.value.trim().length > 0) setError('')
          }}
          maxLength={10}
          placeholder="예: 구름이"
          data-testid="name-input"
          aria-describedby={error ? 'name-error' : undefined}
          className="w-full border-2 border-cloud-primary-dark rounded-xl px-4 py-3 font-noto text-lg text-center focus:outline-none focus:ring-2 focus:ring-cloud-primary-dark mb-1"
        />
        {error && (
          <p
            id="name-error"
            role="alert"
            data-testid="name-error"
            className="text-cloud-error text-sm font-noto text-center mb-3"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={name.trim().length === 0}
          className="w-full mt-4 bg-cloud-primary-dark text-white font-noto font-semibold py-3 rounded-xl text-lg min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2"
        >
          다음 →
        </button>
      </form>
      <PrivacyBadge />
    </div>
  )
}

export default WelcomeScreen
