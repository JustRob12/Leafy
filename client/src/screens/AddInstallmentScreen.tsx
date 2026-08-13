import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Dimensions, 
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { 
  ChevronLeft, 
  ShoppingBag, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Wallet, 
  Check,
  Clock,
  Slash,
  CheckCircle2
} from 'lucide-react-native';
import { useAppContext, calculateNextDueDate } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const rf = (size: number) => Math.round(size * scale);

const COMMON_MONTHS = [3, 6, 12, 18, 24, 36];

export default function AddInstallmentScreen() {
  const { wallets, addInstallment, showFeedback, colors, isDarkMode, usdToPhpRate } = useAppContext();
  const navigation = useNavigation<any>();

  const [productName, setProductName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState<'PHP' | 'USD'>('PHP');
  const [monthsToPay, setMonthsToPay] = useState('12');
  const [alreadyPaidMonths, setAlreadyPaidMonths] = useState('0');
  const [customMonthlyAmount, setCustomMonthlyAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(''); // Optional: '' means None / Manual
  
  // Installment Start Date (defaults to today)
  const todayDate = new Date();
  const [startDateStr, setStartDateStr] = useState(todayDate.toISOString().split('T')[0]);

  // Date Picker Modal state
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [pickerDay, setPickerDay] = useState(todayDate.getDate().toString());
  const [pickerMonth, setPickerMonth] = useState((todayDate.getMonth() + 1).toString());
  const [pickerYear, setPickerYear] = useState(todayDate.getFullYear().toString());

  const parsedTotal = parseFloat(totalAmount) || 0;
  const parsedMonths = parseInt(monthsToPay, 10) || 1;
  const parsedAlreadyPaid = Math.min(parsedMonths, Math.max(0, parseInt(alreadyPaidMonths, 10) || 0));
  const calculatedMonthly = parsedMonths > 0 ? parsedTotal / parsedMonths : 0;
  const finalMonthly = parseFloat(customMonthlyAmount) || calculatedMonthly;
  const computedFirstDueDate = calculateNextDueDate(startDateStr, parsedAlreadyPaid);

  const handleSave = async () => {
    if (!productName.trim()) {
      showFeedback('error', 'Please enter a product name');
      return;
    }
    if (parsedTotal <= 0) {
      showFeedback('error', 'Please enter a valid total amount');
      return;
    }
    if (parsedMonths <= 0) {
      showFeedback('error', 'Please enter months to pay');
      return;
    }

    await addInstallment({
      productName: productName.trim(),
      totalAmount: parsedTotal,
      monthlyAmount: finalMonthly,
      monthsToPay: parsedMonths,
      paidMonths: parsedAlreadyPaid,
      startDate: startDateStr,
      walletId: selectedWalletId || undefined,
      currency,
    });

    navigation.goBack();
  };

  const handleConfirmDate = () => {
    const y = parseInt(pickerYear, 10) || new Date().getFullYear();
    const m = Math.min(12, Math.max(1, parseInt(pickerMonth, 10) || 1));
    const d = Math.min(31, Math.max(1, parseInt(pickerDay, 10) || 1));
    
    const formattedM = m < 10 ? `0${m}` : `${m}`;
    const formattedD = d < 10 ? `0${d}` : `${d}`;
    
    setStartDateStr(`${y}-${formattedM}-${formattedD}`);
    setIsDatePickerVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Installment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          {/* Product Name */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Product / Item Name</Text>
          <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderColor: colors.border }]}>
            <ShoppingBag size={18} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g., iPhone 16 Pro, Laptop, Sofa"
              placeholderTextColor={colors.textMuted}
              value={productName}
              onChangeText={setProductName}
            />
          </View>

          {/* Currency Toggle */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Currency</Text>
          <View style={styles.currencyRow}>
            <TouchableOpacity
              style={[
                styles.currencyBtn, 
                { borderColor: colors.border },
                currency === 'PHP' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setCurrency('PHP')}
            >
              <Text style={styles.currencyFlag}>🇵🇭</Text>
              <Text style={[styles.currencyBtnText, currency === 'PHP' && { color: '#FFF' }]}>PHP (₱)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.currencyBtn, 
                { borderColor: colors.border },
                currency === 'USD' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setCurrency('USD')}
            >
              <Text style={styles.currencyFlag}>🇺🇸</Text>
              <Text style={[styles.currencyBtnText, currency === 'USD' && { color: '#FFF' }]}>USD ($)</Text>
            </TouchableOpacity>
          </View>

          {/* Total Amount */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Total Price / Amount</Text>
          <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderColor: colors.border }]}>
            <Text style={[styles.currencySymbolText, { color: colors.primary }]}>{currency === 'USD' ? '$' : '₱'}</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g., 60000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={totalAmount}
              onChangeText={setTotalAmount}
            />
          </View>

          {/* Months to Pay */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Months to Pay</Text>
          <View style={styles.presetMonthsRow}>
            {COMMON_MONTHS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.presetMonthChip,
                  { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9' },
                  monthsToPay === m.toString() && { backgroundColor: colors.primary }
                ]}
                onPress={() => {
                  setMonthsToPay(m.toString());
                  setCustomMonthlyAmount('');
                }}
              >
                <Text style={[
                  styles.presetMonthText,
                  { color: colors.text },
                  monthsToPay === m.toString() && { color: '#FFFFFF', fontFamily: theme.fonts.bold }
                ]}>
                  {m} mos
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderColor: colors.border }]}>
            <Clock size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Or enter number of months (e.g. 12)"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={monthsToPay}
              onChangeText={(text) => {
                setMonthsToPay(text);
                setCustomMonthlyAmount('');
              }}
            />
          </View>

          {/* Months Already Paid */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Months Already Paid (Optional)</Text>
          <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderColor: colors.border }]}>
            <CheckCircle2 size={18} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g. 0 (or 5 if started in the past)"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={alreadyPaidMonths}
              onChangeText={setAlreadyPaidMonths}
            />
          </View>
          <Text style={[styles.dateBasisSubtext, { color: colors.textMuted }]}>
            Enter how many monthly payments you have already completed before recording in the app.
          </Text>

          {/* Responsive Calculated Monthly Amount Preview */}
          <View style={[styles.monthlyPreviewBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f0fdf4', borderColor: colors.primary + '33' }]}>
            <View style={styles.monthlyPreviewHeader}>
              <Text style={[styles.monthlyPreviewLabel, { color: colors.textMuted }]}>Calculated Monthly Payment</Text>
              <Text 
                style={[styles.monthlyPreviewAmount, { color: colors.primary }]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.5}
              >
                {currency === 'USD' ? '$' : '₱'}{calculatedMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo
              </Text>
            </View>

            {currency === 'USD' && (
              <Text style={[styles.usdConversionSub, { color: colors.textMuted }]}>
                ≈ ₱{(calculatedMonthly * usdToPhpRate).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PHP
              </Text>
            )}
          </View>

          {/* Start Date of Installment */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Start Date of Installment</Text>
          <TouchableOpacity 
            style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderColor: colors.border }]}
            onPress={() => setIsDatePickerVisible(true)}
          >
            <CalendarIcon size={18} color={colors.primary} style={styles.inputIcon} />
            <Text style={[styles.dateText, { color: colors.text }]}>{startDateStr}</Text>
          </TouchableOpacity>
          <Text style={[styles.dateBasisSubtext, { color: colors.textMuted }]}>
            First monthly payment will be due on: {computedFirstDueDate}
          </Text>

          {/* Linked Wallet (Optional) */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Auto-Deduct Wallet (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.walletsRow}>
            {/* None Option */}
            <TouchableOpacity
              style={[
                styles.walletChip,
                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderColor: colors.border },
                selectedWalletId === '' && { backgroundColor: colors.border, borderColor: colors.border }
              ]}
              onPress={() => setSelectedWalletId('')}
            >
              <Text style={[
                styles.walletChipName,
                { color: colors.textMuted },
                selectedWalletId === '' && { color: colors.text, fontFamily: theme.fonts.bold }
              ]}>
                None (Manual Payment)
              </Text>
            </TouchableOpacity>

            {/* Wallet Options */}
            {wallets.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                style={[
                  styles.walletChip,
                  { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderColor: colors.border, maxWidth: 160 },
                  selectedWalletId === wallet.id && { backgroundColor: wallet.color || colors.primary, borderColor: wallet.color || colors.primary }
                ]}
                onPress={() => setSelectedWalletId(wallet.id)}
              >
                <Text 
                  style={[
                    styles.walletChipName,
                    { color: colors.text },
                    selectedWalletId === wallet.id && { color: '#FFFFFF' }
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {wallet.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Check size={20} color="#ffffff" />
          <Text style={styles.saveBtnText}>Record Installment</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Date Picker Modal */}
      <Modal
        visible={isDatePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Set Installment Start Date (YYYY-MM-DD)</Text>
            
            <View style={styles.dateInputsRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dateInputSubLabel, { color: colors.textMuted }]}>Year</Text>
                <TextInput
                  style={[styles.modalDateInput, { color: colors.text, borderColor: colors.border }]}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={pickerYear}
                  onChangeText={setPickerYear}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dateInputSubLabel, { color: colors.textMuted }]}>Month</Text>
                <TextInput
                  style={[styles.modalDateInput, { color: colors.text, borderColor: colors.border }]}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={pickerMonth}
                  onChangeText={setPickerMonth}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dateInputSubLabel, { color: colors.textMuted }]}>Day</Text>
                <TextInput
                  style={[styles.modalDateInput, { color: colors.text, borderColor: colors.border }]}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={pickerDay}
                  onChangeText={setPickerDay}
                />
              </View>
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.border }]} 
                onPress={() => setIsDatePickerVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.primary }]} 
                onPress={handleConfirmDate}
              >
                <Text style={[styles.modalBtnText, { color: '#ffffff' }]}>Confirm Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(13),
    marginBottom: 8,
    marginTop: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  currencySymbolText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.medium,
    fontSize: rf(15),
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  currencyFlag: {
    fontSize: rf(16),
  },
  currencyBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(13),
  },
  presetMonthsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  presetMonthChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  presetMonthText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
  },
  monthlyPreviewBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  monthlyPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthlyPreviewLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
    flexShrink: 1,
  },
  monthlyPreviewAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(16),
    flexShrink: 1,
    textAlign: 'right',
  },
  usdConversionSub: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
    marginTop: 4,
  },
  dateText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(15),
  },
  dateBasisSubtext: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
    marginTop: 6,
    marginLeft: 4,
  },
  walletsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  walletChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  walletChipName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(13),
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 18,
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(16),
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(16),
    marginBottom: 20,
    textAlign: 'center',
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dateInputSubLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
    marginBottom: 6,
  },
  modalDateInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    textAlign: 'center',
    fontFamily: theme.fonts.bold,
    fontSize: rf(16),
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
  },
});
