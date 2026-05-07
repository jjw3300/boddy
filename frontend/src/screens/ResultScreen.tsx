import React from 'react';
import {
  View, Text, FlatList, Image,
  TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RecommendStackParamList } from '../types/navigation';
import { GameSummary, GameType } from '../types';
import { COLORS, BLOCK_SHADOW_SM, RADIUS } from '../design';
import { ArrowLeftIcon, RefreshIcon, ChevronRightIcon } from '../components/Icon';

const GAME_TYPE_STYLE: Record<GameType, { label: string; bg: string; bottom: string }> = {
  luck:      { label: '운빨',   bg: COLORS.paintYellow + '66', bottom: COLORS.paintYellow },
  dexterity: { label: '피지컬', bg: '#B5D5A088',                bottom: '#4E9E6B' },
  party:     { label: '파티',   bg: '#F0B0A888',                bottom: COLORS.paintRed },
  strategy:  { label: '뇌지컬', bg: '#A8C8E888',                bottom: COLORS.paintBlue },
};

function weightLabel(weight: number): string {
  if (weight < 2.0) return '쉬움';
  if (weight < 3.5) return '보통';
  return '어려움';
}

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'Result'>;
  route: RouteProp<RecommendStackParamList, 'Result'>;
}

function GameCard({ game, onPress }: { game: GameSummary; onPress: () => void }) {
  const typeStyle = game.game_type ? GAME_TYPE_STYLE[game.game_type] : null;

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
        {/* 썸네일 */}
        {game.thumbnail ? (
          <Image source={{ uri: game.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailEmoji}>🎲</Text>
          </View>
        )}

        <View style={styles.cardInfo}>
          <Text style={styles.gameName} numberOfLines={2}>{game.name}</Text>

          {/* 태그 */}
          <View style={styles.tagRow}>
            {typeStyle && (
              <View style={[styles.tag, { backgroundColor: typeStyle.bg, borderBottomWidth: 2, borderColor: typeStyle.bottom }]}>
                <Text style={[styles.tagText, { color: typeStyle.bottom }]}>{typeStyle.label}</Text>
              </View>
            )}
            <View style={styles.tag}>
              <Text style={styles.tagText}>👥 {game.min_players}~{game.max_players}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>⏱ {game.play_time}분</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{weightLabel(game.weight)}</Text>
            </View>
          </View>
        </View>

        <ChevronRightIcon size={20} color={COLORS.woodMid} />
        <View style={styles.cardPaddingRight} />
      </TouchableOpacity>
      <View style={styles.cardBottom} />
    </View>
  );
}

export default function ResultScreen({ navigation, route }: Props) {
  const { results } = route.params;

  if (results.total === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyBox}>
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyEmoji}>😅</Text>
          </View>
          <View style={styles.emptyBlockBottom} />
          <Text style={styles.emptyTitle}>조건에 맞는 게임이 없어요</Text>
          <Text style={styles.emptySub}>조건을 바꿔서 다시 시도해보세요</Text>
          <View style={styles.resetBtnWrapper}>
            <TouchableOpacity style={styles.resetBtn} onPress={() => navigation.popToTop()}>
              <RefreshIcon size={18} color={COLORS.textOnWood} />
              <Text style={styles.resetBtnText}>다시 찾기</Text>
            </TouchableOpacity>
            <View style={styles.resetBtnBottom} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeftIcon size={20} color={COLORS.woodDark} />
          <Text style={styles.backText}>이전</Text>
        </TouchableOpacity>
        <View style={styles.resetBtnWrapper}>
          <TouchableOpacity style={styles.resetBtn} onPress={() => navigation.popToTop()}>
            <RefreshIcon size={16} color={COLORS.textOnWood} />
            <Text style={styles.resetBtnText}>다시 찾기</Text>
          </TouchableOpacity>
          <View style={styles.resetBtnBottom} />
        </View>
      </View>

      {/* 타이틀 블럭 */}
      <View style={styles.titleArea}>
        <Text style={styles.title}>추천 게임</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{results.total}개</Text>
        </View>
      </View>

      <FlatList
        data={results.games}
        keyExtractor={item => String(item.bgg_id)}
        renderItem={({ item }) => (
          <GameCard
            game={item}
            onPress={() => navigation.navigate('GameDetail', { bggId: item.bgg_id })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  backText: { fontSize: 14, fontWeight: '700', color: COLORS.woodDark },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.textPrimary },
  countBadge: {
    backgroundColor: COLORS.wood,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: COLORS.woodDark,
  },
  countText: { fontSize: 13, fontWeight: '800', color: COLORS.textOnWood },
  list: { paddingHorizontal: 24, paddingBottom: 32, gap: 14 },

  // 카드
  cardWrapper: { ...BLOCK_SHADOW_SM },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.woodLight,
    borderBottomWidth: 0,
  },
  cardBottom: {
    height: 6,
    backgroundColor: COLORS.woodLight,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: COLORS.woodLight,
  },
  thumbnail: { width: 88, height: 108 },
  thumbnailPlaceholder: {
    width: 88, height: 108,
    backgroundColor: COLORS.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailEmoji: { fontSize: 32 },
  cardInfo: { flex: 1, padding: 14, gap: 8 },
  gameName: {
    fontSize: 15, fontWeight: '800',
    color: COLORS.textPrimary, lineHeight: 21,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: {
    backgroundColor: COLORS.bgDeep,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '700' },
  cardPaddingRight: { width: 12 },

  // 빈 화면
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 0, paddingHorizontal: 40 },
  emptyBlock: {
    width: 100, height: 100,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.woodLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.woodMid,
    borderBottomWidth: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
  },
  emptyBlockBottom: {
    width: 100, height: 8,
    backgroundColor: COLORS.woodMid,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    marginBottom: 20,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 6 },
  emptySub: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20 },

  // 버튼
  resetBtnWrapper: {},
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.wood,
    borderRadius: RADIUS.sm,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: COLORS.woodDark,
    borderBottomWidth: 0,
  },
  resetBtnBottom: {
    height: 5,
    backgroundColor: COLORS.woodDark,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
  },
  resetBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.textOnWood },
});
