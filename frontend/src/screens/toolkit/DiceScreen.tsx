import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, Animated, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import { ArrowLeftIcon } from '../../components/Icon';
import { cn } from '../../lib/utils';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'Dice'>;
}

const MAX_DICE = 6;

// ─── 주사위 종류 (자주 쓰는 TRPG 다이스 세트) ─────────────────────────────────

const DIE_TYPES = [4, 6, 8, 10, 12, 20, 100] as const;
type DieSides = typeof DIE_TYPES[number];

const DIE_COLOR: Partial<Record<DieSides, { fg: string; bgClass: string }>> = {
  4:   { fg: '#7C3AED', bgClass: 'bg-violet-50' },
  8:   { fg: '#16A34A', bgClass: 'bg-green-50' },
  10:  { fg: '#D97706', bgClass: 'bg-amber-50' },
  12:  { fg: '#DC2626', bgClass: 'bg-red-50' },
  20:  { fg: '#0D9488', bgClass: 'bg-teal-50' },
  100: { fg: '#2563EB', bgClass: 'bg-blue-50' },
};

// 주사위 눈(pip) 위치 — d6 전용 클래식 표기
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

// 은은한 shadcn 스타일 소프트 섀도우 — iOS(shadow*)/Android(elevation) 둘 다 필요
const DIE_SHADOW = {
  shadowColor: '#1C1917',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.22,
  shadowRadius: 8,
  elevation: 6,
};

function DieFace({ sides, value, size = 90 }: { sides: DieSides; value: number; size?: number }) {
  if (sides === 6) {
    const activePips = PIP_CONFIG[value] ?? [];
    return (
      <View
        className="rounded-xl border border-border bg-card"
        style={[{ width: size, height: size }, DIE_SHADOW]}
      >
        {PIP_POSITIONS.map((pos, idx) =>
          activePips.includes(idx) ? (
            <View
              key={idx}
              className="absolute h-3 w-3 rounded-full bg-foreground"
              style={pos as any}
            />
          ) : null,
        )}
      </View>
    );
  }

  // d6을 제외한 다면체는 도형 없이 숫자만 — 색상으로만 종류를 구분
  const color = DIE_COLOR[sides]!;

  return (
    <View
      className="items-center justify-center rounded-2xl border border-border bg-card"
      style={[{ width: size, height: size }, DIE_SHADOW]}
    >
      <Text
        className="font-bold"
        style={{ color: color.fg, fontSize: value >= 100 ? size * 0.3 : size * 0.42 }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function DiceScreen({ navigation }: Props) {
  const [sides, setSides] = useState<DieSides>(6);
  const [diceCount, setDiceCount] = useState(2);
  const [values, setValues] = useState<number[]>([1, 1]);
  const [rolling, setRolling] = useState(false);

  const shakeAnims = useRef(
    Array.from({ length: MAX_DICE }, () => new Animated.Value(0)),
  ).current;
  const scaleAnims = useRef(
    Array.from({ length: MAX_DICE }, () => new Animated.Value(1)),
  ).current;

  function changeDiceCount(n: number) {
    const next = Math.min(MAX_DICE, Math.max(1, n));
    setDiceCount(next);
    setValues(prev => {
      const arr = [...prev];
      while (arr.length < next) arr.push(1);
      return arr.slice(0, next);
    });
  }

  function changeSides(s: DieSides) {
    if (rolling || s === sides) return;
    setSides(s);
    setValues(prev => prev.map(() => 1));
  }

  function roll() {
    if (rolling) return;
    setRolling(true);

    const newValues = Array.from({ length: diceCount }, () =>
      Math.floor(Math.random() * sides) + 1,
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
  // 4개 이상일 땐 한 줄에 항상 3개까지만 — 3+3, 3+2, 3+1로 고르게 두 줄로 나뉜다.
  const diceSize = diceCount <= 2 ? 100 : diceCount === 3 ? 86 : 68;
  const rowMaxWidth = diceSize * 3 + 14 * 2;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-1.5 self-start px-6 py-2.5">
        <ArrowLeftIcon size={20} color={COLORS.foreground} />
        <Text className="text-sm font-semibold text-foreground">도구 모음</Text>
      </TouchableOpacity>

      <Text className="mb-4 px-6 text-xl font-bold tracking-tight text-foreground">주사위 굴리기</Text>

      {/* 주사위 종류 선택 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-6"
        className="mb-5 grow-0"
      >
        {DIE_TYPES.map(s => {
          const selected = s === sides;
          const color = DIE_COLOR[s];
          return (
            <TouchableOpacity key={s} onPress={() => changeSides(s)} activeOpacity={0.7}>
              <View
                className={cn(
                  'min-w-[56px] items-center rounded-lg border px-3.5 py-2.5',
                  selected ? (color ? color.bgClass : 'bg-accent') : 'border-border bg-background',
                  selected && (color ? 'border-transparent' : 'border-transparent'),
                  !selected && 'border-border',
                )}
              >
                <Text
                  className="text-[13px] font-bold"
                  style={{ color: selected ? (color?.fg ?? COLORS.accentForeground) : COLORS.mutedForeground }}
                >
                  D{s}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 주사위 개수 선택 */}
      <View className="mb-6 px-6">
        <Text className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground">주사위 개수</Text>
        <View className="flex-row items-center gap-5">
          <TouchableOpacity
            onPress={() => changeDiceCount(diceCount - 1)}
            disabled={diceCount <= 1}
            activeOpacity={0.7}
            className={cn(
              'h-11 w-11 items-center justify-center rounded-lg bg-primary',
              diceCount <= 1 && 'opacity-30',
            )}
          >
            <Text className="text-xl font-bold text-primary-foreground">－</Text>
          </TouchableOpacity>
          <Text className="w-8 text-center text-3xl font-bold text-foreground">{diceCount}</Text>
          <TouchableOpacity
            onPress={() => changeDiceCount(diceCount + 1)}
            disabled={diceCount >= MAX_DICE}
            activeOpacity={0.7}
            className={cn(
              'h-11 w-11 items-center justify-center rounded-lg bg-primary',
              diceCount >= MAX_DICE && 'opacity-30',
            )}
          >
            <Text className="text-xl font-bold text-primary-foreground">＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 주사위 표시 영역 */}
      <View className="flex-1 items-center justify-center px-6">
        <View
          className={cn('flex-row items-center justify-center gap-3.5', diceCount > 3 && 'flex-wrap')}
          style={diceCount > 3 ? { maxWidth: rowMaxWidth } : undefined}
        >
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
              <DieFace sides={sides} value={values[i] ?? 1} size={diceSize} />
            </Animated.View>
          ))}
        </View>

        {diceCount > 1 && (
          <View className="mt-6 flex-row items-baseline gap-2 rounded-lg border border-border bg-secondary px-5 py-2.5">
            <Text className="text-sm font-bold text-foreground">합계</Text>
            <Text className="text-2xl font-bold text-foreground">{total}</Text>
          </View>
        )}
      </View>

      {/* 굴리기 버튼 */}
      <View className="px-6 pb-5">
        <TouchableOpacity
          onPress={roll}
          disabled={rolling}
          activeOpacity={0.85}
          className={cn(
            'items-center rounded-xl py-[18px]',
            rolling ? 'bg-muted' : 'bg-primary',
          )}
        >
          <Text className={cn('text-lg font-bold', rolling ? 'text-muted-foreground' : 'text-primary-foreground')}>
            {rolling ? '굴리는 중...' : `🎲  D${sides} 굴리기`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
