import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/navigation/navigationUtils';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { View, StyleSheet } from 'react-native';

import { AppProvider, useAppContext } from './src/context/AppContext';
import LoadingScreen from './src/screens/LoadingScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import WalletsScreen from './src/screens/WalletsScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import CalculatorScreen from './src/screens/CalculatorScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DataTransferScreen from './src/screens/DataTransferScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import MainHeader from './src/components/MainHeader';
import FeedbackModal from './src/components/FeedbackModal';
import ConfirmModal from './src/components/ConfirmModal';
import LoadingOverlay from './src/components/LoadingOverlay';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';

const Stack = createNativeStackNavigator();

function MainNavigation() {
  const { isLoaded, username, colors, isDarkMode } = useAppContext();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash || !isLoaded) {
    return (
      <>
        <StatusBar style="light" />
        <LoadingScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }



  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      {/* Global Header - Only shows when logged in */}
      {username && <MainHeader />}
      
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
        {!username ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Group>
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen name="Calculator" component={CalculatorScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="DataTransfer" component={DataTransferScreen} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </View>
  );
}

// We need to move NavigationContainer outside to manage the ref
function RootNavigator() {
  return (
    <NavigationContainer 
      ref={navigationRef}
      onStateChange={() => {
        // We can't easily trigger re-render of MainNavigation from here without a shared state or event
        // But we can use the ref directly in MainHeader if we want, or use a listener
      }}
    >
      <MainNavigation />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function App() {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#10b981' }} />;
  }

  return (
    <AppProvider>
      <NavigationContainer ref={navigationRef}>
        <MainNavigation />
        <FeedbackModal />
        <ConfirmModal />
        <LoadingOverlay />
      </NavigationContainer>
    </AppProvider>
  );
}
