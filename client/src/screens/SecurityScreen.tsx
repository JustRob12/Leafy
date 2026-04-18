import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration, StatusBar, Image } from 'react-native';
import { theme } from '../theme';
import { Shield, Fingerprint, Lock, ShieldAlert, CheckCircle2, Leaf, Key } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
const LogoSource = require('../../assets/leafylogo.png');

export default function SecurityScreen() {
  const { appPin, unlockApp, colors, isBiometricsEnabled } = useAppContext();

  const UI_COLORS = {
    deepBackground: '#064E3B',
    glassBackground: 'rgba(255, 255, 255, 0.08)',
    keyBackground: 'rgba(255, 255, 255, 0.12)',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    primary: '#10B981',
    error: '#FF4B4B',
  };

  const styles = getStyles(UI_COLORS);

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [screen, setScreen] = useState<'choice' | 'pin'>('choice');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

  const handleBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Leafy',
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        unlockApp();
      }
    } else {
      Vibration.vibrate(100);
      switchToPin();
    }
  };

  const handlePress = (key: string) => {
    if (key === 'delete') {
      setPin(prev => prev.slice(0, -1));
      setError(false);
    } else if (key === '') {
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
        setTimeout(() => unlockApp(), 150);
      } else {
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

  const switchToPin = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setScreen('pin');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

          <View style={styles.header}>
            <View style={styles.brand}>
              <Image source={LogoSource} style={styles.brandLogo} />
              <Text style={styles.brandText}>Leafy</Text>
            </View>
            <View style={[styles.iconWrapper, error && styles.iconWrapperError]}>
              <Lock size={28} color={error ? UI_COLORS.error : UI_COLORS.text} />
            </View>
            <Text style={styles.title}>Vault Access</Text>
            <Text style={styles.subtitle}>Choose your preferred way to unlock</Text>
          </View>

          {screen === 'choice' ? (
            <View style={styles.choiceContainer}>
              {isBiometricsEnabled && (
                <TouchableOpacity
                  style={styles.choiceBtn}
                  onPress={handleBiometrics}
                  activeOpacity={0.7}
                >
                  <View style={styles.choiceIconBox}>
                    <Fingerprint size={32} color={UI_COLORS.primary} />
                  </View>
                  <View style={styles.choiceTextBox}>
                    <Text style={styles.choiceTitle}>Unlock with Fingerprint</Text>
                    <Text style={styles.choiceSub}>Quick biometric access</Text>
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.choiceBtn, { marginTop: 12 }]}
                onPress={switchToPin}
                activeOpacity={0.7}
              >
                <View style={[styles.choiceIconBox, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                  <Key size={28} color="#FFFFFF" />
                </View>
                <View style={styles.choiceTextBox}>
                  <Text style={styles.choiceTitle}>Unlock with PIN</Text>
                  <Text style={styles.choiceSub}>Enter your 4-digit code</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <>
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
                    {key === '0' || (key !== '' && key !== 'delete') ? (
                      <Text style={styles.keyText}>{key}</Text>
                    ) : key === 'delete' ? (
                      <Key size={24} color="#FFFFFF" />
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('choice')}>
                <Text style={styles.backBtnText}>BACK TO METHODS</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.footer}>
            <Shield size={14} color={UI_COLORS.textMuted} />
            <Text style={styles.footerText}>Secure local encryption</Text>
          </View>
        </Animated.View>
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
    marginBottom: 32,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    opacity: 0.9,
  },
  brandText: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  brandLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
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
    fontSize: 24,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  choiceContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  choiceIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceTextBox: {
    marginLeft: 20,
    flex: 1,
  },
  choiceTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  choiceSub: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  backBtn: {
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
    width: 64,
    height: 64,
    borderRadius: 32,
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
    fontSize: 22,
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
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
