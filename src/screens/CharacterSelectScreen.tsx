import { useState } from 'react'
import type { CharacterState } from '../types'
import { loadAllCharacters, loadStageProgress, deleteCharacter } from '../utils/storage'
import { CloudCharacter } from '../components/character/CloudCharacter'
import { STAGES_PER_DIFFICULTY } from '../constants/game'

interface CharacterSelectScreenProps {
  onSelect: (name: string) => void
  onCreateNew: () => void
  onBack: () => void
}

function completedCount(name: string): number {
  return loadStageProgress(name).filter((s) => s.completed).length
}

function CharacterSelectScreen({ onSelect, onCreateNew, onBack }: CharacterSelectScreenProps) {
  const [characters, setCharacters] = useState<CharacterState[]>(() => loadAllCharacters())
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  function handleDelete(name: string) {
    deleteCharacter(name)
    setCharacters(loadAllCharacters())
    setDeleteTarget(null)
  }

  return (
    <div className="text-center" data-testid="character-select-screen">
      <h1 className="text-2xl font-bold text-cloud-primary-dark font-noto mb-6">
        누구로 시작할까?
      </h1>

      <div className="flex flex-col gap-3" data-testid="character-list">
        {characters.map((char) => (
          <div
            key={char.name}
            data-testid={`character-card-${char.name}`}
            className="bg-white border-2 border-cloud-primary-dark rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="shrink-0 scale-75 origin-left">
              <CloudCharacter level={char.level} name={char.name} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-noto font-bold text-lg text-cloud-text">{char.name}</p>
              <p className="font-noto text-sm text-cloud-text-light">
                Lv.{char.level} · {char.difficulty === 'easy' ? '쉬움' : '어려움'} ·{' '}
                {completedCount(char.name)}/{STAGES_PER_DIFFICULTY}
              </p>
            </div>

            {deleteTarget === char.name ? (
              <div className="flex flex-col gap-1" data-testid={`delete-confirm-${char.name}`}>
                <p className="text-xs text-cloud-text-light font-noto">정말 지울까요?</p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    data-testid={`delete-yes-${char.name}`}
                    onClick={() => handleDelete(char.name)}
                    className="text-xs font-noto text-white bg-red-600 rounded px-3 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                  >
                    지우기
                  </button>
                  <button
                    type="button"
                    data-testid={`delete-no-${char.name}`}
                    onClick={() => setDeleteTarget(null)}
                    className="text-xs font-noto text-cloud-text bg-gray-200 rounded px-3 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  data-testid={`select-${char.name}`}
                  onClick={() => onSelect(char.name)}
                  className="text-sm font-noto font-bold text-white bg-cloud-primary-dark rounded-lg px-4 min-h-[44px] hover:opacity-90 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2"
                >
                  선택 ▶
                </button>
                <button
                  type="button"
                  aria-label={`${char.name} 삭제`}
                  data-testid={`delete-${char.name}`}
                  onClick={() => setDeleteTarget(char.name)}
                  className="text-xs font-noto text-cloud-text-light underline underline-offset-2 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2 rounded"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        data-testid="create-new-character"
        onClick={onCreateNew}
        className="w-full mt-6 bg-white border-2 border-dashed border-cloud-primary-dark text-cloud-primary-dark font-noto font-bold py-3 rounded-xl text-lg min-h-[44px] hover:bg-cloud-bg active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2"
      >
        + 새 캐릭터 만들기
      </button>

      <button
        type="button"
        data-testid="select-back"
        onClick={onBack}
        className="mt-3 text-sm text-cloud-text-light font-noto underline underline-offset-2 min-h-[44px] px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-primary-dark focus-visible:ring-offset-2 rounded"
      >
        ← 뒤로
      </button>
    </div>
  )
}

export default CharacterSelectScreen
