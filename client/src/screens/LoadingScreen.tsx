import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { theme } from '../theme';
import { Leaf } from 'lucide-react-native';
const LogoSource = require('../../assets/splash-icon.png');

import { useAppContext } from '../context/AppContext';

interface LoadingScreenProps {
  onFinish: () => void;
}

export default function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const { colors, isDarkMode } = useAppContext();
  const styles = getStyles();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Fast loading display
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconContainer}>
          <Image source={LogoSource} style={styles.logoImage} />
        </View>
        <Text style={styles.title}>Leon</Text>
        <Text style={styles.subtitle}>Your Invisible Architect</Text>
      </Animated.View>
    </View>
  );
}


const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 40,
    color: '#ffffff',
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 8,
  },
});
