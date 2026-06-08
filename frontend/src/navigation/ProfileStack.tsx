import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types/navigation';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AppInfoScreen from '../screens/profile/AppInfoScreen';
import DeleteAccountScreen from '../screens/profile/DeleteAccountScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="AppInfo" component={AppInfoScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </Stack.Navigator>
  );
}
