import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { ChevronDown } from 'lucide-react-native';
import { useAppContext, getWalletTotalBalanceInPhp } from '../context/AppContext';
import WalletPickerModal from './WalletPickerModal';

interface WalletDropdownProps {
  selectedWalletId: string | null;
  onSelectWallet: (id: string) => void;
  allowAll?: boolean;
  allLabel?: string;
}

export default function WalletDropdown({
  selectedWalletId,
  onSelectWallet,
  allowAll = false,
  allLabel = 'All Wallets',
}: WalletDropdownProps) {
  const { wallets, colors, isDarkMode, usdToPhpRate } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const [modalVisible, setModalVisible] = useState(false);

  const isAllSelected = selectedWalletId === 'ALL' || selectedWalletId === 'all';
  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  const totalAllBalance = (wallets || []).reduce(
    (sum, w) => sum + getWalletTotalBalanceInPhp(w, usdToPhpRate),
    0
  );

  const displayText = isAllSelected
    ? `${allLabel} (₱${Math.floor(totalAllBalance).toLocaleString('en-PH')})`
    : selectedWallet
    ? `${selectedWallet.name} (₱${Math.floor(getWalletTotalBalanceInPhp(selectedWallet, usdToPhpRate)).toLocaleString('en-PH')})`
    : 'Select Wallet...';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownBtn}
        onPress={() => setModalVisible(true)}
        activeOpacity={1}
      >
        <Text style={[styles.dropdownBtnText, !isAllSelected && !selectedWallet && { color: colors.textMuted }]}>
          {displayText}
        </Text>
        <ChevronDown size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <WalletPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onSelectWallet={onSelectWallet}
        allowAll={allowAll}
        allLabel={allLabel}
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
