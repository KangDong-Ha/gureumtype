---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
workflowType: 'research'
lastStep: 5
research_type: 'technical'
research_topic: 'React + TypeScript 환경에서 한글 IME 처리'
research_goals: 'useKoreanIme 커스텀 훅 설계에 바로 활용 가능한 패턴 도출'
user_name: 'dongha'
date: '2026-06-09'
web_research_enabled: true
source_verification: true
---

# 기술 리서치 보고서: React + TypeScript 한글 IME 처리

**날짜:** 2026-06-09  
**작성자:** dongha  
**리서치 유형:** technical  

---

## 리서치 개요

브라우저에서 한글 IME 처리 시 발생하는 composition 이벤트 흐름, React의 관련 API, 테스트 환경에서의 시뮬레이션 방법, 그리고 타이핑 게임에서의 한글 판정 주의사항을 종합적으로 분석한다. 최종 목표는 `useKoreanIme` 커스텀 훅 설계에 즉시 활용 가능한 패턴을 도출하는 것이다.

---

## 1. 브라우저 composition 이벤트 흐름

### 기본 이벤트 시퀀스

한글(또는 CJK 문자) 입력 시 브라우저는 다음 순서로 이벤트를 발생시킨다:

```
keydown (isComposing: false)
  → compositionstart  (data: "")
  → keyup
  → compositionupdate (data: "ㅎ")    ← 'ㅎ' 입력
  → input             (isComposing: true)
  → compositionupdate (data: "하")    ← 'ㅏ' 입력 → 조합 진행
  → input             (isComposing: true)
  → compositionupdate (data: "한")    ← 'ㄴ' 입력 → 종성 결합
  → input             (isComposing: true)
  → compositionend    (data: "한")    ← 스페이스/확인 → 조합 완료
  → input             (isComposing: false)
keydown (isComposing: false)
```

### 핵심 포인트

- **compositionstart**: IME 세션 시작 시 1회 발생. `data`는 빈 문자열 `""`
- **compositionupdate**: 자모 하나가 추가/변경될 때마다 발생. `data`는 현재 조합 중인 문자열 (예: `"ㅎ"` → `"하"` → `"한"`)
- **compositionend**: 조합 완료(스페이스, Enter, 다음 초성 입력 등) 시 발생. `data`는 최종 완성된 문자열
- composition 세션 중에도 `keydown`/`keyup`은 계속 발생하며, 이 시점의 `isComposing`은 `true`
- `input` 이벤트도 조합 중에 발생하며 `InputEvent.isComposing === true`

### W3C 스펙 정의 순서 (compositionend와 input 순서)

W3C UI Events 스펙 기준으로는:

```
compositionupdate → beforeinput → input → compositionend
```

그러나 **Chrome v53 이후**로 이 순서가 변경되어 현재 Chrome은:

```
compositionupdate → beforeinput → input → compositionend
```

으로 동작하지만, Firefox/Edge는 `compositionend` 후에 `input`이 발생하는 경우가 있어 **브라우저 간 일관성이 없다**. 이는 React의 `onChange` 타이밍 문제로 이어진다.

---

## 2. React에서 한글 IME를 올바르게 처리하는 방법

### React의 Synthetic Event와 composition 핸들러

React는 세 가지 IME 관련 합성 이벤트를 제공한다:

```typescript
<input
  onCompositionStart={(e: React.CompositionEvent<HTMLInputElement>) => {
    console.log('조합 시작:', e.data); // 보통 ""
  }}
  onCompositionUpdate={(e: React.CompositionEvent<HTMLInputElement>) => {
    console.log('조합 중:', e.data);   // "ㅎ", "하", "한" ...
  }}
  onCompositionEnd={(e: React.CompositionEvent<HTMLInputElement>) => {
    console.log('조합 완료:', e.data); // "한"
  }}
/>
```

### 권장 패턴: useRef로 composition 상태 추적

`useState` 대신 `useRef`를 사용하는 이유는 상태 업데이트가 비동기일 수 있어 이벤트 핸들러 내에서 즉각 반영되지 않을 수 있기 때문이다:

