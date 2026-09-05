import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { ChevronsUpDown, CreditCard, Check } from 'lucide-react-native';
import WalletBrandLogo from './WalletBrandLogo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const rf = (size: number) => Math.round(size * scale);

interface BottomWalletBarProps {
  selectedWallet: any;
  onOpenWalletPicker: () => void;
  onSave: () => void;
  saveLabel: string;
  disabled?: boolean;
}

export default function BottomWalletBar({
  selectedWallet,
  onOpenWalletPicker,
  onSave,
  saveLabel,
  disabled = false,
}: BottomWalletBarProps) {
  const { colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);

  return (
    <View style={styles.container}>
      {/* Wallet Selector Pill (Left) */}
      <TouchableOpacity
        style={styles.walletButton}
        onPress={onOpenWalletPicker}
        activeOpacity={0.75}
      >
        <View style={styles.walletIconContainer}>
          {selectedWallet?.presetLogo ? (
            <WalletBrandLogo logoKey={selectedWallet.presetLogo} size={28} />
          ) : (
            <View style={[styles.fallbackIcon, { backgroundColor: selectedWallet?.color || colors.primary }]}>
              <CreditCard size={16} color="#ffffff" />
            </View>
          )}
        </View>

        <View style={styles.walletTextContainer}>
          <Text style={styles.accountLabel}>ACCOUNT</Text>
          <Text style={styles.walletName} numberOfLines={1}>
            {selectedWallet ? selectedWallet.name : 'Select Wallet'}
          </Text>
        </View>

        <View style={styles.upDownIconWrapper}>
          <ChevronsUpDown size={rf(18)} color={colors.textMuted} strokeWidth={2.2} />
        </View>
      </TouchableOpacity>

      {/* Save Action Button (Right) */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: colors.primary },
          disabled && styles.saveButtonDisabled,
        ]}
        onPress={onSave}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={[styles.saveButtonText, disabled && styles.saveButtonTextDisabled]}>
          {saveLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingTop: 8,
      paddingBottom: 6,
    },
    walletButton: {
      flex: 1.15,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.2 : 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    walletIconContainer: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    fallbackIcon: {
      width: 30,
      height: 30,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    walletTextContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    accountLabel: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(9),
      color: colors.textMuted,
      letterSpacing: 0.8,
      marginBottom: 1,
    },
    walletName: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(13),
      color: colors.text,
    },
    upDownIconWrapper: {
      marginLeft: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButton: {
      flex: 1,
      height: rf(52),
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 4,
    },
    saveButtonDisabled: {
      opacity: 0.45,
      shadowOpacity: 0,
      elevation: 0,
    },
    saveButtonText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(16),
      color: '#ffffff',
      letterSpacing: 0.3,
    },
    saveButtonTextDisabled: {
      color: 'rgba(255, 255, 255, 0.85)',
    },
  });
