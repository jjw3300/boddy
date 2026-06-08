import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { TabParamList } from '../types/navigation';
import RecommendStack from './RecommendStack';
import LogStack from './LogStack';
import { CafeScreen } from '../screens/PlaceholderScreen';
import ToolkitStack from './ToolkitStack';
import ProfileStack from './ProfileStack';
import { DiceIcon, BookIcon, MapPinIcon, WrenchIcon, UserIcon } from '../components/Icon';
import { COLORS, RADIUS, BLOCK_DEPTH } from '../design';

const Tab = createBottomTabNavigator<TabParamList>();

// ─── 탭 아이콘 컴포넌트 ─────────────────────────────────────────────────────

interface TabIconProps {
  Icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
  label: string;
  focused: boolean;
  activeColor: string;
  activeBg: string;
  activeBottom: string;
}

function WoodTabIcon({
  Icon, label, focused, activeColor, activeBg, activeBottom,
}: TabIconProps) {
  return (
    <View style={s.iconWrap}>
      {/* 블럭 바닥면 (focused 일 때만) */}
      {focused && <View style={[s.tabBottom, { backgroundColor: activeBottom }]} />}
      {/* 블럭 표면 */}
      <View style={[
        s.tabBlock,
        focused
          ? { backgroundColor: activeBg, borderColor: activeColor, borderBottomWidth: 0 }
          : { backgroundColor: COLORS.bgDeep, borderColor: COLORS.woodLight, borderBottomWidth: 0 },
        focused && s.tabBlockFocused,
      ]}>
        <Icon
          size={20}
          color={focused ? activeColor : COLORS.woodMid}
          fill={focused ? activeBg : 'transparent'}
        />
      </View>
    </View>
  );
}

// ─── TabNavigator ────────────────────────────────────────────────────────────

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: s.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: s.tabLabel,
        tabBarActiveTintColor: COLORS.woodDark,
        tabBarInactiveTintColor: COLORS.woodMid,
        tabBarItemStyle: s.tabItem,
      }}
    >
      <Tab.Screen
        name="RecommendTab"
        component={RecommendStack}
        options={{
          tabBarLabel: '추천',
          tabBarIcon: ({ focused }) => (
            <WoodTabIcon
              Icon={DiceIcon} label="추천" focused={focused}
              activeColor={COLORS.woodDark} activeBg={COLORS.wood} activeBottom={COLORS.woodDeep}
            />
          ),
        }}
      />
      <Tab.Screen
        name="LogTab"
        component={LogStack}
        options={{
          tabBarLabel: '기록',
          tabBarIcon: ({ focused }) => (
            <WoodTabIcon
              Icon={BookIcon} label="기록" focused={focused}
              activeColor="#3A6B2A" activeBg="#A8D090" activeBottom="#2A5020"
            />
          ),
        }}
      />
      <Tab.Screen
        name="CafeTab"
        component={CafeScreen}
        options={{
          tabBarLabel: '카페',
          tabBarIcon: ({ focused }) => (
            <WoodTabIcon
              Icon={MapPinIcon} label="카페" focused={focused}
              activeColor={COLORS.paintRed} activeBg="#F0B0A8" activeBottom="#A03028"
            />
          ),
        }}
      />
      <Tab.Screen
        name="ToolkitTab"
        component={ToolkitStack}
        options={{
          tabBarLabel: '도구',
          tabBarIcon: ({ focused }) => (
            <WoodTabIcon
              Icon={WrenchIcon} label="도구" focused={focused}
              activeColor={COLORS.paintBlue} activeBg="#A8C8E8" activeBottom="#2A5080"
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: '내 정보',
          tabBarIcon: ({ focused }) => (
            <WoodTabIcon
              Icon={UserIcon} label="내 정보" focused={focused}
              activeColor={COLORS.woodDark} activeBg={COLORS.woodLight} activeBottom={COLORS.woodMid}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── 스타일 ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.cardLight,
    borderTopWidth: 2.5,
    borderTopColor: COLORS.woodLight,
    height: 74,
    paddingBottom: 10,
    paddingTop: 6,
    // 탭바 자체도 나무 블럭 느낌
    shadowColor: COLORS.woodDeep,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  iconWrap: {
    alignItems: 'center',
    width: 46,
    position: 'relative',
  },
  tabBlock: {
    width: 42,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
    zIndex: 1,
  },
  tabBlockFocused: {
    // focused 블럭은 살짝 올라간 느낌
    marginBottom: BLOCK_DEPTH,
  },
  tabBottom: {
    position: 'absolute',
    bottom: 0,
    width: 42,
    height: BLOCK_DEPTH + 2,
    borderRadius: RADIUS.sm,
    zIndex: 0,
  },
});
