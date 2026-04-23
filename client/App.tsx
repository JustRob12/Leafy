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
import AddTravelScreen from './src/screens/AddTravelScreen';
import StatusCardScreen from './src/screens/StatusCardScreen';
import WithdrawScreen from './src/screens/WithdrawScreen';
import DepositScreen from './src/screens/DepositScreen';
import RecursionScreen from './src/screens/RecursionScreen';
import AddWalletScreen from './src/screens/AddWalletScreen';
import AddGoalScreen from './src/screens/AddGoalScreen';
import AddRecursionScreen from './src/screens/AddRecursionScreen';
import AddReceivableScreen from './src/screens/AddReceivableScreen';
import AddDebtScreen from './src/screens/AddDebtScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import AddSubscriptionScreen from './src/screens/AddSubscriptionScreen';
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
            <Stack.Screen name="AddTravel" component={AddTravelScreen} />
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
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="AddSubscription" component={AddSubscriptionScreen} />
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
      AddTravel: 'add-travel',
    },
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter_400Regular': Inter_400Regular,
    'Inter_500Medium': Inter_500Medium,
    'Inter_600SemiBold': Inter_600SemiBold,
    'Inter_700Bold': Inter_700Bold,
  });

  return (
    <AppProvider>
      <AppContent fontsLoaded={fontsLoaded} />
    </AppProvider>
  );
}

function AppContent({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoaded, isSecurityEnabled, isUnlocked } = useAppContext();
  const [showSplash, setShowSplash] = useState(true);
  const [didTimeout, setDidTimeout] = useState(false);
  const [pendingWidgetAction, setPendingWidgetAction] = useState<string | null>(null);

  // Quick Action / Widget Handling
  useEffect(() => {
    if (!isLoaded) return;

    // 1. Set up the shortcuts (only needs to be done once)
    const setupShortcuts = async () => {
      try {
        await QuickActions.setItems([
          {
            id: 'deposit',
            title: 'Add Savings',
            icon: Platform.OS === 'ios' ? 'symbol:plus.circle.fill' : 'shortcut_add_savings', 
            params: { href: 'leafy://deposit' }
          },
          {
            id: 'withdraw',
            title: 'Withdraw',
            icon: Platform.OS === 'ios' ? 'symbol:arrow.up.right.circle.fill' : 'shortcut_withdraw',
            params: { href: 'leafy://withdraw' }
          },
          {
            id: 'add_goal',
            title: 'Add Goal',
            icon: Platform.OS === 'ios' ? 'symbol:target' : 'shortcut_add_goal',
            params: { href: 'leafy://add-goal' }
          }
        ]);
      } catch (e) {
        console.warn('QuickActions not supported');
      }
    };
    setupShortcuts();

    const handleAction = (actionId: string) => {
      const routeMap: Record<string, string> = {
        deposit: 'Deposit',
        withdraw: 'Withdraw',
        add_goal: 'AddGoal'
      };
      
      const route = routeMap[actionId];
      if (!route) return;

      if (isSecurityEnabled && !isUnlocked) {
        setPendingWidgetAction(route);
      } else {
        setTimeout(() => {
            if (navigationRef.isReady()) {
                navigationRef.navigate(route as never);
            }
        }, 100);
      }
    };

    // 2. Listen for shortcut interactions
    const deviceSubscription = QuickActions.addListener((action) => {
      handleAction(action.id);
    });

    // 3. Check for initial launch action
    const initialAction = QuickActions.initial as any;
    if (initialAction) {
      handleAction(initialAction.id);
    }

    return () => deviceSubscription.remove();
  }, [isLoaded]); // Re-run when app data is ready

  // Handle pending widget action after unlock
  useEffect(() => {
    if (isUnlocked && pendingWidgetAction) {
      setTimeout(() => {
        if (navigationRef.isReady()) {
          navigationRef.navigate(pendingWidgetAction as never);
          setPendingWidgetAction(null);
        }
      }, 500); // Small delay to allow Security screen transition
    }
  }, [isUnlocked, pendingWidgetAction]);

  // Safety valve: If loading takes more than 15 seconds, force the app to proceed
  useEffect(() => {
    const timer = setTimeout(() => {
      setDidTimeout(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  // Determine if we should stay on the loading screen
  // We are "ready" if (fonts are loaded AND data is loaded) OR we hit the safety timeout
  const isReady = (fontsLoaded && isLoaded) || didTimeout;

  if (showSplash || !isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#10b981' }}>
        <StatusBar style="light" />
        <LoadingScreen onFinish={() => setShowSplash(false)} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer ref={navigationRef} linking={linking}>
         <MainNavigation />
      </NavigationContainer>
      <FeedbackModal />
      <ConfirmModal />
      <LoadingOverlay />
    </View>
  );
}

