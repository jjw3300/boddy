import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RecommendStackParamList } from '../types/navigation';
import { GameSummary, GameType } from '../types';
import { fetchGameDetail } from '../api/games';
import { COLORS, BLOCK_SHADOW_SM, RADIUS } from '../design';
import { ArrowLeftIcon } from '../components/Icon';

const GAME_TYPE_STYLE: Record<GameType, { label: string; bg: string; bottom: string }> = {
  luck:      { label: '운빨',   bg: COLORS.paintYellow + '66', bottom: COLORS.paintYellow },
  dexterity: { label: '피지컬', bg: '#B5D5A088',                bottom: '#4E9E6B' },
  party:     { label: '파티',   bg: '#F0B0A888',                bottom: COLORS.paintRed },
  strategy:  { label: '뇌지컬', bg: '#A8C8E888',                bottom: COLORS.paintBlue },
};

function weightLabel(weight: number) {
  if (weight < 2.0) return { text: '쉬움',   bg: '#B5D5A0', bottom: '#4E9E6B' };
  if (weight < 3.5) return { text: '보통',   bg: COLORS.woodLight, bottom: COLORS.woodMid };
  return               { text: '어려움', bg: '#F0B0A8', bottom: COLORS.paintRed };
}

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'GameDetail'>;
  route: RouteProp<RecommendStackParamList, 'GameDetail'>;
}

function InfoBlock({ label, value, bg, bottom }: { label: string; value: string; bg: string; bottom: string }) {
  return (
    <View style={styles.infoBlockWrapper}>
      <View style={[styles.infoBlock, { backgroundColor: bg }]}>
        <Text style={styles.infoBlockLabel}>{label}</Text>
        <Text style={styles.infoBlockValue}>{value}</Text>
      </View>
      <View style={[styles.infoBlockBottom, { backgroundColor: bottom }]} />
    </View>
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
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeftIcon size={20} color={COLORS.woodDark} />
          <Text style={styles.backText}>뒤로</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.wood} />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      )}

      {error && (
        <View style={styles.centerBox}>
          <Text style={styles.errorEmoji}>😢</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.retryWrapper}>
            <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.retryBtnText}>돌아가기</Text>
            </TouchableOpacity>
            <View style={styles.retryBtnBottom} />
          </View>
        </View>
      )}

      {!loading && !error && game && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* 썸네일 블럭 */}
          <View style={styles.thumbnailWrapper}>
            <View style={styles.thumbnailBlock}>
              {game.thumbnail ? (
                <Image source={{ uri: game.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Text style={styles.thumbnailEmoji}>🎲</Text>
                </View>
              )}
            </View>
            <View style={styles.thumbnailBlockBottom} />
          </View>

          {/* 게임 이름 */}
          <Text style={styles.gameName}>{game.name}</Text>

          {/* 게임 유형 태그 */}
          {game.game_type && (
            <View style={styles.typeBadgeWrapper}>
              <View style={[styles.typeBadge, { backgroundColor: GAME_TYPE_STYLE[game.game_type].bg }]}>
                <Text style={[styles.typeBadgeText, { color: GAME_TYPE_STYLE[game.game_type].bottom }]}>
                  {GAME_TYPE_STYLE[game.game_type].label}
                </Text>
              </View>
              <View style={[styles.typeBadgeBottom, { backgroundColor: GAME_TYPE_STYLE[game.game_type].bottom }]} />
            </View>
          )}

          {/* 정보 블럭 그리드 */}
          <View style={styles.infoGrid}>
            <InfoBlock
              label="인원"
              value={`${game.min_players}~${game.max_players}명`}
              bg={COLORS.woodLight}
              bottom={COLORS.woodMid}
            />
            <InfoBlock
              label="시간"
              value={`${game.play_time}분`}
              bg="#A8C8E8"
              bottom={COLORS.paintBlue}
            />
            {(() => {
              const d = weightLabel(game.weight);
              return <InfoBlock label="난이도" value={d.text} bg={d.bg} bottom={d.bottom} />;
            })()}
          </View>

          {/* 설명 */}
          <View style={styles.descSection}>
            <View style={styles.descTitleRow}>
              <View style={styles.descTitleAccent} />
              <Text style={styles.descTitle}>게임 소개</Text>
            </View>
            <View style={styles.descCard}>
              <Text style={styles.descText}>
                {game.description ?? '설명 정보가 없어요.'}
              </Text>
            </View>
          </View>

          {/* BGG ID */}
          <View style={styles.bggRow}>
            <Text style={styles.bggText}>BGG ID: {game.bgg_id}</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 4 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 6 },
  backText: { fontSize: 14, fontWeight: '700', color: COLORS.woodDark },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary, marginTop: 8 },
  errorEmoji: { fontSize: 48 },
  errorText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  retryWrapper: {},
  retryBtn: {
    backgroundColor: COLORS.wood,
    borderRadius: RADIUS.sm,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: COLORS.woodDark,
    borderBottomWidth: 0,
    marginTop: 8,
  },
  retryBtnBottom: {
    height: 5,
    backgroundColor: COLORS.woodDark,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
  },
  retryBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.textOnWood },
  content: { paddingHorizontal: 24, paddingBottom: 48, alignItems: 'center' },

  // 썸네일
  thumbnailWrapper: { marginTop: 8, marginBottom: 20, ...BLOCK_SHADOW_SM },
  thumbnailBlock: {
    width: 180,
    height: 180,
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.woodMid,
    borderBottomWidth: 0,
  },
  thumbnailBlockBottom: {
    height: 8,
    width: 180,
    backgroundColor: COLORS.woodMid,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  thumbnail: { width: 180, height: 180 },
  thumbnailPlaceholder: {
    width: 180, height: 180,
    backgroundColor: COLORS.bgDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  thumbnailEmoji: { fontSize: 64 },

  // 이름
  gameName: {
    fontSize: 24, fontWeight: '900', color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 32, marginBottom: 12,
  },

  // 유형 배지
  typeBadgeWrapper: { marginBottom: 20 },
  typeBadge: {
    borderRadius: RADIUS.sm,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 0,
  },
  typeBadgeBottom: {
    height: 4,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
  },
  typeBadgeText: { fontSize: 14, fontWeight: '900' },

  // 정보 블럭
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 24, width: '100%' },
  infoBlockWrapper: { flex: 1, ...BLOCK_SHADOW_SM },
  infoBlock: {
    borderRadius: RADIUS.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 0,
  },
  infoBlockBottom: {
    height: 6,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  infoBlockLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 4 },
  infoBlockValue: { fontSize: 15, fontWeight: '900', color: COLORS.textPrimary },

  // 설명
  descSection: { width: '100%', marginBottom: 16 },
  descTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  descTitleAccent: { width: 5, height: 20, backgroundColor: COLORS.wood, borderRadius: 3 },
  descTitle: { fontSize: 17, fontWeight: '900', color: COLORS.textPrimary },
  descCard: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.woodLight,
  },
  descText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 22, fontWeight: '500' },

  bggRow: { alignSelf: 'flex-start' },
  bggText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
});
