import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { GameSummary, GameType, RecommendationResponse } from '../types';
import GameDetailScreen from './GameDetailScreen';

const COLORS = {
  bg: '#F5ECD7',
  card: '#FFFDF5',
  primary: '#8B5E3C',
  text: '#3E2A1E',
  subtext: '#7A5C3A',
  tag: '#E8D5B0',
};

const GAME_TYPE_LABEL: Record<GameType, { label: string; emoji: string; color: string }> = {
  luck:      { label: '운빨',   emoji: '🎰', color: '#E07B54' },
  dexterity: { label: '피지컬', emoji: '🤸', color: '#5BA85A' },
  party:     { label: '파티',   emoji: '🥳', color: '#C8860A' },
  strategy:  { label: '뇌지컬', emoji: '🧠', color: '#5B7EC8' },
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy:   '⭐ 쉬움',
  medium: '⭐⭐ 보통',
  hard:   '⭐⭐⭐ 어려움',
};

function difficultyFromWeight(weight: number): string {
  if (weight < 2.0) return 'easy';
  if (weight < 3.5) return 'medium';
  return 'hard';
}

interface Props {
  results: RecommendationResponse;
  onReset: () => void;
}

function GameCard({ game, onPress }: { game: GameSummary; onPress: () => void }) {
  const typeInfo = game.game_type ? GAME_TYPE_LABEL[game.game_type] : null;
  const difficulty = DIFFICULTY_LABEL[difficultyFromWeight(game.weight)];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {game.thumbnail ? (
        <Image source={{ uri: game.thumbnail }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Text style={styles.thumbnailEmoji}>🎲</Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.gameName} numberOfLines={2}>{game.name}</Text>
        <View style={styles.tagRow}>
          {typeInfo && (
            <View style={[styles.tag, { backgroundColor: typeInfo.color + '22' }]}>
              <Text style={[styles.tagText, { color: typeInfo.color }]}>
                {typeInfo.emoji} {typeInfo.label}
              </Text>
            </View>
          )}
          <View style={styles.tag}>
            <Text style={styles.tagText}>👥 {game.min_players}~{game.max_players}명</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>⏱ {game.play_time}분</Text>
          </View>
        </View>
        <Text style={styles.difficulty}>{difficulty}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function ResultScreen({ results, onReset }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (selectedId !== null) {
    return (
      <GameDetailScreen
        bggId={selectedId}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  if (results.total === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>😅</Text>
          <Text style={styles.emptyText}>조건에 맞는 게임을 찾지 못했어요</Text>
          <Text style={styles.emptySubtext}>조건을 바꿔서 다시 시도해보세요!</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
            <Text style={styles.resetBtnText}>다시 찾기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>추천 게임</Text>
          <Text style={styles.headerSub}>{results.total}개 찾았어요 🎉</Text>
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
          <Text style={styles.resetBtnText}>다시 찾기</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={results.games}
        keyExtractor={item => String(item.bgg_id)}
        renderItem={({ item }) => (
          <GameCard game={item} onPress={() => setSelectedId(item.bgg_id)} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.subtext,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  thumbnail: {
    width: 90,
    height: 110,
  },
  thumbnailPlaceholder: {
    backgroundColor: COLORS.tag,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailEmoji: {
    fontSize: 32,
  },
  cardInfo: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: COLORS.tag,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.subtext,
    fontWeight: '600',
  },
  difficulty: {
    fontSize: 12,
    color: COLORS.subtext,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.subtext,
    paddingRight: 14,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 56 },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.subtext,
    textAlign: 'center',
  },
  resetBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  resetBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
