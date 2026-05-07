import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RecommendStackParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import RecommendationScreen from '../screens/RecommendationScreen';
import ResultScreen from '../screens/ResultScreen';
import GameDetailScreen from '../screens/GameDetailScreen';

const Stack = createNativeStackNavigator<RecommendStackParamList>();

export default function RecommendStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Recommendation" component={RecommendationScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="GameDetail" component={GameDetailScreen} />
    </Stack.Navigator>
  );
}
