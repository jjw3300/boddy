import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecommendStackParamList } from '../types/navigation';
import { GameSummary, GameType } from '../types';
import { getRecentRecommendation, RecentRecommendation } from '../services/recommendationHistory';
import { COLORS } from '../design';
import { SearchIcon, ChevronRightIcon, DiceIcon, TrophyIcon } from '../components/Icon';
import { GradientView } from '../components/GradientView';
import { Card } from '../components/Card';
import { Tag, TagColor } from '../components/Tag';
import { cn } from '../lib/utils';

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'Home'>;
}

const GAME_TYPE_STYLE: Record<GameType, { label: string; color: TagColor }> = {
  luck:      { label: '운빨',   color: 'warning' },
  dexterity: { label: '피지컬', color: 'success' },
  party:     { label: '파티',   color: 'danger' },
  strategy:  { label: '뇌지컬', color: 'info' },
};

// 등수 배지 — ResultScreen과 동일하게 1~3위는 메달 색으로 강조
const RANK_BADGE_STYLE: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-[#FFD700]', text: 'text-black' },
  2: { bg: 'bg-[#C0C0C0]', text: 'text-black' },
  3: { bg: 'bg-[#CD7F32]', text: 'text-white' },
};

function rankBadgeStyle(rank: number): { bg: string; text: string } {
  return RANK_BADGE_STYLE[rank] ?? { bg: 'bg-black/70', text: 'text-white' };
}

function weightLabel(weight: number): string {
  if (weight < 2.0) return '쉬움';
  if (weight < 3.5) return '보통';
  return '어려움';
}

function relativeTime(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return new Date(iso).toISOString().slice(0, 10);
}

const TOP_N = 3;

function RankedGameRow({ game, onPress }: { game: GameSummary; onPress: () => void }) {
  const typeStyle = game.game_type ? GAME_TYPE_STYLE[game.game_type] : null;
  const badge = rankBadgeStyle(game.rank ?? 99);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card className="flex-row items-center gap-3 p-3">
        <View className={cn('h-8 w-8 items-center justify-center rounded-full', badge.bg)}>
          <Text className={cn('text-[13px] font-extrabold', badge.text)}>{game.rank}</Text>
        </View>
        <View className="flex-1 gap-1.5">
          <Text className="text-[15px] font-extrabold text-foreground" numberOfLines={1}>{game.name}</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {typeStyle && <Tag label={typeStyle.label} color={typeStyle.color} />}
            <Tag label={`👥 ${game.min_players}~${game.max_players}`} />
            <Tag label={`⏱ ${game.play_time}분`} />
            <Tag label={weightLabel(game.weight)} />
          </View>
        </View>
        <ChevronRightIcon size={18} color={COLORS.mutedForeground} />
      </Card>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const [recent, setRecent] = useState<RecentRecommendation | null>(null);

  useFocusEffect(
    useCallback(() => {
      getRecentRecommendation().then(setRecent);
    }, []),
  );

  const topGames = recent?.games.slice(0, TOP_N) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-6 pb-10" showsVerticalScrollIndicator={false}>

        {/* 헤더 */}
        <View className="mb-1 mt-5 flex-row items-center gap-2">
          <DiceIcon size={22} color={COLORS.foreground} fill="transparent" />
          <Text className="text-2xl font-extrabold tracking-tight text-foreground">추천</Text>
        </View>
        <Text className="mb-6 text-[13px] font-medium text-muted-foreground">오늘은 어떤 게임을 즐겨볼까요?</Text>

        {/* 추천 질의응답 CTA */}
        <TouchableOpacity onPress={() => navigation.navigate('Recommendation')} activeOpacity={0.9}>
          <GradientView gradient="primary" direction="diagonal" className="rounded-2xl p-5">
            <View className="flex-row items-center gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/25">
                <SearchIcon size={26} color="#FFFFFF" fill="transparent" />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-lg font-extrabold text-white">나에게 맞는 게임 찾기</Text>
                <Text className="text-[13px] font-semibold text-white/90">인원수 · 스타일 · 시간 5문항이면 끝</Text>
              </View>
              <ChevronRightIcon size={22} color="#FFFFFF" />
            </View>
          </GradientView>
        </TouchableOpacity>

        {/* 최근 추천 게임 순위 */}
        <View className="mb-3 mt-8 flex-row items-center justify-between">
          <Text className="text-base font-extrabold text-foreground">최근 추천 게임 순위</Text>
          {recent && (
            <Text className="text-xs font-bold text-muted-foreground">{relativeTime(recent.createdAt)}</Text>
          )}
        </View>

        {topGames.length > 0 ? (
          <View className="gap-2.5">
            {topGames.map(game => (
              <RankedGameRow
                key={game.bgg_id}
                game={game}
                onPress={() => navigation.navigate('GameDetail', { bggId: game.bgg_id, game })}
              />
            ))}
          </View>
        ) : (
          /* 빈 상태 — 아직 추천받은 적이 없을 때 */
          <Card className="items-center gap-3 px-6 py-8">
            <GradientView gradient="soft" className="h-14 w-14 items-center justify-center rounded-2xl">
              <TrophyIcon size={26} color={COLORS.foreground} fill="transparent" />
            </GradientView>
            <View className="items-center gap-1">
              <Text className="text-[15px] font-extrabold text-foreground">아직 추천받은 게임이 없어요</Text>
              <Text className="text-center text-[13px] font-medium text-muted-foreground">
                위 버튼으로 나에게 맞는 게임을 찾아보면{'\n'}여기에 순위로 보여드릴게요
              </Text>
            </View>
          </Card>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
