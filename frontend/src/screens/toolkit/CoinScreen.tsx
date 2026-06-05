import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS, BLOCK_SHADOW, BLOCK_SHADOW_SM, RADIUS } from '../../design';
import { ArrowLeftIcon } from '../../components/Icon';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'Coin'>;
}

type Face = 'heads' | 'tails';

const FACE_CONFIG: Record<Face, { label: string; sub: string; bg: string; border: string; text: string }> = {
  heads: {
    label: '앞',
    sub: 'HEADS',
    bg: '#FFF0B0',
    border: COLORS.paintYellow,
    text: '#8A6A00',
  },
  tails: {
    label: '뒤',
    sub: 'TAILS',
    bg: COLORS.woodLight,
    border: COLORS.woodMid,
    text: COLORS.woodDark,
  },
};

export default function CoinScreen({ navigation }: Props) {
  const [displayFace, setDisplayFace] = useState<Face>('heads');
  const [result, setResult] = useState<Face | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [flipCount, setFlipCount] = useState(0);

  const scaleX = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  function flip() {
    if (flipping) return;
    setFlipping(true);

    const newFace: Face = Math.random() < 0.5 ? 'heads' : 'tails';

    // 위로 올랐다 내려오는 bounce + scaleX 플립
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

    // 정점(midpoint)에서 면 교체
    setTimeout(() => {
      setDisplayFace(newFace);
      setResult(newFace);
    }, 200);
  }

  const cfg = FACE_CONFIG[displayFace];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeftIcon size={20} color={COLORS.woodDark} />
        <Text style={styles.backText}>도구 모음</Text>
      </TouchableOpacity>

      <Text style={styles.title}>동전 던지기</Text>

      {/* 동전 영역 */}
      <View style={styles.coinArea}>
        <Animated.View
          style={[
            styles.coinWrapper,
            { transform: [{ translateY: bounceAnim }, { scaleX }] },
          ]}
        >
          <View style={[styles.coin, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            <Text style={[styles.coinLabel, { color: cfg.text }]}>{cfg.label}</Text>
            <Text style={[styles.coinSub, { color: cfg.text }]}>{cfg.sub}</Text>
          </View>
          <View style={[styles.coinEdge, { backgroundColor: cfg.border }]} />
        </Animated.View>

        {/* 결과 뱃지 */}
        {result !== null && flipCount > 0 && (
          <View style={styles.resultBadge}>
            <Text style={styles.resultText}>
              {result === 'heads' ? '🪙 앞면 !' : '🪙 뒷면 !'}
            </Text>
          </View>
        )}

        {result === null && (
          <Text style={styles.hintText}>동전을 던져보세요</Text>
        )}
      </View>

      {/* 던지기 버튼 */}
      <View style={styles.btnArea}>
        <View style={styles.btnWrapper}>
          <TouchableOpacity
            style={[styles.flipBtn, flipping && styles.flipBtnDisabled]}
            onPress={flip}
            disabled={flipping}
            activeOpacity={0.85}
          >
            <Text style={styles.flipBtnText}>
              {flipping ? '던지는 중...' : '🪙  던지기'}
            </Text>
          </TouchableOpacity>
          <View style={[styles.flipBtnBottom, flipping && styles.flipBtnBottomDisabled]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 24, alignSelf: 'flex-start',
  },
  backText: { fontSize: 14, fontWeight: '700', color: COLORS.woodDark },

  title: {
    fontSize: 26, fontWeight: '900', color: COLORS.textPrimary,
    paddingHorizontal: 24, marginBottom: 8,
  },

  coinArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  coinWrapper: {
    ...BLOCK_SHADOW,
  },
  coin: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 4,
    borderBottomWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  coinEdge: {
    height: 10,
    width: 160,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  coinLabel: { fontSize: 52, fontWeight: '900' },
  coinSub: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },

  resultBadge: {
    backgroundColor: COLORS.woodLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: COLORS.woodMid,
    ...BLOCK_SHADOW_SM,
  },
  resultText: { fontSize: 22, fontWeight: '900', color: COLORS.woodDark },
  hintText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },

  btnArea: { paddingHorizontal: 24, paddingBottom: 20 },
  btnWrapper: { ...BLOCK_SHADOW },
  flipBtn: {
    backgroundColor: '#E8A020',
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2.5, borderColor: '#8A6A00', borderBottomWidth: 0,
  },
  flipBtnDisabled: { backgroundColor: COLORS.bgDeep, borderColor: COLORS.woodLight },
  flipBtnBottom: {
    height: 8, backgroundColor: '#8A6A00',
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  flipBtnBottomDisabled: { backgroundColor: COLORS.woodLight },
  flipBtnText: { fontSize: 18, fontWeight: '900', color: '#3D2000' },
});
