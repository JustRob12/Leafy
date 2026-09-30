import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import {
  ChevronLeft,
  CreditCard,
  Calendar,
  Clock,
  Check,
  CheckCircle2,
  Pencil,
  Trash2,
  RotateCcw,
  Wallet as WalletIcon,
  X,
  Sparkles,
  Zap
} from 'lucide-react-native';
import { useAppContext, SubscriptionType } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  formatPaidTimestamp,
  getDueDateStatus
} from '../utils/paymentSchedule';
import { resolveSubscriptionLogo } from '../services/SubscriptionCatalogService';
import { rf } from '../utils/responsive';

const SUBS_ICONS: { [key: string]: any } = {
  'capcut.png': require('../../public/subs/capcut.png'),
  'chatgpt.png': require('../../public/subs/chatgpt.png'),
  'disney.png': require('../../public/subs/disney.png'),
  'gemini.png': require('../../public/subs/gemini.png'),
  'netflix.png': require('../../public/subs/netflix.png'),
  'prime.png': require('../../public/subs/prime.png'),
  'spotify.png': require('../../public/subs/spotify.png'),
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SubscriptionDetailScreen() {
  const {
    subscriptions,
    wallets,
    deleteSubscription,
    paySubscriptionMonth,
    revertSubscriptionMonth,
    showConfirm,
    colors,
    isDarkMode,
    isBalanceHidden
  } = useAppContext();

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const initialItem = route.params?.subscription;
  const subscription = (subscriptions || []).find((s: SubscriptionType) => s.id === initialItem?.id) || initialItem;

  const [isPayModalVisible, setIsPayModalVisible] = useState(false);
  const [selectedCycleKey, setSelectedCycleKey] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(subscription?.walletId || '');

  if (!subscription) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Subscription not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtnPill, { backgroundColor: colors.primary }]}>
            <Text style={styles.backBtnPillText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currencySymbol = subscription.currency === 'USD' ? '$' : '₱';
  const monthlyCost = subscription.amount || 0;
  const annualCost = monthlyCost * 12;

  const formatAmount = (val: number) => {
    if (isBalanceHidden) return `${currencySymbol} ******`;
    return `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleDelete = () => {
    showConfirm(
      'Delete Subscription',
      `Are you sure you want to delete "${subscription.title}"?`,
      async () => {
        await deleteSubscription(subscription.id);
        navigation.goBack();
      },
      true
    );
  };

  // Next renewal date calculations
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth();
  const dayOfMonth = Math.min(31, Math.max(1, subscription.dayOfMonth || 1));

  let nextRenewalDate = new Date(currentYear, currentMonthIdx, dayOfMonth);
  today.setHours(0, 0, 0, 0);
  nextRenewalDate.setHours(0, 0, 0, 0);

  if (nextRenewalDate.getTime() < today.getTime()) {
    nextRenewalDate = new Date(currentYear, currentMonthIdx + 1, dayOfMonth);
  }

  const diffTime = nextRenewalDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const nextRenewalFormatted = `${String(dayOfMonth).padStart(2, '0')} ${MONTH_NAMES[nextRenewalDate.getMonth()]} ${nextRenewalDate.getFullYear()}`;
  const currentMonthCycleKey = `${MONTH_NAMES[nextRenewalDate.getMonth()]} ${nextRenewalDate.getFullYear()}`;

  const handleOpenPay = (cycleKeyToPay: string) => {
    setSelectedCycleKey(cycleKeyToPay);
    if (!selectedWalletId && subscription.walletId) {
      setSelectedWalletId(subscription.walletId);
    } else if (!selectedWalletId && wallets.length > 0) {
      setSelectedWalletId(wallets[0].id);
    }
    setIsPayModalVisible(true);
  };

  const handleConfirmPayment = async () => {
    setIsPayModalVisible(false);
    if (!selectedCycleKey) return;
    await paySubscriptionMonth(subscription.id, selectedCycleKey, selectedWalletId || undefined);
  };

  const handleRevertCycle = (cycleKeyToRevert: string) => {
    showConfirm(
      'Undo Subscription Payment',
      `Revert payment for ${cycleKeyToRevert}? This will reset the status for this billing cycle.`,
      async () => {
        await revertSubscriptionMonth(subscription.id, cycleKeyToRevert);
      },
      false,
      'Undo Payment',
      'alert'
    );
  };

  // Build billing cycles for 12 months centered around the current date
  const cycles = [];
  const startMonthOffset = -5; // 5 months back, current month, 6 months forward
  for (let offset = startMonthOffset; offset <= 6; offset++) {
    const targetDate = new Date(currentYear, currentMonthIdx + offset, dayOfMonth);
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    const cycleKey = `${MONTH_NAMES[m]} ${y}`;
    const dueDateFormatted = `${String(dayOfMonth).padStart(2, '0')} ${MONTH_NAMES[m]} ${y}`;

    // Status checks
    const targetMidnight = new Date(y, m, dayOfMonth);
    targetMidnight.setHours(0, 0, 0, 0);
    const isPast = targetMidnight.getTime() < today.getTime();
    const isCurrent = y === nextRenewalDate.getFullYear() && m === nextRenewalDate.getMonth();

    const historyRecord = (subscription.paymentHistory || []).find((h: any) => h.cycleKey === cycleKey);
    const isPaid = !!historyRecord;

    cycles.push({
      cycleKey,
      dueDateFormatted,
      isPaid,
      historyRecord,
      isCurrent,
      isPast,
      targetMidnight
    });
  }

  // Count how many are paid
  const paidCount = cycles.filter(c => c.isPaid).length;

  // Resolve logo
  const logo = resolveSubscriptionLogo(subscription.title, subscription.icon);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>SUBSCRIPTION DETAILS</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddSubscription', { subscription })}
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
          {/* Top Row */}
          <View style={styles.overviewTopRow}>
            <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '18' }]}>
              {logo && SUBS_ICONS[logo] ? (
                <Image source={SUBS_ICONS[logo]} style={styles.subLogoImage} resizeMode="contain" />
              ) : logo && (logo.startsWith('http://') || logo.startsWith('https://')) ? (
                <Image source={{ uri: logo }} style={styles.subLogoImage} resizeMode="contain" />
              ) : (
                <CreditCard size={24} color={colors.primary} />
              )}
            </View>
            <View style={styles.overviewTitleBox}>
              <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                {subscription.title}
              </Text>
              <Text style={[styles.subtitleText, { color: colors.textMuted }]}>
                Every {dayOfMonth}th of month • {subscription.walletId ? 'Auto-Pay' : 'Manual'}
              </Text>
            </View>
          </View>

          {/* Segmented 12-Month Year Progress Bar */}
          <View style={styles.segmentedBarContainer}>
            {cycles.map((c, idx) => {
              return (
                <View
                  key={idx}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: c.isPaid ? colors.primary : (isDarkMode ? '#334155' : '#e2e8f0'),
                    }
                  ]}
                />
              );
            })}
          </View>

          {/* Key Metrics Columns */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>MONTHLY</Text>
              <Text style={[styles.metricValue, { color: colors.text }]} numberOfLines={1}>
                {formatAmount(monthlyCost)}
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metricCol}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>ANNUAL ESTIMATE</Text>
              <Text style={[styles.metricValue, { color: colors.text }]} numberOfLines={1}>
                {formatAmount(annualCost)}
              </Text>
            </View>
          </View>

          {/* Next Renewal Box */}
          <View style={[styles.nextPaymentBox, { backgroundColor: isDarkMode ? '#172033' : '#f8fafc', borderColor: colors.border }]}>
            <View style={styles.nextPaymentLeft}>
              <Text style={[styles.nextPaymentLabel, { color: colors.textMuted }]}>NEXT RENEWAL</Text>
              <Text style={[styles.nextPaymentAmount, { color: colors.text }]}>
                {formatAmount(monthlyCost)}
              </Text>
              <View style={styles.dueStatusRow}>
                <Calendar size={13} color={daysRemaining <= 3 ? '#ef4444' : colors.textMuted} />
                <Text
                  style={[
                    styles.nextPaymentDueDate,
                    { color: daysRemaining <= 3 ? '#ef4444' : colors.textMuted }
                  ]}
                >
                  Due {nextRenewalFormatted} ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left)
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.payButton, { backgroundColor: colors.primary }]}
              onPress={() => handleOpenPay(currentMonthCycleKey)}
              activeOpacity={0.8}
            >
              <CreditCard size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.payButtonText}>Pay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule Section */}
        <View style={styles.scheduleHeaderRow}>
          <Text style={[styles.scheduleTitle, { color: colors.text }]}>Billing History & Schedule</Text>
          <View style={[styles.scheduleCountBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.scheduleCountText, { color: colors.textMuted }]}>
              {paidCount} paid
            </Text>
          </View>
        </View>

        {/* Schedule List */}
        <View style={styles.scheduleList}>
          {cycles.map((item) => {
            return (
              <View
                key={item.cycleKey}
                style={[
                  styles.scheduleItemCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: item.isCurrent && !item.isPaid ? colors.primary + '60' : colors.border,
                  },
                  item.isCurrent && !item.isPaid && styles.activeDueCardHighlight
                ]}
              >
                <View style={styles.scheduleItemLeft}>
                  {/* Month & Cost */}
                  <Text style={[styles.cycleNumberText, { color: colors.text }]}>
                    {item.cycleKey} • {formatAmount(monthlyCost)}
                  </Text>

                  {/* Due Date */}
                  <View style={styles.scheduleDateRow}>
                    <Calendar size={13} color={item.isPast && !item.isPaid ? '#ef4444' : colors.textMuted} />
                    <Text
                      style={[
                        styles.scheduleDateText,
                        { color: item.isPast && !item.isPaid ? '#ef4444' : colors.textMuted }
                      ]}
                    >
                      Renewal {item.dueDateFormatted}
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
                  ) : item.isPast ? (
                    <Text style={styles.overdueNoteText}>Past renewal cycle</Text>
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
                      <TouchableOpacity
                        onPress={() => handleRevertCycle(item.cycleKey)}
                        style={[styles.revertBtn, { borderColor: colors.border }]}
                        activeOpacity={0.7}
                      >
                        <RotateCcw size={13} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ) : item.isCurrent || item.isPast ? (
                    <TouchableOpacity
                      style={[styles.duePayBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleOpenPay(item.cycleKey)}
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
                <Text style={[styles.modalTitle, { color: colors.text }]}>Renew Subscription</Text>
                <Text style={[styles.modalSub, { color: colors.textMuted }]}>
                  {selectedCycleKey} • {subscription.title}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsPayModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalAmountBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
              <Text style={[styles.modalAmountLabel, { color: colors.primary }]}>Subscription Renewal Amount</Text>
              <Text style={[styles.modalAmountValue, { color: colors.primary }]}>
                {formatAmount(monthlyCost)}
              </Text>
            </View>

            {/* Wallet Selection */}
            <Text style={[styles.walletSelectTitle, { color: colors.text }]}>Select Payment Wallet:</Text>
            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
              {wallets.map((wallet) => {
                const isSelected = selectedWalletId === wallet.id;
                const walletBal = subscription.currency === 'USD' ? (wallet.usdBalance || 0) : wallet.balance;
                const isSufficient = walletBal >= monthlyCost;

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
                    <Text style={[styles.walletOptionName, { color: colors.text }]}>External / Card Auto-Pay</Text>
                    <Text style={[styles.walletOptionBalance, { color: colors.textMuted }]}>
                      Record renewed without wallet deduction
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
    overflow: 'hidden',
  },
  subLogoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  overviewTitleBox: {
    flex: 1,
  },
  productName: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(17),
    lineHeight: 22,
    marginBottom: 4,
  },
  subtitleText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(13),
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