```typescript
function KoreanInput() {
  const [value, setValue] = useState('');
  const isComposingRef = useRef(false);

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    // compositionend 시점에 최종 값을 처리
    setValue(e.currentTarget.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 조합 중에도 display용 값은 업데이트 (input이 올바르게 보이도록)
    // 하지만 검색/판정 로직은 isComposing 체크 후 실행
    setValue(e.target.value);

    if (!isComposingRef.current) {
      // 조합 완료된 경우에만 실행할 로직
      triggerSearch(e.target.value);
    }
  };

  return (
    <input
      value={value}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
    />
  );
}
```

### 중요한 주의사항: controlled 컴포넌트의 딜레마

controlled 컴포넌트에서는 `onChange`를 막으면 입력 자체가 안 되므로, **display 값 업데이트는 허용하되 비즈니스 로직만 조합 완료 후 실행**하는 이중 전략이 필요하다.

---

## 3. isComposing 플래그의 역할과 Enter 키 처리 타이밍

### 문제 상황: Enter 키 이중 처리

한글 입력 후 Enter를 누르면:
1. OS/IME가 조합 완료를 위해 Enter를 처리 (compositionend 트리거)
2. 브라우저가 Enter keydown을 다시 처리

이로 인해 Enter 핸들러가 두 번 실행되는 버그가 발생한다.

### 해결책 1: nativeEvent.isComposing 체크 (Chrome/Firefox 권장)

```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.nativeEvent.isComposing) return; // 조합 중이면 무시

  if (e.key === 'Enter') {
    handleSubmit();
  }
};
```

### 해결책 2: keyCode 229 체크 (Safari 호환)

Safari에서는 **Enter를 눌러 조합을 완료하는 순간 `isComposing`이 `false`로 바뀌어버리는** 버그가 있다. 따라서 Safari에서는 `isComposing`만으로는 부족하다.

IME 조합 중에는 keyCode가 `229`로 나오는 특성을 활용:

```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Safari 대응: isComposing이 false여도 keyCode 229면 조합 중
  if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return;

  if (e.key === 'Enter') {
    handleSubmit();
  }
};
```

### 해결책 3: useRef로 수동 composition 추적 (가장 안전)

```typescript
const isComposingRef = useRef(false);

// Safari를 포함한 모든 브라우저에서 가장 신뢰할 수 있는 방법
<input
  onCompositionStart={() => { isComposingRef.current = true; }}
  onCompositionEnd={() => { isComposingRef.current = false; }}
  onKeyDown={(e) => {
    if (isComposingRef.current) return;
    if (e.key === 'Enter') handleSubmit();
  }}
/>
```

---

## 4. e.nativeEvent.isComposing vs e.isComposing 차이

### 핵심 차이

| 구분 | `e.isComposing` | `e.nativeEvent.isComposing` |
|------|-----------------|------------------------------|
| 타입 | React SyntheticEvent | 브라우저 네이티브 DOM Event |
| 존재 여부 | React의 KeyboardEvent 타입에는 **정의되지 않음** | 항상 존재 |
| 실제 동작 | TypeScript 컴파일 오류 발생 가능 | 실제 브라우저 값 반환 |

### React SyntheticEvent에는 isComposing이 없다

React의 `KeyboardEvent<T>` 타입은 표준 DOM `KeyboardEvent`의 모든 속성을 노출하지 않는다. `isComposing`은 SyntheticEvent에 직접 노출되지 않으므로 반드시 `nativeEvent`를 통해 접근해야 한다:

```typescript
// 잘못된 방법 (TypeScript 오류)
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.isComposing) { ... } // Property 'isComposing' does not exist
};

// 올바른 방법
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.nativeEvent.isComposing) { ... } // 정상 동작
};
```

### CompositionEvent에는 isComposing이 없다

`onCompositionStart/Update/End`의 이벤트 타입인 `React.CompositionEvent`에는 `isComposing` 속성 자체가 없다 (조합 이벤트 자체가 이미 composition 상태를 의미하기 때문). `isComposing`은 `KeyboardEvent`, `InputEvent`, `MouseEvent` 등에만 존재한다.

