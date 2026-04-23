import React from 'react';
import { View, Animated } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { Home, Wallet, Target, Clock } from 'lucide-react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { globalTabBarTranslateY } from '../hooks/useScrollHideTabBar';


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
      tabBar={(props) => (
        <Animated.View 
          style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            transform: [{ translateY: globalTabBarTranslateY }],
            zIndex: 100,
            elevation: 100,
          }}
        >
          <BottomTabBar {...props} />
        </Animated.View>
      )}
      screenOptions={{

        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: colors.card }} />
        ),
        tabBarStyle: {
          backgroundColor: colors.card,
          height: 70,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 20,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
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
