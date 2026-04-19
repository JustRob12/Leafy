import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Modal } from 'react-native';
import { theme } from '../theme';
import { Leaf } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';

export default function LoadingOverlay() {
  const { loading, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Start spinning
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  if (!loading) return null;

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      transparent
      visible={loading}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <View style={styles.loaderBox}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Leaf size={40} color={colors.primary} />
            </Animated.View>
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}


const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderBox: {
    backgroundColor: colors.card,
    padding: theme.spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: isDarkMode ? 0.3 : 0.2,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 160,
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: colors.border,
  },
  loadingText: {
    marginTop: 16,
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
});
