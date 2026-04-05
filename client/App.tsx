import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { View } from 'react-native';

import { AppProvider, useAppContext } from './src/context/AppContext';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import LoadingScreen from './src/screens/LoadingScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import FeedbackModal from './src/components/FeedbackModal';
import ConfirmModal from './src/components/ConfirmModal';

const Stack = createNativeStackNavigator();

function MainNavigation() {
  const { isLoaded, username } = useAppContext();
  const [showSplash, setShowSplash] = useState(true);

  // Keep splash running while it animates OR while storage hasn't loaded 
  if (showSplash || !isLoaded) {
    return (
      <>
        <StatusBar style="light" />
        <LoadingScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!username ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Group>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="History" component={HistoryScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </>
  );
}

export default function App() {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    // Render blank background while exact font variants load for the splash
    return <View style={{ flex: 1, backgroundColor: '#10b981' }} />;
  }

  return (
    <AppProvider>
      <NavigationContainer>
        <MainNavigation />
        <FeedbackModal />
        <ConfirmModal />
      </NavigationContainer>
    </AppProvider>
  );
}
