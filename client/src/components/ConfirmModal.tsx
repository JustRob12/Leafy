import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';

export default function ConfirmModal() {
  const { confirmState, closeConfirm } = useAppContext();

  if (!confirmState.visible) return null;

  return (
    <Modal transparent animationType="fade" visible={confirmState.visible}>
      <TouchableWithoutFeedback onPress={closeConfirm}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.iconWrapper}>
                  <AlertTriangle size={24} color="#ef4444" />
                </View>
                <TouchableOpacity onPress={closeConfirm} style={styles.closeBtn}>
                  <X size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.title}>{confirmState.title}</Text>
              <Text style={styles.message}>{confirmState.message}</Text>
              
              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeConfirm}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={() => {
                  if (confirmState.onConfirm) confirmState.onConfirm();
                  closeConfirm();
                }}>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
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
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: theme.colors.textMuted,
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
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.text,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.card,
  }
});
