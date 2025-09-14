# 커피 관리 PWA ☕

커피 원두 재고 관리, 레시피 관리, 소비량 추적을 위한 PWA(Progressive Web App)입니다.

## 🚀 주요 기능

### ☕ 커피 재고 관리
- 커피 원두 재고량 추적 및 관리
- 브랜드, 종류, 가격, 현재 보유량 등 기본 정보 관리
- 상세 정보를 메모장 형태로 자유롭게 기록
- 재고 부족 알림 및 유통기한 관리

### 📝 레시피 관리
- 커피 제조 레시피 저장 및 관리
- 분쇄 입자 크기 설정
- 제조 과정을 메모장 형태로 자유롭게 기록
- 카테고리별 분류 (에스프레소, 드립, 라떼, 카푸치노, 아메리카노, 콜드브루 등)
- 즐겨찾기 기능

### 💬 댓글 시스템
- 레시피에 대한 맛 평가 및 댓글 작성
- 1-5점 평점 시스템
- 댓글 수정 및 삭제 기능
- 실시간 댓글 업데이트

### 📊 소비량 추적
- 일일/주간/월간 커피 소비량 통계
- 달력을 통한 소비 기록 시각화
- 빠른 소비 기록 추가 기능

### 📱 PWA 지원
- 모바일에서 앱처럼 설치하여 사용 가능
- 오프라인에서도 기본 기능 사용 가능
- 푸시 알림 지원

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Firestore, Authentication)
- **State Management**: Zustand
- **PWA**: Next PWA
- **UI Components**: Headless UI, Heroicons

## 📁 프로젝트 구조

```
rcvcofffee/
├── src/
│   ├── app/                          # Next.js App Router 페이지
│   │   ├── coffees/                  # 커피 관리 페이지
│   │   │   ├── detail/               # 커피 상세 페이지
│   │   │   ├── new/                  # 커피 추가 페이지
│   │   │   └── page.tsx              # 커피 목록 페이지
│   │   ├── recipes/                  # 레시피 관리 페이지
│   │   │   ├── detail/               # 레시피 상세 페이지 (댓글 포함)
│   │   │   ├── edit/                 # 레시피 수정 페이지
│   │   │   ├── new/                  # 레시피 추가 페이지
│   │   │   └── page.tsx              # 레시피 목록 페이지
│   │   ├── consumption/              # 소비량 관리 페이지
│   │   │   ├── quick/                # 빠른 소비 기록 페이지
│   │   │   └── page.tsx              # 소비량 통계 페이지
│   │   ├── login/                    # 로그인 페이지
│   │   ├── mypage/                   # 마이페이지
│   │   └── page.tsx                  # 대시보드 (메인 페이지)
│   ├── components/                   # React 컴포넌트
│   │   ├── coffees/                  # 커피 관련 컴포넌트
│   │   ├── recipes/                  # 레시피 관련 컴포넌트
│   │   ├── consumption/              # 소비량 관련 컴포넌트
│   │   ├── dashboard/                # 대시보드 컴포넌트
│   │   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── providers/                # 컨텍스트 프로바이더
│   │   └── ui/                       # 공통 UI 컴포넌트
│   ├── hooks/                        # 커스텀 훅
│   │   └── useAuth.ts                # 인증 관련 훅
│   ├── lib/                          # 라이브러리 설정
│   │   └── firebase.ts               # Firebase 설정
│   ├── services/                     # Firebase 서비스
│   │   ├── authService.ts            # 인증 서비스
│   │   └── firebaseService.ts        # Firestore 서비스
│   ├── store/                        # Zustand 상태 관리
│   │   └── useStore.ts               # 전역 상태 스토어
│   └── types/                        # TypeScript 타입 정의
│       ├── index.ts                  # 메인 타입 정의
│       └── next-pwa.d.ts             # PWA 타입 정의
├── public/                           # 정적 파일
│   ├── icons/                        # PWA 아이콘
│   └── manifest.json                 # PWA 매니페스트
├── firebase.json                     # Firebase 설정
├── firestore.rules                   # Firestore 보안 규칙
├── firestore.indexes.json            # Firestore 인덱스 설정
└── next.config.ts                    # Next.js 설정
```

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/Inseok-kong/rcvcofffee.git
cd rcvcofffee/rcvcofffee
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 Firebase 설정을 추가하세요:

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. 개발 서버 실행
```bash
npm run dev
```

개발 서버가 실행되면 http://localhost:3000 에서 앱을 확인할 수 있습니다.

### 5. 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# Firebase에 배포
firebase deploy
```

## 🔧 사용 가능한 스크립트

- `npm run dev`: 개발 서버 실행 (Turbopack 사용)
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run lint`: ESLint 실행

## 🌐 배포된 앱

- **URL**: https://rcvcoffee.web.app
- **PWA**: 모바일에서 "홈 화면에 추가" 가능

## 📱 PWA 기능

- 모바일에서 앱처럼 설치 가능
- 오프라인에서도 기본 기능 사용 가능
- 푸시 알림 지원
- 반응형 디자인으로 모든 기기에서 최적화

## 🔐 보안

- Firebase Authentication을 통한 사용자 인증
- Firestore 보안 규칙을 통한 데이터 보호
- 사용자별 데이터 격리

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request