import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import { ArrowLeftIcon, TrophyIcon } from '../../components/Icon';
import { Button } from '../../components/Button';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'Scoreboard'>;
}

interface Player {
  id: string;
  name: string;
  score: number;
}

let _id = 0;
function nextId() { return String(++_id); }

const RANK_FG = ['#D97706', '#78716C', '#C8640A'];
const RANK_BG = ['#FFFBEB', '#F5F5F4', '#FBEADB'];

export default function ScoreboardScreen({ navigation }: Props) {
  const [players, setPlayers] = useState<Player[]>([
    { id: nextId(), name: '플레이어 1', score: 0 },
    { id: nextId(), name: '플레이어 2', score: 0 },
  ]);
  const [nameInput, setNameInput] = useState('');
  const inputRef = useRef<TextInput>(null);

  // 점수 내림차순 정렬 (동점이면 추가 순서 유지)
  const sorted = [...players].sort((a, b) => b.score - a.score);

  function getRank(id: string): number {
    const idx = sorted.findIndex(p => p.id === id);
    if (idx === 0) return 1;
    if (sorted[idx].score === sorted[idx - 1].score) {
      return getRank(sorted[idx - 1].id);
    }
    return idx + 1;
  }

  function adjustScore(id: string, delta: number) {
    setPlayers(prev =>
      prev.map(p => p.id === id ? { ...p, score: p.score + delta } : p),
    );
  }

  function setScore(id: string, raw: string) {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) {
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, score: n } : p));
    }
  }

  function updateName(id: string, name: string) {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }

  function addPlayer() {
    const name = nameInput.trim() || `플레이어 ${players.length + 1}`;
    setPlayers(prev => [...prev, { id: nextId(), name, score: 0 }]);
    setNameInput('');
    inputRef.current?.blur();
  }

  function removePlayer(id: string) {
    if (players.length <= 1) return;
    setPlayers(prev => prev.filter(p => p.id !== id));
  }

  function resetAll() {
    Alert.alert('점수 초기화', '모든 점수를 0으로 초기화할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '초기화', style: 'destructive', onPress: () => {
        setPlayers(prev => prev.map(p => ({ ...p, score: 0 })));
      }},
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-1.5 px-2 py-2.5">
          <ArrowLeftIcon size={20} color={COLORS.foreground} />
          <Text className="text-sm font-semibold text-foreground">도구 모음</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resetAll} className="rounded-lg border border-border bg-red-50 px-3.5 py-2">
          <Text className="text-[13px] font-extrabold text-red-600">초기화</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-2 px-6 pb-4">
        <TrophyIcon size={22} color={COLORS.foreground} fill="transparent" />
        <Text className="text-xl font-bold tracking-tight text-foreground">점수판</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2.5 px-4 pb-8"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {sorted.map(player => {
          const rank = getRank(player.id);
          const isTop3 = rank <= 3;
          const rankFg = isTop3 ? RANK_FG[rank - 1] : COLORS.mutedForeground;
          const rankBg = isTop3 ? RANK_BG[rank - 1] : '#F5F5F4';

          return (
            <View key={player.id} className="flex-row items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-3">
              {/* 순위 뱃지 */}
              <View className="h-[30px] w-[30px] items-center justify-center rounded-full" style={{ backgroundColor: rankBg }}>
                <Text className="text-[13px] font-extrabold" style={{ color: rankFg }}>{rank}</Text>
              </View>

              {/* 이름 */}
              <TextInput
                className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm font-bold text-foreground"
                value={player.name}
                onChangeText={t => updateName(player.id, t)}
                selectTextOnFocus
              />

              {/* -10 */}
              <TouchableOpacity className="px-1 py-1.5" onPress={() => adjustScore(player.id, -10)}>
                <Text className="text-[11px] font-extrabold text-muted-foreground">-10</Text>
              </TouchableOpacity>

              {/* - + score + + */}
              <View className="flex-row items-center gap-0.5">
                <TouchableOpacity
                  className="h-[30px] w-[30px] items-center justify-center rounded-md bg-primary"
                  onPress={() => adjustScore(player.id, -1)}
                >
                  <Text className="text-lg font-extrabold text-primary-foreground">－</Text>
                </TouchableOpacity>

                <TextInput
                  className="h-[30px] w-[46px] rounded-md border border-border bg-background text-center text-base font-extrabold text-foreground"
                  value={String(player.score)}
                  onChangeText={t => setScore(player.id, t)}
                  keyboardType="numeric"
                  selectTextOnFocus
                  textAlign="center"
                />

                <TouchableOpacity
                  className="h-[30px] w-[30px] items-center justify-center rounded-md bg-primary"
                  onPress={() => adjustScore(player.id, 1)}
                >
                  <Text className="text-lg font-extrabold text-primary-foreground">＋</Text>
                </TouchableOpacity>
              </View>

              {/* +10 */}
              <TouchableOpacity className="px-1 py-1.5" onPress={() => adjustScore(player.id, 10)}>
                <Text className="text-[11px] font-extrabold text-muted-foreground">+10</Text>
              </TouchableOpacity>

              {/* 삭제 */}
              {players.length > 1 && (
                <TouchableOpacity
                  className="h-7 w-7 items-center justify-center rounded-full bg-red-50"
                  onPress={() => removePlayer(player.id)}
                >
                  <Text className="text-base font-bold text-red-600">×</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* 플레이어 추가 */}
        <View className="mt-1 flex-row items-center gap-2">
          <TextInput
            ref={inputRef}
            className="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground"
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="이름 입력..."
            placeholderTextColor={COLORS.mutedForeground}
            onSubmitEditing={addPlayer}
            returnKeyType="done"
          />
          <Button label="+ 추가" size="sm" onPress={addPlayer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
