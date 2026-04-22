import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, Building2, Calendar } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import WalletDropdown from '../components/WalletDropdown';

export default function AddRecursionScreen() {
  const { addRecursion, editRecursion, colors, isDarkMode } = useAppContext();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = getStyles(colors, isDarkMode);

  const editingRecursion = route.params?.recursion;
  const isEditing = !!editingRecursion;

  const [companyName, setCompanyName] = useState(editingRecursion?.companyName || '');
  const [amount, setAmount] = useState(editingRecursion?.amount?.toString() || '');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'bi-monthly'>(editingRecursion?.frequency || 'monthly');
  const [dayOfMonth, setDayOfMonth] = useState(editingRecursion?.dayOfMonth?.toString() || '1');
  const [dayOfWeek, setDayOfWeek] = useState<number>(editingRecursion?.dayOfWeek ?? 1); // Default to Monday
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(editingRecursion?.walletId || null);

  const daysOfWeek = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    const dayNumeric = parseInt(dayOfMonth);
    
    // Basic validation
    if (!companyName.trim() || isNaN(numericAmount) || numericAmount <= 0 || !selectedWalletId) return;

    // Content specific validation
    if (frequency === 'monthly' && (isNaN(dayNumeric) || dayNumeric < 1 || dayNumeric > 31)) return;

    const recursionData: any = {
      companyName: companyName.trim(),
      amount: numericAmount,
      walletId: selectedWalletId,
      frequency,
    };

    if (frequency === 'monthly') recursionData.dayOfMonth = dayNumeric;
    if (frequency === 'weekly') recursionData.dayOfWeek = dayOfWeek;
    // Bi-monthly logic is predefined as 15/30 in the process engine

    if (isEditing) {
      await editRecursion(editingRecursion.id, recursionData);
    } else {
      await addRecursion(recursionData);
    }
    navigation.goBack();
  };

  const isFormValid = companyName.trim() && amount && selectedWalletId && (
    frequency === 'bi-monthly' || 
    frequency === 'weekly' || 
    (frequency === 'monthly' && dayOfMonth && !isNaN(parseInt(dayOfMonth)))
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Recursion' : 'New Recursion'}</Text>
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

        <Text style={styles.inputLabel}>Amount (Salary)</Text>
        <View style={styles.inputWrapper}>
          <Text style={{ fontSize: 18, color: colors.textMuted, fontFamily: theme.fonts.bold, marginRight: 12 }}>₱</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Text style={styles.inputLabel}>Frequency</Text>
        <View style={styles.frequencyContainer}>
           {(['weekly', 'monthly', 'bi-monthly'] as const).map((f) => (
             <TouchableOpacity
               key={f}
               onPress={() => setFrequency(f)}
               style={[
                 styles.frequencyTab,
                 frequency === f ? styles.frequencyTabActive : null
               ]}
             >
               <Text style={[
                 styles.frequencyTabText,
                 frequency === f ? styles.frequencyTabActiveText : null
               ]}>
                 {f === 'bi-monthly' ? '15 Days' : f.charAt(0).toUpperCase() + f.slice(1)}
               </Text>
             </TouchableOpacity>
           ))}
        </View>

        {frequency === 'monthly' && (
          <>
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
          </>
        )}

        {frequency === 'weekly' && (
          <>
            <Text style={styles.inputLabel}>Repeat Every</Text>
            <View style={styles.daysWrapper}>
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  onPress={() => setDayOfWeek(day.value)}
                  style={[
                    styles.dayPill,
                    dayOfWeek === day.value ? styles.dayPillActive : null
                  ]}
                >
                  <Text style={[
                    styles.dayPillText,
                    dayOfWeek === day.value ? styles.dayPillActiveText : null
                  ]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {frequency === 'bi-monthly' && (
          <View style={styles.infoBox}>
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.infoText}>This will automatically add to your wallet every 15th and 30th (or end of month).</Text>
          </View>
        )}

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
          <Text style={styles.saveBtnText}>{isEditing ? 'Update Recursion' : 'Save Recursion'}</Text>
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
  frequencyContainer: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  frequencyTab: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  frequencyTabActive: {
    backgroundColor: colors.primary,
  },
  frequencyTabText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  frequencyTabActiveText: {
    color: '#ffffff',
    fontFamily: theme.fonts.bold,
  },
  daysWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  dayPill: {
    flex: 1,
    minWidth: '22%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  dayPillActive: {
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    borderColor: colors.primary,
  },
  dayPillText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
  dayPillActiveText: {
    color: colors.primary,
    fontFamily: theme.fonts.bold,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.05)' : '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.2)',
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
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
