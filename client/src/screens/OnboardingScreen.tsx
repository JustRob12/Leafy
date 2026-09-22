import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Animated, Image, Vibration, ScrollView } from 'react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Leaf, ArrowRight, Lock, Fingerprint, Delete, ShieldCheck, Key } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useResponsive } from '../utils/responsive';
import * as LocalAuthentication from 'expo-local-authentication';
const LogoSource = require('../../assets/icon.png');

export default function OnboardingScreen() {
  const { setUsername, setAppPin, toggleSecurity, toggleBiometrics, colors, isDarkMode } = useAppContext();
  const { isLandscape, isTablet } = useResponsive();
  const styles = getStyles(colors, isDarkMode, isLandscape, isTablet);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [biometricsSupported, setBiometricsSupported] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Keypad numbers
  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete'],
  ];

  const triggerTransition = (nextStep: 1 | 2 | 3) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 80,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNameContinue = () => {
    if (name.trim().length > 0) {
      Keyboard.dismiss();
      triggerTransition(2);
    }
  };

  const [firstPin, setFirstPin] = useState('');
  const [pinStep, setPinStep] = useState<'create' | 'confirm'>('create');
  const [pinError, setPinError] = useState<string | null>(null);

  const checkBiometricsAndProceed = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      setBiometricsSupported(true);
      triggerTransition(3);
    } else {
      await finalizeOnboarding(false);
    }
  };

  const handleKeypadPress = (key: string) => {
    setPinError(null);
    if (key === 'delete') {
      setPin(prev => prev.slice(0, -1));
    } else if (key !== '') {
      if (pin.length < 6) {
        const newPin = pin + key;
        setPin(newPin);

        if (newPin.length === 6) {
          if (pinStep === 'create') {
            setTimeout(() => {
              setFirstPin(newPin);
              setPin('');
              setPinStep('confirm');
            }, 200);
          } else {
            if (newPin === firstPin) {
              setTimeout(() => {
                checkBiometricsAndProceed();
              }, 300);
            } else {
              Vibration.vibrate([0, 50, 50, 50]);
              setPinError("PINs do not match. Please try again.");
              setTimeout(() => {
                setPin('');
                setFirstPin('');
                setPinStep('create');
              }, 600);
            }
          }
        }
      }
    }
  };

  const finalizeOnboarding = async (useBiometrics: boolean) => {
    try {
      if (pin.length === 6) {
        await setAppPin(pin);
        await toggleSecurity(true);
      }
      if (useBiometrics) {
        await toggleBiometrics(true);
      }

      // Setting username triggers the navigation away from Onboarding
      await setUsername(name.trim());
    } catch (error) {
      console.error("Error saving onboarding details:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>

            {step === 1 && (
              <ScrollView
                contentContainerStyle={styles.step1ScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.topSection}>
                  <View style={styles.iconContainer}>
                    <Image source={LogoSource} style={styles.logoImage} />
                  </View>
                  <Text style={styles.title}>Welcome to Leon</Text>
                  <Text style={styles.subtitle}>Your Invisible Architect for personal finance.</Text>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>What should we call you?</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    maxLength={6}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleNameContinue}
                  />

                  <TouchableOpacity
                    style={[
                      styles.button,
                      name.trim().length === 0 && styles.buttonDisabled
                    ]}
                    onPress={handleNameContinue}
                    disabled={name.trim().length === 0}
                  >
                    <Text style={styles.buttonText}>Continue</Text>
                    <ArrowRight size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {step === 2 && (
              <ScrollView
                contentContainerStyle={styles.step2ScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <View style={isLandscape ? styles.landscapeRow : styles.portraitCol}>
                  {/* Left Column in Landscape / Top in Portrait */}
                  <View style={isLandscape ? styles.landscapeLeftCol : styles.portraitTopCol}>
                    <View style={[styles.iconContainerVariant, pinError ? { backgroundColor: '#ef444420' } : null]}>
                      <Lock size={isLandscape ? 26 : 32} color={pinError ? '#ef4444' : colors.primary} />
                    </View>
                    <Text style={styles.titleCenter}>
                      {pinStep === 'create' ? 'Create Security PIN' : 'Confirm Your PIN'}
                    </Text>
                    <Text style={[styles.subtitleCenter, pinError ? { color: '#ef4444', fontFamily: theme.fonts.bold } : null]}>
                      {pinError || (pinStep === 'create' 
                        ? 'Create a 6-digit PIN to protect your financial data.' 
                        : 'Re-enter your 6-digit PIN to verify.')}
                    </Text>

                    <View style={styles.pinContainer}>
                      {[1, 2, 3, 4, 5, 6].map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.pinDot,
                            pin.length > i && styles.pinDotFilled,
                            pinError ? styles.pinDotError : null
                          ]}
                        />
                      ))}
                    </View>
                  </View>

                  {/* Right Column in Landscape / Bottom in Portrait */}
                  <View style={isLandscape ? styles.landscapeRightCol : styles.portraitBottomCol}>
                    <View style={styles.keypad}>
                      {keypadRows.map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.keypadRow}>
                          {row.map((key, colIndex) => (
                            <TouchableOpacity
                              key={colIndex}
                              style={[
                                styles.key,
                                key === '' && styles.keyEmpty,
                              ]}
                              onPress={() => handleKeypadPress(key)}
                              activeOpacity={0.7}
                              disabled={key === ''}
                            >
                              {key === '0' || (key !== '' && key !== 'delete') ? (
                                <Text style={styles.keyText}>{key}</Text>
                              ) : key === 'delete' ? (
                                <Delete size={isLandscape ? 20 : 24} color={colors.text} />
                              ) : null}
                            </TouchableOpacity>
                          ))}
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}

            {step === 3 && (
              <ScrollView
                contentContainerStyle={styles.step3ScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.setupSection}>
                  <View style={[styles.iconContainerVariant, { backgroundColor: '#10b9811a' }]}>
                    <Fingerprint size={isLandscape ? 32 : 38} color={colors.primary} />
                  </View>
                  <Text style={styles.titleCenter}>Enable Biometrics</Text>
                  <Text style={styles.subtitleCenter}>Unlock Leon faster with your fingerprint or face ID.</Text>

                  <View style={styles.step3Actions}>
                    <TouchableOpacity
                      style={[styles.button, { width: '100%', marginBottom: 16 }]}
                      onPress={() => finalizeOnboarding(true)}
                    >
                      <ShieldCheck size={20} color="#ffffff" />
                      <Text style={styles.buttonText}>Enable Biometrics</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.skipButton}
                      onPress={() => finalizeOnboarding(false)}
                    >
                      <Text style={styles.skipButtonText}>I'll just use my PIN</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}

          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDarkMode: boolean, isLandscape: boolean, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    width: '100%',
  },
  step1ScrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: isLandscape ? 20 : theme.spacing.lg,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  step2ScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: isLandscape ? 16 : theme.spacing.lg,
    maxWidth: isLandscape ? 780 : 440,
    width: '100%',
    alignSelf: 'center',
  },
  step3ScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
  },
  landscapeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 24,
  },
  portraitCol: {
    width: '100%',
    alignItems: 'center',
  },
  landscapeLeftCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portraitTopCol: {
    width: '100%',
    alignItems: 'center',
  },
  landscapeRightCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portraitBottomCol: {
    width: '100%',
    alignItems: 'center',
  },
  topSection: {
    marginTop: isLandscape ? 12 : theme.spacing.xxl,
  },
  setupSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: isLandscape ? 64 : 80,
    height: isLandscape ? 64 : 80,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isLandscape ? 12 : theme.spacing.xl,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  iconContainerVariant: {
    width: isLandscape ? 56 : 72,
    height: isLandscape ? 56 : 72,
    borderRadius: isLandscape ? 28 : 36,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isLandscape ? 12 : 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: isLandscape ? 26 : 32,
    color: colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: isLandscape ? 14 : 16,
    color: colors.textMuted,
    lineHeight: isLandscape ? 20 : 24,
  },
  titleCenter: {
    fontFamily: theme.fonts.bold,
    fontSize: isLandscape ? 22 : 26,
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitleCenter: {
    fontFamily: theme.fonts.medium,
    fontSize: isLandscape ? 13 : 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: isLandscape ? 16 : 36,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  inputSection: {
    marginTop: isLandscape ? 16 : 0,
    marginBottom: isLandscape ? 12 : theme.spacing.xl,
  },
  inputLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: colors.text,
    marginBottom: theme.spacing.xl,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: isLandscape ? 8 : 40,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pinDotError: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  keypad: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: isLandscape ? 240 : 280,
    gap: isLandscape ? 8 : 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  key: {
    width: isLandscape ? 52 : 72,
    height: isLandscape ? 52 : 72,
    borderRadius: isLandscape ? 26 : 36,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  keyText: {
    fontFamily: theme.fonts.bold,
    fontSize: isLandscape ? 22 : 28,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  buttonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: '#ffffff',
  },
  step3Actions: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: isLandscape ? 12 : 20,
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.textMuted,
  },
});
