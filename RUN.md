# Boddy 실행 가이드

> buddy + board = **Boddy** — 보드게임 편의성 지원 앱

---

## 사전 준비 (최초 1회)

### 공통 필수 도구

| 도구 | 버전 | 확인 명령어 |
|------|------|------------|
| Node.js | 22.11.0 이상 | `node -v` |
| Python | 3.12 이상 | `python --version` |
| Git | 최신 | `git --version` |

### Android 개발 환경 (Android 에뮬레이터 / 실기기)

1. [Android Studio](https://developer.android.com/studio) 설치
2. Android Studio → SDK Manager → Android SDK 설치
3. 환경변수 설정 (Windows 기준)
   ```
   ANDROID_HOME = C:\Users\<사용자명>\AppData\Local\Android\Sdk
   PATH에 추가 = %ANDROID_HOME%\platform-tools
   ```
4. Android Studio → Virtual Device Manager → 에뮬레이터 생성 (API 35 권장)

---

## 백엔드 실행 (FastAPI)

```bash
# 1. 백엔드 폴더로 이동
cd backend

# 2. 최초 1회: 가상환경 생성
python -m venv .venv

# 3. 가상환경 활성화
# Windows PowerShell
.venv\Scripts\Activate.ps1
# Windows CMD
.venv\Scripts\activate.bat
# Mac / Linux
source .venv/bin/activate

# 4. 최초 1회: 패키지 설치
pip install -r requirements.txt

# 5. 환경변수 파일 생성 (최초 1회)
copy .env.example .env     # Windows
# cp .env.example .env     # Mac/Linux

# 6. 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

서버가 정상 실행되면 아래 주소에서 확인 가능합니다.

- API 상태: http://localhost:8000/health
- Swagger 문서: http://localhost:8000/docs

---

## 프론트엔드 실행 (React Native)

### 패키지 설치 (최초 1회)

```bash
cd frontend
npm install
```

### Metro 번들러 시작

```bash
cd frontend
npm start
```

Metro가 실행된 상태에서 별도 터미널을 열어 아래 명령어를 실행합니다.

### Android 실행

```bash
cd frontend
npm run android
```

> Android Studio에서 에뮬레이터를 먼저 실행해 두거나, USB 디버깅을 켠 실기기를 연결해야 합니다.

### iOS 실행 (Mac 전용)

```bash
cd frontend/ios
pod install          # 최초 1회 또는 네이티브 모듈 변경 시

cd ..
npm run ios
```

---

## API URL 설정 (`config.ts`)

프론트엔드가 백엔드와 통신하려면 [frontend/src/config.ts](frontend/src/config.ts) 의 `BASE_URL`을 환경에 맞게 수정해야 합니다.

```ts
// Android 에뮬레이터 (기본값)
const BASE_URL = 'http://10.0.2.2:8000/api/v1';

// iOS 시뮬레이터
const BASE_URL = 'http://localhost:8000/api/v1';

// 실기기 (개발 PC와 같은 Wi-Fi 연결 필요)
const BASE_URL = 'http://192.168.x.x:8000/api/v1';
//                        ↑ ipconfig 로 확인한 PC의 실제 IP
```

---

## 전체 실행 순서 요약

```
터미널 1  →  백엔드 서버 실행
터미널 2  →  Metro 번들러 실행 (npm start)
터미널 3  →  앱 빌드 실행 (npm run android)
```

세 터미널 모두 켜진 상태를 유지해야 합니다.

---

## 자주 발생하는 문제

### `JAVA_HOME is not set` 오류
Android Studio 설치 후 JDK 경로를 환경변수에 추가합니다.
```
JAVA_HOME = C:\Program Files\Android\Android Studio\jbr
```

### 에뮬레이터에서 네트워크 연결 안 됨
에뮬레이터 ↔ 호스트 통신에는 `10.0.2.2`를 사용합니다. `localhost`나 `127.0.0.1`은 에뮬레이터 내부를 가리키므로 연결되지 않습니다.

### Metro 캐시 문제 (화면이 이상하게 보일 때)
```bash
npm start -- --reset-cache
```

### Android 빌드 실패 시
```bash
cd frontend/android
./gradlew clean        # Mac/Linux
gradlew.bat clean      # Windows
cd ..
npm run android
```

### pip install 오류 (`externally-managed-environment`)
가상환경이 활성화되지 않은 상태입니다. 3번 단계(가상환경 활성화)를 먼저 실행하세요. 터미널 프롬프트 앞에 `(.venv)` 표시가 있어야 합니다.
