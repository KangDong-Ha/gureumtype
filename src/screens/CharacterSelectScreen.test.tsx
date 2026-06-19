import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import CharacterSelectScreen from './CharacterSelectScreen'
import { saveCharacter, saveStageProgress, loadAllCharacterNames } from '../utils/storage'

function seedCharacters() {
  saveCharacter({ name: '구름이', level: 1, xp: 0, maxXp: 100, difficulty: 'easy' })
  saveCharacter({ name: '햇살이', level: 2, xp: 50, maxXp: 200, difficulty: 'hard' })
  saveStageProgress('구름이', [{ stageIndex: 0, completed: true, bestWpm: 80 }])
}

describe('CharacterSelectScreen', () => {
  beforeEach(() => {
    localStorage.clear()
    seedCharacters()
  })

  it('저장된 모든 캐릭터 카드가 표시된다', () => {
    render(<CharacterSelectScreen onSelect={() => {}} onCreateNew={() => {}} onBack={() => {}} />)
    expect(screen.getByTestId('character-card-구름이')).toBeInTheDocument()
    expect(screen.getByTestId('character-card-햇살이')).toBeInTheDocument()
  })

  it('캐릭터 카드에 레벨·난이도·진행도가 표시된다', () => {
    render(<CharacterSelectScreen onSelect={() => {}} onCreateNew={() => {}} onBack={() => {}} />)
    expect(screen.getByTestId('character-card-구름이')).toHaveTextContent('Lv.1 · 쉬움 · 1/10')
    expect(screen.getByTestId('character-card-햇살이')).toHaveTextContent('Lv.2 · 어려움 · 0/10')
  })

  it('선택 버튼 클릭 시 onSelect(name)이 호출된다', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<CharacterSelectScreen onSelect={onSelect} onCreateNew={() => {}} onBack={() => {}} />)
    await user.click(screen.getByTestId('select-구름이'))
    expect(onSelect).toHaveBeenCalledWith('구름이')
  })

  it('새 캐릭터 만들기 클릭 시 onCreateNew가 호출된다', async () => {
    const user = userEvent.setup()
    const onCreateNew = vi.fn()
    render(<CharacterSelectScreen onSelect={() => {}} onCreateNew={onCreateNew} onBack={() => {}} />)
    await user.click(screen.getByTestId('create-new-character'))
    expect(onCreateNew).toHaveBeenCalledTimes(1)
  })

  it('뒤로 클릭 시 onBack이 호출된다', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<CharacterSelectScreen onSelect={() => {}} onCreateNew={() => {}} onBack={onBack} />)
    await user.click(screen.getByTestId('select-back'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('삭제 클릭 시 확인 대화상자가 표시되고, 바로 삭제되지 않는다', async () => {
    const user = userEvent.setup()
    render(<CharacterSelectScreen onSelect={() => {}} onCreateNew={() => {}} onBack={() => {}} />)
    await user.click(screen.getByTestId('delete-구름이'))
    expect(screen.getByTestId('delete-confirm-구름이')).toBeInTheDocument()
    // 아직 삭제 안 됨
    expect(loadAllCharacterNames()).toContain('구름이')
  })

  it('확인 대화상자에서 취소 시 삭제되지 않는다', async () => {
    const user = userEvent.setup()
    render(<CharacterSelectScreen onSelect={() => {}} onCreateNew={() => {}} onBack={() => {}} />)
    await user.click(screen.getByTestId('delete-구름이'))
    await user.click(screen.getByTestId('delete-no-구름이'))
    expect(screen.queryByTestId('delete-confirm-구름이')).not.toBeInTheDocument()
    expect(loadAllCharacterNames()).toContain('구름이')
  })

  it('확인 대화상자에서 지우기 시 캐릭터가 삭제되고 목록에서 사라진다', async () => {
    const user = userEvent.setup()
    render(<CharacterSelectScreen onSelect={() => {}} onCreateNew={() => {}} onBack={() => {}} />)
    await user.click(screen.getByTestId('delete-구름이'))
    await user.click(screen.getByTestId('delete-yes-구름이'))
    expect(screen.queryByTestId('character-card-구름이')).not.toBeInTheDocument()
    expect(loadAllCharacterNames()).not.toContain('구름이')
    // 다른 캐릭터는 유지
    expect(screen.getByTestId('character-card-햇살이')).toBeInTheDocument()
  })
})
