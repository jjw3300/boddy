import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../design';
import { DiceIcon, KakaoIcon, GoogleIcon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { GradientView } from '../../components/GradientView';
import { useAuth, LoginProvider } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState<LoginProvider | null>(null);

  const handleLogin = async (provider: LoginProvider) => {
    try {
      setLoading(provider);
      await login(provider);
    } catch {
      // 실제 SDK 연동 후 에러 처리 추가
    } finally {
      setLoading(null);
    }
  };

  return (
    <GradientView gradient="primary" direction="diagonal" className="flex-1">
      <SafeAreaView className="flex-1">
        {/* 로고 + 태그라인 */}
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-white/25">
            <DiceIcon size={40} color="#FFFFFF" fill="transparent" />
          </View>
          <Text className="text-4xl font-extrabold tracking-tight text-white">Boddy</Text>
          <Text className="mt-1.5 text-sm font-medium text-white/85">보드게임 버디</Text>
          <Text className="mt-4 text-center text-sm leading-5 text-white/85">
            어떤 게임 해볼지 같이 찾아봐요
          </Text>
        </View>

        {/* 로그인 버튼 영역 — 화이트 바텀시트 */}
        <View className="gap-2.5 rounded-t-[32px] bg-white px-6 pb-8 pt-7 shadow-lg">
          <Text className="mb-1 text-center text-[11px] font-semibold tracking-wide text-muted-foreground">
            로그인하고 시작하기
          </Text>

          {/* 카카오 로그인 */}
          <Button
            onPress={loading ? undefined : () => handleLogin('kakao')}
            className="h-14 rounded-xl bg-[#FEE500]"
          >
            {loading === 'kakao' ? (
              <ActivityIndicator size="small" color={COLORS.kakaoText} />
            ) : (
              <View className="flex-row items-center gap-2.5">
                <KakaoIcon size={22} />
                <Text className="text-base font-bold tracking-tight text-[#191919]">카카오로 시작하기</Text>
              </View>
            )}
          </Button>

          {/* 구글 로그인 */}
          <Button
            onPress={loading ? undefined : () => handleLogin('google')}
            variant="outline"
            className="h-14 rounded-xl"
          >
            {loading === 'google' ? (
              <ActivityIndicator size="small" color={COLORS.foreground} />
            ) : (
              <View className="flex-row items-center gap-2.5">
                <GoogleIcon size={22} />
                <Text className="text-base font-bold tracking-tight text-foreground">Google로 시작하기</Text>
              </View>
            )}
          </Button>

          {/* 나중에 하기 */}
          <TouchableOpacity
            className="mt-1 items-center py-2"
            onPress={() => handleLogin('guest')}
            activeOpacity={0.7}
          >
            <Text className="text-[13px] font-medium text-muted-foreground underline">나중에 하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GradientView>
  );
}
