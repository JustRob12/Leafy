import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, Plus, CreditCard, Trash2, Calendar, AlertTriangle, CheckCircle2, Zap } from 'lucide-react-native';
import { useAppContext, SubscriptionType } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { resolveSubscriptionLogo } from '../services/SubscriptionCatalogService';
import { 
  formatPaidTimestamp, 
  getSubscriptionNextDeadline, 
  sortSubscriptionsByClosestDeadline 
} from '../utils/paymentSchedule';

const SUBS_ICONS: { [key: string]: any } = {
  'capcut.png': require('../../public/subs/capcut.png'),
  'chatgpt.png': require('../../public/subs/chatgpt.png'),
  'disney.png': require('../../public/subs/disney.png'),
  'gemini.png': require('../../public/subs/gemini.png'),
  'netflix.png': require('../../public/subs/netflix.png'),
  'prime.png': require('../../public/subs/prime.png'),
  'spotify.png': require('../../public/subs/spotify.png'),
  'pldt.png': require('../../public/subs/pldt.png'),
  'PHI.png': require('../../public/subs/PHI.png'),
};

export default function SubscriptionScreen() {
  const { 
    subscriptions, 
    deleteSubscription, 
    paySubscriptionMonth, 
    colors, 
    isDarkMode, 
    showConfirm,
    wallets 
  } = useAppContext();
  const navigation = useNavigation<any>();
  const styles = getStyles(colors, isDarkMode);

  // Sort subscriptions: near deadlines / unpaid at top, paid monthly at the bottom
  const sortedSubscriptions = useMemo(() => {
    return sortSubscriptionsByClosestDeadline(subscriptions);
  }, [subscriptions]);

  const handleDelete = (id: string, title: string) => {
    showConfirm(
      'Delete Subscription',
      `Are you sure you want to remove ${title}?`,
      () => deleteSubscription(id),
      true
    );
  };

  const handlePayMonth = (sub: SubscriptionType) => {
    const deadline = getSubscriptionNextDeadline(sub);
    const symbol = sub.currency === 'USD' ? '$' : '₱';
    showConfirm(
      'Pay Monthly Subscription',
      `Mark "${sub.title}" as paid for ${deadline.cycleKey} (${symbol}${sub.amount.toLocaleString()})?`,
      () => paySubscriptionMonth(sub.id, deadline.cycleKey, sub.walletId),
      false,
      'Pay',
      'pay'
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddSubscription')} style={styles.addBtn}>
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sortedSubscriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CreditCard size={64} color={colors.textMuted} opacity={0.2} />
            <Text style={styles.emptyText}>No subscriptions tracked yet</Text>
            <TouchableOpacity 
              style={styles.emptyAddBtn}
              onPress={() => navigation.navigate('AddSubscription')}
            >
              <Text style={styles.emptyAddBtnText}>Add Subscription</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sortedSubscriptions.map((sub) => {
            const deadline = getSubscriptionNextDeadline(sub);
            const {
              formattedDueDate,
              isCurrentMonthPaid,
              isOverdue,
              isDueSoon,
              daysRemaining,
              cycleKey
            } = deadline;

            const sortedHistory = [...(sub.paymentHistory || [])].sort(
              (a: any, b: any) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime()
            );
            const latestPayment = sortedHistory[0];

            const logo = resolveSubscriptionLogo(sub.title, sub.icon);
            const isHighlightDue = !isCurrentMonthPaid && (isOverdue || isDueSoon);

            return (
              <TouchableOpacity 
                key={sub.id} 
                style={[
                  styles.subscriptionCard, 
                  isHighlightDue && styles.dueSoonCard,
                  isCurrentMonthPaid && styles.paidCard
                ]}
                onPress={() => navigation.navigate('SubscriptionDetail', { subscription: sub })}
                activeOpacity={0.8}
              >
                <View style={styles.cardLeft}>
                  <View style={[
                    styles.iconWrapper, 
                    isHighlightDue && styles.dueSoonIconWrapper, 
                    logo && { backgroundColor: 'transparent', borderWidth: 0 }
                  ]}>
                    {logo && SUBS_ICONS[logo] ? (
                      <Image source={SUBS_ICONS[logo]} style={styles.subIcon} />
                    ) : logo && (logo.startsWith('http://') || logo.startsWith('https://')) ? (
                      <Image source={{ uri: logo }} style={styles.subIcon} />
                    ) : (
                      <CreditCard size={20} color={isHighlightDue ? '#ef4444' : colors.primary} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text 
                      style={[
                        styles.subTitle, 
                        isHighlightDue && styles.dueSoonText
                      ]} 
                      numberOfLines={1}
                    >
                      {sub.title}
                    </Text>
                    <View style={styles.row}>
                      <Calendar size={12} color={colors.textMuted} />
                      <Text style={styles.subDetail}>
                        {isCurrentMonthPaid 
                          ? `Every ${sub.dayOfMonth}th • Next: ${formattedDueDate}`
                          : `Due: ${formattedDueDate}`}
                      </Text>
                    </View>
                    {latestPayment ? (
                      <View style={styles.paidDateRow}>
                        <CheckCircle2 size={11} color="#10b981" />
                        <Text style={styles.paidDateText} numberOfLines={1}>
                          {formatPaidTimestamp(latestPayment.paidDate)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                
                <View style={styles.cardRight}>
                  <Text style={[styles.subAmount, isHighlightDue && styles.dueSoonText]}>
                    {sub.currency === 'USD' ? '$' : '₱'}{sub.amount.toLocaleString()}
                  </Text>
                  
                  {isCurrentMonthPaid ? (
                    <View style={[styles.daysBadge, styles.paidBadge]}>
                      <Text style={[styles.daysText, styles.paidBadgeText]}>✓ Paid</Text>
                    </View>
                  ) : isOverdue ? (
                    <View style={[styles.daysBadge, styles.dueSoonBadge]}>
                      <Text style={[styles.daysText, styles.dueSoonBadgeText]}>
                        {daysRemaining === 0 ? 'Due Today' : `${Math.abs(daysRemaining)}d overdue`}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.daysBadge, isDueSoon ? styles.dueSoonBadge : styles.normalBadge]}>
                      <Text style={[styles.daysText, isDueSoon && styles.dueSoonBadgeText]}>
                        {daysRemaining === 0 ? 'Due Today' : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`}
                      </Text>
                    </View>
                  )}

                  {!isCurrentMonthPaid && (
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation?.();
                        handlePayMonth(sub);
                      }}
                      style={styles.markPaidBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.markPaidBtnText}>Mark Paid ›</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    onPress={() => handleDelete(sub.id, sub.title)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={16} color={isHighlightDue ? '#ef4444' : colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
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
  addBtn: {
    padding: 8,
    marginRight: -8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyAddBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: '#ffffff',
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dueSoonCard: {
    borderColor: '#fecaca',
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.05)' : '#fef2f2',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueSoonIconWrapper: {
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
  },
  subTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  dueSoonText: {
    color: '#ef4444',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subDetail: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  subAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  daysBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  normalBadge: {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
  },
  dueSoonBadge: {
    backgroundColor: '#ef4444',
  },
  paidBadge: {
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.16)' : '#dcfce7',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.35)' : '#bbf7d0',
  },
  daysText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    color: colors.textMuted,
  },
  dueSoonBadgeText: {
    color: '#ffffff',
  },
  paidBadgeText: {
    color: '#15803d',
  },
  paidDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  paidDateText: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: '#10b981',
  },
  paidCard: {
    opacity: 0.9,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.3)',
  },
  markPaidBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.35)' : '#a7f3d0',
    marginTop: 2,
  },
  markPaidBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    color: '#10b981',
  },
  deleteBtn: {
    marginTop: 4,
    padding: 4,
  },
  subIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    resizeMode: 'contain',
  },
});
