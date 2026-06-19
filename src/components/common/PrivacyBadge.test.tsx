import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PrivacyBadge } from './PrivacyBadge'

describe('PrivacyBadge', () => {
  it('data-testid="privacy-badge"가 렌더링된다', () => {
    render(<PrivacyBadge />)
    expect(screen.getByTestId('privacy-badge')).toBeInTheDocument()
  })

  it('"광고 없음 · 개인정보 수집 없음" 문구가 표시된다', () => {
    render(<PrivacyBadge />)
    expect(screen.getByTestId('privacy-badge')).toHaveTextContent('광고 없음 · 개인정보 수집 없음')
  })
})
