import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS, BLOCK_SHADOW, BLOCK_SHADOW_SM, RADIUS } from '../../design';
import { ArrowLeftIcon } from '../../components/Icon';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'Dice'>;
}

// 주사위 눈 위치: [top-left, top-right, mid-left, center, mid-right, bottom-left, bottom-right]
const PIP_POSITIONS = [
  { top: '16%', left: '16%' },
  { top: '16%', right: '16%' },
  { top: '42%', left: '16%' },
  { top: '42%', left: '42%' },
  { top: '42%', right: '16%' },
  { bottom: '16%', left: '16%' },
  { bottom: '16%', right: '16%' },
] as const;

const PIP_CONFIG: Record<number, number[]> = {
  1: [3],
  2: [1, 5],
  3: [1, 3, 5],
  4: [0, 1, 5, 6],
  5: [0, 1, 3, 5, 6],
  6: [0, 1, 2, 4, 5, 6],
};

function DieFace({ value, size = 90 }: { value: number; size?: number }) {
  const activePips = PIP_CONFIG[value] ?? [];
  return (
    <View style={[styles.dieFace, { width: size, height: size }]}>
      {PIP_POSITIONS.map((pos, idx) =>
        activePips.includes(idx) ? (
          <View key={idx} style={[styles.pip, pos as any]} />
        ) : null,
      )}
    </View>
  );
}

