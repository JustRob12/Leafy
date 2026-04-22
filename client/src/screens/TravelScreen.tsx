import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import { Plus, Trash2, ChevronLeft, Calendar, Plane, MapPin, DollarSign, Wallet } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import LeafyDatePicker from '../components/LeafyDatePicker';
import { useNavigation } from '@react-navigation/native';

export default function TravelScreen() {
  const { travels, addTravel, deleteTravel, showConfirm, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const navigation = useNavigation<any>();

  const [modalVisible, setModalVisible] = useState(false);
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
      setModalVisible(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setTripName('');
    setLocation('');
    setExpenses('');
    setStartDate(null);
    setEndDate(null);
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

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      "Delete Trip?",
      `Are you sure you want to remove "${name}" from your records? This will delete the expense history for this trip.`,
      () => deleteTravel(id)
    );
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>

          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Adventures</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {travels.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Plane size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Where to next?</Text>
            <Text style={styles.emptySubtitle}>You haven't recorded any trips yet. Start logging your adventures and expenses!</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => setModalVisible(true)}
            >
              <Plus size={18} color="#ffffff" />
              <Text style={styles.createBtnText}>Record First Trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          travels.map((trip) => (
            <View key={trip.id} style={styles.travelCard}>
              
              <View style={styles.cardHeader}>
                <View style={styles.titleSection}>
                   <View style={styles.iconBox}>
                     <Plane size={18} color={colors.primary} />
                   </View>
                   <View>
                     <Text style={styles.tripName}>{trip.name}</Text>
                     <View style={styles.locationRow}>
                       <MapPin size={12} color={colors.textMuted} />
                       <Text style={styles.locationText}>{trip.location}</Text>
                     </View>
                   </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(trip.id, trip.name)}>
                   <Trash2 size={16} color="#ef4444" style={{ opacity: 0.8 }} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardFooter}>
                <View style={styles.dateInfo}>
                   <Calendar size={14} color={colors.textMuted} />
                   <View>
                     <Text style={styles.dateText}>{trip.startDate}</Text>
                     <Text style={styles.dateText}>{trip.endDate}</Text>
                   </View>
                </View>
                <View style={styles.expenseInfo}>
                   <Text style={styles.expenseLabel}>Expenses</Text>
                   <Text style={styles.expenseValue}>₱{trip.expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Plus size={30} color="#ffffff" />
      </TouchableOpacity>

      <ActionSheet
        visible={modalVisible}
        onClose={() => { setModalVisible(false); resetForm(); }}
        title="Record New Trip"
      >
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
          <Wallet size={18} color={colors.textMuted} style={styles.inputIcon} />
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

        <TouchableOpacity
          style={[styles.saveBtn, (!tripName.trim() || !location.trim() || !expenses || !startDate || !endDate) && styles.saveBtnDisabled]}
          onPress={handleAddTravel}
          disabled={!tripName.trim() || !location.trim() || !expenses || !startDate || !endDate}
        >
          <Text style={styles.saveBtnText}>Save Trip Record</Text>
        </TouchableOpacity>

        <LeafyDatePicker
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onSelect={handleDateSelect}
          initialDate={pickerMode === 'start' ? (startDate || undefined) : (endDate || undefined)}
          title={pickerMode === 'start' ? "Select Start Date" : "Select End Date"}
        />
      </ActionSheet>
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
  addBtnHeader: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 140,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
    gap: 8,
  },
  createBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: '#ffffff',
  },
  travelCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? colors.border : colors.primary + '22',
    padding: 20,
    paddingHorizontal: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.2 : 0.04,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
  },
  tripName: {
    fontFamily: theme.fonts.bold,
    fontSize: 17,
    color: colors.text,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
    opacity: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  expenseInfo: {
    alignItems: 'flex-end',
  },
  expenseLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  expenseValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.primary,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
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
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
});
