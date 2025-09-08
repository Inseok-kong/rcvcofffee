# RCV@UOS Coffee 관리 앱 ☕

Firebase 기반의 커피 사용량 및 레시피 관리 PWA 애플리케이션입니다.

## 🚀 주요 기능

### 📱 핵심 기능
- **커피 등록 관리**: 상세한 커피 원두 정보 등록 (컵노트, 로스팅 포인트, 농장 정보, 감각적 특성 등)
- **공유 커피 재고**: 모든 사용자가 공유하는 커피 재고 관리
- **일일 커피 소비 기록**: 시간대별 소비 기록 및 사용자별 소비 추적
- **커피 레시피 관리**: 원두 선택 기반 레시피 등록 및 관리
- **원두 사용량 추적**: 실시간 재고 관리 및 소비 기록 삭제 시 자동 재고 복구
- **커피 상세 페이지**: 이미지와 같은 상세한 커피 정보 표시

### 🎨 UI/UX
- **메인 대시보드**: 커피 재고 현황, 최근 레시피, 빠른 액션 버튼
- **커피 상세 페이지**: 다크 테마의 전문적인 커피 정보 표시
- **소비 기록 달력**: 달력 형태의 소비 기록 시각화
- **PWA 기능**: 오프라인 지원, 홈 화면 설치
- **반응형 디자인**: 모바일 우선 설계

### 🔐 사용자 인증 및 관리
- Firebase Authentication
- 구글/이메일 로그인
- 닉네임 관리 (마이페이지)
- 공유 데이터 시스템 (모든 사용자가 동일한 커피/레시피 공유)

### 💬 커뮤니티 기능
- **게시판**: 커피 관련 정보 공유
- **댓글 시스템**: 게시글에 대한 댓글 작성

## 🛠 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **PWA**: next-pwa, Service Worker
- **상태 관리**: Zustand
- **UI**: Heroicons

## 📦 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd coffee
```

### 2. 의존성 설치
```bash
npm install
```

### 3. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Authentication 활성화 (이메일/비밀번호, 구글 로그인)
3. Firestore Database 생성
4. Storage 활성화
5. 프로젝트 설정에서 웹 앱 추가

### 4. 환경 변수 설정

`.env.local` 파일을 생성하고 Firebase 설정을 추가하세요:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. 개발 서버 실행
```bash
npm run dev
```

### 6. 프로덕션 빌드
```bash
npm run build
npm start
```

## 📱 PWA 기능

### 설치 방법
1. 브라우저에서 앱 접속
2. 주소창 옆의 설치 아이콘 클릭
3. "설치" 버튼 클릭

### 오프라인 지원
- Service Worker를 통한 오프라인 캐싱
- 네트워크 복구 시 데이터 동기화

## 🗂 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── login/             # 로그인 페이지
│   ├── coffees/           # 커피 관리 페이지
│   │   ├── new/           # 커피 추가 페이지
│   │   └── [id]/          # 커피 상세 페이지 (동적 라우트)
│   ├── recipes/           # 레시피 관리 페이지
│   │   ├── new/           # 레시피 추가 페이지
│   │   └── detail/        # 레시피 상세 페이지
│   ├── consumption/       # 소비 기록 페이지
│   │   └── quick/         # 빠른 소비 기록 페이지
│   ├── board/             # 게시판 페이지
│   │   ├── new/           # 게시글 작성
│   │   ├── detail/        # 게시글 상세
│   │   └── edit/          # 게시글 수정
│   └── mypage/            # 마이페이지 (닉네임 관리)
├── components/            # React 컴포넌트
│   ├── dashboard/         # 대시보드 컴포넌트
│   ├── coffees/           # 커피 관련 컴포넌트
│   ├── recipes/           # 레시피 관련 컴포넌트
│   ├── consumption/       # 소비 기록 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트 (네비게이션)
│   ├── providers/         # Context Provider
│   └── ui/                # 공통 UI 컴포넌트
├── lib/                   # 라이브러리 설정
│   └── firebase.ts        # Firebase 설정
├── services/              # API 서비스
│   ├── authService.ts     # 인증 서비스
│   └── firebaseService.ts # Firestore 서비스
├── store/                 # 상태 관리
│   └── useStore.ts        # Zustand 스토어
└── types/                 # TypeScript 타입 정의
    └── index.ts           # 타입 정의
```

