import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';

export default function ConfirmModal() {
  const { confirmState, closeConfirm, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);

  if (!confirmState.visible) return null;

  return (
    <Modal transparent animationType="fade" visible={confirmState.visible}>
      <TouchableWithoutFeedback onPress={closeConfirm}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={[styles.iconWrapper, confirmState.isDestructive ? { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' } : { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5' }]}>
                  <AlertTriangle size={24} color={confirmState.isDestructive ? colors.danger : colors.primary} />
                </View>
                <TouchableOpacity onPress={closeConfirm} style={styles.closeBtn}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.title}>{confirmState.title}</Text>
              <Text style={styles.message}>{confirmState.message}</Text>
              
              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeConfirm}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.confirmBtn, confirmState.isDestructive ? { backgroundColor: colors.danger } : { backgroundColor: colors.primary }]} 
                  onPress={() => {
                    if (confirmState.onConfirm) confirmState.onConfirm();
                    closeConfirm();
                  }}
                >
                  <Text style={styles.confirmText}>{confirmState.isDestructive ? 'Delete' : 'Confirm'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}


const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: isDarkMode ? 0.3 : 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.text,
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: '#ffffff',
  },
});