---

## 5. jsdom(Vitest/Jest 환경)에서 composition 이벤트 시뮬레이션

### fireEvent로 composition 이벤트 시뮬레이션

`@testing-library/react`의 `fireEvent`는 composition 이벤트 메서드를 제공한다:

```typescript
import { render, fireEvent } from '@testing-library/react';

test('한글 IME 조합 시뮬레이션', () => {
  const { getByRole } = render(<KoreanInput />);
  const input = getByRole('textbox');

  // 1. 조합 시작
  fireEvent.compositionStart(input, { data: '' });

  // 2. 'ㅎ' 입력
  fireEvent.compositionUpdate(input, { data: 'ㅎ' });
  fireEvent.input(input, { target: { value: 'ㅎ' } });

  // 3. 'ㅏ' 입력 → '하' 조합
  fireEvent.compositionUpdate(input, { data: '하' });
  fireEvent.input(input, { target: { value: '하' } });

  // 4. 'ㄴ' 입력 → '한' 조합
  fireEvent.compositionUpdate(input, { data: '한' });
  fireEvent.input(input, { target: { value: '한' } });

  // 5. 조합 완료 (스페이스 또는 Enter)
  fireEvent.compositionEnd(input, { data: '한' });
  fireEvent.change(input, { target: { value: '한' } });
});
```

### 중요한 jsdom 제한사항

jsdom은 실제 IME를 구현하지 않으므로:

1. **`isComposing` 플래그가 자동으로 설정되지 않는다.** fireEvent로 발생시킨 keydown 이벤트의 `isComposing`은 기본값 `false`이다.
2. **수동으로 이벤트 속성을 지정**해야 한다:

```typescript
// isComposing: true를 명시적으로 설정
fireEvent.keyDown(input, {
  key: 'Enter',
  keyCode: 229,
  isComposing: true,  // 이 방법으로는 실제로 반영 안 될 수 있음
});

// 더 신뢰할 수 있는 방법: createEvent 사용
const keydownEvent = new KeyboardEvent('keydown', {
  key: 'Enter',
  keyCode: 13,
  isComposing: true,
  bubbles: true,
});
input.dispatchEvent(keydownEvent);
```

### 실용적 테스트 전략: 핸들러 직접 테스트

composition 이벤트의 jsdom 한계 때문에, **훅 로직을 분리하여 직접 테스트**하는 방식이 더 실용적이다:

```typescript
// useKoreanIme 훅의 상태 변화를 테스트
import { renderHook, act } from '@testing-library/react';

test('isComposing 상태 변화', () => {
  const { result } = renderHook(() => useKoreanIme());

  expect(result.current.isComposing).toBe(false);

  act(() => {
    result.current.handleCompositionStart(
      { data: '' } as React.CompositionEvent<HTMLInputElement>
    );
  });

  expect(result.current.isComposing).toBe(true);

  act(() => {
    result.current.handleCompositionEnd(
      { data: '한', currentTarget: { value: '한' } } as any
    );
  });

  expect(result.current.isComposing).toBe(false);
});
```

### user-event의 현재 한계

`@testing-library/user-event`는 현재(2024~2026) composition 세션을 완전히 지원하지 않는다. 이슈 #1097이 오픈되어 있으며, `userEvent.keyboard()`나 `userEvent.type()`은 한글 조합 과정을 정확히 재현하지 못한다.

---

## 6. 한글 자모 분리 문제

### 두벌식 키보드에서의 자모 조합 원리

한글 음절은 **초성(자음) + 중성(모음) + 종성(자음, 선택적)** 구조로 이루어진다. 브라우저 IME는 다음 상태 기계(State Machine)로 동작한다:

```
상태 1: 초성 입력 → 'ㅎ' (아직 음절 미완성, compositionupdate data: "ㅎ")
상태 2: 중성 입력 → 'ㅎ' + 'ㅏ' = '하' (음절 조합 중, compositionupdate data: "하")
상태 3: 종성 입력 → '하' + 'ㄴ' = '한' (종성 결합, compositionupdate data: "한")
상태 4a: 다음 모음 입력 → 'ㄴ'이 초성으로 이동 → '하' 확정 + '나...' (compositionend data: "하", 새 세션 시작)
상태 4b: 스페이스/Enter → '한' 확정 (compositionend data: "한")
```

