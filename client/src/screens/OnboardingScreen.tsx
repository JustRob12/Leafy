import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Animated, Image } from 'react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Leaf, ArrowRight, Lock, Fingerprint, Delete, ShieldCheck, Key } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import * as LocalAuthentication from 'expo-local-authentication';
const LogoSource = require('../../assets/leafylogo.png');

export default function OnboardingScreen() {
  const { setUsername, setAppPin, toggleSecurity, toggleBiometrics, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [biometricsSupported, setBiometricsSupported] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Keypad numbers
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

  const triggerTransition = (nextStep: 1 | 2 | 3) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
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
    if (key === 'delete') {
      setPin(prev => prev.slice(0, -1));
    } else if (key !== '') {
      if (pin.length < 4) {
        const newPin = pin + key;
        setPin(newPin);

        if (newPin.length === 4) {
          setTimeout(() => {
            checkBiometricsAndProceed();
          }, 300);
        }
      }
    }
  };

  const finalizeOnboarding = async (useBiometrics: boolean) => {
    try {
      if (pin.length === 4) {
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
              <>
                <View style={styles.topSection}>
                  <View style={styles.iconContainer}>
                    <Image source={LogoSource} style={styles.logoImage} />
                  </View>
                  <Text style={styles.title}>Welcome to Leafy</Text>
                  <Text style={styles.subtitle}>Your Invisible Architect for personal finance.</Text>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>What should we call you?</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Alex Johnson"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
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
              </>
            )}

            {step === 2 && (
              <View style={styles.setupSection}>
                <View style={styles.iconContainerVariant}>
                  <Lock size={32} color={colors.primary} />
                </View>
                <Text style={styles.titleCenter}>Secure your Vault</Text>
                <Text style={styles.subtitleCenter}>Create a 4-digit PIN to protect your local financial data.</Text>

                <View style={styles.pinContainer}>
                  {[1, 2, 3, 4].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.pinDot,
                        pin.length > i && styles.pinDotFilled,
                      ]}
                    />
                  ))}
                </View>

                <View style={styles.keypad}>
                  {keys.map((key, index) => (
                    <TouchableOpacity
                      key={index}
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
                        <Delete size={24} color={colors.text} />
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {step === 3 && (
              <View style={styles.setupSection}>
                <View style={[styles.iconContainerVariant, { backgroundColor: '#10b9811a' }]}>
                  <Fingerprint size={38} color={colors.primary} />
                </View>
                <Text style={styles.titleCenter}>Enable Biometrics</Text>
                <Text style={styles.subtitleCenter}>Unlock Leafy faster with your fingerprint or face ID.</Text>

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
            )}

          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  topSection: {
    marginTop: theme.spacing.xxl,
  },
  setupSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  iconContainerVariant: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 32,
    color: colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
  },
  titleCenter: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleCenter: {
    fontFamily: theme.fonts.medium,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: theme.spacing.xl,
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
    gap: 20,
    marginBottom: 60,
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
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
    paddingHorizontal: 20,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    fontSize: 28,
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
    marginTop: 20,
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.textMuted,
  },
});
