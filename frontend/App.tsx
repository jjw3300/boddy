import React from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import TabNavigator from './src/navigation/TabNavigator';
import LoginScreen from './src/screens/auth/LoginScreen';
import { COLORS } from './src/design';

function AppInner() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.wood} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
