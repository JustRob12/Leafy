import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Vibration, StatusBar } from 'react-native';
import { theme } from '../theme';
import { Shield, Delete, Fingerprint, Lock, ShieldAlert, CheckCircle2, Leaf } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SecurityScreen() {
  const { appPin, unlockApp, colors, isDarkMode } = useAppContext();
  
  // Custom deep emerald palette for this screen
  const UI_COLORS = {
    deepBackground: '#064E3B', // Deepest Forest Green
    glassBackground: 'rgba(255, 255, 255, 0.08)',
    keyBackground: 'rgba(255, 255, 255, 0.12)',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    primary: '#10B981', // Vibrant Emerald
    error: '#FF4B4B',
  };

  const styles = getStyles(UI_COLORS);
  
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Keypad numbers
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

  const handlePress = (key: string) => {
    if (key === 'delete') {
      setPin(prev => prev.slice(0, -1));
      setError(false);
    } else if (key === '') {
      // Spacer
    } else {
      if (pin.length < 4) {
        setPin(prev => prev + key);
        setError(false);
      }
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === appPin) {
        // Success
        setTimeout(() => {
           unlockApp();
        }, 150);
      } else {
        // Error
        setError(true);
        triggerShake();
        Vibration.vibrate([0, 50, 50, 50]);
        setTimeout(() => setPin(''), 500);
      }
    }
  }, [pin]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.brand}>
               <Leaf size={32} color={UI_COLORS.primary} fill={UI_COLORS.primary} />
               <Text style={styles.brandText}>Leafy</Text>
            </View>
            <View style={[styles.iconWrapper, error && styles.iconWrapperError]}>
              <Lock size={28} color={error ? UI_COLORS.error : UI_COLORS.text} />
            </View>
            <Text style={styles.title}>Protected Vault</Text>
            <Text style={styles.subtitle}>Enter your secure PIN to continue</Text>
          </View>

          <Animated.View style={[styles.pinContainer, { transform: [{ translateX: shakeAnim }] }]}>
            {[1, 2, 3, 4].map((_, i) => (
              <View 
                  key={i} 
                  style={[
                      styles.pinDot, 
                      pin.length > i && styles.pinDotFilled,
                      error && styles.pinDotError
                  ]} 
              />
            ))}
          </Animated.View>

          <View style={styles.keypad}>
            {keys.map((key, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.key, 
                  key === '' && styles.keyEmpty,
                ]}
                onPress={() => handlePress(key)}
                activeOpacity={0.5}
                disabled={key === ''}
              >
                {key === 'delete' ? (
                  <Delete size={28} color={UI_COLORS.text} />
                ) : (
                  <Text style={styles.keyText}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
             <Shield size={14} color={UI_COLORS.textMuted} />
             <Text style={styles.footerText}>Secure Offline Encryption</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepBackground,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    opacity: 0.9,
  },
  brandText: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.glassBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconWrapperError: {
    borderColor: colors.error,
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    // Add subtle shadow/glow to filled dots
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  pinDotError: {
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  key: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.keyBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  keyEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  keyText: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: colors.text,
  },
  footer: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
