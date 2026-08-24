import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Animated, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import { ArrowLeftIcon } from '../../components/Icon';
import { GradientView } from '../../components/GradientView';
import { cn } from '../../lib/utils';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'Coin'>;
}

type Face = 'heads' | 'tails';

const FACE_CONFIG: Record<Face, { label: string; sub: string; bgHex: string; textHex: string; borderHex?: string }> = {
  heads: { label: '앞', sub: 'HEADS', bgHex: COLORS.primary, textHex: COLORS.primaryForeground },
  tails: { label: '뒤', sub: 'TAILS', bgHex: COLORS.background, textHex: COLORS.foreground, borderHex: COLORS.border },
};

const COIN_SIZE = 160;

export default function CoinScreen({ navigation }: Props) {
  const [displayFace, setDisplayFace] = useState<Face>('heads');
  const [result, setResult] = useState<Face | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [flipCount, setFlipCount] = useState(0);

  const scaleX = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  // 동전이 떠오른 높이에 따라 바닥 그림자가 작아지고 옅어지도록 연결
  const shadowScale = bounceAnim.interpolate({
    inputRange: [-60, 0], outputRange: [0.72, 1], extrapolate: 'clamp',
  });
  const shadowOpacity = bounceAnim.interpolate({
    inputRange: [-60, 0], outputRange: [0.4, 1], extrapolate: 'clamp',
  });

  function flip() {
    if (flipping) return;
    setFlipping(true);

    const newFace: Face = Math.random() < 0.5 ? 'heads' : 'tails';

    Animated.parallel([
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -60, duration: 200, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(scaleX, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleX, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setFlipping(false);
      setFlipCount(c => c + 1);
    });

    setTimeout(() => {
      setDisplayFace(newFace);
      setResult(newFace);
    }, 200);
  }

  const cfg = FACE_CONFIG[displayFace];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-1.5 self-start px-6 py-2.5">
        <ArrowLeftIcon size={20} color={COLORS.foreground} />
        <Text className="text-sm font-semibold text-foreground">도구 모음</Text>
      </TouchableOpacity>

      <Text className="mb-2 px-6 text-xl font-bold tracking-tight text-foreground">동전 던지기</Text>

      {/* 동전 영역 */}
      <View className="flex-1 items-center justify-center gap-8">
        <View style={{ width: COIN_SIZE, height: COIN_SIZE }}>
          <Animated.View
            className="absolute rounded-full bg-muted"
            style={{
              top: 0, left: 0, width: COIN_SIZE, height: COIN_SIZE,
              transform: [{ scale: shadowScale }], opacity: shadowOpacity,
            }}
          />
          <Animated.View
            className="absolute left-0 top-0"
            style={{ transform: [{ translateY: bounceAnim }, { scaleX }] }}
          >
            <View
              className="items-center justify-center gap-1 rounded-full border"
              style={{
                width: COIN_SIZE, height: COIN_SIZE,
                backgroundColor: cfg.bgHex,
                borderColor: cfg.borderHex ?? cfg.bgHex,
              }}
            >
              <Text className="text-5xl font-extrabold" style={{ color: cfg.textHex }}>{cfg.label}</Text>
              <Text className="text-sm font-extrabold tracking-[2px]" style={{ color: cfg.textHex }}>{cfg.sub}</Text>
            </View>
          </Animated.View>
        </View>

        {result !== null && flipCount > 0 && (
          <View className="rounded-lg border border-border bg-secondary px-6 py-3">
            <Text className="text-xl font-extrabold text-foreground">
              {result === 'heads' ? '🪙 앞면 !' : '🪙 뒷면 !'}
            </Text>
          </View>
        )}

        {result === null && (
          <Text className="text-[15px] font-semibold text-muted-foreground">동전을 던져보세요</Text>
        )}
      </View>

      {/* 던지기 버튼 */}
      <View className="px-6 pb-5">
        <TouchableOpacity
          onPress={flip}
          disabled={flipping}
          activeOpacity={0.85}
          className={cn('items-center overflow-hidden rounded-xl py-[18px]', flipping && 'bg-muted')}
        >
          {!flipping && <GradientView gradient="primary" style={StyleSheet.absoluteFill} />}
          <Text className={cn('text-lg font-bold', flipping ? 'text-muted-foreground' : 'text-white')}>
            {flipping ? '던지는 중...' : '🪙  던지기'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