### compositionupdate.data로 조합 중인 문자 감지

```typescript
onCompositionUpdate={(e) => {
  const composingChar = e.data; // "ㅎ", "하", "한" 등 현재 조합 중인 글자
  // 이 값은 아직 확정되지 않은 문자
}}
```

### 유니코드로 조합 완료 여부 판단

한글 음절 유니코드 범위: `U+AC00` (가) ~ `U+D7A3` (힣)  
한글 자모 유니코드 범위: `U+1100`~`U+11FF`, `U+3131`~`U+318E` (ㄱ~ㅎ, ㅏ~ㅣ)

```typescript
function isCompleteHangul(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0xAC00 && code <= 0xD7A3;
}

function isHangulJamo(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 0x1100 && code <= 0x11FF) ||
         (code >= 0x3131 && code <= 0x318E);
}

// compositionupdate data 검사 예시
onCompositionUpdate={(e) => {
  const data = e.data;
  if (data.length === 1) {
    if (isHangulJamo(data)) {
      // 초성 단독 상태: 'ㅎ' 같은 자음만 입력됨 → 음절 미완성
    } else if (isCompleteHangul(data)) {
      // 초성+중성 조합 완료: '하' 같은 상태 → 종성 기다리는 중
    }
  }
}}
```

### 마지막 자모가 조합 중일 때의 특수 케이스

타이핑 '한글' 을 입력하는 과정:

```
'ㅎ' → compositionupdate: "ㅎ"     (자모만, 미완성)
'ㅏ' → compositionupdate: "하"     (초성+중성)
'ㄴ' → compositionupdate: "한"     (초성+중성+종성, 아직 조합 중)
'ㄱ' → compositionend: "한"        (한 확정)
       compositionstart: ""
       compositionupdate: "그"       (새 글자 시작 - 종성 ㄴ 이 초성으로 넘어가지 않음)
```

중요: 'ㄴ' 입력 후 compositionupdate의 data가 "한"이지만 이는 **아직 조합 완료가 아니다**. 다음 글자가 모음이면 'ㄴ'이 다음 음절의 초성으로 이동하고 '하'만 확정될 수 있다.

---

## 7. 타이핑 게임에서 한글 판정 시 주의사항

### 핵심 원칙: compositionend 전까지는 판정 금지

타이핑 게임에서 '한글'을 타자할 때 글자별 정오 판정을 즉각 하면 안 되는 이유:

```
목표: "한"
사용자 입력: 'ㅎ' → 'ㅏ' → 'ㄴ'

compositionupdate: "ㅎ" → 아직 판정 불가 (모음 없음)
compositionupdate: "하" → 아직 판정 불가 ('한'과 불일치이지만 조합 중)
compositionupdate: "한" → 아직 판정 불가 (다음 글자가 모음이면 '하'로 바뀔 수 있음)
compositionend:    "한" → 이제 판정 가능!
```

### 권장 판정 전략

```typescript
function useTypingGame(targetText: string) {
  const isComposingRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    const completedChar = e.data; // 조합 완료된 글자
    judgeCharacter(completedChar);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 조합 중 Enter는 무시
    if (isComposingRef.current || e.nativeEvent.isComposing) return;
    // ... 영어 입력 처리
  };

  const judgeCharacter = (inputChar: string) => {
    const targetChar = targetText[currentIndex];
    const isCorrect = inputChar === targetChar;
    setResults(prev => [...prev, isCorrect]);
    setCurrentIndex(prev => prev + 1);
  };

  return { handleCompositionStart, handleCompositionEnd, handleKeyDown, results };
}
```

### compositionupdate를 활용한 실시간 시각 피드백 (판정과 분리)

판정은 compositionend 후에 하되, **시각적 강조(조합 중 글자 색상 등)는 compositionupdate로 실시간** 구현 가능:

