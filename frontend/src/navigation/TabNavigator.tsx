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
import { GradientView } from '../components/GradientView';
import { COLORS } from '../design';

const Tab = createBottomTabNavigator<TabParamList>();

// ─── 탭 아이콘 컴포넌트 ─────────────────────────────────────────────────────

interface TabIconProps {
  Icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
  focused: boolean;
}

function TabIcon({ Icon, focused }: TabIconProps) {
  if (!focused) {
    return (
      <View className="h-9 w-9 items-center justify-center">
        <Icon size={22} color={COLORS.mutedForeground} fill="transparent" />
      </View>
    );
  }
  return (
    <GradientView gradient="primary" direction="diagonal" className="h-9 w-9 items-center justify-center rounded-xl">
      <Icon size={20} color="#FFFFFF" fill="transparent" />
    </GradientView>
  );
}

// 탭 바 정중앙 — 추천 탭을 큼직한 원형 그라데이션 아이콘으로 강조한다. 이 앱의
// 핵심 기능이라 다른 탭과 같은 취급을 받지 않도록 크기/색/그림자로 차별화한다.
//
// 주의: tabBarButton을 직접 커스텀(Pressable 등으로 교체)하면 리액트 내비게이션
// 내부의 탭 아이템 레이아웃과 어긋나 정중앙 정렬이 깨지고 터치 영역도 어긋나는
// 문제가 있었다. tabBarIcon만 바꾸고 버튼 자체는 다른 탭과 동일한 기본
// PlatformPressable을 그대로 쓰는 편이 정렬·터치 모두 안전하다.
function CenterTabIcon({ focused }: { focused: boolean }) {
  return (
    <View className="h-9 w-9 items-center justify-center">
      <GradientView
        gradient="primary"
        direction="diagonal"
        className="items-center justify-center rounded-full"
        style={{
          width: 52,
          height: 52,
          opacity: focused ? 1 : 0.9,
          shadowColor: '#FF9F1C',
          shadowOpacity: 0.4,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <DiceIcon size={24} color="#FFFFFF" fill="transparent" />
      </GradientView>
    </View>
  );
}

// ─── TabNavigator ────────────────────────────────────────────────────────────

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="RecommendTab"
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
        name="RecommendTab"
        component={RecommendStack}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => <CenterTabIcon focused={focused} />,
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
