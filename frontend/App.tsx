import React from 'react';
import { StatusBar } from 'react-native';
import RecommendationScreen from './src/screens/RecommendationScreen';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F5ECD7" />
      <RecommendationScreen />
    </>
  );
}
