import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { Plus, ChevronLeft, Calendar, Plane, MapPin } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import LeafyDatePicker from '../components/LeafyDatePicker';
import { useNavigation } from '@react-navigation/native';

export default function AddTravelScreen() {
  const { addTravel, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const navigation = useNavigation<any>();

  const [tripName, setTripName] = useState('');
  const [location, setLocation] = useState('');
  const [expenses, setExpenses] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'start' | 'end' | null>(null);

  const handleAddTravel = async () => {
    const numericExpenses = parseFloat(expenses);
    if (tripName.trim() && location.trim() && !isNaN(numericExpenses) && startDate && endDate) {
      await addTravel({
        name: tripName.trim(),
        location: location.trim(),
        expenses: numericExpenses,
        startDate: formatDisplayDate(startDate),
        endDate: formatDisplayDate(endDate),
      });
      navigation.goBack();
    }
  };

  const handleOpenPicker = (mode: 'start' | 'end') => {
    setPickerMode(mode);
    setPickerVisible(true);
  };

  const handleDateSelect = (date: Date) => {
    if (pickerMode === 'start') setStartDate(date);
    else if (pickerMode === 'end') setEndDate(date);
    setPickerVisible(false);
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Adventure</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Trip Name</Text>
            <View style={styles.inputWrapper}>
              <Plane size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g., Summer in El Nido"
                placeholderTextColor={colors.textMuted}
                value={tripName}
                onChangeText={setTripName}
                autoFocus
              />
            </View>

            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g., Palawan, Philippines"
                placeholderTextColor={colors.textMuted}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            <Text style={styles.inputLabel}>Expenses (₱)</Text>
            <View style={styles.inputWrapper}>
              <Text style={{ fontSize: 18, color: colors.textMuted, fontFamily: theme.fonts.bold, marginRight: 10 }}>₱</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={expenses}
                onChangeText={setExpenses}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TouchableOpacity 
                  style={styles.inputWrapper}
                  onPress={() => handleOpenPicker('start')}
                >
                  <Calendar size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <Text style={[styles.dateInputPlaceholder, startDate && { color: colors.text }]}>
                    {startDate ? formatDisplayDate(startDate) : 'Select Start'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TouchableOpacity 
                  style={styles.inputWrapper}
                  onPress={() => handleOpenPicker('end')}
                >
                  <Calendar size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <Text style={[styles.dateInputPlaceholder, endDate && { color: colors.text }]}>
                    {endDate ? formatDisplayDate(endDate) : 'Select End'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, (!tripName.trim() || !location.trim() || !expenses || !startDate || !endDate) && styles.saveBtnDisabled]}
            onPress={handleAddTravel}
            disabled={!tripName.trim() || !location.trim() || !expenses || !startDate || !endDate}
          >
            <Text style={styles.saveBtnText}>Save Trip Record</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <LeafyDatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleDateSelect}
        initialDate={pickerMode === 'start' ? (startDate || undefined) : (endDate || undefined)}
        title={pickerMode === 'start' ? "Select Start Date" : "Select End Date"}
      />
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 52,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  dateInputPlaceholder: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    paddingVertical: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
