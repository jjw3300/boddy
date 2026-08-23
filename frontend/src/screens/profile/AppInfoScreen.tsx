import React from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import { ArrowLeftIcon, DiceIcon } from '../../components/Icon';
import { Card } from '../../components/Card';

interface Props {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'AppInfo'>;
}

export default function AppInfoScreen({ navigation }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* 헤더 */}
      <View className="flex-row items-center justify-between border-b border-border px-4 py-4">
        <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color={COLORS.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">앱 정보</Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerClassName="px-5 pb-10">
        {/* 앱 로고 + 이름 */}
        <View className="items-center gap-2 py-8">
          <View className="mb-2 h-[76px] w-[76px] items-center justify-center rounded-xl border border-border bg-primary">
            <DiceIcon size={40} color={COLORS.primaryForeground} fill="transparent" />
          </View>
          <Text className="text-[26px] font-bold tracking-tight text-foreground">Boddy</Text>
          <Text className="text-sm text-muted-foreground">보드게임 버디</Text>
          <View className="mt-1 rounded-full border border-border bg-accent px-4 py-1">
            <Text className="text-xs font-semibold text-foreground">v1.0.0</Text>
          </View>
        </View>

        {/* 정보 카드 */}
        <InfoCard>
          <InfoRow label="버전" value="1.0.0" />
          <Divider />
          <InfoRow label="개발자" value="Boddy Team" />
          <Divider />
          <InfoRow label="보드게임 데이터" value="BoardGameGeek API" />
        </InfoCard>

        <SectionLabel text="오픈소스 라이선스" />
        <InfoCard>
          <InfoRow label="React Native" value="0.85.3" />
          <Divider />
          <InfoRow label="React Navigation" value="7.x" />
          <Divider />
          <InfoRow label="BGG XML API" value="v2" />
        </InfoCard>

        <SectionLabel text="문의 및 피드백" />
        <InfoCard>
          <TouchableInfoRow
            label="이메일 문의"
            value="support@boddy.app"
            onPress={() => Linking.openURL('mailto:support@boddy.app')}
          />
        </InfoCard>

        {/* 저작권 */}
        <Text className="mt-8 text-center text-xs leading-5 text-muted-foreground">
          © 2026 Boddy. All rights reserved.{'\n'}
          오늘도 즐거운 한 판 되세요
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── 서브 컴포넌트 ───────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <Text className="mb-2 mt-5 text-[11px] font-semibold tracking-widest text-muted-foreground">
      {text}
    </Text>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return <Card className="mb-2 overflow-hidden">{children}</Card>;
}

function Divider() {
  return <View className="mx-4 h-px bg-border" />;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      <Text className="text-sm font-semibold text-foreground">{label}</Text>
      <Text className="text-sm text-muted-foreground">{value}</Text>
    </View>
  );
}

function TouchableInfoRow({
  label, value, onPress,
}: { label: string; value: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between px-4 py-3.5"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className="text-sm font-semibold text-foreground">{label}</Text>
      <Text className="text-sm text-blue-700 underline">{value}</Text>
    </TouchableOpacity>
  );
}
