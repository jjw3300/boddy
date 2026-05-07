import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LogStackParamList } from '../types/navigation';
import LogListScreen from '../screens/LogListScreen';
import NewLogScreen from '../screens/NewLogScreen';
import LogDetailScreen from '../screens/LogDetailScreen';

const Stack = createNativeStackNavigator<LogStackParamList>();

export default function LogStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LogList" component={LogListScreen} />
      <Stack.Screen name="NewLog" component={NewLogScreen} />
      <Stack.Screen name="LogDetail" component={LogDetailScreen} />
    </Stack.Navigator>
  );
}
