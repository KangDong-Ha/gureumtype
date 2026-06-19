import type { CharacterLevel, CharacterEmotion } from '../../types'

interface CloudCharacterProps {
  level: CharacterLevel
  name: string
  emotion?: CharacterEmotion
}

const EMOTION_ANIMATION: Record<CharacterEmotion, string> = {
  idle: 'animate-[float_2s_ease-in-out_infinite]',
  'typing-fast': 'animate-[bounce-fast_0.5s_ease-in-out_infinite]',
  'typing-slow': 'animate-[wobble_1.5s_ease-in-out_infinite]',
  'level-up': 'animate-[level-up-bounce_0.5s_ease-out]',
  celebrate: 'animate-[float_2s_ease-in-out_infinite]',
}

function CloudLevel1() {
  return (
    <svg
      data-testid="cloud-level-1"
      viewBox="0 0 80 70"
      xmlns="http://www.w3.org/2000/svg"
      className="w-20 h-[70px]"
      aria-hidden="true"
    >
      {/* 구름 본체 */}
      <ellipse cx="40" cy="48" rx="28" ry="14" fill="#5BABF0" />
      <circle cx="28" cy="42" r="13" fill="#5BABF0" />
      <circle cx="52" cy="40" r="11" fill="#5BABF0" />
      <circle cx="40" cy="36" r="14" fill="#5BABF0" />
      {/* 새싹 */}
      <line x1="40" y1="22" x2="40" y2="14" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="36" cy="11" rx="5" ry="7" fill="#4ade80" transform="rotate(-20 36 11)" />
      <ellipse cx="44" cy="10" rx="5" ry="7" fill="#34d399" transform="rotate(20 44 10)" />
      {/* 눈 */}
      <circle cx="34" cy="41" r="2.5" fill="white" />
      <circle cx="46" cy="41" r="2.5" fill="white" />
      <circle cx="34.8" cy="41.8" r="1.2" fill="#2D3748" />
      <circle cx="46.8" cy="41.8" r="1.2" fill="#2D3748" />
      {/* 볼터치 */}
      <ellipse cx="29" cy="45" rx="4" ry="2.5" fill="#FFB3C6" opacity="0.6" />
      <ellipse cx="51" cy="45" rx="4" ry="2.5" fill="#FFB3C6" opacity="0.6" />
    </svg>
  )
}

function CloudLevel2() {
  return (
    <svg
      data-testid="cloud-level-2"
      viewBox="0 0 100 80"
      xmlns="http://www.w3.org/2000/svg"
      className="w-28 h-20"
      aria-hidden="true"
    >
      {/* 구름 본체 — 더 풍성 */}
      <ellipse cx="50" cy="58" rx="36" ry="16" fill="#5BABF0" />
      <circle cx="32" cy="50" r="17" fill="#5BABF0" />
      <circle cx="68" cy="48" r="15" fill="#5BABF0" />
      <circle cx="50" cy="42" r="19" fill="#5BABF0" />
      {/* 하이라이트 */}
      <ellipse cx="42" cy="36" rx="8" ry="5" fill="#B8DCF8" opacity="0.7" />
      {/* 별 장식 */}
      <text x="72" y="28" fontSize="12" fill="#FFD166" textAnchor="middle">★</text>
      <text x="22" y="32" fontSize="9" fill="#FFD166" textAnchor="middle">✦</text>
      {/* 눈 */}
      <circle cx="42" cy="48" r="3" fill="white" />
      <circle cx="58" cy="48" r="3" fill="white" />
      <circle cx="43" cy="49" r="1.5" fill="#2D3748" />
      <circle cx="59" cy="49" r="1.5" fill="#2D3748" />
      {/* 미소 */}
      <path d="M 43 54 Q 50 59 57 54" stroke="#2D3748" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* 볼터치 */}
      <ellipse cx="36" cy="53" rx="5" ry="3" fill="#FFB3C6" opacity="0.6" />
      <ellipse cx="64" cy="53" rx="5" ry="3" fill="#FFB3C6" opacity="0.6" />
    </svg>
  )
}

function CloudLevel3() {
  return (
    <svg
      data-testid="cloud-level-3"
      viewBox="0 0 120 100"
      xmlns="http://www.w3.org/2000/svg"
      className="w-36 h-24"
      aria-hidden="true"
    >
      {/* 광채 후광 */}
      <circle cx="60" cy="52" r="42" fill="#FFD166" opacity="0.2" />
      <circle cx="60" cy="52" r="36" fill="#FFD166" opacity="0.15" />
      {/* 구름 본체 — 완전체 */}
      <ellipse cx="60" cy="68" rx="44" ry="18" fill="#5BABF0" />
      <circle cx="36" cy="58" r="20" fill="#5BABF0" />
      <circle cx="84" cy="56" r="18" fill="#5BABF0" />
      <circle cx="60" cy="48" r="24" fill="#5BABF0" />
      {/* 하이라이트 */}
      <ellipse cx="50" cy="40" rx="11" ry="7" fill="#B8DCF8" opacity="0.8" />
      {/* 왕관 */}
      <polygon points="60,10 53,22 46,14 54,26 60,18 66,26 74,14 67,22" fill="#FFD166" />
      <circle cx="60" cy="12" r="2.5" fill="#FF8C42" />
      <circle cx="47" cy="16" r="2" fill="#FF8C42" />
      <circle cx="73" cy="16" r="2" fill="#FF8C42" />
      {/* 별 장식 */}
      <text x="88" y="32" fontSize="14" fill="#FFD166" textAnchor="middle">★</text>
      <text x="28" y="36" fontSize="11" fill="#FFD166" textAnchor="middle">★</text>
      <text x="96" y="54" fontSize="9" fill="#FFD166" textAnchor="middle">✦</text>
      <text x="20" y="54" fontSize="9" fill="#FFD166" textAnchor="middle">✦</text>
      {/* 눈 — 반짝이는 눈 */}
      <circle cx="51" cy="55" r="4" fill="white" />
      <circle cx="69" cy="55" r="4" fill="white" />
      <circle cx="52.5" cy="56" r="2" fill="#2D3748" />
      <circle cx="70.5" cy="56" r="2" fill="#2D3748" />
      <circle cx="53.5" cy="55" r="0.8" fill="white" />
      <circle cx="71.5" cy="55" r="0.8" fill="white" />
      {/* 큰 미소 */}
      <path d="M 50 63 Q 60 71 70 63" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 볼터치 */}
      <ellipse cx="42" cy="61" rx="6" ry="3.5" fill="#FFB3C6" opacity="0.7" />
      <ellipse cx="78" cy="61" rx="6" ry="3.5" fill="#FFB3C6" opacity="0.7" />
    </svg>
  )
}

export function CloudCharacter({ level, name, emotion = 'idle' }: CloudCharacterProps) {
  const animClass = EMOTION_ANIMATION[emotion]
  return (
    <div
      data-testid="cloud-character"
      data-emotion={emotion}
      role="img"
      aria-label={`${name} 캐릭터, 현재 레벨 ${level}`}
      className={`${animClass} motion-reduce:animate-none motion-reduce:transition-none transition-all duration-300 flex items-center justify-center`}
    >
      {level === 1 && <CloudLevel1 />}
      {level === 2 && <CloudLevel2 />}
      {level === 3 && <CloudLevel3 />}
    </div>
  )
}
