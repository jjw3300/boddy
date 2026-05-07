import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RecommendStackParamList } from '../types/navigation';
import { GameSummary, GameType } from '../types';
import { fetchGameDetail } from '../api/games';

const COLORS = {
  bg: '#F5ECD7',
  card: '#FFFDF5',
  primary: '#8B5E3C',
  text: '#3E2A1E',
  subtext: '#7A5C3A',
  tag: '#E8D5B0',
  divider: '#E0CBA8',
};

const GAME_TYPE_INFO: Record<GameType, { label: string; emoji: string; color: string }> = {
  luck:      { label: '운빨',   emoji: '🎰', color: '#E07B54' },
  dexterity: { label: '피지컬', emoji: '🤸', color: '#5BA85A' },
  party:     { label: '파티',   emoji: '🥳', color: '#C8860A' },
  strategy:  { label: '뇌지컬', emoji: '🧠', color: '#5B7EC8' },
};

function weightToStars(weight: number): string {
  if (weight < 2.0) return '⭐ 쉬움';
  if (weight < 3.5) return '⭐⭐ 보통';
  return '⭐⭐⭐ 어려움';
}

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'GameDetail'>;
  route: RouteProp<RecommendStackParamList, 'GameDetail'>;
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>게임 정보 불러오는 중...</Text>
        </View>
      )}

      {error && (
        <View style={styles.centerBox}>
          <Text style={styles.errorEmoji}>😢</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryBtnText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && game && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {game.thumbnail ? (
            <Image source={{ uri: game.thumbnail }} style={styles.thumbnail} resizeMode="contain" />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.thumbnailEmoji}>🎲</Text>
            </View>
          )}

          <Text style={styles.gameName}>{game.name}</Text>

          <View style={styles.tagRow}>
            {game.game_type && (
              <View style={[styles.tag, { backgroundColor: GAME_TYPE_INFO[game.game_type].color + '22' }]}>
                <Text style={[styles.tagText, { color: GAME_TYPE_INFO[game.game_type].color }]}>
                  {GAME_TYPE_INFO[game.game_type].emoji} {GAME_TYPE_INFO[game.game_type].label}
                </Text>
              </View>
            )}
            <View style={styles.tag}>
              <Text style={styles.tagText}>👥 {game.min_players}~{game.max_players}명</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>⏱ {game.play_time}분</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{weightToStars(game.weight)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>게임 소개</Text>
          {game.description ? (
            <Text style={styles.description}>{game.description}</Text>
          ) : (
            <Text style={styles.descriptionEmpty}>설명 정보가 없어요.</Text>
          )}

          <View style={styles.bggNote}>
            <Text style={styles.bggNoteText}>📋 BGG ID: {game.bgg_id}</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 6 },
  backText: { color: COLORS.subtext, fontSize: 15, fontWeight: '600' },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: COLORS.subtext, fontSize: 15, marginTop: 8 },
  errorEmoji: { fontSize: 48 },
  errorText: { fontSize: 16, color: COLORS.text, fontWeight: '600', textAlign: 'center' },
  retryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  content: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  thumbnail: {
    width: 200, height: 200, borderRadius: 16,
    marginTop: 16, marginBottom: 20,
  },
  thumbnailPlaceholder: {
    width: 200, height: 200, borderRadius: 16,
    backgroundColor: COLORS.tag,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 16, marginBottom: 20,
  },
  thumbnailEmoji: { fontSize: 64 },
  gameName: {
    fontSize: 24, fontWeight: '800', color: COLORS.text,
    textAlign: 'center', marginBottom: 16, lineHeight: 32,
  },
  tagRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 8, marginBottom: 20,
  },
  tag: { backgroundColor: COLORS.tag, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontSize: 13, color: COLORS.subtext, fontWeight: '600' },
  divider: { width: '100%', height: 1, backgroundColor: COLORS.divider, marginBottom: 20 },
  sectionTitle: {
    fontSize: 17, fontWeight: '700', color: COLORS.text,
    alignSelf: 'flex-start', marginBottom: 10,
  },
  description: { fontSize: 15, color: COLORS.text, lineHeight: 24, alignSelf: 'flex-start' },
  descriptionEmpty: { fontSize: 14, color: COLORS.subtext, alignSelf: 'flex-start' },
  bggNote: {
    marginTop: 24, backgroundColor: COLORS.tag,
    borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  bggNoteText: { fontSize: 12, color: COLORS.subtext },
});
