import { ViewStyle, TextStyle } from 'react-native';

// ─── 색상 ────────────────────────────────────────────────────────────────────

export const COLORS = {
  // 배경
  bg:        '#F5E6C8',
  bgDeep:    '#EDD9A3',

  // 나무 계열
  woodHighlight: '#F0D89C',
  woodLight: '#E8C98A',
  wood:      '#C8914A',
  woodMid:   '#A0702A',
  woodDark:  '#7D4E24',
  woodDeep:  '#4E2D0E',

  // 페인트 포인트
  paintRed:    '#D4473C',
  paintBlue:   '#4A7FB5',
  paintGreen:  '#4E9E6B',
  paintYellow: '#E8A020',

  // 소셜 로그인 브랜드 색
  kakao:     '#FEE500',
  kakaoText: '#191919',
  google:    '#FFFFFF',
  googleText:'#333333',

  // 텍스트
  textPrimary:   '#3D2314',
  textSecondary: '#7D5C3A',
  textMuted:     '#B09070',
  textOnWood:    '#FFFAF0',
  textLight:     '#F5E6C8',

  // 상태
  danger:    '#C0392B',
  dangerBg:  '#FDECEA',
  dangerDark:'#922B21',
  success:   '#27AE60',
  successBg: '#E9F7EF',

  // 카드
  card:       '#F4DEB3',
  cardLight:  '#FDF6E3',
  cardBorder: '#E8C98A',
};

// ─── 타이포그래피 ────────────────────────────────────────────────────────────

export const FONT: Record<string, TextStyle> = {
  display: { fontSize: 44, fontWeight: '900', letterSpacing: 1, color: COLORS.textPrimary },
  h1:      { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  h2:      { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  h3:      { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  body:    { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  bodyB:   { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  caption: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  label:   { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: COLORS.textSecondary },
  onWood:  { fontSize: 15, fontWeight: '700', color: COLORS.textOnWood },
};

// ─── 간격 ────────────────────────────────────────────────────────────────────

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ─── 둥글기 ──────────────────────────────────────────────────────────────────

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 999,
};

// ─── 나무 블럭 그림자 ────────────────────────────────────────────────────────

export const BLOCK_SHADOW: ViewStyle = {
  shadowColor: '#3D1A08',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.35,
  shadowRadius: 3,
  elevation: 6,
};

export const BLOCK_SHADOW_SM: ViewStyle = {
  shadowColor: '#3D1A08',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 3,
};

export const BLOCK_SHADOW_LG: ViewStyle = {
  shadowColor: '#3D1A08',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.4,
  shadowRadius: 4,
  elevation: 10,
};

// ─── 나무 블럭 공통 스타일 ───────────────────────────────────────────────────

/** 나무 블럭의 바닥면 높이 (눌렸을 때 줄어드는 두께) */
export const BLOCK_DEPTH = 6;
