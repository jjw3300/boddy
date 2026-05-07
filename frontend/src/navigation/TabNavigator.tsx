import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { TabParamList } from '../types/navigation';
import RecommendStack from './RecommendStack';
import LogStack from './LogStack';
import { CafeScreen, ToolkitScreen } from '../screens/PlaceholderScreen';
import { DiceIcon, BookIcon, MapPinIcon, WrenchIcon } from '../components/Icon';
import { COLORS, RADIUS } from '../design';

const Tab = createBottomTabNavigator<TabParamList>();

interface TabIconProps {
  Icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
  label: string;
  focused: boolean;
  activeColor: string;
  activeFill: string;
  activeBottom: string;
}

function WoodTabIcon({ Icon, label, focused, activeColor, activeFill, activeBottom }: TabIconProps) {
  return (
    <View style={styles.tabIconWrapper}>
      <View style={[
        styles.tabBlock,
        focused && { backgroundColor: activeFill, borderColor: activeColor },
      ]}>
        <Icon
          size={22}
          color={focused ? activeColor : COLORS.woodMid}
          fill={focused ? activeFill : 'transparent'}
        />
      </View>
      {focused && <View style={[styles.tabBlockBottom, { backgroundColor: activeBottom }]} />}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: COLORS.woodDark,
        tabBarInactiveTintColor: COLORS.woodMid,
      }}
    >
      <Tab.Screen
        name="RecommendTab"
        component={RecommendStack}
        options={{
          tabBarLabel: '추천',
          tabBarIcon: ({ focused }) => (
            <WoodTabIcon
              Icon={DiceIcon}
              label="추천"
              focused={focused}
              activeColor={COLORS.woodDark}
              activeFill={COLORS.wood}
              activeBottom={COLORS.woodDark}
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
              Icon={BookIcon}
              label="기록"
              focused={focused}
              activeColor="#4E7A3A"
              activeFill="#B5D5A0"
              activeBottom="#4E7A3A"
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
              Icon={MapPinIcon}
              label="카페"
              focused={focused}
              activeColor={COLORS.paintRed}
              activeFill="#F0B0A8"
              activeBottom={COLORS.paintRed}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ToolkitTab"
        component={ToolkitScreen}
        options={{
          tabBarLabel: '도구',
          tabBarIcon: ({ focused }) => (
            <WoodTabIcon
              Icon={WrenchIcon}
              label="도구"
              focused={focused}
              activeColor={COLORS.paintBlue}
              activeFill="#A8C8E8"
              activeBottom={COLORS.paintBlue}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.cardLight,
    borderTopWidth: 3,
    borderTopColor: COLORS.woodLight,
    height: 72,
    paddingBottom: 10,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  tabIconWrapper: {
    alignItems: 'center',
    width: 44,
  },
  tabBlock: {
    width: 40,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.woodLight,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabBlockBottom: {
    width: 40,
    height: 4,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
  },
});
