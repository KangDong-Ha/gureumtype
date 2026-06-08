/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cloud-primary':    '#5BABF0',  // 하늘색 — 메인 액션, 버튼
        'cloud-secondary':  '#FFD166',  // 햇살 노랑 — 성취, 보상
        'cloud-success':    '#06D6A0',  // 민트 그린 — 정타, 완료
        'cloud-error':      '#FF6B6B',  // 산호 빨강 — 오타 (부드럽게)
        'cloud-bg':         '#F0F8FF',  // 연한 하늘 — 메인 배경
        'cloud-surface':    '#FFFFFF',  // 흰색 — 카드, 입력창
        'cloud-text':       '#2D3748',  // 다크 네이비 — 본문
        'cloud-text-light': '#718096',  // 회색 — 보조 텍스트
      },
      fontFamily: {
        'noto': ['"Noto Sans KR"', '"Noto Sans"', 'sans-serif'],
      },
      fontSize: {
        'typing': ['22px', { lineHeight: '1.6' }],  // 타이핑 문장용
      },
      backgroundImage: {
        'cloud-sky': 'linear-gradient(160deg, #c9e8ff 0%, #e8f4ff 40%, #fff5e6 100%)',
      },
    },
  },
  plugins: [],
}
