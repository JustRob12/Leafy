import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Leaf, ArrowRight } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const { setUsername, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);

  const handleContinue = async () => {
    if (name.trim().length > 0) {
      await setUsername(name.trim());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.topSection}>
            <View style={styles.iconContainer}>
              <Leaf size={32} color="#ffffff" />
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
              onSubmitEditing={handleContinue}
            />
            
            <TouchableOpacity 
              style={[
                styles.button,
                name.trim().length === 0 && styles.buttonDisabled
              ]} 
              onPress={handleContinue}
              disabled={name.trim().length === 0}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <ArrowRight size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
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
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  topSection: {
    marginTop: theme.spacing.xxl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
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
});
