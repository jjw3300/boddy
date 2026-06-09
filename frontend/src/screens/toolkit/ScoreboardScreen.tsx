import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../../types/navigation';
import { COLORS, RADIUS } from '../../design';
import { ArrowLeftIcon, TrophyIcon } from '../../components/Icon';

interface Props {
  navigation: NativeStackNavigationProp<ToolkitStackParamList, 'Scoreboard'>;
}

interface Player {
  id: string;
  name: string;
  score: number;
}

let _id = 0;
function nextId() { return String(++_id); }

const RANK_COLORS = ['#E8A020', '#9E9E9E', '#C8640A'];
const RANK_BG    = ['#FFF0B0', '#F0F0F0', '#F0D0A8'];

export default function ScoreboardScreen({ navigation }: Props) {
  const [players, setPlayers] = useState<Player[]>([
    { id: nextId(), name: '플레이어 1', score: 0 },
    { id: nextId(), name: '플레이어 2', score: 0 },
  ]);
  const [nameInput, setNameInput] = useState('');
  const inputRef = useRef<TextInput>(null);

  // 점수 내림차순 정렬 (동점이면 추가 순서 유지)
  const sorted = [...players].sort((a, b) => b.score - a.score);

  function getRank(id: string): number {
    const idx = sorted.findIndex(p => p.id === id);
    if (idx === 0) return 1;
    if (sorted[idx].score === sorted[idx - 1].score) {
      return getRank(sorted[idx - 1].id);
    }
    return idx + 1;
  }

  function adjustScore(id: string, delta: number) {
    setPlayers(prev =>
      prev.map(p => p.id === id ? { ...p, score: p.score + delta } : p),
    );
  }

  function setScore(id: string, raw: string) {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) {
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, score: n } : p));
    }
  }

  function updateName(id: string, name: string) {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }

  function addPlayer() {
    const name = nameInput.trim() || `플레이어 ${players.length + 1}`;
    setPlayers(prev => [...prev, { id: nextId(), name, score: 0 }]);
    setNameInput('');
    inputRef.current?.blur();
  }

  function removePlayer(id: string) {
    if (players.length <= 1) return;
    setPlayers(prev => prev.filter(p => p.id !== id));
  }

  function resetAll() {
    Alert.alert('점수 초기화', '모든 점수를 0으로 초기화할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '초기화', style: 'destructive', onPress: () => {
        setPlayers(prev => prev.map(p => ({ ...p, score: 0 })));
      }},
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeftIcon size={20} color={COLORS.woodDark} />
          <Text style={styles.backText}>도구 모음</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resetAll} style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>초기화</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.headerRow}>
        <TrophyIcon size={24} color={COLORS.woodDark} fill={COLORS.woodMid} />
        <Text style={styles.title}>점수판</Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {sorted.map((player, idx) => {
          const rank = getRank(player.id);
          const isTop3 = rank <= 3;
          const rankColor = isTop3 ? RANK_COLORS[rank - 1] : COLORS.woodMid;
          const rankBg   = isTop3 ? RANK_BG[rank - 1] : COLORS.bgDeep;

          return (
            <View key={player.id} style={styles.row}>
              {/* 순위 뱃지 */}
              <View style={[styles.rankBadge, { backgroundColor: rankBg, borderColor: rankColor }]}>
                <Text style={[styles.rankText, { color: rankColor }]}>{rank}</Text>
              </View>

              {/* 이름 */}
              <TextInput
                style={styles.nameInput}
                value={player.name}
                onChangeText={t => updateName(player.id, t)}
                selectTextOnFocus
              />

              {/* -10 */}
              <TouchableOpacity style={styles.adjBtn} onPress={() => adjustScore(player.id, -10)}>
                <Text style={styles.adjBtnTextSm}>-10</Text>
              </TouchableOpacity>

              {/* - + score + + */}
              <View style={styles.scoreCtrl}>
                <TouchableOpacity style={styles.stepBtn} onPress={() => adjustScore(player.id, -1)}>
                  <Text style={styles.stepBtnText}>－</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.scoreInput}
                  value={String(player.score)}
                  onChangeText={t => setScore(player.id, t)}
                  keyboardType="numeric"
                  selectTextOnFocus
                  textAlign="center"
                />

                <TouchableOpacity style={styles.stepBtn} onPress={() => adjustScore(player.id, 1)}>
                  <Text style={styles.stepBtnText}>＋</Text>
                </TouchableOpacity>
              </View>

              {/* +10 */}
              <TouchableOpacity style={styles.adjBtn} onPress={() => adjustScore(player.id, 10)}>
                <Text style={styles.adjBtnTextSm}>+10</Text>
              </TouchableOpacity>

              {/* 삭제 */}
              {players.length > 1 && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removePlayer(player.id)}
                >
                  <Text style={styles.removeBtnText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* 플레이어 추가 */}
        <View style={styles.addRow}>
          <TextInput
            ref={inputRef}
            style={styles.addInput}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="이름 입력..."
            placeholderTextColor={COLORS.textSecondary}
            onSubmitEditing={addPlayer}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addPlayer} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ 추가</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8,
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 8,
  },
  backText: { fontSize: 14, fontWeight: '700', color: COLORS.woodDark },
  resetBtn: {
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: '#F0B0A8',
    borderRadius: RADIUS.sm,
    borderWidth: 1.5, borderColor: COLORS.paintRed,
  },
  resetBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.paintRed },

  headerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.textPrimary },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    paddingVertical: 12, paddingHorizontal: 10,
    shadowColor: '#3D1A08',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },

  rankBadge: {
    width: 30, height: 30,
    borderRadius: 15, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 13, fontWeight: '900' },

  nameInput: {
    flex: 1,
    fontSize: 14, fontWeight: '700', color: COLORS.textPrimary,
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1.5, borderColor: COLORS.woodLight,
  },

  scoreCtrl: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
  },
  stepBtn: {
    width: 30, height: 30,
    backgroundColor: COLORS.wood,
    borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: { fontSize: 18, fontWeight: '900', color: COLORS.textOnWood },
  scoreInput: {
    width: 46, height: 30,
    borderWidth: 2, borderColor: COLORS.woodLight,
    borderRadius: RADIUS.sm,
    fontSize: 16, fontWeight: '900', color: COLORS.textPrimary,
    backgroundColor: COLORS.bg,
  },

  adjBtn: {
    paddingHorizontal: 4, paddingVertical: 6,
  },
  adjBtnTextSm: { fontSize: 11, fontWeight: '800', color: COLORS.textSecondary },

  removeBtn: {
    width: 28, height: 28,
    backgroundColor: '#F0B0A8',
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.paintRed,
  },
  removeBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.paintRed },

  addRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  addInput: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: COLORS.textPrimary, fontWeight: '600',
  },
  addBtnWrapper: {},
  addBtn: {
    backgroundColor: COLORS.wood,
    borderRadius: RADIUS.sm,
    paddingVertical: 10, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: COLORS.woodDark,
    shadowColor: '#3D1A08',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  addBtnBottom: {},
  addBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.textOnWood },
});
