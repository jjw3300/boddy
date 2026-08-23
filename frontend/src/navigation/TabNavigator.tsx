import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { TabParamList } from '../types/navigation';
import RecommendStack from './RecommendStack';
import LogStack from './LogStack';
import CafeScreen from '../screens/CafeScreen';
import ToolkitStack from './ToolkitStack';
import ProfileStack from './ProfileStack';
import { DiceIcon, BookIcon, MapPinIcon, WrenchIcon, UserIcon } from '../components/Icon';
import { COLORS } from '../design';

const Tab = createBottomTabNavigator<TabParamList>();

// ─── 탭 아이콘 컴포넌트 ─────────────────────────────────────────────────────

interface TabIconProps {
  Icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
  focused: boolean;
}

function TabIcon({ Icon, focused }: TabIconProps) {
  return (
    <View className="items-center gap-1">
      <Icon
        size={22}
        color={focused ? COLORS.primaryForeground : COLORS.mutedForeground}
        fill={focused ? COLORS.primary : 'transparent'}
      />
    </View>
  );
}

// ─── TabNavigator ────────────────────────────────────────────────────────────

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarActiveTintColor: COLORS.foreground,
        tabBarInactiveTintColor: COLORS.mutedForeground,
      }}
    >
      <Tab.Screen
        name="RecommendTab"
        component={RecommendStack}
        options={{
          tabBarLabel: '추천',
          tabBarIcon: ({ focused }) => <TabIcon Icon={DiceIcon} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="LogTab"
        component={LogStack}
        options={{
          tabBarLabel: '기록',
          tabBarIcon: ({ focused }) => <TabIcon Icon={BookIcon} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CafeTab"
        component={CafeScreen}
        options={{
          tabBarLabel: '카페',
          tabBarIcon: ({ focused }) => <TabIcon Icon={MapPinIcon} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ToolkitTab"
        component={ToolkitStack}
        options={{
          tabBarLabel: '도구',
          tabBarIcon: ({ focused }) => <TabIcon Icon={WrenchIcon} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: '내 정보',
          tabBarIcon: ({ focused }) => <TabIcon Icon={UserIcon} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
