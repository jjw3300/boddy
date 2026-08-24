import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, SafeAreaView, Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { LogStackParamList } from '../types/navigation';
import { PlayLog, ResultType, WinLossResult } from '../types/log';
import { getLog, deleteLog } from '../services/logStorage';
import { COLORS } from '../design';
import { ArrowLeftIcon, DiceIcon } from '../components/Icon';
import { Button } from '../components/Button';
import { GradientView } from '../components/GradientView';
import { cn } from '../lib/utils';

const RESULT_TYPE_LABELS: Record<ResultType, string> = {
  score: '점수',
  win_loss: '승패',
  rank: '순위',
  free: '자유',
};

const WIN_LOSS_LABEL: Record<WinLossResult, { text: string; textClass: string; bgClass: string }> = {
  win:  { text: 'O', textClass: 'text-green-700', bgClass: 'bg-green-50' },
  draw: { text: '△', textClass: 'text-muted-foreground', bgClass: 'bg-muted' },
  loss: { text: 'X', textClass: 'text-red-600', bgClass: 'bg-red-50' },
};

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

interface Props {
  navigation: NativeStackNavigationProp<LogStackParamList, 'LogDetail'>;
  route: RouteProp<LogStackParamList, 'LogDetail'>;
}

function getPlayerName(log: PlayLog, player_id: string): string {
  return log.players.find(p => p.id === player_id)?.name ?? '-';
}

