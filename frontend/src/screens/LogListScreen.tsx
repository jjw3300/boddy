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
import { COLORS, BLOCK_SHADOW_SM, RADIUS } from '../design';
import { BookIcon, ChevronRightIcon, DiceIcon } from '../components/Icon';

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
    <View style={styles.cardWrapper}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
        {log.game_thumbnail ? (
          <Image source={{ uri: log.game_thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <DiceIcon size={28} color={COLORS.woodMid} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.gameName} numberOfLines={1}>{log.game_name}</Text>
          <Text style={styles.dateText}>{log.played_at}</Text>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>👥 {log.players.length}명</Text>
            </View>
            <View style={[styles.tag, styles.resultTag]}>
              <Text style={[styles.tagText, styles.resultTagText]}>
                {RESULT_LABELS[log.result_type]}
              </Text>
            </View>
          </View>
        </View>
        <ChevronRightIcon size={18} color={COLORS.woodMid} />
        <View style={{ width: 8 }} />
      </TouchableOpacity>
      <View style={styles.cardBottom} />
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <BookIcon size={24} color={COLORS.woodDark} fill={COLORS.woodMid} />
          <Text style={styles.title}>플레이 기록</Text>
        </View>
        <View style={styles.addBtnWrapper}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('NewLog')}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnText}>+ 기록하기</Text>
          </TouchableOpacity>
          <View style={styles.addBtnBottom} />
        </View>
      </View>

      {logs.length === 0 ? (
        <View style={styles.emptyBox}>
          <View style={styles.emptyBlock}>
            <BookIcon size={48} color={COLORS.woodMid} fill={COLORS.woodLight} />
          </View>
          <View style={styles.emptyBlockBottom} />
          <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
          <Text style={styles.emptySub}>첫 번째 게임 기록을 남겨보세요!</Text>
          <View style={styles.addBtnWrapper}>
            <TouchableOpacity
              style={[styles.addBtn, styles.emptyAddBtn]}
              onPress={() => navigation.navigate('NewLog')}
              activeOpacity={0.85}
            >
              <Text style={styles.addBtnText}>+ 기록 시작하기</Text>
            </TouchableOpacity>
            <View style={styles.addBtnBottom} />
          </View>
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
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingTop: 20,
    paddingBottom: 14,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary },
  addBtnWrapper: {},
  addBtn: {
    backgroundColor: COLORS.wood,
    borderRadius: RADIUS.sm,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: COLORS.woodDark,
    borderBottomWidth: 0,
  },
  emptyAddBtn: { paddingHorizontal: 20, paddingVertical: 12 },
  addBtnBottom: {
    height: 5,
    backgroundColor: COLORS.woodDark,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
  },
  addBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.textOnWood },

  list: { paddingHorizontal: 24, paddingBottom: 32, gap: 12 },

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
  thumbnail: { width: 76, height: 96 },
  thumbnailPlaceholder: {
    width: 76, height: 96,
    backgroundColor: COLORS.bgDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  gameName: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  dateText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  tagRow: { flexDirection: 'row', gap: 5, marginTop: 4 },
  tag: {
    backgroundColor: COLORS.bgDeep,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  resultTag: { backgroundColor: COLORS.woodLight },
  tagText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '700' },
  resultTagText: { color: COLORS.woodDark },

  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    paddingHorizontal: 40,
  },
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
  emptyTitle: {
    fontSize: 18, fontWeight: '800', color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: 6,
  },
  emptySub: {
    fontSize: 14, fontWeight: '600', color: COLORS.textSecondary,
    textAlign: 'center', marginBottom: 24,
  },
});
