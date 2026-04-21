import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Platform, TouchableWithoutFeedback, Keyboard, Dimensions, ScrollView, KeyboardAvoidingView } from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const { height } = Dimensions.get('window');

export default function ActionSheet({ visible, onClose, title, children }: ActionSheetProps) {
  const { colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(height);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11
      }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
            keyboardVerticalOffset={0}
          >
            <Animated.View 
              style={[
                styles.content, 
                { 
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
                {children}
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}


const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  scrollArea: {
    width: '100%',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: 4,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  cancelBtn: {
    padding: 8,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
  },
  cancelBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.textMuted,
  }
});




