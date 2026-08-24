// ─────────────────────────────────────────────────────────────────────────
// Boddy 그라데이션 디자인 시스템 — 노랑 베이스 고채도 그라데이션
// 히어로 영역·CTA·아바타 링·FAB 등 "포인트"에만 선택적으로 사용하고,
// 본문 카드/리스트는 흰 배경 + 컬러 포인트로 대비를 준다.
// ─────────────────────────────────────────────────────────────────────────

/** 메인 브랜드 그라데이션 — 골든 옐로우 → 비비드 오렌지. CTA, 히어로, 로고 배지 */
export const GRADIENT_PRIMARY = ['#FFE55C', '#FF9F1C'];

/** 보조 그라데이션 — 오렌지 → 코랄 핑크. 강조 배지, 두 번째 히어로 패널, 결과/축하 연출 */
export const GRADIENT_WARM = ['#FF9F1C', '#FF5E7E'];

/** 옅은 그라데이션 — 페일 옐로우 → 옐로우. 서브틀한 배경 패널, 선택되지 않은 상태 */
export const GRADIENT_SOFT = ['#FFF6D6', '#FFE066'];

/** 딥 그라데이션 — 앰버 → 버건디. 다크 히어로/오버레이 텍스트 대비용 */
export const GRADIENT_DEEP = ['#FB8B24', '#C1392B'];

export const GRADIENTS = {
  primary: GRADIENT_PRIMARY,
  warm: GRADIENT_WARM,
  soft: GRADIENT_SOFT,
  deep: GRADIENT_DEEP,
} as const;

export type GradientName = keyof typeof GRADIENTS;
