import React from 'react';
import Svg, { Path, Circle, Rect, G, Line, Ellipse, Polygon } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  fill?: string;
}

// ─── 탭 아이콘 ───────────────────────────────────────────────────────────────

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

// ─── 내 정보 탭 아이콘 ───────────────────────────────────────────────────────

export function UserIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" fill={fill} stroke={color} strokeWidth="2" />
      <Path
        d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20"
        stroke={color} strokeWidth="2" strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── 설정 / 내 정보 화면 아이콘 ─────────────────────────────────────────────

export function BellIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
        fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

export function InfoIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={fill} stroke={color} strokeWidth="2" />
      <Line x1="12" y1="8" x2="12" y2="8.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="12" y1="12" x2="12" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function LogoutIcon({ size = 24, color = '#3D2314' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M16 17L21 12L16 7"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function EditIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
        fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 24, color = '#3D2314' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ShieldIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
        fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── 기존 유틸 아이콘 ────────────────────────────────────────────────────────

export function SearchIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" fill={fill} stroke={color} strokeWidth="2.5" />
      <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

export function ArrowLeftIcon({ size = 24, color = '#3D2314' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M12 5L5 12L12 19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function RefreshIcon({ size = 24, color = '#3D2314' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12C3 7.03 7.03 3 12 3C15.47 3 18.47 4.97 20.03 7.87" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M21 3V8H16" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 12C21 16.97 16.97 21 12 21C8.53 21 5.53 19.03 3.97 16.13" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M3 21V16H8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

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

export function FingerIcon({ size = 24, color = '#3D2314', fill = 'none' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C10.9 3 10 3.9 10 5V13L8.5 11.5C7.9 10.9 6.9 10.9 6.3 11.5C5.7 12.1 5.7 13.1 6.3 13.7L10 18C10.9 19.2 12.3 20 14 20C16.8 20 19 17.8 19 15V8C19 6.9 18.1 6 17 6C16.6 6 16.3 6.1 16 6.3V6C16 4.9 15.1 4 14 4C13.6 4 13.3 4.1 13 4.3V5C13 3.9 12.6 3 12 3Z"
        fill={fill} stroke={color} strokeWidth="1.8" strokeLinejoin="round"
      />
    </Svg>
  );
}

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

// ─── 소셜 로그인 아이콘 ──────────────────────────────────────────────────────

/** 카카오 말풍선 K 아이콘 */
export function KakaoIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Ellipse cx="12" cy="11" rx="9" ry="8" fill="#191919" />
      <Path
        d="M7.5 14C7.5 14 8.5 8 12 8C15.5 8 16.5 14 16.5 14"
        stroke="#FEE500" strokeWidth="0" fill="none"
      />
      {/* 카카오 K 글자 형태의 심플 표현 */}
      <Path d="M9.5 8.5V13.5" stroke="#FEE500" strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M9.5 11L13.5 8.5" stroke="#FEE500" strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M9.5 11L13.5 13.5" stroke="#FEE500" strokeWidth="1.8" strokeLinecap="round" />
      {/* 말풍선 꼬리 */}
      <Path d="M10 17C9 17 8 16 8.5 15L10 17Z" fill="#191919" />
    </Svg>
  );
}

/** 구글 G 아이콘 */
export function GoogleIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z"
        fill="#4285F4"
      />
      <Path
        d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.62 12 18.62C9.14 18.62 6.71 16.7 5.84 14.1H2.18V16.94C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.07H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.93L5.84 14.09Z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.07L5.84 9.91C6.71 7.31 9.14 5.38 12 5.38Z"
        fill="#EA4335"
      />
    </Svg>
  );
}
