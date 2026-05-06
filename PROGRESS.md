# Boddy 프로젝트 진행 현황

> 보드게임 편의성 지원 앱 | buddy + board = **Boddy**  
> 마지막 업데이트: 2026-05-06

---

## 기술 스택

| 레이어 | 선택 | 버전 |
|--------|------|------|
| 프론트엔드 | React Native (TypeScript) | 0.85.3 |
| 백엔드 | FastAPI (Python) | 0.115.0 |
| 데이터베이스 | PostgreSQL + Supabase | - |
| 배포 | Railway (백엔드) | - |
| 지도 | 카카오맵 API | - |
| 보드게임 DB | BGG XML API2 | - |

---

## 완료된 작업

### 환경 세팅
- [x] 프로젝트 폴더 구조 생성 (`frontend/`, `backend/`)
- [x] React Native 0.85.3 TypeScript 프로젝트 초기화
- [x] FastAPI 백엔드 기본 구조 생성
- [x] Python 3.12 설치 및 가상환경 세팅 (`.venv`)
- [x] Git 초기화 및 `.gitignore` 설정
- [x] GitHub 레포 생성 및 연결 ([jjw3300/boddy](https://github.com/jjw3300/boddy))

### F-01 보드게임 추천 (Q&A 필터링) — Phase 1
- [x] BGG XML API2 연동 (`bgg_service.py`)
  - Hot 게임 50개 조회 후 상세 정보 일괄 요청
  - 필터 조건 적용 후 최대 20개 반환
- [x] 추천 필터 스키마 정의
  - `player_count` (인원 수)
  - `play_style` (cooperative / competitive / both)
  - `difficulty` (easy / medium / hard) — BGG weight 기반
  - `play_time` (short <30분 / medium 30~90분 / long >90분)
  - `game_type` (luck / dexterity / party / strategy) — BGG 메카닉·카테고리 ID 기반 자동 감지
- [x] REST API 엔드포인트 (`POST /api/v1/recommendations`)
- [x] Q&A 5단계 흐름 화면 (`RecommendationScreen.tsx`)
  - 인원 → 협력/경쟁 → 게임 유형 → 난이도 → 플레이 시간
  - 진행바, 이전 버튼, 브라운/베이지 Boddy 디자인 적용
- [x] 결과 목록 화면 (`ResultScreen.tsx`)
  - 썸네일, 게임 유형 태그(운빨🎰 / 피지컬🤸 / 파티🥳 / 뇌지컬🧠), 인원·시간·난이도 표시
  - 결과 없을 때 빈 화면 처리

---

## 남은 작업

### F-01 보드게임 추천 — 마무리
- [ ] 게임 상세 페이지 (게임 클릭 시 BGG 상세 정보 조회)
- [ ] 추천 결과 캐싱 (BGG API 응답 느림 → Redis 또는 인메모리 캐시)
- [ ] BGG API 재시도 로직 (타임아웃 대응)
- [ ] 실기기/에뮬레이터 테스트 및 API URL 환경변수화

### F-02 플레이 기록 (Board Game Log)
- [ ] Supabase 프로젝트 생성 및 연결
- [ ] DB 테이블 설계 (`game_logs`, `users`)
- [ ] 기록 작성 화면 (날짜, 게임명, 참가자, 점수, 소감)
- [ ] 기록 목록/상세 화면 (다이어리 형태)
- [ ] 나무판·스탬프 애니메이션 UI 연출
- [ ] 백엔드 CRUD API (`/api/v1/logs`)
- [ ] 유저 인증 (Supabase Auth)

### F-03 주변 보드게임 카페 찾기
- [ ] 카카오맵 API 키 발급 및 연동
- [ ] 현재 위치 권한 요청 (React Native Geolocation)
- [ ] 반경 N km 카페 마커 표시
- [ ] 카페 기본 정보 카드 (이름, 거리, 주소)

### F-04 플레이 편의 도구 모음
- [ ] 주사위 굴리기 (다면체 선택, 물리 효과·사운드)
- [ ] 동전 던지기
- [ ] 점수표 Scoreboard (플레이어 등록, +/- 실시간 점수)
- [ ] First Player 선정 룰렛 (멀티터치 랜덤 픽)

### 공통 / 인프라
- [ ] 네비게이션 설정 (React Navigation — 탭 + 스택)
- [ ] 앱 아이콘 및 스플래시 화면 (Boddy 브랜딩)
- [ ] Railway 배포 (백엔드)
- [ ] 환경변수 관리 (.env, react-native-config)
- [ ] F-01 Phase 2: LLM 자연어 추천 (앱 안정화 후)
- [ ] Android / iOS 스토어 배포

---

## 현재 폴더 구조

```
BoardGame/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI 앱 진입점, CORS 설정
│   │   ├── config.py                # 환경변수 (pydantic-settings)
│   │   ├── routers/
│   │   │   └── recommendation.py   # POST /api/v1/recommendations
│   │   ├── services/
│   │   │   └── bgg_service.py      # BGG API 연동 + 필터·게임유형 감지
│   │   └── schemas/
│   │       └── recommendation.py   # 요청/응답 Pydantic 모델
│   ├── requirements.txt
│   ├── .env.example
│   └── .env                        # 로컬 전용 (gitignore)
└── frontend/
    ├── src/
    │   ├── screens/
    │   │   ├── RecommendationScreen.tsx  # Q&A 5단계 흐름
    │   │   └── ResultScreen.tsx          # 추천 결과 목록
    │   ├── api/
    │   │   └── recommendation.ts         # fetchRecommendations()
    │   └── types/
    │       └── index.ts                  # 공통 타입 정의
    ├── App.tsx
    └── package.json
```
