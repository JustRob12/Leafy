import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme';
import {
  ChevronLeft,
  Plus,
  Trash2,
  CreditCard,
  Check,
  Zap,
  AlertCircle,
  Clock,
  Bookmark,
  ChevronsUpDown,
  ChevronDown,
  Calendar,
} from 'lucide-react-native';
import { useAppContext, MoneySplitPlan, SplitItem, SplitScheduleType, getWalletTotalBalanceInPhp } from '../context/AppContext';
import WalletBrandLogo from '../components/WalletBrandLogo';
import WalletPickerModal from '../components/WalletPickerModal';
import LeonDatePicker from '../components/LeonDatePicker';
import { rf, useResponsive } from '../utils/responsive';

const QUICK_TITLES = ['Salary Split', 'Payday Allocation', 'Bills & Savings', 'Personal Budget'];

const WEEK_DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function AddSplitScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { wallets, addSplit, editSplit, colors, isDarkMode, usdToPhpRate, showConfirm, showFeedback } = useAppContext();
  const { isTablet, isLandscape, width } = useResponsive();
  const styles = useMemo(() => getStyles(colors, isDarkMode, isTablet, isLandscape), [colors, isDarkMode, isTablet, isLandscape]);

  const editingPlan: MoneySplitPlan | undefined = route.params?.splitPlan;
  const isEditing = !!editingPlan;

  // Form States
  const [title, setTitle] = useState(editingPlan?.title || '');
  const [sourceWalletId, setSourceWalletId] = useState<string>(
    editingPlan?.sourceWalletId || (wallets.length > 0 ? wallets[0].id : '')
  );
  const [totalAmount, setTotalAmount] = useState<string>(
    editingPlan?.totalAmount ? editingPlan.totalAmount.toString() : '0'
  );
  const [currency, setCurrency] = useState<'PHP' | 'USD'>(editingPlan?.currency || 'PHP');

  // Schedule States
  const [scheduleType, setScheduleType] = useState<SplitScheduleType['type']>(
    editingPlan?.schedule?.type || 'semi-monthly'
  );
  const [specificDate, setSpecificDate] = useState<string>(
    editingPlan?.schedule?.date || new Date().toISOString().split('T')[0]
  );
  const [weeklyOption, setWeeklyOption] = useState<string>(
    editingPlan?.schedule?.weeklyOption || 'weekdays'
  );
  const [dayOfMonth, setDayOfMonth] = useState<number>(
    editingPlan?.schedule?.dayOfMonth || 15
  );
  const [yearlyMonth, setYearlyMonth] = useState<number>(
    editingPlan?.schedule?.yearlyMonth ?? new Date().getMonth()
  );
  const [yearlyDay, setYearlyDay] = useState<number>(
    editingPlan?.schedule?.yearlyDay || 15
  );

  // Modal States for Wallet Pickers and Date Picker
  const [sourceWalletModalVisible, setSourceWalletModalVisible] = useState(false);
  const [activeModalSplitId, setActiveModalSplitId] = useState<string | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // Destination Splits
  const [splits, setSplits] = useState<SplitItem[]>(() => {
    if (editingPlan?.splits && editingPlan.splits.length > 0) {
      return editingPlan.splits;
    }
    return [];
  });

  const parsedTotal = parseFloat(totalAmount.replace(/,/g, '')) || 0;

  const totalAllocated = useMemo(() => {
    return splits.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [splits]);

  const remainingAmount = Math.max(0, parsedTotal - totalAllocated);
  const isOverAllocated = totalAllocated > parsedTotal && parsedTotal > 0;

  const sourceWallet = useMemo(() => {
    return wallets.find(w => w.id === sourceWalletId);
  }, [wallets, sourceWalletId]);

  const sourceBalance = useMemo(() => {
    if (!sourceWallet) return 0;
    return getWalletTotalBalanceInPhp(sourceWallet, usdToPhpRate);
  }, [sourceWallet, usdToPhpRate]);

  // Destination wallet options (excluding currently selected source wallet)
  const availableDestWallets = useMemo(() => {
    return wallets.filter(w => w.id !== sourceWalletId);
  }, [wallets, sourceWalletId]);

  const handleAddSplitItem = () => {
    const defaultWallet = availableDestWallets.find(w => !splits.some(s => s.walletId === w.id)) || availableDestWallets[0] || wallets[0];
    if (!defaultWallet) {
      showFeedback('error', 'Add more wallets to create destination splits');
      return;
    }
    setSplits(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        walletId: defaultWallet.id,
        amount: 0,
        note: '',
      },
    ]);
  };

  const handleUpdateSplitItem = (id: string, updates: Partial<SplitItem>) => {
    setSplits(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleRemoveSplitItem = (id: string) => {
    setSplits(prev => prev.filter(item => item.id !== id));
  };

  const handleAmountChange = (text: string) => {
    let raw = text.replace(/[^0-9.]/g, '');
    if (raw.length > 1 && raw.startsWith('0') && !raw.startsWith('0.')) {
      raw = raw.replace(/^0+/, '');
    }
    setTotalAmount(raw);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Select Date';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (!y || !m || !d) return dateStr;
      const date = new Date(y, m - 1, d);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      return `${dayName}, ${month} ${d}, ${y}`;
    } catch {
      return dateStr;
    }
  };

  const handleSave = async (andExecuteNow: boolean = false) => {
    if (!title.trim()) {
      showFeedback('error', 'Please enter a title for the split');
      return;
    }
    if (parsedTotal <= 0) {
      showFeedback('error', 'Please enter a valid total amount');
      return;
    }
    if (!sourceWalletId) {
      showFeedback('error', 'Please select a source wallet');
      return;
    }
    if (splits.length === 0) {
      showFeedback('error', 'Add at least one destination split');
      return;
    }

    const invalidItem = splits.find(s => !s.walletId || s.amount <= 0);
    if (invalidItem) {
      showFeedback('error', 'Every split must have a destination wallet and amount');
      return;
    }

    if (totalAllocated > parsedTotal) {
      showFeedback('error', 'Total allocated cannot exceed the total amount');
      return;
    }

    const scheduleData: SplitScheduleType = {
      type: scheduleType,
      date: scheduleType === 'once' ? specificDate : undefined,
      weeklyOption: scheduleType === 'weekly' ? weeklyOption as any : undefined,
      dayOfMonth: (scheduleType === 'monthly' || scheduleType === 'semi-monthly') ? dayOfMonth : undefined,
      yearlyMonth: scheduleType === 'yearly' ? yearlyMonth : undefined,
      yearlyDay: scheduleType === 'yearly' ? yearlyDay : undefined,
    };

    if (isEditing && editingPlan) {
      await editSplit(editingPlan.id, {
        title: title.trim(),
        sourceWalletId,
        totalAmount: parsedTotal,
        currency,
        schedule: scheduleData,
        splits,
      });
      if (andExecuteNow) {
        showConfirm(
          'Execute Split Now?',
          `Deduct ₱${totalAllocated.toLocaleString()} from ${sourceWallet?.name} and transfer to ${splits.length} destination wallets now?`,
          async () => {
            const { executeSplit } = useAppContext();
            await executeSplit(editingPlan.id);
            navigation.goBack();
          },
          false,
          'Approve',
          'check'
        );
      } else {
        navigation.goBack();
      }
    } else {
      if (andExecuteNow) {
        showConfirm(
          'Execute Split Now?',
          `Deduct ₱${totalAllocated.toLocaleString()} from ${sourceWallet?.name} and transfer to ${splits.length} destination wallets immediately?`,
          async () => {
            await addSplit(
              {
                title: title.trim(),
                sourceWalletId,
                totalAmount: parsedTotal,
                currency,
                schedule: scheduleData,
                splits,
              },
              true
            );
            navigation.goBack();
          },
          false,
          'Approve',
          'check'
        );
      } else {
        await addSplit(
          {
            title: title.trim(),
            sourceWalletId,
            totalAmount: parsedTotal,
            currency,
            schedule: scheduleData,
            splits,
          },
          false
        );
        navigation.goBack();
      }
    }
  };

  const activeSplitItem = useMemo(() => {
    return splits.find(s => s.id === activeModalSplitId);
  }, [splits, activeModalSplitId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.responsiveWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ChevronLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Split Plan' : 'New Money Split'}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Step 1: Title Input */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>SPLIT PLAN NAME</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Salary Split, Payday Distribution"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.quickTitlesRow}>
              {QUICK_TITLES.map((t, idx) => {
                const isActive = title === t;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.quickChip, isActive && styles.quickChipActive]}
                    onPress={() => setTitle(t)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.quickChipText, isActive && styles.quickChipTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Step 2: Source Wallet (Modal Selection - No Side Scrolling) */}
          <View style={styles.sectionCard}>
            <View style={styles.labelRow}>
              <Text style={styles.sectionLabel}>SOURCE WALLET (WHERE MONEY COMES FROM)</Text>
            </View>
            <Text style={styles.sectionSub}>Money will be deducted from this account when the split executes.</Text>

            <TouchableOpacity
              style={styles.sourceWalletTrigger}
              onPress={() => setSourceWalletModalVisible(true)}
              activeOpacity={0.75}
            >
              <View style={styles.walletTriggerLeft}>
                <View style={[styles.walletTriggerIconBox, { backgroundColor: (sourceWallet?.color || colors.primary) + '18' }]}>
                  {sourceWallet?.presetLogo ? (
                    <WalletBrandLogo logoKey={sourceWallet.presetLogo} size={22} />
                  ) : (
                    <CreditCard size={17} color={sourceWallet?.color || colors.primary} />
                  )}
                </View>
                <View style={styles.walletTriggerInfo}>
                  <Text style={styles.walletTriggerName} numberOfLines={1}>
                    {sourceWallet ? sourceWallet.name : 'Select Source Wallet'}
                  </Text>
                  <Text style={styles.walletTriggerBal}>
                    Available: ₱{Math.floor(sourceBalance).toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={styles.walletTriggerAction}>
                <Text style={styles.walletTriggerActionText}>Change</Text>
                <ChevronDown size={14} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Step 3: Total Money To Split */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>TOTAL AMOUNT TO SPLIT</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencySymbol}>{currency === 'USD' ? '$' : '₱'}</Text>
              <TextInput
                style={styles.amountInput}
                value={totalAmount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textMuted + '55'}
              />
            </View>

            {/* Quick Amount Adder Chips */}
            <View style={styles.quickAmountsRow}>
              {[1000, 5000, 9000, 15000, 20000].map(amt => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickAmountPill, parsedTotal === amt && styles.quickAmountPillActive]}
                  onPress={() => setTotalAmount(amt.toString())}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickAmountText, parsedTotal === amt && styles.quickAmountTextActive]}>
                    ₱{amt >= 1000 ? `${amt / 1000}k` : amt}
                  </Text>
                </TouchableOpacity>
              ))}
              {sourceBalance > 0 && (
                <TouchableOpacity
                  style={styles.quickAmountPill}
                  onPress={() => setTotalAmount(Math.floor(sourceBalance).toString())}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAmountText}>Max Bal</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Step 4: Schedule / Frequency Selector */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>SCHEDULE & RECURRENCE</Text>
            <Text style={styles.sectionSub}>Choose when this allocation runs (weekly, every 15th, monthly, yearly, or once).</Text>

            {/* Frequency Type Tabs */}
            <View style={styles.frequencyTabs}>
              {[
                { key: 'once', label: 'Once' },
                { key: 'weekly', label: 'Weekly' },
                { key: 'semi-monthly', label: 'Every 15th' },
                { key: 'monthly', label: 'Monthly' },
                { key: 'yearly', label: 'Yearly' },
              ].map(tab => {
                const isTabActive = scheduleType === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.freqTab, isTabActive && styles.freqTabActive]}
                    onPress={() => setScheduleType(tab.key as any)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[styles.freqTabText, isTabActive && styles.freqTabTextActive]}
                      numberOfLines={1}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Frequency Sub-options */}
            {scheduleType === 'once' && (
              <View style={styles.subConfigContainer}>
                <Text style={styles.subConfigTitle}>Target Execution Date:</Text>
                <TouchableOpacity
                  style={styles.datePickerTrigger}
                  onPress={() => setDatePickerVisible(true)}
                  activeOpacity={0.75}
                >
                  <View style={styles.datePickerLeft}>
                    <View style={styles.calendarIconBox}>
                      <Calendar size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.datePickerText}>
                      {formatDisplayDate(specificDate)}
                    </Text>
                  </View>
                  <View style={styles.datePickerAction}>
                    <Text style={styles.datePickerActionText}>Change Date</Text>
                    <ChevronDown size={13} color={colors.primary} />
                  </View>
                </TouchableOpacity>

                <View style={styles.quickTitlesRow}>
                  <TouchableOpacity
                    style={styles.quickChip}
                    onPress={() => setSpecificDate(new Date().toISOString().split('T')[0])}
                  >
                    <Text style={styles.quickChipText}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickChip}
                    onPress={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setSpecificDate(d.toISOString().split('T')[0]);
                    }}
                  >
                    <Text style={styles.quickChipText}>Tomorrow</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickChip}
                    onPress={() => {
                      const now = new Date();
                      const d = new Date(now.getFullYear(), now.getMonth(), 15);
                      if (d < now) d.setMonth(d.getMonth() + 1);
                      setSpecificDate(d.toISOString().split('T')[0]);
                    }}
                  >
                    <Text style={styles.quickChipText}>Next 15th</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {scheduleType === 'weekly' && (
              <View style={styles.subConfigContainer}>
                <Text style={styles.subConfigTitle}>Select Days (Weekdays or Weekends):</Text>
                <View style={styles.quickTitlesRow}>
                  <TouchableOpacity
                    style={[styles.quickChip, weeklyOption === 'weekdays' && styles.quickChipActive]}
                    onPress={() => setWeeklyOption('weekdays')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.quickChipText, weeklyOption === 'weekdays' && styles.quickChipTextActive]}>
                      Weekdays (Mon - Fri)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.quickChip, weeklyOption === 'weekends' && styles.quickChipActive]}
                    onPress={() => setWeeklyOption('weekends')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.quickChipText, weeklyOption === 'weekends' && styles.quickChipTextActive]}>
                      Weekends (Sat - Sun)
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.subConfigTitle, { marginTop: 8 }]}>Or specific day:</Text>
                <View style={styles.daysOfWeekGrid}>
                  {WEEK_DAYS.map(d => {
                    const isDaySelected = weeklyOption === d.key;
                    return (
                      <TouchableOpacity
                        key={d.key}
                        style={[styles.dayCircle, isDaySelected && styles.dayCircleActive]}
                        onPress={() => setWeeklyOption(d.key)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.dayCircleText, isDaySelected && styles.dayCircleTextActive]}>
                          {d.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {scheduleType === 'semi-monthly' && (
              <View style={styles.subConfigContainer}>
                <Text style={styles.subConfigTitle}>Semi-Monthly Payday Cycle:</Text>
                <View style={styles.quickTitlesRow}>
                  <TouchableOpacity
                    style={[styles.quickChip, dayOfMonth === 15 && styles.quickChipActive]}
                    onPress={() => setDayOfMonth(15)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.quickChipText, dayOfMonth === 15 && styles.quickChipTextActive]}>
                      Every 15th of the Month
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.quickChip, dayOfMonth === 30 && styles.quickChipActive]}
                    onPress={() => setDayOfMonth(30)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.quickChipText, dayOfMonth === 30 && styles.quickChipTextActive]}>
                      15th & 30th (Payday Cycle)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {scheduleType === 'monthly' && (
              <View style={styles.subConfigContainer}>
                <Text style={styles.subConfigTitle}>Select Day of Month ({dayOfMonth}):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(num => {
                    const isDay = dayOfMonth === num;
                    return (
                      <TouchableOpacity
                        key={num}
                        style={[styles.daySquare, isDay && styles.daySquareActive]}
                        onPress={() => setDayOfMonth(num)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.daySquareText, isDay && styles.daySquareTextActive]}>
                          {num}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {scheduleType === 'yearly' && (
              <View style={styles.subConfigContainer}>
                <Text style={styles.subConfigTitle}>Select Month:</Text>
                <View style={styles.monthsGrid}>
                  {MONTHS.map((m, idx) => {
                    const isMonthSelected = yearlyMonth === idx;
                    return (
                      <TouchableOpacity
                        key={m}
                        style={[styles.monthPill, isMonthSelected && styles.monthPillActive]}
                        onPress={() => setYearlyMonth(idx)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.monthPillText, isMonthSelected && styles.monthPillTextActive]}>
                          {m}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.subConfigTitle, { marginTop: 10 }]}>Select Day ({yearlyDay}):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(num => {
                    const isDay = yearlyDay === num;
                    return (
                      <TouchableOpacity
                        key={num}
                        style={[styles.daySquare, isDay && styles.daySquareActive]}
                        onPress={() => setYearlyDay(num)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.daySquareText, isDay && styles.daySquareTextActive]}>
                          {num}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Step 5: Split Destinations (Each container has a Modal Wallet Selector - No Side Scrolling) */}
          <View style={styles.sectionCard}>
            <View style={styles.splitHeaderRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.sectionLabel}>SPLIT DESTINATIONS</Text>
                <Text style={styles.sectionSub}>Add destination accounts to distribute money into.</Text>
              </View>
              <TouchableOpacity style={styles.addDestinationBtn} onPress={handleAddSplitItem} activeOpacity={0.8}>
                <Plus size={13} color="#ffffff" style={{ marginRight: 3 }} />
                <Text style={styles.addDestinationBtnText}>Add Split</Text>
              </TouchableOpacity>
            </View>

            {splits.length === 0 ? (
              <View style={styles.emptySplitsBox}>
                <Text style={styles.emptySplitsText}>No destination accounts added yet.</Text>
                <TouchableOpacity style={styles.emptyAddBtn} onPress={handleAddSplitItem}>
                  <Plus size={15} color={colors.primary} />
                  <Text style={[styles.emptyAddBtnText, { color: colors.primary }]}>Add Destination Account</Text>
                </TouchableOpacity>
              </View>
            ) : (
              splits.map((item, index) => {
                const destWallet = wallets.find(w => w.id === item.walletId);
                const destBal = destWallet ? getWalletTotalBalanceInPhp(destWallet, usdToPhpRate) : 0;

                return (
                  <View key={item.id} style={styles.splitItemCard}>
                    {/* Split Item Header */}
                    <View style={styles.splitItemHeader}>
                      <View style={styles.splitIndexBadge}>
                        <Text style={styles.splitIndexText}>#{index + 1}</Text>
                      </View>
                      <Text style={styles.splitItemTitle}>Destination Account</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveSplitItem(item.id)}
                        style={styles.deleteSplitBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Trash2 size={15} color="#ef4444" />
                      </TouchableOpacity>
                    </View>

                    {/* MODAL TRIGGER FOR CHOOSING WALLET (No side-to-side scrolling) */}
                    <TouchableOpacity
                      style={styles.destWalletTriggerBtn}
                      onPress={() => setActiveModalSplitId(item.id)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.destWalletTriggerLeft}>
                        <View style={[styles.destWalletIconBox, { backgroundColor: (destWallet?.color || colors.primary) + '18' }]}>
                          {destWallet?.presetLogo ? (
                            <WalletBrandLogo logoKey={destWallet.presetLogo} size={20} />
                          ) : (
                            <CreditCard size={15} color={destWallet?.color || colors.primary} />
                          )}
                        </View>
                        <View style={styles.destWalletDetails}>
                          <Text style={styles.destWalletLabel}>ACCOUNT</Text>
                          <Text style={styles.destWalletName} numberOfLines={1}>
                            {destWallet ? destWallet.name : 'Select Destination Account'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.destWalletTriggerRight}>
                        {destWallet ? (
                          <Text style={styles.destWalletBal}>₱{Math.floor(destBal).toLocaleString()}</Text>
                        ) : null}
                        <ChevronsUpDown size={14} color={colors.textMuted} strokeWidth={2.2} style={{ marginLeft: 6 }} />
                      </View>
                    </TouchableOpacity>

                    {/* Amount and Note Inputs */}
                    <View style={styles.splitInputsRow}>
                      <View style={styles.splitAmountCol}>
                        <Text style={styles.miniInputLabel}>AMOUNT (₱)</Text>
                        <View style={styles.splitAmountInputWrap}>
                          <Text style={styles.splitCurrencyPrefix}>₱</Text>
                          <TextInput
                            style={styles.splitAmountInput}
                            value={item.amount ? item.amount.toString() : ''}
                            onChangeText={(t) => {
                              const val = parseFloat(t.replace(/[^0-9.]/g, '')) || 0;
                              handleUpdateSplitItem(item.id, { amount: val });
                            }}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={colors.textMuted}
                          />
                        </View>
                      </View>

                      <View style={styles.splitNoteCol}>
                        <Text style={styles.miniInputLabel}>NOTE (OPTIONAL)</Text>
                        <TextInput
                          style={styles.splitNoteInput}
                          value={item.note || ''}
                          onChangeText={(t) => handleUpdateSplitItem(item.id, { note: t })}
                          placeholder="e.g. Allowance, Savings"
                          placeholderTextColor={colors.textMuted}
                        />
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Step 6: Allocation Summary Visualizer */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>ALLOCATION SUMMARY</Text>

            {/* Visual Percentage Bar */}
            <View style={styles.progressBarWrapper}>
              {splits.map((s, idx) => {
                const pct = parsedTotal > 0 ? (s.amount / parsedTotal) * 100 : 0;
                const sliceColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
                return (
                  <View
                    key={s.id}
                    style={{
                      height: '100%',
                      width: `${Math.min(100, pct)}%`,
                      backgroundColor: sliceColors[idx % sliceColors.length],
                    }}
                  />
                );
              })}
              {remainingAmount > 0 && parsedTotal > 0 && (
                <View
                  style={{
                    height: '100%',
                    width: `${(remainingAmount / parsedTotal) * 100}%`,
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0',
                  }}
                />
              )}
            </View>

            {/* Math Rows */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Income / Money:</Text>
              <Text style={styles.summaryValue}>₱{parsedTotal.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Allocated to Splits:</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>- ₱{totalAllocated.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { fontFamily: theme.fonts.bold }]} numberOfLines={1}>
                Remaining in {sourceWallet?.name || 'Source'}:
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: isOverAllocated ? '#ef4444' : '#10b981', fontFamily: theme.fonts.bold, fontSize: rf(14.5) },
                ]}
              >
                ₱{remainingAmount.toLocaleString()}
              </Text>
            </View>

            {isOverAllocated && (
              <View style={styles.overAllocatedBanner}>
                <AlertCircle size={15} color="#ef4444" style={{ marginRight: 6 }} />
                <Text style={styles.overAllocatedText}>
                  Allocated amount exceeds total by ₱{(totalAllocated - parsedTotal).toLocaleString()}!
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.executeNowBtn, isOverAllocated && { opacity: 0.6 }]}
              onPress={() => handleSave(true)}
              activeOpacity={0.8}
              disabled={isOverAllocated}
            >
              <Zap size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.executeNowBtnText}>
                {isEditing ? 'Save & Execute Now' : 'Save & Execute Split'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.savePlanBtn}
              onPress={() => handleSave(false)}
              activeOpacity={0.8}
              disabled={isOverAllocated}
            >
              <Bookmark size={15} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={styles.savePlanBtnText}>Save Split Plan Only</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Source Wallet Picker Modal */}
      <WalletPickerModal
        visible={sourceWalletModalVisible}
        onClose={() => setSourceWalletModalVisible(false)}
        wallets={wallets}
        selectedWalletId={sourceWalletId}
        onSelectWallet={(id) => {
          setSourceWalletId(id);
          setSourceWalletModalVisible(false);
          // If any split was using this newly chosen source wallet, remap it to another available wallet
          setSplits(prev => prev.map(sp => {
            if (sp.walletId === id) {
              const alt = wallets.find(w => w.id !== id);
              return alt ? { ...sp, walletId: alt.id } : sp;
            }
            return sp;
          }));
        }}
      />

      {/* Destination Wallet Picker Modal for Container Items */}
      <WalletPickerModal
        visible={activeModalSplitId !== null}
        onClose={() => setActiveModalSplitId(null)}
        wallets={availableDestWallets.length > 0 ? availableDestWallets : wallets}
        selectedWalletId={activeSplitItem?.walletId || null}
        onSelectWallet={(selectedId) => {
          if (activeModalSplitId) {
            handleUpdateSplitItem(activeModalSplitId, { walletId: selectedId });
            setActiveModalSplitId(null);
          }
        }}
      />

      {/* Date Picker Modal */}
      <LeonDatePicker
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onSelect={(date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          setSpecificDate(`${y}-${m}-${day}`);
          setDatePickerVisible(false);
        }}
        initialDate={new Date(specificDate || Date.now())}
        title="Select Execution Date"
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDarkMode: boolean, isTablet: boolean, isLandscape: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    responsiveWrapper: {
      flex: 1,
      width: '100%',
      maxWidth: (isTablet || isLandscape) ? 680 : undefined,
      alignSelf: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(16),
      color: colors.text,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    sectionLabel: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(10),
      letterSpacing: 0.6,
      color: colors.textMuted,
      marginBottom: 4,
    },
    sectionSub: {
      fontFamily: theme.fonts.regular,
      fontSize: rf(11),
      color: colors.textMuted,
      marginBottom: 10,
      lineHeight: 15,
    },
    textInput: {
      height: 42,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      fontSize: rf(13),
      fontFamily: theme.fonts.medium,
      color: colors.text,
    },
    quickTitlesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 8,
    },
    quickChip: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 16,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickChipActive: {
      backgroundColor: colors.primary + '18',
      borderColor: colors.primary,
    },
    quickChipText: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(11),
      color: colors.text,
    },
    quickChipTextActive: {
      color: colors.primary,
      fontFamily: theme.fonts.bold,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    // Source Wallet Trigger Button (Modal based)
    sourceWalletTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
      borderRadius: 14,
      padding: 11,
      borderWidth: 1,
      borderColor: colors.border,
    },
    walletTriggerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
      minWidth: 0,
    },
    walletTriggerIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    walletTriggerInfo: {
      flex: 1,
      minWidth: 0,
    },
    walletTriggerName: {
      fontFamily: theme.fonts.semiBold,
      fontSize: rf(13),
      color: colors.text,
      marginBottom: 2,
    },
    walletTriggerBal: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(11),
      color: colors.textMuted,
    },
    walletTriggerAction: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '14',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 10,
      gap: 3,
    },
    walletTriggerActionText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(11),
      color: colors.primary,
    },
    amountInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingHorizontal: 14,
      height: 52,
    },
    currencySymbol: {
      fontSize: rf(20),
      fontFamily: theme.fonts.bold,
      color: colors.primary,
      marginRight: 6,
    },
    amountInput: {
      flex: 1,
      fontSize: rf(20),
      fontFamily: theme.fonts.bold,
      color: colors.text,
    },
    quickAmountsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 10,
    },
    quickAmountPill: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 16,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickAmountPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    quickAmountText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: rf(11),
      color: colors.text,
    },
    quickAmountTextActive: {
      color: '#ffffff',
    },
    frequencyTabs: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
      borderRadius: 12,
      padding: 3,
      marginBottom: 10,
    },
    freqTab: {
      flex: 1,
      paddingVertical: 6,
      paddingHorizontal: 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },
    freqTabActive: {
      backgroundColor: colors.primary,
    },
    freqTabText: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(10.5),
      color: colors.textMuted,
    },
    freqTabTextActive: {
      color: '#ffffff',
      fontFamily: theme.fonts.bold,
    },
    subConfigContainer: {
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    subConfigTitle: {
      fontFamily: theme.fonts.semiBold,
      fontSize: rf(11),
      color: colors.text,
      marginBottom: 6,
    },
    // Date Picker Trigger
    datePickerTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
      borderRadius: 12,
      paddingVertical: 9,
      paddingHorizontal: 11,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 4,
    },
    datePickerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    calendarIconBox: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: colors.primary + '16',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },
    datePickerText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: rf(12.5),
      color: colors.text,
    },
    datePickerAction: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '14',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
      gap: 3,
    },
    datePickerActionText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(11),
      color: colors.primary,
    },
    daysOfWeekGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    dayCircle: {
      width: 35,
      height: 35,
      borderRadius: 17.5,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCircleActive: {
      backgroundColor: colors.primary,
    },
    dayCircleText: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(10.5),
      color: colors.text,
    },
    dayCircleTextActive: {
      color: '#ffffff',
      fontFamily: theme.fonts.bold,
    },
    daysScroll: {
      gap: 5,
      paddingVertical: 3,
    },
    daySquare: {
      width: 34,
      height: 34,
      borderRadius: 8,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    daySquareActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    daySquareText: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(11.5),
      color: colors.text,
    },
    daySquareTextActive: {
      color: '#ffffff',
      fontFamily: theme.fonts.bold,
    },
    monthsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 5,
    },
    monthPill: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
      borderWidth: 1,
      borderColor: colors.border,
    },
    monthPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    monthPillText: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(10.5),
      color: colors.text,
    },
    monthPillTextActive: {
      color: '#ffffff',
      fontFamily: theme.fonts.bold,
    },
    splitHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    addDestinationBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 10,
    },
    addDestinationBtnText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(11),
      color: '#ffffff',
    },
    emptySplitsBox: {
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    emptySplitsText: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(11.5),
      color: colors.textMuted,
      marginBottom: 6,
    },
    emptyAddBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    emptyAddBtnText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(12),
    },
    splitItemCard: {
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
      borderRadius: 14,
      padding: 11,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    splitItemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    splitIndexBadge: {
      backgroundColor: colors.primary + '20',
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 6,
      marginRight: 6,
    },
    splitIndexText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(10),
      color: colors.primary,
    },
    splitItemTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(11.5),
      color: colors.text,
      flex: 1,
    },
    deleteSplitBtn: {
      padding: 3,
    },
    // Destination Wallet Picker Modal Trigger in Each Container
    destWalletTriggerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 9,
    },
    destWalletTriggerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
      minWidth: 0,
    },
    destWalletIconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    destWalletDetails: {
      flex: 1,
      minWidth: 0,
    },
    destWalletLabel: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(9),
      color: colors.textMuted,
      letterSpacing: 0.5,
    },
    destWalletName: {
      fontFamily: theme.fonts.semiBold,
      fontSize: rf(12),
      color: colors.text,
    },
    destWalletTriggerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    destWalletBal: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(11),
      color: colors.textMuted,
    },
    splitInputsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    splitAmountCol: {
      flex: 1.1,
    },
    splitNoteCol: {
      flex: 1.4,
    },
    miniInputLabel: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(9.5),
      letterSpacing: 0.4,
      color: colors.textMuted,
      marginBottom: 3,
    },
    splitAmountInputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 8,
      height: 38,
    },
    splitCurrencyPrefix: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(12.5),
      color: colors.primary,
      marginRight: 3,
    },
    splitAmountInput: {
      flex: 1,
      fontFamily: theme.fonts.bold,
      fontSize: rf(12.5),
      color: colors.text,
      paddingVertical: 0,
    },
    splitNoteInput: {
      height: 38,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      fontFamily: theme.fonts.medium,
      fontSize: rf(11.5),
      color: colors.text,
      paddingVertical: 0,
    },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryCardTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(10),
      letterSpacing: 0.6,
      color: colors.textMuted,
      marginBottom: 8,
    },
    progressBarWrapper: {
      flexDirection: 'row',
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
      marginBottom: 12,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 3,
    },
    summaryLabel: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(11.5),
      color: colors.textMuted,
      flexShrink: 1,
      marginRight: 8,
    },
    summaryValue: {
      fontFamily: theme.fonts.semiBold,
      fontSize: rf(12.5),
      color: colors.text,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 6,
    },
    overAllocatedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fee2e2',
      borderRadius: 8,
      padding: 8,
      marginTop: 8,
    },
    overAllocatedText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(11),
      color: '#ef4444',
      flex: 1,
    },
    actionsContainer: {
      gap: 8,
    },
    executeNowBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#10b981',
      paddingVertical: 12,
      borderRadius: 14,
      shadowColor: '#10b981',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 8,
      elevation: 3,
    },
    executeNowBtnText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(13),
      color: '#ffffff',
    },
    savePlanBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
      paddingVertical: 11,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    savePlanBtnText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(12.5),
      color: colors.text,
    },
  });
