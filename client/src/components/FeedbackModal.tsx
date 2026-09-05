import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, TouchableWithoutFeedback } from 'react-native';
import { Check, Trash2, AlertCircle } from 'lucide-react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';

export default function FeedbackModal() {
  const { feedback, closeFeedback, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (feedback.visible) {
      scaleValue.setValue(0);
      opacityValue.setValue(0);
      
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 140,
          friction: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [feedback.visible]);

  return (
    <Modal transparent animationType="fade" visible={feedback.visible}>
      <TouchableWithoutFeedback onPress={closeFeedback}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[{ transform: [{ scale: scaleValue }], opacity: opacityValue }]}>
              {feedback.type === 'success' ? (
                <View style={styles.checkCard}>
                  <View style={styles.checkCircle}>
                    <Check size={38} color="#ffffff" strokeWidth={3.5} />
                  </View>
                </View>
              ) : feedback.type === 'delete' ? (
                <View style={styles.checkCard}>
                  <View style={[styles.checkCircle, { backgroundColor: colors.danger, shadowColor: colors.danger }]}>
                    <Trash2 size={34} color="#ffffff" />
                  </View>
                </View>
              ) : (
                <View style={styles.content}>
                  <View style={[styles.iconWrapper, styles.errorBg]}>
                    <AlertCircle size={44} color={colors.danger} />
                  </View>
                  {feedback.message ? <Text style={styles.message}>{feedback.message}</Text> : null}
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCard: {
    width: 100,
    height: 100,
    backgroundColor: colors.card,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDarkMode ? 0.4 : 0.15,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  checkCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: isDarkMode ? 0.3 : 0.2,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: colors.border,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  errorBg: {
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
  },
  message: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  }
});
