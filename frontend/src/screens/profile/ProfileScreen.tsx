import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, Switch, Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { COLORS, FONT, SPACING, RADIUS } from '../../design';
import {
  UserIcon, BellIcon, InfoIcon, LogoutIcon, EditIcon,
  ChevronRightIcon, ShieldIcon,
} from '../../components/Icon';
import { useAuth } from '../../context/AuthContext';

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
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <Text style={s.pageTitle}>내 정보</Text>

        {/* 프로필 카드 */}
        <View style={s.profileCard}>
          {/* 아바타 */}
          <View style={s.avatarWrapper}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={s.avatarImg} />
            ) : (
              <View style={s.avatarBlock}>
                <UserIcon size={40} color={COLORS.woodLight} fill={COLORS.woodLight} />
              </View>
            )}
          </View>

          {/* 사용자 정보 */}
          <View style={s.profileInfo}>
            <Text style={s.nickname}>{user?.nickname ?? '게스트'}</Text>
            {user?.email ? (
              <Text style={s.email}>{user.email}</Text>
            ) : isGuest ? (
              <Text style={s.emailMuted}>로그인하면 더 많은 기능을 쓸 수 있어요</Text>
            ) : null}
            <View style={s.providerBadge}>
              <Text style={s.providerText}>
                {user?.provider === 'kakao' ? '🟡 카카오 계정'
                  : user?.provider === 'google' ? '🔵 Google 계정'
                  : '👤 게스트'}
              </Text>
            </View>
          </View>

          {/* 프로필 수정 버튼 */}
          {!isGuest && (
            <TouchableOpacity
              style={s.editBtn}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.7}
            >
              <EditIcon size={18} color={COLORS.woodMid} />
            </TouchableOpacity>
          )}
        </View>

        {/* 게스트일 때 로그인 유도 */}
        {isGuest && (
          <TouchableOpacity style={s.loginNudge} activeOpacity={0.85}
            onPress={() => navigation.navigate('Login' as any)}>
            <Text style={s.loginNudgeText}>로그인 / 회원가입 →</Text>
          </TouchableOpacity>
        )}

        {/* 섹션: 설정 */}
        <SectionHeader label="설정" />

        <SettingsCard>
          <SettingsRow
            icon={<BellIcon size={20} color={COLORS.woodMid} fill="none" />}
            label="알림"
            right={
              <Switch
                value={notiEnabled}
                onValueChange={setNotiEnabled}
                trackColor={{ false: COLORS.bgDeep, true: COLORS.wood }}
                thumbColor={notiEnabled ? COLORS.woodHighlight : COLORS.woodLight}
              />
            }
          />
          <Divider />
          <SettingsRow
            icon={<InfoIcon size={20} color={COLORS.woodMid} fill="none" />}
            label="앱 정보"
            onPress={() => navigation.navigate('AppInfo')}
            right={<ChevronRightIcon size={18} color={COLORS.woodMid} />}
          />
        </SettingsCard>

        {!isGuest && (
          <>
            <SectionHeader label="계정" />
            <SettingsCard>
              <SettingsRow
                icon={<LogoutIcon size={20} color={COLORS.woodMid} />}
                label="로그아웃"
                onPress={handleLogout}
                right={<ChevronRightIcon size={18} color={COLORS.woodMid} />}
              />
              <Divider />
              <SettingsRow
                icon={<ShieldIcon size={20} color={COLORS.danger} />}
                label="회원 탈퇴"
                onPress={() => navigation.navigate('DeleteAccount')}
                labelColor={COLORS.danger}
                right={<ChevronRightIcon size={18} color={COLORS.danger} />}
              />
            </SettingsCard>
          </>
        )}

        {/* 게스트 로그아웃 없음 — 빈 섹션 */}
        {isGuest && (
          <View style={{ height: SPACING.xl }} />
        )}

        <Text style={s.version}>Boddy v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── 서브 컴포넌트 ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return <Text style={s.sectionHeader}>{label}</Text>;
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.settingsCard}>{children}</View>
  );
}

function Divider() {
  return <View style={s.divider} />;
}

interface RowProps {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  labelColor?: string;
}

function SettingsRow({ icon, label, right, onPress, labelColor }: RowProps) {
  const inner = (
    <View style={s.settingsRow}>
      <View style={s.settingsRowLeft}>
        <View style={s.settingsIcon}>{icon}</View>
        <Text style={[s.settingsLabel, labelColor ? { color: labelColor } : null]}>
          {label}
        </Text>
      </View>
      {right && <View style={s.settingsRowRight}>{right}</View>}
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

// ─── 스타일 ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  pageTitle: {
    ...FONT.h1,
    fontSize: 26,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    color: COLORS.textPrimary,
  },

  // 프로필 카드
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.lg,
    shadowColor: '#3D1A08',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarWrapper: {},
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.woodLight,
  },
  avatarBlock: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.wood,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.woodMid,
  },
  profileInfo: { flex: 1, gap: 4 },
  nickname: { ...FONT.h3, color: COLORS.textPrimary },
  email: { ...FONT.caption, color: COLORS.textSecondary },
  emailMuted: { ...FONT.caption, color: COLORS.textMuted, fontStyle: 'italic' },
  providerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.bgDeep,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginTop: 2,
  },
  providerText: { ...FONT.label, fontSize: 11 },
  editBtn: {
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgDeep,
  },

  // 게스트 로그인 유도
  loginNudge: {
    backgroundColor: COLORS.wood,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.woodDark,
    marginBottom: SPACING.lg,
    shadowColor: '#3D1A08',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  loginNudgeText: {
    ...FONT.bodyB,
    color: COLORS.textOnWood,
  },

  // 섹션 헤더
  sectionHeader: {
    ...FONT.label,
    fontSize: 11,
    letterSpacing: 1,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm + 2,
  },

  // 설정 카드
  settingsCard: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
    shadowColor: '#3D1A08',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 4,
    flex: 1,
  },
  settingsIcon: {
    width: 28,
    alignItems: 'center',
  },
  settingsLabel: {
    ...FONT.bodyB,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  settingsRowRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.bgDeep,
    marginHorizontal: SPACING.md,
  },

  version: {
    ...FONT.caption,
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
});
