import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme';
import { ChevronUp, ChevronDown } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';

interface WalletDropdownProps {
  selectedWalletId: string | null;
  onSelectWallet: (id: string) => void;
}

export default function WalletDropdown({ selectedWalletId, onSelectWallet }: WalletDropdownProps) {
  const { wallets } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);

  return (
    <View style={styles.container}>
      {isOpen && (
        <View style={styles.dropupList}>
          <ScrollView style={styles.scrollList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {wallets.map(w => (
              <TouchableOpacity
                key={w.id}
                style={[styles.walletItem, selectedWalletId === w.id && styles.walletItemSelected]}
                onPress={() => {
                  onSelectWallet(w.id);
                  setIsOpen(false);
                }}
              >
                <Text style={[styles.walletItemText, selectedWalletId === w.id && styles.walletItemTextSelected]}>
                  {w.name} (₱{w.balance.toFixed(0)})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        style={[styles.dropdownBtn, isOpen && styles.dropdownBtnActive]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <Text style={[styles.dropdownBtnText, !selectedWallet && { color: theme.colors.textMuted }]}>
          {selectedWallet ? `${selectedWallet.name} (₱${selectedWallet.balance.toFixed(0)})` : 'Select Wallet...'}
        </Text>
        {isOpen ? <ChevronDown size={20} color={theme.colors.textMuted} /> : <ChevronUp size={20} color={theme.colors.textMuted} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
    zIndex: 100, // Ensure dropup stays above other inputs visually
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  dropdownBtnActive: {
    borderColor: theme.colors.primary,
  },
  dropdownBtnText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.text,
  },
  dropupList: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    marginBottom: 8,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  scrollList: {
    maxHeight: 180, // Show about 3-4 wallets before scrolling
  },
  walletItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  walletItemSelected: {
    backgroundColor: '#ecfdf5',
  },
  walletItemText: {
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: theme.colors.text,
  },
  walletItemTextSelected: {
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.primary,
  }
});
