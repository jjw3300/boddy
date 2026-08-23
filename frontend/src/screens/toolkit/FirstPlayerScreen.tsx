import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import { ArrowLeftIcon, FingerIcon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { cn } from '../../lib/utils';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'FirstPlayer'>;
}

// 룰렛 슬롯 딜레이 시퀀스 (ms) — 빠르게 시작해 점점 느려짐
const ROULETTE_DELAYS = [70, 70, 80, 90, 110, 130, 160, 200, 250, 310, 380, 460, 540];

const WINNER_COLORS = [
  { bgHex: '#FFFBEB', fg: '#D97706' },
  { bgHex: '#F0FDF4', fg: '#16A34A' },
  { bgHex: '#FEF2F2', fg: '#DC2626' },
  { bgHex: '#EFF6FF', fg: '#2563EB' },
  { bgHex: '#F5F3FF', fg: '#7C3AED' },
];

let _pid = 0;
function pid() { return String(++_pid); }

export default function FirstPlayerScreen({ navigation }: Props) {
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([
    { id: pid(), name: '플레이어 1' },
    { id: pid(), name: '플레이어 2' },
  ]);
  const [nameInput, setNameInput] = useState('');
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const winnerScale = useRef(new Animated.Value(1)).current;

  function addPlayer() {
    const name = nameInput.trim() || `플레이어 ${players.length + 1}`;
    setPlayers(prev => [...prev, { id: pid(), name }]);
    setNameInput('');
  }

  function removePlayer(id: string) {
    if (players.length <= 2) return;
    setPlayers(prev => prev.filter(p => p.id !== id));
    setHighlighted(null);
    setWinner(null);
  }

  function pickFirst() {
    if (animating || players.length < 2) return;
    setAnimating(true);
    setWinner(null);
    setHighlighted(null);

    const winnerIdx = Math.floor(Math.random() * players.length);

    let step = 0;
    function nextStep() {
      const remaining = ROULETTE_DELAYS.length - step;
      const idx = (winnerIdx - remaining + players.length * 10) % players.length;
      setHighlighted(idx);

      if (step >= ROULETTE_DELAYS.length - 1) {
        setHighlighted(winnerIdx);
        setWinner(players[winnerIdx].name);
        setAnimating(false);

        Animated.sequence([
          Animated.timing(winnerScale, { toValue: 1.12, duration: 160, useNativeDriver: true }),
          Animated.timing(winnerScale, { toValue: 0.96, duration: 120, useNativeDriver: true }),
          Animated.timing(winnerScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
          Animated.timing(winnerScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();
        return;
      }

      step++;
      setTimeout(nextStep, ROULETTE_DELAYS[step] ?? 500);
    }

    setTimeout(nextStep, ROULETTE_DELAYS[0]);
  }

  function reset() {
    setHighlighted(null);
    setWinner(null);
    winnerScale.setValue(1);
  }

  const canPick = players.length >= 2 && !animating;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-1.5 self-start px-6 py-2.5">
        <ArrowLeftIcon size={20} color={COLORS.foreground} />
        <Text className="text-sm font-semibold text-foreground">도구 모음</Text>
      </TouchableOpacity>

      <View className="mb-5 flex-row items-center gap-2 px-6">
        <FingerIcon size={22} color={COLORS.foreground} fill="transparent" />
        <Text className="text-xl font-bold tracking-tight text-foreground">선 정하기</Text>
      </View>

      <ScrollView
        contentContainerClassName="px-6 pb-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 플레이어 목록 */}
        <View className="mb-4 gap-2.5">
          {players.map((p, idx) => {
            const isHighlighted = highlighted === idx;
            const isWinner = winner !== null && isHighlighted;
            const colorSet = WINNER_COLORS[idx % WINNER_COLORS.length];

            const cardContent = (
              <View
                className="flex-row items-center rounded-xl border border-border px-5 py-4"
                style={{ backgroundColor: isHighlighted ? colorSet.bgHex : COLORS.background }}
              >
                <Text
                  className="flex-1 text-lg font-extrabold"
                  style={{ color: isHighlighted ? colorSet.fg : COLORS.foreground }}
                >
                  {isWinner ? '🎉  ' : ''}{p.name}
                  {isWinner ? '  🎉' : ''}
                </Text>
                {players.length > 2 && !animating && (
                  <TouchableOpacity
                    className="h-7 w-7 items-center justify-center rounded-full bg-red-50"
                    onPress={() => removePlayer(p.id)}
                  >
                    <Text className="text-base font-bold text-red-600">×</Text>
                  </TouchableOpacity>
                )}
              </View>
            );

            return isWinner ? (
              <Animated.View key={p.id} style={{ transform: [{ scale: winnerScale }] }}>
                {cardContent}
              </Animated.View>
            ) : (
              <View key={p.id}>{cardContent}</View>
            );
          })}
        </View>

        {/* 플레이어 추가 */}
        <View className="mb-5 flex-row items-center gap-2">
          <TextInput
            className="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground"
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="이름 추가..."
            placeholderTextColor={COLORS.mutedForeground}
            onSubmitEditing={addPlayer}
            returnKeyType="done"
            editable={!animating}
          />
          <Button label="+ 추가" size="sm" onPress={addPlayer} />
        </View>

        {/* 결과 안내 */}
        {winner && (
          <View className="mb-3 items-center rounded-xl border border-border bg-accent p-4">
            <Text className="mb-1 text-xs font-extrabold tracking-wide text-foreground">첫 번째 플레이어</Text>
            <Text className="text-2xl font-extrabold text-foreground">{winner}</Text>
          </View>
        )}

        {winner && (
          <View className="items-center">
            <TouchableOpacity className="rounded-lg border border-border bg-secondary px-5 py-2.5" onPress={reset}>
              <Text className="text-[13px] font-extrabold text-secondary-foreground">다시 정하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 정하기 버튼 (하단 고정) */}
      <View className="px-6 pb-5">
        <TouchableOpacity
          onPress={pickFirst}
          disabled={!canPick}
          activeOpacity={0.85}
          className={cn('items-center rounded-xl py-[18px]', canPick ? 'bg-primary' : 'bg-muted')}
        >
          <Text className={cn('text-lg font-bold', canPick ? 'text-primary-foreground' : 'text-muted-foreground')}>
            {animating ? '정하는 중...' : '👆  선 정하기!'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
