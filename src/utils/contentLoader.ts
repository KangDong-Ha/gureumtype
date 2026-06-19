import contentData from '../data/content-ko.json'
import type { ContentItem, ContentCollection } from '../types'
import type { DifficultyLevel } from '../types/game'

const content = contentData as unknown as ContentCollection

export function getStageContent(
  difficulty: DifficultyLevel,
  stageIndex: number,
): ContentItem | null {
  if (stageIndex < 0) return null
  const items = content[difficulty]
  if (!items) return null
  if (stageIndex >= items.length) return null
  return items[stageIndex]
}
