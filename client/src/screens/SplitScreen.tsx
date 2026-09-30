import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import {
  ChevronLeft,
  Plus,
  GitFork,
  Zap,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  CreditCard,
} from 'lucide-react-native';
import { useAppContext, MoneySplitPlan, getWalletTotalBalanceInPhp } from '../context/AppContext';
import WalletBrandLogo from '../components/WalletBrandLogo';
import { rf, useResponsive } from '../utils/responsive';

export default function SplitScreen() {
  const navigation = useNavigation<any>();
  const { splits, wallets, executeSplit, deleteSplit, showConfirm, colors, isDarkMode, usdToPhpRate } = useAppContext();
  const { isTablet, isLandscape } = useResponsive();
  const styles = useMemo(() => getStyles(colors, isDarkMode, isTablet, isLandscape), [colors, isDarkMode, isTablet, isLandscape]);

  const totalSplitVolume = splits.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  const formatScheduleLabel = (plan: MoneySplitPlan) => {
    const s = plan.schedule;
    if (!s) return 'Flexible';

    if (s.type === 'once') {
      return s.date ? `Once: ${s.date}` : 'One-time Date';
    }
    if (s.type === 'weekly') {
      if (s.weeklyOption === 'weekdays') return 'Weekly: Weekdays (Mon - Fri)';
      if (s.weeklyOption === 'weekends') return 'Weekly: Weekends (Sat - Sun)';
      return `Weekly: Every ${s.weeklyOption || 'week'}`;
    }
    if (s.type === 'semi-monthly') {
      return s.dayOfMonth === 30 ? '15th & 30th (Payday Cycle)' : 'Every 15th of Month';
    }
    if (s.type === 'monthly') {
      return `Monthly: Day ${s.dayOfMonth || 1}`;
    }
    if (s.type === 'yearly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `Yearly: ${months[s.yearlyMonth ?? 0]} ${s.yearlyDay || 1}`;
    }
    return 'Recurring Schedule';
  };

  const handleExecute = (plan: MoneySplitPlan) => {
    const sourceWallet = wallets.find(w => w.id === plan.sourceWalletId);
    const totalAllocated = plan.splits.reduce((sum, sp) => sum + (sp.amount || 0), 0);
    const sym = plan.currency === 'USD' ? '$' : '₱';

    showConfirm(
      'Execute Split Now?',
      `Deduct ${sym}${totalAllocated.toLocaleString()} from ${sourceWallet?.name || 'source wallet'} and transfer across ${plan.splits.length} destination accounts? Transactions will be recorded immediately.`,
      async () => {
        await executeSplit(plan.id);
      },
      false,
      'Approve',
      'check'
    );
  };

  const handleDelete = (plan: MoneySplitPlan) => {
    showConfirm(
      'Delete Split Plan?',
      `Are you sure you want to remove "${plan.title}"? Previous recorded transactions will not be affected.`,
      async () => {
        await deleteSplit(plan.id);
      },
      true,
      'Delete',
      'trash'
    );
  };

  const formatTimestamp = (isoDate?: string) => {
    if (!isoDate) return null;
    const d = new Date(isoDate);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${day} ${month} ${year} • ${time}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.responsiveWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ChevronLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Money Split</Text>
          <TouchableOpacity
            style={styles.newSplitBtn}
            onPress={() => navigation.navigate('AddSplit')}
            activeOpacity={0.8}
          >
            <Plus size={14} color="#ffffff" style={{ marginRight: 3 }} />
            <Text style={styles.newSplitBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroIconBox}>
                <GitFork size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroSubTitle}>TOTAL ACTIVE SPLITS</Text>
                <Text style={styles.heroTotalAmount}>₱{totalSplitVolume.toLocaleString()}</Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{splits.length} {splits.length === 1 ? 'Plan' : 'Plans'}</Text>
              </View>
            </View>
            <Text style={styles.heroDescription}>
              Allocate funds from your income wallet directly into multiple destination accounts (like GCash, GoTyme, etc.) with automatic transaction deduction.
            </Text>
          </View>

          {/* Splits List */}
          {splits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <GitFork size={32} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No Split Plans Yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first split plan to automatically distribute salary or money into GCash, GoTyme, or savings accounts with live transaction logging.
              </Text>
              <TouchableOpacity
                style={styles.createFirstBtn}
                onPress={() => navigation.navigate('AddSplit')}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#ffffff" style={{ marginRight: 5 }} />
                <Text style={styles.createFirstBtnText}>Create First Split Plan</Text>
              </TouchableOpacity>
            </View>
          ) : (
            splits.map((plan) => {
              const sourceWallet = wallets.find(w => w.id === plan.sourceWalletId);
              const sourceBal = sourceWallet ? getWalletTotalBalanceInPhp(sourceWallet, usdToPhpRate) : 0;
              const totalAllocated = plan.splits.reduce((sum, sp) => sum + (sp.amount || 0), 0);
              const remaining = Math.max(0, plan.totalAmount - totalAllocated);
              const sym = plan.currency === 'USD' ? '$' : '₱';
              const sliceColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

              return (
                <View key={plan.id} style={styles.planCard}>
                  {/* Plan Card Header */}
                  <View style={styles.planCardHeader}>
                    <View style={styles.planHeaderInfo}>
                      <Text style={styles.planTitle} numberOfLines={1}>{plan.title}</Text>
                      <View style={styles.scheduleBadgeRow}>
                        <Clock size={11} color={colors.primary} style={{ marginRight: 4 }} />
                        <Text style={styles.scheduleBadgeText} numberOfLines={1}>{formatScheduleLabel(plan)}</Text>
                      </View>
                    </View>
                    <View style={styles.planAmountBox}>
                      <Text style={styles.planTotalText}>{sym}{plan.totalAmount.toLocaleString()}</Text>
                      <Text style={styles.planTotalSub}>Total Budget</Text>
                    </View>
                  </View>

                  {/* Source Wallet Bar */}
                  <View style={styles.sourceWalletRow}>
                    <Text style={styles.sourceLabel}>FROM SOURCE:</Text>
                    <View style={styles.sourceWalletPill}>
                      {sourceWallet?.presetLogo ? (
                        <WalletBrandLogo logoKey={sourceWallet.presetLogo} size={15} style={{ marginRight: 5 }} />
                      ) : (
                        <CreditCard size={13} color={colors.primary} style={{ marginRight: 5 }} />
                      )}
                      <Text style={styles.sourceWalletName} numberOfLines={1}>{sourceWallet?.name || 'Source Wallet'}</Text>
                      <Text style={styles.sourceWalletBal}>(₱{Math.floor(sourceBal).toLocaleString()})</Text>
                    </View>
                  </View>

                  {/* Segmented Progress Bar */}
                  <View style={styles.segmentedBar}>
                    {plan.splits.map((sp, idx) => {
                      const pct = plan.totalAmount > 0 ? (sp.amount / plan.totalAmount) * 100 : 0;
                      return (
                        <View
                          key={sp.id}
                          style={{
                            height: '100%',
                            width: `${Math.min(100, pct)}%`,
                            backgroundColor: sliceColors[idx % sliceColors.length],
                          }}
                        />
                      );
                    })}
                    {remaining > 0 && (
                      <View
                        style={{
                          height: '100%',
                          width: `${(remaining / plan.totalAmount) * 100}%`,
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
                        }}
                      />
                    )}
                  </View>

                  {/* Split Destination Items Breakdown */}
                  <View style={styles.breakdownList}>
                    {plan.splits.map((sp, idx) => {
                      const destWallet = wallets.find(w => w.id === sp.walletId);
                      return (
                        <View key={sp.id} style={styles.breakdownItem}>
                          <View style={styles.breakdownLeft}>
                            <View style={[styles.destDot, { backgroundColor: sliceColors[idx % sliceColors.length] }]} />
                            {destWallet?.presetLogo ? (
                              <WalletBrandLogo logoKey={destWallet.presetLogo} size={16} style={{ marginRight: 6 }} />
                            ) : (
                              <CreditCard size={13} color={colors.text} style={{ marginRight: 6 }} />
                            )}
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <Text style={styles.destName} numberOfLines={1}>{destWallet?.name || 'Destination'}</Text>
                              {sp.note ? <Text style={styles.destNote} numberOfLines={1}>{sp.note}</Text> : null}
                            </View>
                          </View>
                          <Text style={styles.destAmount}>{sym}{sp.amount.toLocaleString()}</Text>
                        </View>
                      );
                    })}

                    {/* Remaining kept in source wallet */}
                    <View style={[styles.breakdownItem, styles.breakdownRemainingItem]}>
                      <View style={styles.breakdownLeft}>
                        <View style={[styles.destDot, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.3)' : '#94a3b8' }]} />
                        <Text style={styles.remainingLabel} numberOfLines={1}>Stays in {sourceWallet?.name || 'Source'}</Text>
                      </View>
                      <Text style={styles.remainingAmount}>{sym}{remaining.toLocaleString()}</Text>
                    </View>
                  </View>

                  {/* Last Execution Info */}
                  <View style={styles.lastExecutionBanner}>
                    {plan.lastExecutedAt ? (
                      <>
                        <Zap size={12} color="#10b981" style={{ marginRight: 5 }} />
                        <Text style={styles.lastExecutedText} numberOfLines={1}>
                          Last Executed: {formatTimestamp(plan.lastExecutedAt)}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} color={colors.primary} style={{ marginRight: 5 }} />
                        <Text style={styles.lastExecutedText}>Ready to execute</Text>
                      </>
                    )}
                  </View>

                  {/* Card Actions */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.executeCardBtn}
                      onPress={() => handleExecute(plan)}
                      activeOpacity={0.8}
                    >
                      <Zap size={14} color="#ffffff" style={{ marginRight: 5 }} />
                      <Text style={styles.executeCardBtnText}>Execute Split</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={() => navigation.navigate('AddSplit', { splitPlan: plan })}
                      activeOpacity={0.7}
                    >
                      <Edit2 size={15} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.iconActionBtn, styles.deleteActionBtn]}
                      onPress={() => handleDelete(plan)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={15} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
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
    newSplitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 18,
    },
    newSplitBtnText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(12),
      color: '#ffffff',
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    heroHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    heroIconBox: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    heroSubTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(10),
      letterSpacing: 0.6,
      color: colors.textMuted,
    },
    heroTotalAmount: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(19),
      color: colors.text,
      marginTop: 1,
    },
    heroBadge: {
      backgroundColor: colors.primary + '18',
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 10,
    },
    heroBadgeText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(10.5),
      color: colors.primary,
    },
    heroDescription: {
      fontFamily: theme.fonts.regular,
      fontSize: rf(11.5),
      color: colors.textMuted,
      lineHeight: 16,
    },
    emptyContainer: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 16,
    },
    emptyIconBox: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    emptyTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(16),
      color: colors.text,
      marginBottom: 5,
    },
    emptySubtitle: {
      fontFamily: theme.fonts.regular,
      fontSize: rf(12),
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 17,
      marginBottom: 16,
    },
    createFirstBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 14,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 6,
      elevation: 3,
    },
    createFirstBtnText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(13),
      color: '#ffffff',
    },
    planCard: {
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
    planCardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    planHeaderInfo: {
      flex: 1,
      marginRight: 10,
    },
    planTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(14.5),
      color: colors.text,
      marginBottom: 3,
    },
    scheduleBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    scheduleBadgeText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: rf(11),
      color: colors.primary,
    },
    planAmountBox: {
      alignItems: 'flex-end',
    },
    planTotalText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(15),
      color: colors.text,
    },
    planTotalSub: {
      fontFamily: theme.fonts.regular,
      fontSize: rf(10),
      color: colors.textMuted,
    },
    sourceWalletRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 10,
    },
    sourceLabel: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(9.5),
      color: colors.textMuted,
      letterSpacing: 0.5,
    },
    sourceWalletPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      maxWidth: '100%',
    },
    sourceWalletName: {
      fontFamily: theme.fonts.semiBold,
      fontSize: rf(11.5),
      color: colors.text,
      marginRight: 4,
      flexShrink: 1,
    },
    sourceWalletBal: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(10.5),
      color: colors.textMuted,
    },
    segmentedBar: {
      flexDirection: 'row',
      height: 7,
      borderRadius: 4,
      overflow: 'hidden',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
      marginBottom: 12,
    },
    breakdownList: {
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
      borderRadius: 14,
      padding: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    breakdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 5,
    },
    breakdownRemainingItem: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 3,
      paddingTop: 7,
    },
    breakdownLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
      minWidth: 0,
    },
    destDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      marginRight: 7,
    },
    destName: {
      fontFamily: theme.fonts.semiBold,
      fontSize: rf(12),
      color: colors.text,
    },
    destNote: {
      fontFamily: theme.fonts.regular,
      fontSize: rf(10),
      color: colors.textMuted,
    },
    destAmount: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(12),
      color: colors.text,
      marginLeft: 8,
    },
    remainingLabel: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(11.5),
      color: colors.textMuted,
      flexShrink: 1,
    },
    remainingAmount: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(12),
      color: '#10b981',
      marginLeft: 8,
    },
    lastExecutionBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 2,
    },
    lastExecutedText: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(10.5),
      color: colors.textMuted,
      flex: 1,
    },
    cardActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    executeCardBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#10b981',
      paddingVertical: 9,
      borderRadius: 12,
      shadowColor: '#10b981',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 2,
    },
    executeCardBtnText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(12),
      color: '#ffffff',
    },
    iconActionBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteActionBtn: {
      backgroundColor: '#fee2e2',
      borderColor: '#fca5a5',
    },
  });
