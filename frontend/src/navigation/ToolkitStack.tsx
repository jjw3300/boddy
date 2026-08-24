import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ToolkitStackParamList } from '../types/navigation';
import ToolkitHomeScreen from '../screens/toolkit/ToolkitHomeScreen';
import DiceScreen from '../screens/toolkit/DiceScreen';
import CoinScreen from '../screens/toolkit/CoinScreen';
import FirstPlayerScreen from '../screens/toolkit/FirstPlayerScreen';

const Stack = createNativeStackNavigator<ToolkitStackParamList>();

export default function ToolkitStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ToolkitHome" component={ToolkitHomeScreen} />
      <Stack.Screen name="Dice" component={DiceScreen} />
      <Stack.Screen name="Coin" component={CoinScreen} />
      <Stack.Screen name="FirstPlayer" component={FirstPlayerScreen} />
    </Stack.Navigator>
  );
}
