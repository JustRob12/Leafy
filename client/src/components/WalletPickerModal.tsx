import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { theme } from '../theme';
import { X, CreditCard, Check, WalletCards } from 'lucide-react-native';
import WalletBrandLogo from './WalletBrandLogo';
import { useAppContext, getWalletTotalBalanceInPhp } from '../context/AppContext';

import { rf } from '../utils/responsive';

interface WalletPickerModalProps {
  visible: boolean;
  onClose: () => void;
  wallets: any[];
  selectedWalletId: string | null;
  onSelectWallet: (id: string) => void;
  allowAll?: boolean;
  allLabel?: string;
  showBalance?: boolean;
}

export default function WalletPickerModal({
  visible,
  onClose,
  wallets,
  selectedWalletId,
  onSelectWallet,
  allowAll = false,
  allLabel = 'All Wallets',
  showBalance = true,
}: WalletPickerModalProps) {
  const { colors, isDarkMode, usdToPhpRate } = useAppContext();
  const styles = getStyles(colors, isDarkMode);

  const displayWallets = useMemo(() => {
    if (!allowAll) return wallets;
    return [
      {
        id: 'ALL',
        name: allLabel,
        isAll: true,
      },
      ...wallets,
    ];
  }, [wallets, allowAll, allLabel]);

  const totalAllBalance = useMemo(() => {
    return (wallets || []).reduce((sum, w) => sum + getWalletTotalBalanceInPhp(w, usdToPhpRate), 0);
  }, [wallets, usdToPhpRate]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.dismissArea} />
        </TouchableWithoutFeedback>

        {/* Minimal Compact Floating Modal */}
        <View style={styles.floatingCard}>
          {/* Minimal Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>SELECT ACCOUNT</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Compact Scrollable List */}
          <View style={styles.listWrapper}>
            <FlatList
              data={displayWallets}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = item.isAll
                  ? selectedWalletId === 'ALL' || selectedWalletId === 'all'
                  : item.id === selectedWalletId;
                const totalBalance = item.isAll
                  ? totalAllBalance
                  : getWalletTotalBalanceInPhp(item, usdToPhpRate);
                const accentColor = item.color || colors.primary;

                return (
                  <TouchableOpacity
                    style={[
                      styles.walletItem,
                      isSelected && styles.walletItemSelected,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelectWallet(item.id);
                      onClose();
                    }}
                  >
                    {/* Left Accent Pill / Logo Box */}
                    <View
                      style={[
                        styles.walletIconBox,
                        { backgroundColor: accentColor + '16' },
                      ]}
                    >
                      {item.isAll ? (
                        <WalletCards size={17} color={accentColor} />
                      ) : item.presetLogo ? (
                        <WalletBrandLogo logoKey={item.presetLogo} size={22} />
                      ) : (
                        <CreditCard size={15} color={accentColor} />
                      )}
                    </View>

                    {/* Middle: Name & Balance */}
                    <View style={styles.walletDetails}>
                      <Text
                        style={[
                          styles.walletName,
                          isSelected && { color: colors.primary },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      {showBalance && (
                        <Text style={styles.walletBalanceText} numberOfLines={1}>
                          ₱{Math.floor(totalBalance).toLocaleString('en-PH')}
                        </Text>
                      )}
                    </View>

                    {/* Right: Minimalist Indicator */}
                    {isSelected ? (
                      <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                        <Check size={11} color="#ffffff" strokeWidth={3} />
                      </View>
                    ) : (
                      <View style={styles.unselectedRadio} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingBottom: Platform.OS === 'ios' ? 76 : 66,
    },
    dismissArea: {
      flex: 1,
    },
    floatingCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingTop: 12,
      paddingBottom: 8,
      paddingHorizontal: 12,
      maxWidth: 480,
      width: '100%',
      alignSelf: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDarkMode ? 0.3 : 0.12,
      shadowRadius: 14,
      elevation: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 4,
      marginBottom: 8,
    },
    headerTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(10.5),
      color: colors.textMuted,
      letterSpacing: 0.8,
    },
    closeBtn: {
      padding: 3,
      borderRadius: 10,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    },
    listWrapper: {
      maxHeight: 205,
    },
    listContent: {
      paddingBottom: 2,
      gap: 6,
    },
    walletItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 9,
      paddingHorizontal: 10,
      borderRadius: 13,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    walletItemSelected: {
      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
      borderColor: colors.primary,
    },
    walletIconBox: {
      width: 32,
      height: 32,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },
    walletDetails: {
      flex: 1,
      justifyContent: 'center',
    },
    walletName: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(13),
      color: colors.text,
    },
    walletBalanceText: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(11),
      color: colors.textMuted,
      marginTop: 1,
    },
    checkCircle: {
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unselectedRadio: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
  });
