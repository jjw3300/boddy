// ─────────────────────────────────────────────────────────────────────────
// Boddy 디자인 시스템 — shadcn 스타일 (react-native-reusables + NativeWind)
// 실제 스타일링은 컴포넌트의 className(Tailwind)으로 하고, 여기 COLORS는
// className을 쓸 수 없는 자리(SVG 아이콘 color prop, StatusBar, ActivityIndicator
// 등 네이티브 prop)에서만 쓰는 raw hex 값. global.css의 CSS 변수와 반드시 맞출 것.
// ─────────────────────────────────────────────────────────────────────────

export const COLORS = {
  background: '#FFFFFF',
  foreground: '#1C1917',

  primary: '#FFEE58',
  primaryForeground: '#1C1917',

  secondary: '#FAFAF9',
  secondaryForeground: '#1C1917',

  muted: '#F5F5F4',
  mutedForeground: '#78716C',

  accent: '#FEF3C7',
  accentForeground: '#292100',

  destructive: '#DC2626',
  destructiveForeground: '#FFFFFF',

  success: '#16A34A',
  successForeground: '#FFFFFF',

  info: '#3B82F6',
  infoForeground: '#FFFFFF',

  border: '#E7E5E4',

  // 소셜 로그인 브랜드 색
  kakao: '#FEE500',
  kakaoText: '#191919',
};