export default function DiceScreen({ navigation }: Props) {
  const [diceCount, setDiceCount] = useState(2);
  const [values, setValues] = useState<number[]>([1, 1]);
  const [rolling, setRolling] = useState(false);

  const shakeAnims = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0)),
  ).current;
  const scaleAnims = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(1)),
  ).current;

  function changeDiceCount(n: number) {
    const next = Math.min(5, Math.max(1, n));
    setDiceCount(next);
    setValues(prev => {
      const arr = [...prev];
      while (arr.length < next) arr.push(1);
      return arr.slice(0, next);
    });
  }

  function roll() {
    if (rolling) return;
    setRolling(true);

    const newValues = Array.from({ length: diceCount }, () =>
      Math.floor(Math.random() * 6) + 1,
    );

    const animations = Array.from({ length: diceCount }, (_, i) =>
      Animated.sequence([
        Animated.parallel([
          Animated.sequence([
            Animated.timing(shakeAnims[i], { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnims[i], { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnims[i], { toValue: 8, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnims[i], { toValue: -8, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnims[i], { toValue: 5, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnims[i], { toValue: -5, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnims[i], { toValue: 0, duration: 40, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(scaleAnims[i], { toValue: 1.15, duration: 180, useNativeDriver: true }),
            Animated.timing(scaleAnims[i], { toValue: 1, duration: 180, useNativeDriver: true }),
          ]),
        ]),
      ]),
    );

    Animated.parallel(animations).start(() => {
      setValues(newValues);
      setRolling(false);
    });
  }

  const total = values.slice(0, diceCount).reduce((s, v) => s + v, 0);
  const diceSize = diceCount <= 2 ? 100 : diceCount <= 3 ? 88 : 76;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeftIcon size={20} color={COLORS.woodDark} />
        <Text style={styles.backText}>도구 모음</Text>
      </TouchableOpacity>

      <Text style={styles.title}>주사위 굴리기</Text>

      {/* 주사위 개수 선택 */}
      <View style={styles.countSection}>
        <Text style={styles.countLabel}>주사위 개수</Text>
        <View style={styles.countRow}>
          <View style={styles.countBtnWrapper}>
            <TouchableOpacity
              style={styles.countBtn}
              onPress={() => changeDiceCount(diceCount - 1)}
              disabled={diceCount <= 1}
              activeOpacity={0.8}
            >
              <Text style={[styles.countBtnText, diceCount <= 1 && styles.countBtnDisabled]}>－</Text>
            </TouchableOpacity>
            <View style={styles.countBtnBottom} />
          </View>
          <Text style={styles.countNum}>{diceCount}</Text>
          <View style={styles.countBtnWrapper}>
            <TouchableOpacity
              style={styles.countBtn}
              onPress={() => changeDiceCount(diceCount + 1)}
              disabled={diceCount >= 5}
              activeOpacity={0.8}
            >
              <Text style={[styles.countBtnText, diceCount >= 5 && styles.countBtnDisabled]}>＋</Text>
            </TouchableOpacity>
            <View style={styles.countBtnBottom} />
          </View>
        </View>
      </View>

      {/* 주사위 표시 영역 */}
      <View style={styles.diceArea}>
        <View style={[styles.diceRow, diceCount > 3 && styles.diceGrid]}>
          {Array.from({ length: diceCount }, (_, i) => (
            <Animated.View
              key={i}
              style={{
                transform: [
                  { translateX: shakeAnims[i] },
                  { scale: scaleAnims[i] },
                ],
              }}
            >
              <View style={styles.dieWrapper}>
                <DieFace value={values[i] ?? 1} size={diceSize} />
                <View style={styles.dieShadow} />
              </View>
            </Animated.View>
          ))}
        </View>

        {diceCount > 1 && (
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>합계</Text>
            <Text style={styles.totalValue}>{total}</Text>
          </View>
        )}
      </View>

      {/* 굴리기 버튼 */}
      <View style={styles.rollArea}>
        <View style={styles.rollBtnWrapper}>
          <TouchableOpacity
            style={[styles.rollBtn, rolling && styles.rollBtnDisabled]}
            onPress={roll}
            disabled={rolling}
            activeOpacity={0.85}
          >
            <Text style={styles.rollBtnText}>
              {rolling ? '굴리는 중...' : '🎲  굴리기'}
            </Text>
          </TouchableOpacity>
          <View style={[styles.rollBtnBottom, rolling && styles.rollBtnBottomDisabled]} />
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
    paddingHorizontal: 24, marginBottom: 24,
  },

  countSection: { paddingHorizontal: 24, marginBottom: 32 },
  countLabel: {
    fontSize: 12, fontWeight: '800', color: COLORS.textSecondary,
    letterSpacing: 0.5, marginBottom: 12,
  },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  countBtnWrapper: { ...BLOCK_SHADOW_SM },
  countBtn: {
    width: 44, height: 44,
    backgroundColor: COLORS.wood,
    borderRadius: RADIUS.sm,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.woodDark, borderBottomWidth: 0,
  },
  countBtnBottom: {
    height: 5, backgroundColor: COLORS.woodDark,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
  },
  countBtnText: { fontSize: 22, fontWeight: '900', color: COLORS.textOnWood },
  countBtnDisabled: { color: 'rgba(255,250,240,0.35)' },
  countNum: { fontSize: 32, fontWeight: '900', color: COLORS.textPrimary, minWidth: 32, textAlign: 'center' },

  diceArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  diceRow: { flexDirection: 'row', flexWrap: 'nowrap', gap: 16, alignItems: 'center', justifyContent: 'center' },
  diceGrid: { flexWrap: 'wrap', justifyContent: 'center' },

  dieWrapper: { ...BLOCK_SHADOW },
  dieFace: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 2.5,
    borderColor: COLORS.woodLight,
    borderBottomWidth: 0,
    position: 'relative',
  },
  dieShadow: {
    height: 7,
    backgroundColor: COLORS.woodLight,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
    borderWidth: 2.5,
    borderTopWidth: 0,
    borderColor: COLORS.woodLight,
  },
  pip: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: COLORS.woodDark,
  },

  totalBox: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8,
    marginTop: 24,
    backgroundColor: COLORS.woodLight,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 2, borderColor: COLORS.woodMid,
  },
  totalLabel: { fontSize: 14, fontWeight: '800', color: COLORS.woodMid },
  totalValue: { fontSize: 32, fontWeight: '900', color: COLORS.woodDark },

  rollArea: { paddingHorizontal: 24, paddingBottom: 20 },
  rollBtnWrapper: { ...BLOCK_SHADOW },
  rollBtn: {
    backgroundColor: COLORS.wood,
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2.5, borderColor: COLORS.woodDark, borderBottomWidth: 0,
  },
  rollBtnDisabled: { backgroundColor: COLORS.bgDeep, borderColor: COLORS.woodLight },
  rollBtnBottom: {
    height: 8, backgroundColor: COLORS.woodDark,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  rollBtnBottomDisabled: { backgroundColor: COLORS.woodLight },
  rollBtnText: { fontSize: 18, fontWeight: '900', color: COLORS.textOnWood },
});
