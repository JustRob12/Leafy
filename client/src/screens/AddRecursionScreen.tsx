import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, Building2, DollarSign, Calendar } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import WalletDropdown from '../components/WalletDropdown';

export default function AddRecursionScreen() {
  const { addRecursion, colors, isDarkMode } = useAppContext();
  const navigation = useNavigation<any>();
  const styles = getStyles(colors, isDarkMode);

  const [companyName, setCompanyName] = useState('');
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    const dayNumeric = parseInt(dayOfMonth);
    if (companyName.trim() && !isNaN(numericAmount) && numericAmount > 0 && selectedWalletId && !isNaN(dayNumeric) && dayNumeric >= 1 && dayNumeric <= 31) {
      await addRecursion({
        companyName: companyName.trim(),
        amount: numericAmount,
        walletId: selectedWalletId,
        dayOfMonth: dayNumeric,
      });
      navigation.goBack();
    }
  };

  const isFormValid = companyName.trim() && amount && selectedWalletId && dayOfMonth && !isNaN(parseInt(dayOfMonth));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Recursion</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.inputLabel}>Company Name</Text>
        <View style={styles.inputWrapper}>
          <Building2 size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Work Company"
            placeholderTextColor={colors.textMuted}
            value={companyName}
            onChangeText={setCompanyName}
            autoFocus
          />
        </View>

        <Text style={styles.inputLabel}>Amount (Monthly/Recurring)</Text>
        <View style={styles.inputWrapper}>
          <DollarSign size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Text style={styles.inputLabel}>Day of the Month (1-31)</Text>
        <View style={styles.inputWrapper}>
          <Calendar size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={dayOfMonth}
            onChangeText={setDayOfMonth}
          />
        </View>

        <Text style={styles.inputLabel}>Select Target Wallet</Text>
        <WalletDropdown
          selectedWalletId={selectedWalletId}
          onSelectWallet={setSelectedWalletId}
        />
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, !isFormValid && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!isFormValid}
        >
          <Text style={styles.saveBtnText}>Save Recursion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  inputLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#ffffff',
  },
});