```typescript
const handleCompositionUpdate = (e: React.CompositionEvent<HTMLInputElement>) => {
  setComposingChar(e.data); // 현재 조합 중인 글자 표시용 (판정용 아님)
};
```

### 영어 혼용 입력 처리

영어는 composition 없이 바로 `keydown` → `keypress` → `change`로 처리되므로:

```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (isComposingRef.current) return; // 한글 조합 중이면 스킵

  // 영어/숫자 등 즉시 판정
  const newChar = e.target.value.slice(-1);
  judgeCharacter(newChar);
};
```

---

## 8. React onChange 이벤트와 IME composition 이벤트의 실행 순서

### 실제 이벤트 순서 (Chrome 기준, React 18)

React의 `onChange`는 내부적으로 DOM의 `input` 이벤트를 기반으로 동작한다.

```
compositionstart 발생
  → onCompositionStart 호출

[조합 중 각 자모 입력마다:]
  → compositionupdate 발생
  → onCompositionUpdate 호출
  → input 이벤트 발생 (isComposing: true)
  → onChange 호출 ← 조합 중에도 onChange가 호출됨!

[조합 완료 시:]
  → compositionend 발생
  → onCompositionEnd 호출
  → input 이벤트 발생 (isComposing: false)
  → onChange 호출
```

### 결론: onChange는 조합 중에도 발생한다

React `onChange`는 조합 완료를 기다리지 않는다. `onCompositionEnd`보다 먼저 호출될 수도 있고 이후에도 호출된다. **브라우저와 OS 조합에 따라 순서가 달라진다.**

### 브라우저별 onChange-compositionend 순서

| 브라우저 | 순서 |
|---------|------|
| Chrome (v53+) | compositionend → onChange |
| Firefox | onChange → compositionend (반대!) |
| Safari | 케이스 따라 다름 |

이 불일치 때문에 `onChange` 내에서 `isComposing` 상태를 직접 체크하는 것이 불안정하다. **`useRef`로 별도 추적하는 것이 가장 안전**하다.

---

## 9. useKoreanIme 커스텀 훅 설계 패턴

### 최종 권장 설계

```typescript
import { useRef, useCallback } from 'react';

interface UseKoreanImeOptions {
  onCompositionComplete?: (char: string) => void;
  onKeyAction?: (key: string) => void;
}

interface UseKoreanImeReturn {
  isComposing: boolean; // 현재 조합 중 여부 (ref 기반, 렌더 트리거 없음)
  composingChar: string; // 현재 조합 중인 글자 (실시간 시각 피드백용)
  handlers: {
    onCompositionStart: (e: React.CompositionEvent<HTMLInputElement>) => void;
    onCompositionUpdate: (e: React.CompositionEvent<HTMLInputElement>) => void;
    onCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
}

function useKoreanIme(options: UseKoreanImeOptions = {}): UseKoreanImeReturn {
  const isComposingRef = useRef(false);
  const composingCharRef = useRef('');

  // 시각 피드백용 state (필요시 useState로 변경)
  // const [composingChar, setComposingChar] = useState('');

  const handleCompositionStart = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = true;
      composingCharRef.current = '';
    },
    []
  );

  const handleCompositionUpdate = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      composingCharRef.current = e.data;
      // 실시간 시각 피드백이 필요하면 여기서 setState 호출
    },
    []
  );

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      const completedChar = e.data;
      composingCharRef.current = '';

      if (completedChar && options.onCompositionComplete) {
        options.onCompositionComplete(completedChar);
      }
    },
    [options.onCompositionComplete]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Safari 대응: isComposing + keyCode 229 동시 체크
      const composing =
        isComposingRef.current ||
        e.nativeEvent.isComposing ||
        e.nativeEvent.keyCode === 229;

      if (composing) return;

      if (options.onKeyAction) {
        options.onKeyAction(e.key);
      }
    },
    [options.onKeyAction]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // controlled 컴포넌트의 표시 값은 항상 업데이트
      // 비즈니스 로직은 isComposing 체크
      if (!isComposingRef.current) {
        // 영어/숫자 등 비조합 입력 처리
        const lastChar = e.target.value.slice(-1);
        if (lastChar && options.onCompositionComplete) {
          options.onCompositionComplete(lastChar);
        }
      }
    },
    [options.onCompositionComplete]
  );

  return {
    get isComposing() { return isComposingRef.current; },
    get composingChar() { return composingCharRef.current; },
    handlers: {
      onCompositionStart: handleCompositionStart,
      onCompositionUpdate: handleCompositionUpdate,
      onCompositionEnd: handleCompositionEnd,
      onKeyDown: handleKeyDown,
      onChange: handleChange,
    },
  };
}
```

