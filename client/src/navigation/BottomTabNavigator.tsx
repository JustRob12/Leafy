import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Wallet, Target, Clock } from 'lucide-react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';

import HomeScreen from '../screens/HomeScreen';
import WalletsScreen from '../screens/WalletsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { colors, isDarkMode } = useAppContext();
  
  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 24 }} />
        ),
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          marginHorizontal: 24,
          backgroundColor: colors.card,
          borderRadius: 24,
          height: 64,
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 10,
          elevation: 12,
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
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color }) => <Clock size={24} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}
