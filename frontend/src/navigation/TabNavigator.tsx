import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { TabParamList } from '../types/navigation';
import RecommendStack from './RecommendStack';
import LogStack from './LogStack';
import { CafeScreen } from '../screens/PlaceholderScreen';
import ToolkitStack from './ToolkitStack';
import ProfileStack from './ProfileStack';
import { DiceIcon, BookIcon, MapPinIcon, WrenchIcon, UserIcon } from '../components/Icon';
import { COLORS, RADIUS } from '../design';

const Tab = createBottomTabNavigator<TabParamList>();

// ─── 탭 아이콘 컴포넌트 ─────────────────────────────────────────────────────

interface TabIconProps {
  Icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
  focused: boolean;
  activeColor: string;
  activeBg: string;
}

function WoodTabIcon({ Icon, focused, activeColor, activeBg }: TabIconProps) {
  return (
    <View style={s.iconWrap}>
      <View style={[
        s.tabBlock,
        focused
          ? { backgroundColor: activeBg, borderColor: `${activeColor}40` }
          : { backgroundColor: 'transparent', borderColor: 'transparent' },
      ]}>
        <Icon
          size={20}
          color={focused ? activeColor : COLORS.woodMid}
          fill={focused ? activeBg : 'transparent'}
        />
      </View>
      {focused && <View style={[s.tabIndicator, { backgroundColor: activeColor }]} />}
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
              Icon={DiceIcon} focused={focused}
              activeColor={COLORS.woodDark} activeBg={COLORS.woodLight}
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
              Icon={BookIcon} focused={focused}
              activeColor="#3A6B2A" activeBg="#D8F0C8"
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
              Icon={MapPinIcon} focused={focused}
              activeColor={COLORS.paintRed} activeBg="#FDECEA"
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
              Icon={WrenchIcon} focused={focused}
              activeColor={COLORS.paintBlue} activeBg="#E8F2FF"
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
              Icon={UserIcon} focused={focused}
              activeColor={COLORS.woodDark} activeBg={COLORS.bgDeep}
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
    borderTopWidth: 1,
    borderTopColor: COLORS.woodLight,
    height: 72,
    paddingBottom: 8,
    paddingTop: 6,
    shadowColor: COLORS.woodDeep,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    paddingTop: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 1,
  },
  iconWrap: {
    alignItems: 'center',
    gap: 3,
  },
  tabBlock: {
    width: 40,
    height: 30,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIndicator: {
    width: 16,
    height: 3,
    borderRadius: 2,
  },
});
