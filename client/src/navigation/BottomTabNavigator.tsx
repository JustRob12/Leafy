import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Wallet, Target, Settings } from 'lucide-react-native';
import { theme } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import WalletsScreen from '../screens/WalletsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          /* 
            To shrink the width, increase the marginHorizontal value!
            E.g., marginHorizontal: 30 will shrink the bar more.
          */
          marginHorizontal: 24,
          backgroundColor: theme.colors.card,
          borderRadius: 24,
          height: 64,
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: '#9c9c9cff',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.001,
          shadowRadius: 5,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.medium,
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Home size={24} color={color} />
        }}
      />
      <Tab.Screen
        name="Wallets"
        component={WalletsScreen}
        options={{
          tabBarIcon: ({ color }) => <Wallet size={24} color={color} />
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          tabBarIcon: ({ color }) => <Target size={24} color={color} />
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}
