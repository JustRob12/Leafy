import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { CheckCircle, Trash2, AlertCircle } from 'lucide-react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';

export default function FeedbackModal() {
  const { feedback } = useAppContext();
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
          tension: 50,
          friction: 6,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [feedback.visible]);

  return (
    <Modal transparent animationType="fade" visible={feedback.visible}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.content, { transform: [{ scale: scaleValue }], opacity: opacityValue }]}>
          <View style={[
            styles.iconWrapper, 
            feedback.type === 'success' ? styles.successBg : (feedback.type === 'error' ? styles.errorBg : styles.deleteBg)
          ]}>
            {feedback.type === 'success' && <CheckCircle size={48} color={theme.colors.primary} />}
            {feedback.type === 'error' && <AlertCircle size={48} color="#ef4444" />}
            {feedback.type === 'delete' && <Trash2 size={48} color="#ef4444" />}
          </View>
          <Text style={styles.message}>{feedback.message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    width: '65%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  successBg: {
    backgroundColor: '#ecfdf5',
  },
  deleteBg: {
    backgroundColor: '#fef2f2',
  },
  errorBg: {
    backgroundColor: '#fef2f2',
  },
  message: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
  }
});
