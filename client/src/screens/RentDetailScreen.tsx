import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import {
  ChevronLeft,
  Home,
  Building,
  MapPin,
  Calendar,
  Clock,
  Check,
  CheckCircle2,
  CreditCard,
  Pencil,
  Trash2,
  RotateCcw,
  Wallet as WalletIcon,
  X,
  FileText
} from 'lucide-react-native';
import { useAppContext, RentType } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  calculateRentCycleDueDate,
  formatScheduleDate,
  formatPaidTimestamp,
  getDueDateStatus
} from '../utils/paymentSchedule';
import { rf } from '../utils/responsive';

export default function RentDetailScreen() {
  const {
    rents,
    wallets,
    deleteRent,
    payRentMonth,
    revertRentMonth,
    showConfirm,
    colors,
    isDarkMode,
    isBalanceHidden
  } = useAppContext();

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const initialItem = route.params?.rent;
  const rent = (rents || []).find((r: RentType) => r.id === initialItem?.id) || initialItem;

  const [isPayModalVisible, setIsPayModalVisible] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(rent?.walletId || '');

  if (!rent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Rent property not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtnPill, { backgroundColor: colors.primary }]}>
            <Text style={styles.backBtnPillText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currencySymbol = rent.currency === 'USD' ? '$' : '₱';
  const paidCycles = Math.max(0, rent.paidCycles || 0);
  const monthlyAmount = rent.monthlyAmount || 0;
  const totalPaidToDate = paidCycles * monthlyAmount;

  const formatAmount = (val: number) => {
    if (isBalanceHidden) return `${currencySymbol} ******`;
    return `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleDelete = () => {
    showConfirm(
      'Delete Rent Property',
      `Are you sure you want to delete "${rent.propertyName}" (${rent.location})?`,
      async () => {
        await deleteRent(rent.id);
        navigation.goBack();
      },
      true
    );
  };

  const handleOpenPay = () => {
    if (!selectedWalletId && rent.walletId) {
      setSelectedWalletId(rent.walletId);
    } else if (!selectedWalletId && wallets.length > 0) {
      setSelectedWalletId(wallets[0].id);
    }
    setIsPayModalVisible(true);
  };

  const handleConfirmPayment = async () => {
    setIsPayModalVisible(false);
    await payRentMonth(rent.id, selectedWalletId || undefined);
  };

  const handleRevertLatest = () => {
    if (paidCycles <= 0) return;
    showConfirm(
      'Undo Last Rent Payment',
      `Revert rent payment for month ${paidCycles}? This will restore the previous cycle state.`,
      async () => {
        await revertRentMonth(rent.id);
      },
      false,
      'Undo Payment',
      'alert'
    );
  };

  // Build the list of cycles: all paid cycles + current due cycle + next 3 upcoming cycles
  const totalCyclesToShow = Math.max(paidCycles + 3, 6);
  const scheduleCycles = [];
  for (let k = 1; k <= totalCyclesToShow; k++) {
    const cycleDueDate = calculateRentCycleDueDate(rent.startDate, k);
    const isPaid = k <= paidCycles;
    const isNextDue = k === paidCycles + 1;
    const isFuture = k > paidCycles + 1;
    const dueStatus = getDueDateStatus(cycleDueDate);

    // Find in paymentHistory
    const historyRecord = (rent.paymentHistory || []).find((h: any) => h.cycle === k);

    scheduleCycles.push({
      cycle: k,
      dueDate: cycleDueDate,
      amount: monthlyAmount,
      isPaid,
      isNextDue,
      isFuture,
      dueStatus,
      historyRecord,
      isLatestPaid: isPaid && k === paidCycles
    });
  }

  // Next payment info
  const nextDueDate = calculateRentCycleDueDate(rent.startDate, paidCycles + 1);
  const nextDueStatus = getDueDateStatus(nextDueDate);

  // Segmented tenure representation (12 months cycle window)
  const segmentCount = 12;
  const tenureFilled = paidCycles % 12 === 0 && paidCycles > 0 ? 12 : paidCycles % 12;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>RENT PROPERTY DETAILS</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddRent', { rent })}
            style={[styles.headerActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Pencil size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.headerActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Overview Card */}
        <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header Row */}
          <View style={styles.overviewTopRow}>
            <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '18' }]}>
              <Home size={24} color={colors.primary} />
            </View>
            <View style={styles.overviewTitleBox}>
              <Text style={[styles.propertyName, { color: colors.text }]} numberOfLines={2}>
                {rent.propertyName}
              </Text>
              <View style={styles.locationRow}>
                <MapPin size={13} color={colors.textMuted} />
                <Text style={[styles.locationText, { color: colors.textMuted }]} numberOfLines={1}>
                  {rent.location || 'No location set'}
                </Text>
                <Text style={[styles.subDot, { color: colors.textMuted }]}>•</Text>
                <Text style={[styles.paidMonthsBadgeText, { color: colors.textMuted }]}>
                  {paidCycles} {paidCycles === 1 ? 'month' : 'months'} paid
                </Text>
              </View>
            </View>
          </View>

          {/* Segmented Progress Bar (12-month tenure track) */}
          <View style={styles.segmentedBarContainer}>
            {Array.from({ length: segmentCount }).map((_, idx) => {
              const isFilled = idx < tenureFilled;
              return (
                <View
                  key={idx}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: isFilled ? colors.primary : (isDarkMode ? '#334155' : '#e2e8f0'),
                    }
                  ]}
                />
              );
            })}
          </View>

          {/* Key Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>MONTHLY RENT</Text>
              <Text style={[styles.metricValue, { color: colors.text }]} numberOfLines={1}>
                {formatAmount(monthlyAmount)}
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metricCol}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>TOTAL PAID</Text>
              <Text style={[styles.metricValue, { color: colors.text }]} numberOfLines={1}>
                {formatAmount(totalPaidToDate)}
              </Text>
            </View>
          </View>

          {/* Next Rent Payment Box */}
          <View style={[styles.nextPaymentBox, { backgroundColor: isDarkMode ? '#172033' : '#f8fafc', borderColor: colors.border }]}>
            <View style={styles.nextPaymentLeft}>
              <Text style={[styles.nextPaymentLabel, { color: colors.textMuted }]}>NEXT RENT PAYMENT</Text>
              <Text style={[styles.nextPaymentAmount, { color: colors.text }]}>
                {formatAmount(monthlyAmount)}
              </Text>
              <View style={styles.dueStatusRow}>
                <Calendar size={13} color={nextDueStatus.isOverdue ? '#ef4444' : colors.textMuted} />
                <Text
                  style={[
                    styles.nextPaymentDueDate,
                    { color: nextDueStatus.isOverdue ? '#ef4444' : colors.textMuted }
                  ]}
                >
                  Due {formatScheduleDate(nextDueDate)}
                  {nextDueStatus.isOverdue ? ' (Overdue)' : nextDueStatus.isDueSoon ? ' (Due Soon)' : ''}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.payButton, { backgroundColor: colors.primary }]}
              onPress={handleOpenPay}
              activeOpacity={0.8}
            >
              <CreditCard size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.payButtonText}>Pay Rent</Text>
            </TouchableOpacity>
          </View>

          {/* Notes if any */}
          {!!rent.notes && (
            <View style={[styles.notesBox, { borderColor: colors.border }]}>
              <FileText size={14} color={colors.textMuted} style={{ marginTop: 2, marginRight: 6 }} />
              <Text style={[styles.notesText, { color: colors.textMuted }]}>{rent.notes}</Text>
            </View>
          )}
        </View>

        {/* Schedule Section */}
        <View style={styles.scheduleHeaderRow}>
          <Text style={[styles.scheduleTitle, { color: colors.text }]}>Rent Schedule</Text>
          <View style={[styles.scheduleCountBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.scheduleCountText, { color: colors.textMuted }]}>
              {paidCycles} paid
            </Text>
          </View>
        </View>

        {/* Schedule List */}
        <View style={styles.scheduleList}>
          {scheduleCycles.map((item) => {
            return (
              <View
                key={item.cycle}
                style={[
                  styles.scheduleItemCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: item.isNextDue ? colors.primary + '60' : colors.border,
                  },
                  item.isNextDue && styles.activeDueCardHighlight
                ]}
              >
                <View style={styles.scheduleItemLeft}>
                  {/* Month Index & Amount */}
                  <Text style={[styles.cycleNumberText, { color: colors.text }]}>
                    Month {item.cycle} • {formatAmount(item.amount)}
                  </Text>

                  {/* Due Date */}
                  <View style={styles.scheduleDateRow}>
                    <Calendar size={13} color={item.dueStatus.isOverdue && !item.isPaid ? '#ef4444' : colors.textMuted} />
                    <Text
                      style={[
                        styles.scheduleDateText,
                        { color: item.dueStatus.isOverdue && !item.isPaid ? '#ef4444' : colors.textMuted }
                      ]}
                    >
                      Due {formatScheduleDate(item.dueDate)}
                    </Text>
                  </View>

                  {/* Paid Timestamp */}
                  {item.isPaid ? (
                    <View style={styles.paidInfoBox}>
                      <Clock size={12} color="#10b981" />
                      <Text style={[styles.paidInfoText, { color: colors.textMuted }]} numberOfLines={1}>
                        {item.historyRecord
                          ? `${formatPaidTimestamp(item.historyRecord.paidDate)}${item.historyRecord.walletName ? ` • ${item.historyRecord.walletName}` : ''}`
                          : 'Marked paid before tracking'}
                      </Text>
                    </View>
                  ) : item.isNextDue && item.dueStatus.isOverdue ? (
                    <Text style={styles.overdueNoteText}>Rent payment is overdue</Text>
                  ) : null}
                </View>

                {/* Right Status Badge / Pay Button */}
                <View style={styles.scheduleItemRight}>
                  {item.isPaid ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={styles.paidBadge}>
                        <Check size={13} color="#10b981" strokeWidth={3} />
                        <Text style={styles.paidBadgeText}>Paid</Text>
                      </View>
                      {item.isLatestPaid && (
                        <TouchableOpacity
                          onPress={handleRevertLatest}
                          style={[styles.revertBtn, { borderColor: colors.border }]}
                          activeOpacity={0.7}
                        >
                          <RotateCcw size={13} color={colors.textMuted} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : item.isNextDue ? (
                    <TouchableOpacity
                      style={[styles.duePayBtn, { backgroundColor: colors.primary }]}
                      onPress={handleOpenPay}
                      activeOpacity={0.8}
                    >
                      <CreditCard size={13} color="#ffffff" />
                      <Text style={styles.duePayBtnText}>Pay</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.unpaidBadge, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
                      <Text style={[styles.unpaidBadgeText, { color: colors.textMuted }]}>Upcoming</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Payment Confirmation Modal with Wallet Picker */}
      <Modal
        visible={isPayModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Pay Rent</Text>
                <Text style={[styles.modalSub, { color: colors.textMuted }]}>
                  Month {paidCycles + 1} • {rent.propertyName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsPayModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalAmountBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
              <Text style={[styles.modalAmountLabel, { color: colors.primary }]}>Monthly Rent Amount</Text>
              <Text style={[styles.modalAmountValue, { color: colors.primary }]}>
                {formatAmount(monthlyAmount)}
              </Text>
            </View>

            {/* Wallet Selection */}
            <Text style={[styles.walletSelectTitle, { color: colors.text }]}>Select Payment Wallet:</Text>
            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
              {wallets.map((wallet) => {
                const isSelected = selectedWalletId === wallet.id;
                const walletBal = rent.currency === 'USD' ? (wallet.usdBalance || 0) : wallet.balance;
                const isSufficient = walletBal >= monthlyAmount;

                return (
                  <TouchableOpacity
                    key={wallet.id}
                    style={[
                      styles.walletOptionCard,
                      {
                        backgroundColor: isSelected ? colors.primary + '18' : (isDarkMode ? '#172033' : '#f8fafc'),
                        borderColor: isSelected ? colors.primary : colors.border
                      }
                    ]}
                    onPress={() => setSelectedWalletId(wallet.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.walletOptionLeft}>
                      <WalletIcon size={20} color={isSelected ? colors.primary : colors.textMuted} />
                      <View>
                        <Text style={[styles.walletOptionName, { color: colors.text }]}>{wallet.name}</Text>
                        <Text style={[styles.walletOptionBalance, { color: isSufficient ? colors.textMuted : '#ef4444' }]}>
                          Balance: {currencySymbol}{walletBal.toLocaleString()}
                          {!isSufficient ? ' (Insufficient)' : ''}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View style={[styles.walletSelectedCheck, { backgroundColor: colors.primary }]}>
                        <Check size={14} color="#ffffff" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Option to record without wallet deduction */}
              <TouchableOpacity
                style={[
                  styles.walletOptionCard,
                  {
                    backgroundColor: !selectedWalletId ? colors.primary + '18' : (isDarkMode ? '#172033' : '#f8fafc'),
                    borderColor: !selectedWalletId ? colors.primary : colors.border
                  }
                ]}
                onPress={() => setSelectedWalletId('')}
                activeOpacity={0.7}
              >
                <View style={styles.walletOptionLeft}>
                  <CreditCard size={20} color={!selectedWalletId ? colors.primary : colors.textMuted} />
                  <View>
                    <Text style={[styles.walletOptionName, { color: colors.text }]}>Cash / Bank Transfer</Text>
                    <Text style={[styles.walletOptionBalance, { color: colors.textMuted }]}>
                      Record rent paid without wallet deduction
                    </Text>
                  </View>
                </View>
                {!selectedWalletId && (
                  <View style={[styles.walletSelectedCheck, { backgroundColor: colors.primary }]}>
                    <Check size={14} color="#ffffff" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => setIsPayModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: colors.primary }]}
                onPress={handleConfirmPayment}
              >
                <Text style={styles.modalConfirmText}>Confirm & Pay</Text>
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
  backIconBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  overviewCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  overviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewTitleBox: {
    flex: 1,
  },
  propertyName: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(17),
    lineHeight: 22,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
    maxWidth: '50%',
  },
  subDot: {
    fontSize: rf(10),
  },
  paidMonthsBadgeText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
  },
  segmentedBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  segment: {
    flex: 1,
    height: 7,
    borderRadius: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(11),
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(20),
  },
  metricDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 16,
  },
  nextPaymentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  nextPaymentLeft: {
    flex: 1,
    marginRight: 12,
  },
  nextPaymentLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(10),
    letterSpacing: 0.8,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  nextPaymentAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(22),
    marginBottom: 4,
  },
  dueStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  nextPaymentDueDate: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
    color: '#ffffff',
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  notesText: {
    fontFamily: theme.fonts.regular,
    fontSize: rf(12),
    lineHeight: 18,
    flex: 1,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  scheduleTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
  },
  scheduleCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  scheduleCountText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
  },
  scheduleList: {
    gap: 10,
  },
  scheduleItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  activeDueCardHighlight: {
    borderWidth: 1.5,
  },
  scheduleItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  cycleNumberText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(15),
    marginBottom: 4,
  },
  scheduleDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  scheduleDateText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
  },
  paidInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  paidInfoText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
  },
  overdueNoteText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(11),
    color: '#ef4444',
    marginTop: 3,
  },
  scheduleItemRight: {
    alignItems: 'flex-end',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  paidBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(12),
    color: '#15803d',
  },
  revertBtn: {
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  duePayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 14,
  },
  duePayBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(12),
    color: '#ffffff',
  },
  unpaidBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  unpaidBadgeText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(16),
    marginBottom: 16,
  },
  backBtnPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnPillText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
  },
  modalSub: {
    fontFamily: theme.fonts.regular,
    fontSize: rf(12),
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  modalAmountBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAmountLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
    marginBottom: 2,
  },
  modalAmountValue: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(24),
  },
  walletSelectTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
    marginBottom: 10,
  },
  walletOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  walletOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  walletOptionName: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
  },
  walletOptionBalance: {
    fontFamily: theme.fonts.regular,
    fontSize: rf(11),
    marginTop: 2,
  },
  walletSelectedCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
    color: '#ffffff',
  },
});
