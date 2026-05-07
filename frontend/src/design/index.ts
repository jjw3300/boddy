import { ViewStyle } from 'react-native';

export const COLORS = {
  // 배경
  bg:        '#F5E6C8',   // 밀짚색 캔버스
  bgDeep:    '#EDD9A3',   // 조금 더 짙은 나무판

  // 나무 계열
  woodLight: '#E8C98A',   // 연한 자작나무
  wood:      '#C8914A',   // 기본 나무 (버튼/카드)
  woodMid:   '#A0702A',   // 중간 갈색
  woodDark:  '#7D4E24',   // 진한 마호가니 (그림자/테두리)
  woodDeep:  '#4E2D0E',   // 가장 진한 바닥면

  // 페인트 포인트 (나무 블럭 위 페인트)
  paintRed:  '#D4473C',
  paintBlue: '#4A7FB5',
  paintGreen:'#4E9E6B',
  paintYellow:'#E8A020',

  // 텍스트
  textPrimary:   '#3D2314',
  textSecondary: '#7D5C3A',
  textOnWood:    '#FFFAF0',
  textLight:     '#F5E6C8',

  // 카드
  card:      '#F4DEB3',
  cardLight: '#FDF6E3',
};

// 나무 블럭 특유의 바닥면 그림자 효과
export const BLOCK_SHADOW: ViewStyle = {
  shadowColor: '#4E2D0E',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.45,
  shadowRadius: 2,
  elevation: 7,
};

export const BLOCK_SHADOW_SM: ViewStyle = {
  shadowColor: '#4E2D0E',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.35,
  shadowRadius: 1,
  elevation: 4,
};

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
};
