import React from 'react';
import { View, Animated, TouchableOpacity, Text } from 'react-native';
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
  const insets = useSafeAreaInsets();
  const tabWidth = containerWidth / state.routes.length;

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
        height: 70 + (insets.bottom > 0 ? insets.bottom - 10 : 0), 
        alignItems: 'center',
        paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
      }}
    >
      {/* Solid green bar across the entire top */}
      <View style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: 4, 
        backgroundColor: colors.primary,
        zIndex: 1
      }} />

      {/* Indicator Layer (Animated Dip) */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: tabWidth,
          height: '100%',
          alignItems: 'center',
          transform: [{ translateX }],
          zIndex: 2,
        }}
      >
        {/* The "Dip" background blob */}
        <View style={{ 
          width: 65, 
          height: 56, 
          backgroundColor: colors.primary, 
          borderBottomLeftRadius: 16, 
          borderBottomRightRadius: 16,
        }} />
      </Animated.View>

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
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          >
            <View style={{ height: 30, justifyContent: 'center' }}>
              {Icon && Icon({ color: isFocused ? '#FFF' : colors.textMuted, size: 20, focused: isFocused })}
            </View>
            <Text style={{ 
              color: isFocused ? '#FFF' : colors.textMuted, 
              fontSize: 9,
              fontFamily: theme.fonts.medium,
              marginTop: 1,
            }}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

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
            backgroundColor: colors.card,
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            overflow: 'hidden',
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
