import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import { ArrowLeftIcon, CounterIcon } from '../../components/Icon';
import { Card } from '../../components/Card';
import { cn } from '../../lib/utils';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'Counter'>;
}

interface Player {
  id: string;
  name: string;
  score: number;
}

const MAX_PLAYERS = 8;
let _id = 0;
function nextId() { return String(++_id); }

function makePlayer(idx: number): Player {
  return { id: nextId(), name: `플레이어 ${idx}`, score: 0 };
}

export default function CounterScreen({ navigation }: Props) {
  const [players, setPlayers] = useState<Player[]>([makePlayer(1), makePlayer(2)]);

  const maxScore = Math.max(...players.map(p => p.score));
  const hasLeader = maxScore > 0;

  function adjust(id: string, delta: number) {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, score: p.score + delta } : p));
  }

  function rename(id: string, name: string) {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }

  function addPlayer() {
    if (players.length >= MAX_PLAYERS) return;
    setPlayers(prev => [...prev, makePlayer(prev.length + 1)]);
  }

  function removePlayer(id: string) {
    if (players.length <= 1) return;
    setPlayers(prev => prev.filter(p => p.id !== id));
  }

  function resetAll() {
    Alert.alert('전체 초기화', '모든 플레이어의 점수를 0으로 초기화할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '초기화', style: 'destructive', onPress: () => setPlayers(prev => prev.map(p => ({ ...p, score: 0 }))) },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-6 py-2.5">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-1.5 py-1.5">
          <ArrowLeftIcon size={20} color={COLORS.foreground} />
          <Text className="text-sm font-semibold text-foreground">도구 모음</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resetAll} className="rounded-lg border border-border bg-red-50 px-3.5 py-2">
          <Text className="text-[13px] font-extrabold text-red-600">전체 초기화</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-4 flex-row items-center gap-2 px-6">
        <CounterIcon size={22} color={COLORS.foreground} fill="transparent" />
        <Text className="text-xl font-bold tracking-tight text-foreground">만능 카운터</Text>
      </View>

      <ScrollView
        contentContainerClassName="gap-2.5 px-6 pb-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {players.map(player => {
          const isLeader = hasLeader && player.score === maxScore;
          return (
            <Card key={player.id} className={cn('gap-3 p-4', isLeader && 'border-primary')}>
              <View className="flex-row items-center gap-2">
                {isLeader && <Text className="text-base">👑</Text>}
                <TextInput
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-[14px] font-bold text-foreground"
                  value={player.name}
                  onChangeText={t => rename(player.id, t)}
                  selectTextOnFocus
                />
                {players.length > 1 && (
                  <TouchableOpacity
                    className="h-7 w-7 items-center justify-center rounded-full bg-red-50"
                    onPress={() => removePlayer(player.id)}
                  >
                    <Text className="text-base font-bold text-red-600">×</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row gap-1.5">
                  <TouchableOpacity
                    className="h-10 w-12 items-center justify-center rounded-lg border border-border bg-secondary"
                    onPress={() => adjust(player.id, -5)}
                  >
                    <Text className="text-[13px] font-extrabold text-secondary-foreground">－5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary"
                    onPress={() => adjust(player.id, -1)}
                  >
                    <Text className="text-lg font-extrabold text-secondary-foreground">－</Text>
                  </TouchableOpacity>
                </View>

                <Text className={cn('text-3xl font-extrabold', isLeader ? 'text-primary' : 'text-foreground')}>
                  {player.score}
                </Text>

                <View className="flex-row gap-1.5">
                  <TouchableOpacity
                    className="h-10 w-10 items-center justify-center rounded-lg bg-primary"
                    onPress={() => adjust(player.id, 1)}
                  >
                    <Text className="text-lg font-extrabold text-primary-foreground">＋</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="h-10 w-12 items-center justify-center rounded-lg bg-primary"
                    onPress={() => adjust(player.id, 5)}
                  >
                    <Text className="text-[13px] font-extrabold text-primary-foreground">＋5</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          );
        })}

        {players.length < MAX_PLAYERS && (
          <TouchableOpacity
            onPress={addPlayer}
            activeOpacity={0.7}
            className="items-center rounded-xl border border-dashed border-border py-4"
          >
            <Text className="text-[14px] font-extrabold text-muted-foreground">+ 플레이어 추가 ({players.length}/{MAX_PLAYERS})</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
