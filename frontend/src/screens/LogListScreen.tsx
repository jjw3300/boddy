import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogStackParamList } from '../types/navigation';
import { PlayLog, ResultType } from '../types/log';
import { getLogs } from '../services/logStorage';
import { COLORS } from '../design';
import { BookIcon, ChevronRightIcon, DiceIcon } from '../components/Icon';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Tag } from '../components/Tag';

const RESULT_LABELS: Record<ResultType, string> = {
  score: '점수',
  win_loss: '승패',
  rank: '순위',
  free: '자유',
};

interface Props {
  navigation: NativeStackNavigationProp<LogStackParamList, 'LogList'>;
}

function LogCard({ log, onPress }: { log: PlayLog; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card className="flex-row items-center overflow-hidden">
        {log.game_thumbnail ? (
          <Image source={{ uri: log.game_thumbnail }} className="h-24 w-[76px]" />
        ) : (
          <View className="h-24 w-[76px] items-center justify-center bg-muted">
            <DiceIcon size={28} color={COLORS.mutedForeground} />
          </View>
        )}
        <View className="flex-1 gap-1 px-3 py-3">
          <Text className="text-[15px] font-bold text-foreground" numberOfLines={1}>{log.game_name}</Text>
          <Text className="text-[13px] text-muted-foreground">{log.played_at}</Text>
          <View className="mt-1 flex-row gap-1.5">
            <Tag label={`👥 ${log.players.length}명`} />
            <Tag label={RESULT_LABELS[log.result_type]} color="info" />
          </View>
        </View>
        <ChevronRightIcon size={18} color={COLORS.mutedForeground} />
      </Card>
    </TouchableOpacity>
  );
}

export default function LogListScreen({ navigation }: Props) {
  const [logs, setLogs] = useState<PlayLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      getLogs().then(setLogs);
    }, []),
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-6 pb-4 pt-6">
        <View className="flex-row items-center gap-2">
          <BookIcon size={24} color={COLORS.foreground} fill="transparent" />
          <Text className="text-2xl font-bold tracking-tight text-foreground">플레이 기록</Text>
        </View>
        <Button label="+ 기록하기" size="sm" onPress={() => navigation.navigate('NewLog')} />
      </View>

      {logs.length === 0 ? (
        /* 빈 상태 */
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-5 h-[92px] w-[92px] items-center justify-center rounded-2xl border border-border bg-accent">
            <BookIcon size={44} color={COLORS.primary} fill="transparent" />
          </View>
          <Text className="mb-1.5 text-center text-lg font-bold text-foreground">아직 기록이 없어요</Text>
          <Text className="mb-5 text-center text-[13px] text-muted-foreground">첫 번째 게임 기록을 남겨보세요!</Text>
          <Button
            label="+ 기록 시작하기"
            onPress={() => navigation.navigate('NewLog')}
            className="px-6"
            labelClassName="text-[15px]"
          />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <LogCard
              log={item}
              onPress={() => navigation.navigate('LogDetail', { logId: item.id })}
            />
          )}
          contentContainerClassName="gap-2.5 px-6 pb-8"
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
