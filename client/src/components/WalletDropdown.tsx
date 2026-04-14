import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { ChevronDown } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import WalletPickerModal from './WalletPickerModal';

interface WalletDropdownProps {
  selectedWalletId: string | null;
  onSelectWallet: (id: string) => void;
}

export default function WalletDropdown({ selectedWalletId, onSelectWallet }: WalletDropdownProps) {
  const { wallets, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const [modalVisible, setModalVisible] = useState(false);

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownBtn}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.dropdownBtnText, !selectedWallet && { color: colors.textMuted }]}>
          {selectedWallet ? `${selectedWallet.name} (₱${selectedWallet.balance.toFixed(0)})` : 'Select Wallet...'}
        </Text>
        <ChevronDown size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <WalletPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onSelectWallet={onSelectWallet}
      />
    </View>
  );
}


const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    zIndex: 1, 
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownBtnText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: colors.text,
  },
});
