import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, Switch, Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { COLORS } from '../../design';
import {
  UserIcon, BellIcon, InfoIcon, LogoutIcon, EditIcon,
  ChevronRightIcon, ShieldIcon,
} from '../../components/Icon';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface Props {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [notiEnabled, setNotiEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃할까요?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', style: 'destructive', onPress: logout },
      ],
    );
  };

  const isGuest = !user || user.provider === 'guest';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <Text className="mb-5 mt-5 text-[26px] font-bold text-foreground">내 정보</Text>

        {/* 프로필 카드 */}
        <View className="mb-5 flex-row items-center gap-4 rounded-xl border border-border bg-card p-4">
          {/* 아바타 */}
          <View>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} className="h-[60px] w-[60px] rounded-full" />
            ) : (
              <View className="h-[60px] w-[60px] items-center justify-center rounded-full border border-border bg-primary">
                <UserIcon size={36} color={COLORS.primaryForeground} fill="transparent" />
              </View>
            )}
          </View>

          {/* 사용자 정보 */}
          <View className="flex-1 gap-1">
            <Text className="text-lg font-bold text-foreground">{user?.nickname ?? '게스트'}</Text>
            {user?.email ? (
              <Text className="text-xs text-muted-foreground">{user.email}</Text>
            ) : isGuest ? (
              <Text className="text-xs italic text-muted-foreground">로그인하면 더 많은 기능을 쓸 수 있어요</Text>
            ) : null}
            <View className="mt-0.5 self-start rounded-full bg-muted px-2 py-[3px]">
              <Text className="text-[11px] font-semibold text-foreground">
                {user?.provider === 'kakao' ? '🟡 카카오 계정'
                  : user?.provider === 'google' ? '🔵 Google 계정'
                  : '👤 게스트'}
              </Text>
            </View>
          </View>

          {/* 프로필 수정 버튼 */}
          {!isGuest && (
            <TouchableOpacity
              className="rounded-full bg-muted p-2"
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.7}
            >
              <EditIcon size={18} color={COLORS.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* 게스트일 때 로그인 유도 */}
        {isGuest && (
          <TouchableOpacity activeOpacity={0.85}
            onPress={() => navigation.navigate('Login' as any)}>
            <View className="mb-5 items-center rounded-xl bg-primary py-3.5">
              <Text className="text-[15px] font-bold text-primary-foreground">로그인 / 회원가입 →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 섹션: 설정 */}
        <SectionHeader label="설정" />

        <SettingsCard>
          <SettingsRow
            icon={<BellIcon size={20} color={COLORS.mutedForeground} fill="none" />}
            label="알림"
            right={
              <Switch
                value={notiEnabled}
                onValueChange={setNotiEnabled}
                trackColor={{ false: COLORS.muted, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            }
          />
          <Divider />
          <SettingsRow
            icon={<InfoIcon size={20} color={COLORS.mutedForeground} fill="none" />}
            label="앱 정보"
            onPress={() => navigation.navigate('AppInfo')}
            right={<ChevronRightIcon size={18} color={COLORS.mutedForeground} />}
          />
        </SettingsCard>

        {!isGuest && (
          <>
            <SectionHeader label="계정" />
            <SettingsCard>
              <SettingsRow
                icon={<LogoutIcon size={20} color={COLORS.mutedForeground} />}
                label="로그아웃"
                onPress={handleLogout}
                right={<ChevronRightIcon size={18} color={COLORS.mutedForeground} />}
              />
              <Divider />
              <SettingsRow
                icon={<ShieldIcon size={20} color={COLORS.destructive} />}
                label="회원 탈퇴"
                onPress={() => navigation.navigate('DeleteAccount')}
                labelClassName="text-destructive"
                right={<ChevronRightIcon size={18} color={COLORS.destructive} />}
              />
            </SettingsCard>
          </>
        )}

        {/* 게스트 로그아웃 없음 — 빈 섹션 */}
        {isGuest && (
          <View className="h-6" />
        )}

        <Text className="mt-5 mb-2.5 text-center text-xs text-muted-foreground">Boddy v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── 서브 컴포넌트 ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return <Text className="mb-3 mt-5 text-[11px] font-semibold tracking-wide text-muted-foreground">{label}</Text>;
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="mb-1 overflow-hidden rounded-xl border border-border bg-card">{children}</View>
  );
}

function Divider() {
  return <View className="mx-4 h-px bg-border" />;
}

interface RowProps {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  labelClassName?: string;
}

function SettingsRow({ icon, label, right, onPress, labelClassName }: RowProps) {
  const inner = (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      <View className="flex-1 flex-row items-center gap-3.5">
        <View className="w-7 items-center">{icon}</View>
        <Text className={cn('text-[15px] font-bold text-foreground', labelClassName)}>
          {label}
        </Text>
      </View>
      {right && <View className="items-center justify-center">{right}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}
