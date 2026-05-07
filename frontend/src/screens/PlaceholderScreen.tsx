import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const COLORS = {
  bg: '#F5ECD7',
  text: '#3E2A1E',
  subtext: '#7A5C3A',
  card: '#E8D5B0',
};

interface Props {
  emoji: string;
  title: string;
  description: string;
}

function PlaceholderScreen({ emoji, title, description }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>개발 중이에요 🛠️</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function LogScreen() {
  return (
    <PlaceholderScreen
      emoji="📖"
      title="플레이 기록"
      description={'그날의 게임을\n다이어리처럼 기록해요'}
    />
  );
}

export function CafeScreen() {
  return (
    <PlaceholderScreen
      emoji="📍"
      title="카페 찾기"
      description={'내 근처 보드게임 카페를\n지도에서 찾아요'}
    />
  );
}

export function ToolkitScreen() {
  return (
    <PlaceholderScreen
      emoji="🎰"
      title="도구 모음"
      description={'주사위, 점수판, 동전 던지기\n게임 중 필요한 모든 것'}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  description: {
    fontSize: 15,
    color: COLORS.subtext,
    textAlign: 'center',
    lineHeight: 24,
  },
  badge: {
    marginTop: 8,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  badgeText: {
    fontSize: 13,
    color: COLORS.subtext,
    fontWeight: '600',
  },
});
