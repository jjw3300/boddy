import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image,
  TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogStackParamList } from '../types/navigation';
import { PlayLog, ResultType } from '../types/log';
import { getLogs } from '../services/logStorage';
import { COLORS, FONT, SPACING, BLOCK_SHADOW, BLOCK_SHADOW_SM, RADIUS } from '../design';
import { BookIcon, ChevronRightIcon, DiceIcon } from '../components/Icon';
import { SmallWoodButton } from '../components/WoodButton';

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
    <View style={s.cardWrapper}>
      <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
        {log.game_thumbnail ? (
          <Image source={{ uri: log.game_thumbnail }} style={s.thumbnail} />
        ) : (
          <View style={s.thumbnailPlaceholder}>
            <DiceIcon size={28} color={COLORS.woodMid} />
          </View>
        )}
        <View style={s.cardInfo}>
          <Text style={s.gameName} numberOfLines={1}>{log.game_name}</Text>
          <Text style={s.dateText}>{log.played_at}</Text>
          <View style={s.tagRow}>
            <View style={s.tag}>
              <Text style={s.tagText}>👥 {log.players.length}명</Text>
            </View>
            <View style={[s.tag, s.resultTag]}>
              <Text style={[s.tagText, s.resultTagText]}>
                {RESULT_LABELS[log.result_type]}
              </Text>
            </View>
          </View>
        </View>
        <ChevronRightIcon size={18} color={COLORS.woodMid} />
        <View style={{ width: SPACING.sm }} />
      </TouchableOpacity>
      <View style={s.cardShadow} />
    </View>
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
    <SafeAreaView style={s.container}>
      {/* 헤더 */}
      <View style={s.header}>
        <View style={s.titleRow}>
          <BookIcon size={24} color={COLORS.woodDark} fill={COLORS.woodMid} />
          <Text style={s.title}>플레이 기록</Text>
        </View>
        <SmallWoodButton
          label="+ 기록하기"
          onPress={() => navigation.navigate('NewLog')}
        />
      </View>

      {logs.length === 0 ? (
        /* 빈 상태 */
        <View style={s.emptyBox}>
          <View style={s.emptyWrapper}>
            <View style={s.emptyBlock}>
              <BookIcon size={48} color={COLORS.woodMid} fill={COLORS.woodLight} />
            </View>
            <View style={s.emptyBlockShadow} />
          </View>
          <Text style={s.emptyTitle}>아직 기록이 없어요</Text>
          <Text style={s.emptySub}>첫 번째 게임 기록을 남겨보세요!</Text>
          <SmallWoodButton
            label="+ 기록 시작하기"
            onPress={() => navigation.navigate('NewLog')}
            style={s.emptyBtn}
            labelStyle={s.emptyBtnLabel}
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
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  title: { ...FONT.h1, fontSize: 24 },

  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.sm + 2 },

  // 기록 카드
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
    borderColor: COLORS.cardBorder,
    borderBottomWidth: 0,
  },
  cardShadow: {
    height: 6,
    backgroundColor: COLORS.woodLight,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  thumbnail: { width: 76, height: 96 },
  thumbnailPlaceholder: {
    width: 76, height: 96,
    backgroundColor: COLORS.bgDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1, paddingHorizontal: SPACING.sm + 2, paddingVertical: SPACING.sm + 2, gap: 4 },
  gameName: { ...FONT.bodyB, color: COLORS.textPrimary },
  dateText: { ...FONT.caption, color: COLORS.textSecondary },
  tagRow: { flexDirection: 'row', gap: SPACING.xs + 1, marginTop: SPACING.xs },
  tag: {
    backgroundColor: COLORS.bgDeep,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm - 1,
    paddingVertical: 2,
  },
  resultTag: { backgroundColor: COLORS.woodLight },
  tagText: { ...FONT.label, fontSize: 11, color: COLORS.textSecondary },
  resultTagText: { color: COLORS.woodDark },

  // 빈 상태
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: 0,
  },
  emptyWrapper: { marginBottom: SPACING.lg, ...BLOCK_SHADOW },
  emptyBlock: {
    width: 100, height: 100,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.woodLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: COLORS.woodMid,
    borderBottomWidth: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
  },
  emptyBlockShadow: {
    width: '100%', height: 9,
    backgroundColor: COLORS.woodMid,
    borderBottomLeftRadius: RADIUS.xl, borderBottomRightRadius: RADIUS.xl,
  },
  emptyTitle: { ...FONT.h3, textAlign: 'center', marginBottom: SPACING.xs },
  emptySub: { ...FONT.caption, fontSize: 13, textAlign: 'center', marginBottom: SPACING.lg },
  emptyBtn: { paddingHorizontal: SPACING.lg },
  emptyBtnLabel: { fontSize: 15, paddingHorizontal: SPACING.md },
});
