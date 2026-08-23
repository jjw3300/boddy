import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RecommendStackParamList } from '../types/navigation';
import { GameSummary, GameType } from '../types';
import { fetchGameDetail } from '../api/games';
import { COLORS } from '../design';
import { ArrowLeftIcon } from '../components/Icon';
import { Tag, TagColor } from '../components/Tag';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const GAME_TYPE_STYLE: Record<GameType, { label: string; color: TagColor }> = {
  luck:      { label: '운빨',   color: 'warning' },
  dexterity: { label: '피지컬', color: 'success' },
  party:     { label: '파티',   color: 'danger' },
  strategy:  { label: '뇌지컬', color: 'info' },
};

function weightLabel(weight: number) {
  if (weight < 2.0) return '쉬움';
  if (weight < 3.5) return '보통';
  return '어려움';
}

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'GameDetail'>;
  route: RouteProp<RecommendStackParamList, 'GameDetail'>;
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex-1 items-center py-3.5">
      <Text className="mb-1 text-[11px] font-bold text-muted-foreground">{label}</Text>
      <Text className="text-[15px] font-extrabold text-foreground">{value}</Text>
    </Card>
  );
}

export default function GameDetailScreen({ navigation, route }: Props) {
  const { bggId } = route.params;
  const [game, setGame] = useState<GameSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGameDetail(bggId)
      .then(setGame)
      .catch(() => setError('게임 정보를 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  }, [bggId]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* 헤더 */}
      <View className="px-6 pb-1 pt-3.5">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-1.5 self-start py-1.5">
          <ArrowLeftIcon size={20} color={COLORS.foreground} />
          <Text className="text-sm font-bold text-foreground">뒤로</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="mt-2 text-[15px] font-bold text-muted-foreground">불러오는 중...</Text>
        </View>
      )}

      {error && (
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-5xl">😢</Text>
          <Text className="text-center text-base font-bold text-foreground">{error}</Text>
          <Button label="돌아가기" size="sm" onPress={() => navigation.goBack()} className="mt-2" />
        </View>
      )}

      {!loading && !error && game && (
        <ScrollView contentContainerClassName="items-center px-6 pb-12" showsVerticalScrollIndicator={false}>
          {/* 썸네일 */}
          <View className="mb-5 mt-2 h-[180px] w-[180px] overflow-hidden rounded-xl border border-border">
            {game.thumbnail ? (
              <Image source={{ uri: game.thumbnail }} className="h-[180px] w-[180px]" resizeMode="cover" />
            ) : (
              <View className="h-[180px] w-[180px] items-center justify-center bg-muted">
                <Text className="text-6xl">🎲</Text>
              </View>
            )}
          </View>

          {/* 게임 이름 */}
          <Text className="mb-3 text-center text-[22px] font-extrabold leading-[30px] text-foreground">{game.name}</Text>

          {/* 게임 유형 태그 */}
          {game.game_type && (
            <View className="mb-5">
              <Tag label={GAME_TYPE_STYLE[game.game_type].label} color={GAME_TYPE_STYLE[game.game_type].color} />
            </View>
          )}

          {/* 정보 블럭 그리드 */}
          <View className="mb-6 w-full flex-row gap-2.5">
            <InfoBlock label="인원" value={`${game.min_players}~${game.max_players}명`} />
            <InfoBlock label="시간" value={`${game.play_time}분`} />
            <InfoBlock label="난이도" value={weightLabel(game.weight)} />
          </View>

          {/* 설명 */}
          <View className="mb-4 w-full">
            <View className="mb-2.5 flex-row items-center gap-2">
              <View className="h-5 w-[5px] rounded-sm bg-primary" />
              <Text className="text-[17px] font-extrabold text-foreground">게임 소개</Text>
            </View>
            <Card className="p-4">
              <Text className="text-sm font-medium leading-[22px] text-foreground">
                {game.description ?? '설명 정보가 없어요.'}
              </Text>
            </Card>
          </View>

          {/* BGG ID */}
          <View className="self-start">
            <Text className="text-[11px] font-semibold text-muted-foreground">BGG ID: {game.bgg_id}</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
