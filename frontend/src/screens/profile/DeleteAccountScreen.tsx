import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Alert, TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { COLORS, FONT, SPACING, RADIUS } from '../../design';
import { ArrowLeftIcon, ShieldIcon } from '../../components/Icon';
import { WoodButton, DangerWoodButton } from '../../components/WoodButton';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'DeleteAccount'>;
}

export default function DeleteAccountScreen({ navigation }: Props) {
  const { deleteAccount } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      '정말 탈퇴하시겠어요?',
      '모든 플레이 기록과 데이터가 삭제되며 복구할 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await deleteAccount();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color={COLORS.woodDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>회원 탈퇴</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.body}>
        <View style={s.iconArea}>
          <ShieldIcon size={56} color={COLORS.danger} fill={COLORS.dangerBg} />
        </View>
        <Text style={s.title}>탈퇴 전에 확인해주세요</Text>
        <View style={s.warningCard}>
          {WARNINGS.map((w, i) => (
            <Text key={i} style={s.warningItem}>• {w}</Text>
          ))}
        </View>

        <DangerWoodButton
          label={loading ? '처리 중...' : '회원 탈퇴하기'}
          onPress={handleDelete}
          style={s.deleteBtn}
        />
        <WoodButton
          label="돌아가기"
          onPress={() => navigation.goBack()}
          bg={COLORS.bgDeep}
          bottomColor={COLORS.woodMid}
          depth={5}
          radius={RADIUS.md}
          style={s.cancelBtn}
          labelStyle={s.cancelBtnLabel}
        />
      </View>
    </SafeAreaView>
  );
}

const WARNINGS = [
  '모든 플레이 기록이 영구 삭제됩니다',
  '삭제된 데이터는 복구할 수 없어요',
  '소셜 계정 연결도 해제됩니다',
];

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.woodLight,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { ...FONT.h3, color: COLORS.textPrimary },
  body: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    gap: SPACING.md,
  },
  iconArea: { alignItems: 'center', marginBottom: SPACING.sm },
  title: { ...FONT.h2, textAlign: 'center', color: COLORS.textPrimary },
  warningCard: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  warningItem: { ...FONT.body, color: COLORS.danger, lineHeight: 22 },
  deleteBtn: { paddingVertical: 0, paddingHorizontal: 0, borderWidth: 1.5 },
  cancelBtn: { paddingVertical: 0, paddingHorizontal: 0, borderWidth: 0 },
  cancelBtnLabel: { color: COLORS.textSecondary, fontSize: 15, paddingVertical: 14 },
});
