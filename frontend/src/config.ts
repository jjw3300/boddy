// Android 에뮬레이터: adb reverse tcp:8000 tcp:8000 로 호스트 localhost에 연결
//   (10.0.2.2 직결은 방화벽/네트워크 환경에 따라 막힐 수 있어 더 안정적인 방식으로 변경)
// iOS 시뮬레이터: localhost
// 실기기: 개발 PC의 실제 IP 주소로 변경
const BASE_URL = 'http://localhost:8000/api/v1';

// https://developers.kakao.com 내 애플리케이션 > 앱 키 > JavaScript 키
// (백엔드 KAKAO_REST_API_KEY와는 다른 키). 플랫폼 설정 > Web에 사이트 도메인으로
// http://localhost 를 등록해야 WebView에서 지도가 정상적으로 뜬다.
export const KAKAO_JS_KEY = 'cdf8486a7272e0a1fcb9f4eb049863cd';

export default BASE_URL;
