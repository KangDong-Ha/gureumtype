import { useState, useCallback, useEffect, useRef } from 'react'
import type { CharacterState, CharacterLevel } from '../types'
import { saveCharacter } from '../utils/storage'

const MAX_XP_PER_LEVEL: Record<CharacterLevel, number> = {
  1: 100,
  2: 200,
  3: 300,
}

export function useCharacter(initialCharacter: CharacterState) {
  const [character, setCharacter] = useState<CharacterState>(initialCharacter)
  const [didLevelUp, setDidLevelUp] = useState(false)

  // 활성 캐릭터가 바뀌면(이름 기준) 상태를 새 캐릭터로 재설정.
  // 동일 캐릭터의 in-session XP 변화에는 반응하지 않음(이름이 같으면 reset 안 함).
  const activeNameRef = useRef(initialCharacter.name)
  useEffect(() => {
    if (activeNameRef.current !== initialCharacter.name) {
      activeNameRef.current = initialCharacter.name
      setCharacter(initialCharacter)
      setDidLevelUp(false)
    }
  }, [initialCharacter])

  const addXp = (amount: number) => {
    setCharacter((prev) => {
      const newXp = prev.xp + amount

      if (prev.level < 3 && newXp >= prev.maxXp) {
        const newLevel = (prev.level + 1) as CharacterLevel
        const updated: CharacterState = {
          ...prev,
          level: newLevel,
          xp: 0,
          maxXp: MAX_XP_PER_LEVEL[newLevel],
        }
        saveCharacter(updated)
        setDidLevelUp(true)
        return updated
      }

      const updated: CharacterState = {
        ...prev,
        xp: prev.level === 3 ? Math.min(newXp, prev.maxXp) : newXp,
      }
      saveCharacter(updated)
      return updated
    })
  }

  const clearLevelUp = useCallback(() => setDidLevelUp(false), [])

  return { character, addXp, didLevelUp, clearLevelUp }
}
