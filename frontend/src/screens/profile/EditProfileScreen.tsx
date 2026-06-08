import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { COLORS, FONT, SPACING, RADIUS, BLOCK_SHADOW_SM } from '../../design';
import { ArrowLeftIcon, UserIcon } from '../../components/Icon';
import { WoodButton } from '../../components/WoodButton';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;
}

export default function EditProfileScreen({ navigation }: Props) {
  const { user, updateProfile } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      Alert.alert('닉네임을 입력해주세요');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 16) {
      Alert.alert('닉네임은 2~16자여야 해요');
      return;
    }
    try {
      setSaving(true);
      await updateProfile({ nickname: trimmed });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 헤더 */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={24} color={COLORS.woodDark} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>프로필 편집</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          {/* 아바타 */}
          <View style={s.avatarArea}>
            <View style={s.avatarWrapper}>
              <View style={s.avatarBlock}>
                <UserIcon size={52} color={COLORS.woodLight} fill={COLORS.woodLight} />
              </View>
              <View style={s.avatarShadow} />
            </View>
            <Text style={s.avatarHint}>프로필 이미지는 연동 계정에서 가져와요</Text>
          </View>

          {/* 닉네임 입력 */}
          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>닉네임</Text>
            <View style={s.inputWrapper}>
              <TextInput
                style={s.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="닉네임을 입력하세요"
                placeholderTextColor={COLORS.textMuted}
                maxLength={16}
                autoFocus
              />
              <View style={s.inputShadow} />
            </View>
            <Text style={s.fieldHint}>{nickname.length}/16자</Text>
          </View>

          {/* 저장 버튼 */}
          <WoodButton
            onPress={handleSave}
            disabled={saving}
            label={saving ? '저장 중...' : '저장하기'}
            bg={COLORS.wood}
            bottomColor={COLORS.woodDeep}
            depth={6}
            radius={RADIUS.md}
            style={s.saveBtn}
            labelStyle={s.saveBtnLabel}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
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
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.xxl },

  // 아바타
  avatarArea: { alignItems: 'center', marginBottom: SPACING.xl },
  avatarWrapper: { ...BLOCK_SHADOW_SM, marginBottom: SPACING.sm },
  avatarBlock: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.wood,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.woodMid,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  avatarShadow: {
    height: 8,
    backgroundColor: COLORS.woodDeep,
    borderBottomLeftRadius: RADIUS.full,
    borderBottomRightRadius: RADIUS.full,
  },
  avatarHint: { ...FONT.caption, color: COLORS.textMuted, marginTop: SPACING.xs },

  // 필드
  fieldGroup: { marginBottom: SPACING.xl },
  fieldLabel: { ...FONT.label, fontSize: 12, marginBottom: SPACING.sm, letterSpacing: 1 },
  inputWrapper: { ...BLOCK_SHADOW_SM },
  input: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.sm,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderBottomWidth: 0,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  inputShadow: {
    height: 5,
    backgroundColor: COLORS.woodLight,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
  },
  fieldHint: { ...FONT.caption, color: COLORS.textMuted, textAlign: 'right', marginTop: SPACING.xs },

  // 저장 버튼
  saveBtn: { paddingVertical: 0, paddingHorizontal: 0, borderWidth: 0 },
  saveBtnLabel: { fontSize: 17, fontWeight: '800', paddingVertical: 16 },
});
