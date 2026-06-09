import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Platform,
} from 'react-native';
import { COLORS, FONT, SPACING, RADIUS, BLOCK_SHADOW_LG, BLOCK_SHADOW_SM } from '../../design';
import { DiceIcon, KakaoIcon, GoogleIcon } from '../../components/Icon';
import { WoodButton } from '../../components/WoodButton';
import { useAuth, LoginProvider } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState<LoginProvider | null>(null);

  const handleLogin = async (provider: LoginProvider) => {
    try {
      setLoading(provider);
      await login(provider);
    } catch (e) {
      // 실제 SDK 연동 후 에러 처리 추가
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.grainTop} />
      <View style={s.grainBottom} />

      <View style={s.inner}>
        {/* 로고 + 태그라인 */}
        <View style={s.logoArea}>
          <View style={s.logoWrapper}>
            <View style={s.logoBlock}>
              <DiceIcon size={52} color={COLORS.woodHighlight} fill={COLORS.woodHighlight} />
            </View>
            <View style={s.logoBlockShadow} />
          </View>
          <Text style={s.appName}>Boddy</Text>
          <Text style={s.appSub}>보드게임 버디</Text>
          <Text style={s.tagline}>어떤 게임 해볼지 같이 찾아봐요</Text>
        </View>

        {/* 로그인 버튼 영역 */}
        <View style={s.btnArea}>
          <Text style={s.startLabel}>로그인하고 시작하기</Text>

          {/* 카카오 로그인 */}
          <SocialButton
            label="카카오로 시작하기"
            bg={COLORS.kakao}
            bottomColor="#D4BC00"
            textColor={COLORS.kakaoText}
            onPress={() => handleLogin('kakao')}
            loading={loading === 'kakao'}
            icon={<KakaoIcon size={22} />}
          />

          {/* 구글 로그인 */}
          <SocialButton
            label="Google로 시작하기"
            bg={COLORS.google}
            bottomColor="#C8C8C8"
            textColor={COLORS.googleText}
            onPress={() => handleLogin('google')}
            loading={loading === 'google'}
            icon={<GoogleIcon size={22} />}
            bordered
          />

          {/* 나중에 하기 */}
          <TouchableOpacity
            style={s.guestBtn}
            onPress={() => handleLogin('guest')}
            activeOpacity={0.7}
          >
            <Text style={s.guestText}>나중에 하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── 소셜 로그인 버튼 컴포넌트 ──────────────────────────────────────────────

interface SocialButtonProps {
  label: string;
  bg: string;
  bottomColor: string;
  textColor: string;
  onPress: () => void;
  loading: boolean;
  icon: React.ReactNode;
  bordered?: boolean;
}

function SocialButton({
  label, bg, bottomColor, textColor, onPress, loading, icon, bordered,
}: SocialButtonProps) {
  return (
    <WoodButton
      onPress={loading ? undefined : onPress}
      bg={bg}
      bottomColor={bottomColor}
      depth={5}
      radius={RADIUS.md}
      style={[
        s.socialSurface,
        bordered && s.socialBordered,
      ]}
    >
      <View style={s.socialInner}>
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <>
            <View style={s.socialIcon}>{icon}</View>
            <Text style={[s.socialLabel, { color: textColor }]}>{label}</Text>
          </>
        )}
      </View>
    </WoodButton>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  // 배경 나뭇결 장식선
  grainTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 6,
    backgroundColor: COLORS.woodLight,
    opacity: 0.5,
  },
  grainBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 6,
    backgroundColor: COLORS.woodLight,
    opacity: 0.5,
  },
  inner: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.xl,
  },

  logoArea: {
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: SPACING.md,
  },
  logoBlock: {
    width: 108,
    height: 108,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.wood,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.woodMid,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    ...BLOCK_SHADOW_LG,
  },
  logoBlockShadow: {
    height: 10,
    backgroundColor: COLORS.woodDeep,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    borderWidth: 2.5,
    borderTopWidth: 0,
    borderColor: COLORS.woodDeep,
    marginHorizontal: 4,
    ...BLOCK_SHADOW_SM,
  },
  appName: {
    ...FONT.display,
    fontSize: 48,
    color: COLORS.textPrimary,
    letterSpacing: 3,
  },
  appSub: {
    ...FONT.caption,
    fontSize: 14,
    letterSpacing: 1.5,
    marginTop: 6,
    color: COLORS.textSecondary,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 22,
  },

  btnArea: {
    gap: SPACING.sm + 2,
  },
  startLabel: {
    ...FONT.label,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    letterSpacing: 1.5,
    color: COLORS.textMuted,
  },
  socialSurface: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
  },
  socialBordered: {
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  socialInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    minHeight: 54,
    gap: 10,
  },
  socialIcon: {
    width: 26,
    alignItems: 'center',
  },
  socialLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // 나중에 하기
  guestBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  guestText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
});