function ResultSection({ log }: { log: PlayLog }) {
  const { result_data } = log;

  if (result_data.type === 'score') {
    const sorted = [...result_data.entries].sort((a, b) => {
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });
    const maxScore = sorted[0]?.score ?? null;

    return (
      <View>
        <View className="flex-row bg-muted px-3.5 py-2.5">
          <Text className="flex-[2] text-xs font-extrabold text-muted-foreground">참여자</Text>
          <Text className="flex-1 text-xs font-extrabold text-muted-foreground">점수</Text>
        </View>
        {sorted.map(entry => {
          const isWinner = entry.score !== null && entry.score === maxScore;
          return (
            <View key={entry.player_id} className="flex-row items-center border-t border-border px-3.5 py-3">
              <Text className="flex-[2] text-sm font-bold text-foreground">
                {getPlayerName(log, entry.player_id)}
              </Text>
              <View className="flex-1 flex-row items-center gap-1">
                {isWinner && <Text className="text-base">🏆</Text>}
                <Text className={cn('text-base font-extrabold text-foreground', isWinner && 'text-lg')}>
                  {entry.score ?? '-'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  if (result_data.type === 'win_loss') {
    return (
      <View>
        <View className="flex-row bg-muted px-3.5 py-2.5">
          <Text className="flex-[2] text-xs font-extrabold text-muted-foreground">참여자</Text>
          <Text className="flex-1 text-xs font-extrabold text-muted-foreground">결과</Text>
        </View>
        {result_data.entries.map(entry => {
          const badge = WIN_LOSS_LABEL[entry.result];
          return (
            <View key={entry.player_id} className="flex-row items-center border-t border-border px-3.5 py-3">
              <Text className="flex-[2] text-sm font-bold text-foreground">
                {getPlayerName(log, entry.player_id)}
              </Text>
              <View className="flex-1 flex-row items-center">
                {entry.result === 'win' ? (
                  <GradientView gradient="warm" className="h-[30px] w-9 items-center justify-center rounded-lg">
                    <Text className="text-[15px] font-black text-white">{badge.text}</Text>
                  </GradientView>
                ) : (
                  <View className={cn('h-[30px] w-9 items-center justify-center rounded-lg', badge.bgClass)}>
                    <Text className={cn('text-[15px] font-black', badge.textClass)}>{badge.text}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  if (result_data.type === 'rank') {
    const sorted = [...result_data.entries].sort((a, b) => {
      if (a.rank === null) return 1;
      if (b.rank === null) return -1;
      return a.rank - b.rank;
    });
    return (
      <View>
        <View className="flex-row bg-muted px-3.5 py-2.5">
          <Text className="flex-[2] text-xs font-extrabold text-muted-foreground">참여자</Text>
          <Text className="flex-1 text-xs font-extrabold text-muted-foreground">순위</Text>
        </View>
        {sorted.map(entry => {
          const rank = entry.rank;
          const medal = rank !== null && rank >= 1 && rank <= 3 ? RANK_MEDALS[rank - 1] : null;
          return (
            <View key={entry.player_id} className="flex-row items-center border-t border-border px-3.5 py-3">
              <Text className="flex-[2] text-sm font-bold text-foreground">
                {getPlayerName(log, entry.player_id)}
              </Text>
              <View className="flex-1 flex-row items-center gap-1">
                {medal && <Text className="text-lg">{medal}</Text>}
                <Text className="text-[15px] font-extrabold text-foreground">
                  {rank !== null ? `${rank}위` : '-'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  if (result_data.type === 'free') {
    return (
      <View className="p-3.5">
        <Text className="text-sm font-semibold leading-[22px] text-foreground">{result_data.text || '입력된 내용이 없어요.'}</Text>
      </View>
    );
  }

  return null;
}

export default function LogDetailScreen({ navigation, route }: Props) {
  const { logId } = route.params;
  const [log, setLog] = useState<PlayLog | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLog = useCallback(async () => {
    const data = await getLog(logId);
    setLog(data);
    setLoading(false);
  }, [logId]);

  useEffect(() => { loadLog(); }, [loadLog]);

  function handleDelete() {
    Alert.alert(
      '기록 삭제',
      '이 기록을 삭제할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await deleteLog(logId);
            navigation.goBack();
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center gap-4">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!log) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-base font-bold text-foreground">기록을 찾을 수 없어요.</Text>
          <Button variant="gradient" label="돌아가기" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-1 pt-3.5">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-1.5 py-1.5">
          <ArrowLeftIcon size={20} color={COLORS.foreground} />
          <Text className="text-sm font-bold text-foreground">뒤로</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} className="rounded-lg border border-border bg-red-50 px-3 py-1.5">
          <Text className="text-[13px] font-extrabold text-red-600">삭제</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerClassName="px-6 pb-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Game thumbnail + name */}
        <View className="mb-7 mt-3 flex-row items-start gap-4">
          <View className="h-[90px] w-[90px] overflow-hidden rounded-xl border border-border">
            {log.game_thumbnail ? (
              <Image source={{ uri: log.game_thumbnail }} className="h-[90px] w-[90px]" resizeMode="cover" />
            ) : (
              <GradientView gradient="primary" className="h-[90px] w-[90px] items-center justify-center">
                <DiceIcon size={40} color="#FFFFFF" />
              </GradientView>
            )}
          </View>
          <View className="flex-1 justify-center gap-1.5">
            <Text className="text-xl font-extrabold leading-[26px] text-foreground">{log.game_name}</Text>
            <View className="self-start rounded-lg border border-border bg-accent px-2.5 py-1">
              <Text className="text-xs font-bold text-foreground">📅 {log.played_at}</Text>
            </View>
            {log.bgg_id && (
              <Text className="text-[11px] font-semibold text-muted-foreground">BGG #{log.bgg_id}</Text>
            )}
          </View>
        </View>

        {/* Players + Result */}
        <View className="mb-6">
          <View className="mb-2.5 flex-row items-center gap-2">
            <View className="h-5 w-[5px] rounded-[3px] bg-primary" />
            <Text className="text-[15px] font-extrabold text-foreground">참여자 · {RESULT_TYPE_LABELS[log.result_type]}</Text>
          </View>
          <View className="overflow-hidden rounded-xl border border-border bg-card">
            <ResultSection log={log} />
          </View>
        </View>

        {/* Review */}
        {log.review ? (
          <View className="mb-6">
            <View className="mb-2.5 flex-row items-center gap-2">
              <View className="h-5 w-[5px] rounded-[3px] bg-primary" />
              <Text className="text-[15px] font-extrabold text-foreground">후기</Text>
            </View>
            <View className="rounded-xl border border-border bg-card p-4">
              <Text className="text-sm font-semibold leading-[22px] text-foreground">{log.review}</Text>
            </View>
          </View>
        ) : null}

        {/* Players list */}
        <View className="mb-6">
          <View className="mb-2.5 flex-row items-center gap-2">
            <View className="h-5 w-[5px] rounded-[3px] bg-primary" />
            <Text className="text-[15px] font-extrabold text-foreground">참여자 목록</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {log.players.map(p => (
              <View key={p.id} className="rounded-lg border border-border bg-accent px-3 py-1.5">
                <Text className="text-[13px] font-extrabold text-foreground">{p.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Timestamps */}
        <Text className="mt-2 text-right text-[11px] font-semibold text-muted-foreground">
          기록: {new Date(log.created_at).toLocaleString('ko-KR')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
