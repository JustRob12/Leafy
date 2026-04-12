import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { theme } from '../theme';
import { X, Wallet as WalletIcon } from 'lucide-react-native';

const { height } = Dimensions.get('window');

interface WalletPickerModalProps {
  visible: boolean;
  onClose: () => void;
  wallets: any[];
  selectedWalletId: string | null;
  onSelectWallet: (id: string) => void;
}

export default function WalletPickerModal({ visible, onClose, wallets, selectedWalletId, onSelectWallet }: WalletPickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.dismissArea} />
        </TouchableWithoutFeedback>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Wallet</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={wallets}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedWalletId;
              return (
                <TouchableOpacity
                  style={[styles.walletItem, isSelected && styles.walletItemSelected]}
                  onPress={() => {
                    onSelectWallet(item.id);
                    onClose();
                  }}
                >
                  <View style={styles.walletIconWrapper}>
                    <WalletIcon size={20} color={isSelected ? theme.colors.primary : theme.colors.textMuted} />
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  content: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: height * 0.7,
    paddingTop: 24,
    // Add shadow since we no longer have a dark overlay
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
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
    color: theme.colors.text,
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
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  walletItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#ecfdf5',
  },
  walletIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
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
    color: theme.colors.text,
  },
  walletNameSelected: {
    color: theme.colors.primary,
  },
  walletBalanceText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  checkIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
});
