import { useRef, useEffect } from 'react';
import { Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Global animated value representing the Y offset of the tab bar
// 0 = fully visible, ~100 = fully hidden below screen
export const globalTabBarTranslateY = new Animated.Value(0);

export function useScrollHideTabBar() {
  const navigation = useNavigation();
  const lastOffsetY = useRef(0);
  const isHidden = useRef(false);

  // Automatically show TabBar when screen is focused/entered
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      showTabBar();
    });
    return unsubscribe;
  }, [navigation]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffsetY = event.nativeEvent.contentOffset.y;
    const diff = currentOffsetY - lastOffsetY.current;

    // Show if bouncing at top
    if (currentOffsetY < 10) {
      if (isHidden.current) showTabBar();
    } 
    // Scroll Down -> Hide
    else if (diff > 5 && currentOffsetY > 50 && !isHidden.current) {
      hideTabBar();
    } 
    // Scroll Up -> Show
    else if (diff < -5 && isHidden.current) {
      showTabBar();
    }
    
    lastOffsetY.current = currentOffsetY;
  };

  const showTabBar = () => {
    isHidden.current = false;
    Animated.timing(globalTabBarTranslateY, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const hideTabBar = () => {
    isHidden.current = true;
    Animated.timing(globalTabBarTranslateY, {
      toValue: 120, // push down enough to clear the 60px height + bottom margin
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  return { handleScroll };
}
