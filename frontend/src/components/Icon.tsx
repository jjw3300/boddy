import React from 'react';
import Svg, { Path, Circle, Rect, G, Polyline, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  fill?: string;
}

// 주사위 — 추천 탭
export function DiceIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="4" fill={fill} stroke={color} strokeWidth="2" />
      <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
      <Circle cx="15.5" cy="8.5" r="1.5" fill={color} />
      <Circle cx="8.5" cy="15.5" r="1.5" fill={color} />
      <Circle cx="15.5" cy="15.5" r="1.5" fill={color} />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
    </Svg>
  );
}

// 책 — 기록 탭
export function BookIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4C4 4 8 3 12 3C16 3 20 4 20 4V20C20 20 16 19 12 19C8 19 4 20 4 20V4Z"
        fill={fill} stroke={color} strokeWidth="2" strokeLinejoin="round"
      />
      <Line x1="12" y1="3" x2="12" y2="19" stroke={color} strokeWidth="1.5" />
      <Line x1="7" y1="7" x2="11" y2="7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="7" y1="10" x2="11" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="7" y1="13" x2="11" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// 위치 핀 — 카페 탭
export function MapPinIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
        fill={fill} stroke={color} strokeWidth="2" strokeLinejoin="round"
      />
      <Circle cx="12" cy="9" r="2.5" fill={color} />
    </Svg>
  );
}

// 렌치 — 도구 탭
export function WrenchIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.7 6.3a1 1 0 0 0-1.4 0L9 10.6V14h3.4l4.3-4.3a1 1 0 0 0 0-1.4L14.7 6.3z"
        fill={fill} stroke={color} strokeWidth="1.8" strokeLinejoin="round"
      />
      <Path d="M5 19l6-6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// 돋보기 — 검색/추천
export function SearchIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" fill={fill} stroke={color} strokeWidth="2.5" />
      <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

// 뒤로가기 화살표
export function ArrowLeftIcon({ size = 24, color = '#3D2314' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M12 5L5 12L12 19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// 새로고침/다시
export function RefreshIcon({ size = 24, color = '#3D2314' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12C3 7.03 7.03 3 12 3C15.47 3 18.47 4.97 20.03 7.87"
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
      />
      <Path d="M21 3V8H16" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M21 12C21 16.97 16.97 21 12 21C8.53 21 5.53 19.03 3.97 16.13"
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
      />
      <Path d="M3 21V16H8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// 체크 마크
export function ChevronRightIcon({ size = 24, color = '#3D2314' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// 게임패드 / 컨트롤러
export function GamepadIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="7" width="20" height="12" rx="5" fill={fill} stroke={color} strokeWidth="2" />
      <Line x1="7" y1="11" x2="7" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="5" y1="13" x2="9" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="16" cy="11.5" r="1.2" fill={color} />
      <Circle cx="16" cy="14.5" r="1.2" fill={color} />
    </Svg>
  );
}

// 동전 — 동전 던지기
export function CoinIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" fill={fill} stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" />
      <Line x1="12" y1="7" x2="12" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="12" y1="15" x2="12" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// 트로피 — 점수판
export function TrophyIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 3H16V13C16 15.21 14.21 17 12 17C9.79 17 8 15.21 8 13V3Z"
        fill={fill} stroke={color} strokeWidth="2" strokeLinejoin="round"
      />
      <Path d="M8 6H4C4 6 4 10 8 11" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M16 6H20C20 6 20 10 16 11" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="12" y1="17" x2="12" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="8" y1="20" x2="16" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

// 손가락 — 선 정하기
export function FingerIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C12 3 12 3 12 3C10.9 3 10 3.9 10 5V13L8.5 11.5C7.9 10.9 6.9 10.9 6.3 11.5C5.7 12.1 5.7 13.1 6.3 13.7L10 18C10.9 19.2 12.3 20 14 20C16.8 20 19 17.8 19 15V8C19 6.9 18.1 6 17 6C16.6 6 16.3 6.1 16 6.3V6C16 4.9 15.1 4 14 4C13.6 4 13.3 4.1 13 4.3V5C13 3.9 12.6 3 12 3Z"
        fill={fill} stroke={color} strokeWidth="1.8" strokeLinejoin="round"
      />
    </Svg>
  );
}

// 별 (즐겨찾기 / 평점)
export function StarIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={fill} stroke={color} strokeWidth="2" strokeLinejoin="round"
      />
    </Svg>
  );
}
