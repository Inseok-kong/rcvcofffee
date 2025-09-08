# 커피 관리 PWA 앱 ☕

Firebase 기반의 커피 사용량 및 레시피 관리 PWA 애플리케이션입니다.

## 🚀 주요 기능

### 📱 핵심 기능
- **커피 등록 관리**: 커피 원두 정보 등록, 수정, 삭제
- **일일 커피 소비 기록**: 사용자별 커피 소비 추적 및 통계
- **커피 레시피 관리**: 레시피 등록, 카테고리 분류, 즐겨찾기
- **원두 사용량 추적**: 실시간 재고 관리 및 사용량 분석

### 🎨 UI/UX
- **메인 대시보드**: 오늘 마신 커피, 보유 원두 현황, 최근 레시피, 주간 통계
- **PWA 기능**: 오프라인 지원, 푸시 알림, 홈 화면 설치
- **반응형 디자인**: 모바일 우선 설계

### 🔐 사용자 인증
- Firebase Authentication
- 구글/이메일 로그인
- 사용자별 데이터 분리

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
│   ├── recipes/           # 레시피 관리 페이지
│   └── consumption/       # 소비 기록 페이지
├── components/            # React 컴포넌트
│   ├── dashboard/         # 대시보드 컴포넌트
│   ├── coffees/           # 커피 관련 컴포넌트
│   ├── recipes/           # 레시피 관련 컴포넌트
│   ├── consumption/       # 소비 기록 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트
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
- `users`: 사용자 정보
- `coffees`: 커피 원두 정보
- `recipes`: 레시피 정보
- `consumptions`: 소비 기록
- `beanUsages`: 원두 사용 기록

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

---

**커피 관리 PWA 앱**으로 더 나은 커피 경험을 만들어보세요! ☕✨