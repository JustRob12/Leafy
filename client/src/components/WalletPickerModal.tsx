import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TouchableWithoutFeedback, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../theme';
import { X, Wallet as WalletIcon } from 'lucide-react-native';

import { useAppContext } from '../context/AppContext';

const { height } = Dimensions.get('window');

interface WalletPickerModalProps {
  visible: boolean;
  onClose: () => void;
  wallets: any[];
  selectedWalletId: string | null;
  onSelectWallet: (id: string) => void;
}

export default function WalletPickerModal({ visible, onClose, wallets, selectedWalletId, onSelectWallet }: WalletPickerModalProps) {
  const { colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.dismissArea} />
        </TouchableWithoutFeedback>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          style={{ width: '100%' }}
        >
          <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Wallet</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={{ flexShrink: 1 }}>
            <FlatList
              data={wallets}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedWalletId;
                return (
                  <TouchableOpacity
                    style={[styles.walletItem, isSelected && styles.walletItemSelected]}
                    activeOpacity={1}
                    onPress={() => {
                      onSelectWallet(item.id);
                      onClose();
                    }}
                  >
                    <View style={styles.walletIconWrapper}>
                      <WalletIcon size={20} color={isSelected ? colors.primary : colors.textMuted} />
                    </View>
                    <View style={styles.walletDetails}>
                      <Text style={[styles.walletName, isSelected && styles.walletNameSelected]}>{item.name}</Text>
                      <Text style={styles.walletBalanceText}>Balance: ₱{item.balance.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</Text>
                    </View>
                    {isSelected && <View style={styles.checkIndicator} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}


const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  content: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: height * 0.7,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 20,
    elevation: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  walletItemSelected: {
    borderColor: colors.primary,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
  },
  walletIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  walletDetails: {
    flex: 1,
  },
  walletName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  walletNameSelected: {
    color: colors.primary,
  },
  walletBalanceText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
