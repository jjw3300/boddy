import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, StyleSheet, SafeAreaView, Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { LogStackParamList } from '../types/navigation';
import { PlayLog, ResultType, WinLossResult } from '../types/log';
import { getLog, deleteLog } from '../services/logStorage';
import { COLORS, BLOCK_SHADOW_SM, RADIUS } from '../design';
import { ArrowLeftIcon, DiceIcon } from '../components/Icon';

const RESULT_TYPE_LABELS: Record<ResultType, string> = {
  score: '점수',
  win_loss: '승패',
  rank: '순위',
  free: '자유',
};

const WIN_LOSS_LABEL: Record<WinLossResult, { text: string; color: string; bg: string }> = {
  win:  { text: 'O', color: '#2E6E47', bg: '#B5D5A0' },
  draw: { text: '△', color: COLORS.woodMid, bg: COLORS.woodLight },
  loss: { text: 'X', color: COLORS.paintRed, bg: '#F0B0A8' },
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
  const { result_data, players } = log;

  if (result_data.type === 'score') {
    const sorted = [...result_data.entries].sort((a, b) => {
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });
    const maxScore = sorted[0]?.score ?? null;

    return (
      <View style={styles.resultTable}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.cellName]}>참여자</Text>
          <Text style={[styles.tableHeaderCell, styles.cellValue]}>점수</Text>
        </View>
        {sorted.map(entry => {
          const isWinner = entry.score !== null && entry.score === maxScore;
          return (
            <View key={entry.player_id} style={styles.tableRow}>
              <Text style={[styles.cellName, styles.playerName]}>
                {getPlayerName(log, entry.player_id)}
              </Text>
              <View style={[styles.cellValue, styles.scoreCell]}>
                {isWinner && <Text style={styles.trophyIcon}>🏆</Text>}
                <Text style={[styles.scoreText, isWinner && styles.scoreTextWinner]}>
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
      <View style={styles.resultTable}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.cellName]}>참여자</Text>
          <Text style={[styles.tableHeaderCell, styles.cellValue]}>결과</Text>
        </View>
        {result_data.entries.map(entry => {
          const style = WIN_LOSS_LABEL[entry.result];
          return (
            <View key={entry.player_id} style={styles.tableRow}>
              <Text style={[styles.cellName, styles.playerName]}>
                {getPlayerName(log, entry.player_id)}
              </Text>
              <View style={styles.cellValue}>
                <View style={[styles.winLossBadge, { backgroundColor: style.bg, borderColor: style.color }]}>
                  <Text style={[styles.winLossBadgeText, { color: style.color }]}>{style.text}</Text>
                </View>
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
      <View style={styles.resultTable}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.cellName]}>참여자</Text>
          <Text style={[styles.tableHeaderCell, styles.cellValue]}>순위</Text>
        </View>
        {sorted.map(entry => {
          const rank = entry.rank;
          const medal = rank !== null && rank >= 1 && rank <= 3 ? RANK_MEDALS[rank - 1] : null;
          return (
            <View key={entry.player_id} style={styles.tableRow}>
              <Text style={[styles.cellName, styles.playerName]}>
                {getPlayerName(log, entry.player_id)}
              </Text>
              <View style={[styles.cellValue, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                {medal && <Text style={styles.medalText}>{medal}</Text>}
                <Text style={styles.rankText}>
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
      <View style={styles.freeCard}>
        <Text style={styles.freeText}>{result_data.text || '입력된 내용이 없어요.'}</Text>
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
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.wood} />
        </View>
      </SafeAreaView>
    );
  }

  if (!log) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>기록을 찾을 수 없어요.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnStandalone}>
            <Text style={styles.backBtnStandaloneText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeftIcon size={20} color={COLORS.woodDark} />
          <Text style={styles.backText}>뒤로</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>삭제</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Game thumbnail + name */}
        <View style={styles.gameHeader}>
          <View style={styles.thumbnailWrapper}>
            <View style={styles.thumbnailBlock}>
              {log.game_thumbnail ? (
                <Image source={{ uri: log.game_thumbnail }} style={styles.thumbnail} resizeMode="cover" />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <DiceIcon size={40} color={COLORS.woodMid} />
                </View>
              )}
            </View>
            <View style={styles.thumbnailBlockBottom} />
          </View>
          <View style={styles.gameNameBox}>
            <Text style={styles.gameName}>{log.game_name}</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>📅 {log.played_at}</Text>
            </View>
            {log.bgg_id && (
              <Text style={styles.bggText}>BGG #{log.bgg_id}</Text>
            )}
          </View>
        </View>

        {/* Players + Result */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>참여자 · {RESULT_TYPE_LABELS[log.result_type]}</Text>
          </View>
          <View style={styles.tableCard}>
            <ResultSection log={log} />
          </View>
        </View>

        {/* Review */}
        {log.review ? (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>후기</Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewText}>{log.review}</Text>
            </View>
          </View>
        ) : null}

        {/* Players list */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>참여자 목록</Text>
          </View>
          <View style={styles.playersRow}>
            {log.players.map(p => (
              <View key={p.id} style={styles.playerChip}>
                <Text style={styles.playerChipText}>{p.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Timestamps */}
        <Text style={styles.timestampText}>
          기록: {new Date(log.created_at).toLocaleString('ko-KR')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  backBtnStandalone: {
    backgroundColor: COLORS.wood, borderRadius: RADIUS.sm,
    paddingVertical: 10, paddingHorizontal: 20,
  },
  backBtnStandaloneText: { fontSize: 14, fontWeight: '800', color: COLORS.textOnWood },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 4,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  backText: { fontSize: 14, fontWeight: '700', color: COLORS.woodDark },
  deleteBtn: {
    backgroundColor: '#F0B0A8',
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: COLORS.paintRed,
  },
  deleteBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.paintRed },

  content: { paddingHorizontal: 24, paddingBottom: 48 },

  // Game header
  gameHeader: { flexDirection: 'row', gap: 16, marginTop: 12, marginBottom: 28, alignItems: 'flex-start' },
  thumbnailWrapper: { ...BLOCK_SHADOW_SM },
  thumbnailBlock: {
    width: 90, height: 90,
    borderRadius: RADIUS.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: COLORS.woodMid,
    borderBottomWidth: 0,
  },
  thumbnailBlockBottom: {
    height: 7, width: 90,
    backgroundColor: COLORS.woodMid,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  thumbnail: { width: 90, height: 90 },
  thumbnailPlaceholder: {
    width: 90, height: 90,
    backgroundColor: COLORS.bgDeep,
    alignItems: 'center', justifyContent: 'center',
  },

  gameNameBox: { flex: 1, justifyContent: 'center', gap: 6 },
  gameName: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, lineHeight: 26 },
  dateBadge: {
    backgroundColor: COLORS.woodLight,
    borderRadius: RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: COLORS.woodMid,
  },
  dateBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.woodDark },
  bggText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },

  // Section
  section: { marginBottom: 24 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionAccent: { width: 5, height: 20, backgroundColor: COLORS.wood, borderRadius: 3 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: COLORS.textPrimary },

  // Result table card
  tableCard: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.woodLight,
    overflow: 'hidden',
  },
  resultTable: {},
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.woodLight,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  tableHeaderCell: { fontSize: 12, fontWeight: '800', color: COLORS.woodDark },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderColor: COLORS.woodLight,
  },
  cellName: { flex: 2 },
  cellValue: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  playerName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },

  scoreCell: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trophyIcon: { fontSize: 16 },
  scoreText: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  scoreTextWinner: { color: '#2D5E8A', fontSize: 18 },

  winLossBadge: {
    width: 36, height: 30,
    borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  winLossBadgeText: { fontSize: 15, fontWeight: '900' },

  medalText: { fontSize: 18 },
  rankText: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },

  freeCard: {
    padding: 14,
  },
  freeText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, lineHeight: 22 },

  // Review
  reviewCard: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.woodLight,
  },
  reviewText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, lineHeight: 22 },

  // Players list
  playersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  playerChip: {
    backgroundColor: COLORS.woodLight,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: COLORS.woodMid,
  },
  playerChipText: { fontSize: 13, fontWeight: '700', color: COLORS.woodDark },

  timestampText: {
    fontSize: 11, color: COLORS.textSecondary, fontWeight: '600',
    textAlign: 'right', marginTop: 8,
  },
});
