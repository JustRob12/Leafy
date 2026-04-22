import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/navigation/navigationUtils';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as Notifications from 'expo-notifications';
import { View, StyleSheet, Platform } from 'react-native';
import * as QuickActions from 'expo-quick-actions';

import { AppProvider, useAppContext } from './src/context/AppContext';
import LoadingScreen from './src/screens/LoadingScreen';

// Set up foreground notification behavior
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.log('Foreground notifications not supported:', e);
}
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import WalletsScreen from './src/screens/WalletsScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import GoalDetailScreen from './src/screens/GoalDetailScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SecurityScreen from './src/screens/SecurityScreen';
import CalculatorScreen from './src/screens/CalculatorScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DataTransferScreen from './src/screens/DataTransferScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ReceivablesScreen from './src/screens/ReceivablesScreen';
import DebtsScreen from './src/screens/DebtsScreen';
import GroceryScreen from './src/screens/GroceryScreen';
import GroceryDetailScreen from './src/screens/GroceryDetailScreen';
import TravelScreen from './src/screens/TravelScreen';
import StatusCardScreen from './src/screens/StatusCardScreen';
import WithdrawScreen from './src/screens/WithdrawScreen';
import DepositScreen from './src/screens/DepositScreen';
import RecursionScreen from './src/screens/RecursionScreen';
import AddWalletScreen from './src/screens/AddWalletScreen';
import AddGoalScreen from './src/screens/AddGoalScreen';
import AddRecursionScreen from './src/screens/AddRecursionScreen';
import AddReceivableScreen from './src/screens/AddReceivableScreen';
import AddDebtScreen from './src/screens/AddDebtScreen';
import MainHeader from './src/components/MainHeader';
import FeedbackModal from './src/components/FeedbackModal';
import ConfirmModal from './src/components/ConfirmModal';
import LoadingOverlay from './src/components/LoadingOverlay';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';

const Stack = createNativeStackNavigator();

function MainNavigation() {
  const { username, colors, isDarkMode, isSecurityEnabled, isUnlocked } = useAppContext();

  if (username && isSecurityEnabled && !isUnlocked) {
    return <SecurityScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>

        {!username ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Group>
            <Stack.Screen
              name="Main"
              component={BottomTabNavigator}
              options={{ headerShown: true, header: () => <MainHeader /> }}
            />
            <Stack.Screen name="Calculator" component={CalculatorScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="DataTransfer" component={DataTransferScreen} />

            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="Receivables" component={ReceivablesScreen} />
            <Stack.Screen name="Debts" component={DebtsScreen} />
            <Stack.Screen name="Grocery" component={GroceryScreen} />
            <Stack.Screen name="GroceryDetail" component={GroceryDetailScreen} />
            <Stack.Screen name="Travel" component={TravelScreen} />
            <Stack.Screen name="Security" component={SecurityScreen} />
            <Stack.Screen name="StatusCard" component={StatusCardScreen} />
            <Stack.Screen name="Withdraw" component={WithdrawScreen} />
            <Stack.Screen name="Deposit" component={DepositScreen} />
            <Stack.Screen name="Recursion" component={RecursionScreen} />
            <Stack.Screen name="AddWallet" component={AddWalletScreen} />
            <Stack.Screen name="AddGoal" component={AddGoalScreen} />
            <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
            <Stack.Screen name="AddRecursion" component={AddRecursionScreen} />
            <Stack.Screen name="AddReceivable" component={AddReceivableScreen} />
            <Stack.Screen name="AddDebt" component={AddDebtScreen} />
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

const linking = {
  prefixes: ['leafy://'],
  config: {
    screens: {
      Main: {
        screens: {
          HomeTab: 'home',
        },
      },
      Deposit: 'deposit',
      Withdraw: 'withdraw',
      AddSavings: 'deposit', // Alias
    },
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    // 1. Set up the shortcuts
    const setupShortcuts = async () => {
      try {
        await QuickActions.setItems([
          {
            id: 'deposit',
            title: 'Add Savings',
            icon: Platform.OS === 'ios' ? 'add' : 'add', 
            params: { href: 'leafy://deposit' }
          },
          {
            id: 'withdraw',
            title: 'Withdraw',
            icon: Platform.OS === 'ios' ? 'share' : 'share',
            params: { href: 'leafy://withdraw' }
          }
        ]);
      } catch (e) {
        console.warn('QuickActions not supported on this platform/environment');
      }
    };

    setupShortcuts();

    // 2. Listen for shortcut interactions
    const deviceSubscription = QuickActions.addListener((action) => {
      if (action.id === 'deposit') {
        navigationRef.navigate('Deposit' as never);
      } else if (action.id === 'withdraw') {
        navigationRef.navigate('Withdraw' as never);
      }
    });

    // 3. Check for initial launch action
    const action = QuickActions.initial as any;
    if (action) {
      // Short delay to ensure navigation is ready
      setTimeout(() => {
        if (action.id === 'deposit') {
          navigationRef.navigate('Deposit' as never);
        } else if (action.id === 'withdraw') {
          navigationRef.navigate('Withdraw' as never);
        }
      }, 500);
    }

    return () => deviceSubscription.remove();
  }, []);

  return (
    <AppProvider>
      <AppContent fontsLoaded={fontsLoaded} />
    </AppProvider>
  );
}

function AppContent({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoaded } = useAppContext();
  const [showSplash, setShowSplash] = useState(true);

  // If fonts aren't loaded yet OR data isn't loaded OR splash is still showing
  if (!fontsLoaded || !isLoaded || showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: '#10b981' }}>
        <StatusBar style="light" />
        <LoadingScreen onFinish={() => setShowSplash(false)} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <View style={{ flex: 1 }}>
        <MainNavigation />
        <FeedbackModal />
        <ConfirmModal />
        <LoadingOverlay />
      </View>
    </NavigationContainer>
  );
}

