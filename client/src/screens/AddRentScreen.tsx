import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Dimensions, 
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { 
  ChevronLeft, 
  Home, 
  MapPin, 
  Calendar as CalendarIcon, 
  Check,
  CheckCircle2,
  FileText
} from 'lucide-react-native';
import { useAppContext, calculateNextDueDate } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const rf = (size: number) => Math.round(size * scale);

export default function AddRentScreen() {
  const { wallets, addRent, showFeedback, colors, isDarkMode, usdToPhpRate } = useAppContext();
  const navigation = useNavigation<any>();

  const [propertyName, setPropertyName] = useState('');
  const [location, setLocation] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [currency, setCurrency] = useState<'PHP' | 'USD'>('PHP');
  const [alreadyPaidMonths, setAlreadyPaidMonths] = useState('0');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(''); // Optional: '' means None / Manual
  const [notes, setNotes] = useState('');

  // Start Date (defaults to today)
  const todayDate = new Date();
  const [startDateStr, setStartDateStr] = useState(todayDate.toISOString().split('T')[0]);

  // Date Picker Modal state
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [pickerDay, setPickerDay] = useState(todayDate.getDate().toString());
  const [pickerMonth, setPickerMonth] = useState((todayDate.getMonth() + 1).toString());
  const [pickerYear, setPickerYear] = useState(todayDate.getFullYear().toString());

  const parsedMonthly = parseFloat(monthlyAmount) || 0;
  const parsedAlreadyPaid = Math.max(0, parseInt(alreadyPaidMonths, 10) || 0);
  const computedNextDueDate = calculateNextDueDate(startDateStr, parsedAlreadyPaid);

  const handleSave = async () => {
    if (!propertyName.trim()) {
      showFeedback('error', 'Please enter a property name (e.g. Boarding House)');
      return;
    }
    if (!location.trim()) {
      showFeedback('error', 'Please enter location / address');
      return;
    }
    if (parsedMonthly <= 0) {
      showFeedback('error', 'Please enter valid monthly rent amount');
      return;
    }

    await addRent({
      propertyName: propertyName.trim(),
      location: location.trim(),
      monthlyAmount: parsedMonthly,
      startDate: startDateStr,
      paidCycles: parsedAlreadyPaid,
      walletId: selectedWalletId || undefined,
      currency,
      notes: notes.trim() || undefined,
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Rent Property</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          {/* Property Name */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Property Name / Type</Text>
          <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderColor: colors.border }]}>
            <Home size={18} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g., Boarding House, Studio Apartment"
              placeholderTextColor={colors.textMuted}
              value={propertyName}
              onChangeText={setPropertyName}
            />
          </View>

          {/* Location / Address */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Location / Address</Text>
          <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderColor: colors.border }]}>
            <MapPin size={18} color="#ef4444" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g., Sampaloc Manila, Poblacion Makati"
              placeholderTextColor={colors.textMuted}
              value={location}
              onChangeText={setLocation}
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

          {/* Monthly Rent Amount */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Monthly Rent Amount</Text>
          <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderColor: colors.border }]}>
            <Text style={[styles.currencySymbolText, { color: colors.primary }]}>{currency === 'USD' ? '$' : '₱'}</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g., 3000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={monthlyAmount}
              onChangeText={setMonthlyAmount}
            />
          </View>

          {/* Start Date of Rent */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Date Rent Started</Text>
          <TouchableOpacity 
            style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderColor: colors.border }]}
            onPress={() => setIsDatePickerVisible(true)}
          >
            <CalendarIcon size={18} color={colors.primary} style={styles.inputIcon} />
            <Text style={[styles.dateText, { color: colors.text }]}>{startDateStr}</Text>
          </TouchableOpacity>
          <Text style={[styles.dateBasisSubtext, { color: colors.textMuted }]}>
            Next monthly rent payment will be due on: {computedNextDueDate} (No end date deadline)
          </Text>

          {/* Months Already Paid */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Months Already Paid (Optional)</Text>
          <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderColor: colors.border }]}>
            <CheckCircle2 size={18} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g. 0 (or 3 if started months ago)"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={alreadyPaidMonths}
              onChangeText={setAlreadyPaidMonths}
            />
          </View>

          {/* Linked Wallet (Optional) */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Auto-Deduct Wallet (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.walletsRow}>
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

          {/* Notes (Optional) */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Notes / Landlord Info (Optional)</Text>
          <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderColor: colors.border, height: 70, alignItems: 'flex-start', paddingTop: 10 }]}>
            <FileText size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text, textAlignVertical: 'top' }]}
              placeholder="e.g. Room 302, Landlord Contact 0917..."
              placeholderTextColor={colors.textMuted}
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>

        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Check size={20} color="#ffffff" />
          <Text style={styles.saveBtnText}>Record Rent Property</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={isDatePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Set Rent Start Date (YYYY-MM-DD)</Text>
            
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
