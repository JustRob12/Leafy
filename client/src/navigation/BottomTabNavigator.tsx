import React from 'react';
import { View, Animated, TouchableOpacity, Text, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Wallet, Target, Clock } from 'lucide-react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { globalTabBarTranslateY } from '../hooks/useScrollHideTabBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import HomeScreen from '../screens/HomeScreen';
import WalletsScreen from '../screens/WalletsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

interface CustomTabBarProps extends BottomTabBarProps {
  colors: any;
  isDarkMode: boolean;
}

const CustomTabBar = ({ state, descriptors, navigation, colors, isDarkMode }: CustomTabBarProps) => {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const translateX = React.useRef(new Animated.Value(0)).current;
  const tabWidth = containerWidth > 0 ? containerWidth / state.routes.length : 0;

  React.useEffect(() => {
    if (tabWidth > 0) {
      Animated.spring(translateX, {
        toValue: state.index * tabWidth,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [state.index, tabWidth]);

  return (
    <View 
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={{ 
        flexDirection: 'row', 
        height: 64, 
        alignItems: 'center',
        borderRadius: 32,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Animated Floating Active Pill Indicator */}
      {tabWidth > 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 7,
            left: 0,
            width: tabWidth,
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ translateX }],
            zIndex: 1,
          }}
        >
          <View style={{ 
            width: Math.min(72, tabWidth - 8), 
            height: 48, 
            backgroundColor: colors.primary, 
            borderRadius: 24,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 6,
          }} />
        </Animated.View>
      )}

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const Icon = options.tabBarIcon;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.8}
            style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          >
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ height: 22, justifyContent: 'center' }}>
                {Icon && Icon({ color: isFocused ? '#FFFFFF' : colors.textMuted, size: 20, focused: isFocused })}
              </View>
              <Text style={{ 
                color: isFocused ? '#FFFFFF' : colors.textMuted, 
                fontSize: 10,
                fontFamily: isFocused ? theme.fonts.bold : theme.fonts.medium,
                marginTop: 2,
              }}>
                {route.name}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function BottomTabNavigator() {
  const { colors, isDarkMode } = useAppContext();
  const insets = useSafeAreaInsets();

  const bottomMargin = insets.bottom > 0 
    ? insets.bottom + 12 
    : Platform.OS === 'android' ? 28 : 16;

  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      tabBar={(props) => (
        <Animated.View 
          style={{ 
            position: 'absolute', 
            bottom: bottomMargin, 
            left: 20, 
            right: 20, 
            transform: [{ translateY: globalTabBarTranslateY }],
            zIndex: 100,
            backgroundColor: colors.card,
            borderRadius: 32,
            elevation: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDarkMode ? 0.4 : 0.15,
            shadowRadius: 16,
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
          }}
        >
          <CustomTabBar {...props} colors={colors} isDarkMode={isDarkMode} />
        </Animated.View>
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Home size={20} color={color} />
        }}
      />
      <Tab.Screen
        name="Wallets"
        component={WalletsScreen}
        options={{
          tabBarIcon: ({ color }) => <Wallet size={20} color={color} />
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          tabBarIcon: ({ color }) => <Target size={20} color={color} />
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color }) => <Clock size={20} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}