## 🔧 개발 가이드

### 코드 품질
- TypeScript 엄격 모드 사용
- ESLint/Prettier 설정
- 컴포넌트별 타입 정의

### 성능 최적화
- React.memo, useMemo, useCallback 활용
- 이미지 최적화 및 lazy loading
- Firebase 쿼리 최적화

### 에러 처리
- try-catch 블록으로 Firebase 오류 처리
- 사용자 친화적 에러 메시지
- 로딩 상태 표시

## 📊 데이터베이스 구조

### Firestore 컬렉션
- `users`: 사용자 정보 (닉네임 포함)
- `coffees`: 커피 원두 정보 (상세 설명 필드 포함)
- `recipes`: 레시피 정보 (원두 선택 기반)
- `consumptions`: 소비 기록 (사용자명, 시간대 포함)
- `boardPosts`: 게시판 게시글
- `boardComments`: 게시판 댓글

### 주요 데이터 모델
- **Coffee**: 컵노트, 로스팅 포인트, 농장 정보, 감각적 특성 등 상세 필드
- **CoffeeConsumption**: 사용자명, 소비 시간, 레시피 정보 포함
- **Recipe**: 원두 선택 기반의 간소화된 레시피
- **User**: 닉네임 관리 기능

## 🚀 배포

### Vercel 배포
1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 연결
3. 환경 변수 설정
4. 자동 배포

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## ✨ 주요 특징

### 🎯 공유 시스템
- **공유 커피 재고**: 모든 사용자가 동일한 커피 재고를 공유
- **공유 레시피**: 모든 사용자가 동일한 레시피를 공유
- **공유 소비 기록**: 모든 사용자의 소비 기록을 함께 확인

### 🕐 시간 관리
- **소비 시간 입력**: 소비 기록 시 정확한 시간 입력 가능
- **달력 뷰**: 소비 기록을 달력 형태로 시각화
- **실시간 동기화**: 페이지 포커스 시 자동 데이터 새로고침

### 🔄 자동 복구
- **재고 자동 복구**: 소비 기록 삭제 시 커피 재고 자동 복구
- **트랜잭션 처리**: 데이터 일관성 보장

### 🎨 전문적인 UI
- **커피 상세 페이지**: 다크 테마의 전문적인 커피 정보 표시
- **감각적 특성**: 산미, 바디감, 발효도를 점수로 표시
- **직관적 네비게이션**: 하단 네비게이션 바와 홈 버튼

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 있으시면 이슈를 생성해주세요.

## 🎯 사용법

### 1. 커피 등록
- 대시보드에서 "커피 추가" 클릭
- 기본 정보 (이름, 브랜드, 타입, 무게) 입력
- 상세 정보 (컵노트, 로스팅 포인트, 농장 정보, 감각적 특성) 입력 (선택사항)

### 2. 소비 기록
- 대시보드에서 "커피 마시기" 클릭
- 커피 선택, 레시피 선택 (선택사항), 사용량 입력
- 날짜와 시간 입력
- 소비 기록 완료

### 3. 커피 상세 보기
- 커피 재고에서 커피 카드 클릭
- 상세한 커피 정보 확인
- "상품 추가하기" 버튼으로 소비 기록

### 4. 소비 기록 관리
- 소비 기록 페이지에서 달력 뷰 확인
- 특정 날짜 클릭하여 해당 날짜 소비 기록 확인
- 소비 기록 삭제 시 자동으로 커피 재고 복구

### 5. 게시판 이용
- 커피 관련 정보 공유
- 댓글을 통한 소통

---

**RCV@UOS Coffee 관리 앱**으로 더 나은 커피 경험을 만들어보세요! ☕✨