import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecommendStackParamList } from '../types/navigation';

const COLORS = {
  bg: '#F5ECD7',
  primary: '#8B5E3C',
  text: '#3E2A1E',
  subtext: '#7A5C3A',
  card: '#E8D5B0',
  white: '#FFFDF5',
};

interface Props {
  navigation: NativeStackNavigationProp<RecommendStackParamList, 'Home'>;
}

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      {/* 로고 영역 */}
      <View style={styles.logoArea}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🎲</Text>
        </View>
        <Text style={styles.appName}>Boddy</Text>
        <Text style={styles.appSubtitle}>보드게임 버디</Text>
      </View>

      {/* 메인 액션 */}
      <View style={styles.actionArea}>
        <TouchableOpacity
          style={styles.mainBtn}
          onPress={() => navigation.navigate('Recommendation')}
          activeOpacity={0.8}
        >
          <Text style={styles.mainBtnEmoji}>🔍</Text>
          <View>
            <Text style={styles.mainBtnTitle}>게임 추천받기</Text>
            <Text style={styles.mainBtnSub}>취향에 맞는 게임을 찾아드려요</Text>
          </View>
        </TouchableOpacity>

        {/* 빠른 접근 카드들 */}
        <View style={styles.quickRow}>
          <View style={[styles.quickCard, styles.quickCardDisabled]}>
            <Text style={styles.quickEmoji}>📖</Text>
            <Text style={styles.quickLabel}>플레이 기록</Text>
            <Text style={styles.quickSoon}>준비 중</Text>
          </View>
          <View style={[styles.quickCard, styles.quickCardDisabled]}>
            <Text style={styles.quickEmoji}>📍</Text>
            <Text style={styles.quickLabel}>카페 찾기</Text>
            <Text style={styles.quickSoon}>준비 중</Text>
          </View>
          <View style={[styles.quickCard, styles.quickCardDisabled]}>
            <Text style={styles.quickEmoji}>🎰</Text>
            <Text style={styles.quickLabel}>도구 모음</Text>
            <Text style={styles.quickSoon}>준비 중</Text>
          </View>
        </View>
      </View>

      {/* 하단 문구 */}
      <Text style={styles.footer}>오프라인 보드게임의 모든 것</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  logoArea: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 15,
    color: COLORS.subtext,
    marginTop: 4,
    fontWeight: '500',
  },
  actionArea: {
    gap: 16,
  },
  mainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 24,
    gap: 18,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  mainBtnEmoji: {
    fontSize: 36,
  },
  mainBtnTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  mainBtnSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  quickCardDisabled: {
    opacity: 0.6,
  },
  quickEmoji: {
    fontSize: 26,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  quickSoon: {
    fontSize: 10,
    color: COLORS.subtext,
    fontWeight: '500',
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.subtext,
  },
});