### 사용 예시 (타이핑 게임)

```typescript
function TypingGame({ targetText }: { targetText: string }) {
  const [inputValue, setInputValue] = useState('');
  const [judgedChars, setJudgedChars] = useState<Array<{char: string; correct: boolean}>>([]);
  const indexRef = useRef(0);

  const { handlers } = useKoreanIme({
    onCompositionComplete: (char) => {
      // 한글/영어 모두 여기서 판정
      const targetChar = targetText[indexRef.current];
      setJudgedChars(prev => [...prev, { char, correct: char === targetChar }]);
      indexRef.current += 1;
    },
    onKeyAction: (key) => {
      // Enter, Space 등 처리
      if (key === 'Enter') { /* ... */ }
    }
  });

  return (
    <input
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        handlers.onChange(e);
      }}
      onCompositionStart={handlers.onCompositionStart}
      onCompositionUpdate={handlers.onCompositionUpdate}
      onCompositionEnd={handlers.onCompositionEnd}
      onKeyDown={handlers.onKeyDown}
    />
  );
}
```

---

## 핵심 요약

| 항목 | 요점 |
|------|------|
| composition 이벤트 순서 | start → update(반복) → end, Chrome/Firefox 간 input 이벤트 순서 불일치 |
| isComposing 접근 | `e.nativeEvent.isComposing` (React SyntheticEvent에는 없음) |
| Safari 특이사항 | Enter 입력 시 isComposing이 false로 바뀜 → keyCode 229로 보완 |
| 가장 안전한 추적 | `useRef` 기반 수동 추적 (onCompositionStart/End 사용) |
| onChange 타이밍 | 조합 중에도 발생, 브라우저마다 compositionend와 순서 다름 |
| 타이핑 판정 | compositionend 후에만 판정, compositionupdate는 시각 피드백 전용 |
| jsdom 테스트 | fireEvent.compositionStart/End 직접 호출, isComposing은 수동 설정 필요 |

---

## 참고 자료

- [MDN: compositionstart event](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionstart_event)
- [MDN: compositionend event](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionend_event)
- [MDN: compositionupdate event](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionupdate_event)
- [W3C UI Events Spec](https://www.w3.org/TR/uievents/)
- [React GitHub Issue #8683: Composition Events in controlled components](https://github.com/facebook/react/issues/8683)
- [witch.work: Preventing duplicate Enter key execution during Korean input](https://witch.work/en/posts/fix-input-double-enter-issue)
- [Junhyunny's Devlogs: Korean KeyboardEvent Error in React](https://junhyunny.github.io/react/typescript/korean-keyboard-event-error/)
- [DEV.to: Why 1.6 Billion East Asians Are Quietly Raging at Your Enter Key Handler](https://dev.to/yukimi-inu/why-16-billion-east-asians-are-quietly-raging-at-your-enter-key-handler-1po0)
- [testing-library/user-event Issue #1097: Support keyboard composition sessions](https://github.com/testing-library/user-event/issues/1097)
- [eyesofkids/react-compositionevent](https://github.com/eyesofkids/react-compositionevent)
- [Square Corner Blog: Understanding Composition Browser Events](https://medium.com/square-corner-blog/understanding-composition-browser-events-f402a8ed5643)
- [JIKJIK: React isComposing 한글 두번 입력되는 버그](https://jik-k.github.io/react/2024/06/27/ReactIsComposing.html)
