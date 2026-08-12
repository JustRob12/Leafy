import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { 
  ChevronLeft, 
  Plus, 
  Layers, 
  Calendar, 
  CreditCard, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Zap
} from 'lucide-react-native';
import { useAppContext, InstallmentType } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const rf = (size: number) => Math.round(size * scale);

export default function InstallmentScreen() {
  const { 
    installments, 
    deleteInstallment, 
    payInstallmentMonth, 
    showConfirm, 
    colors, 
    isDarkMode,
    usdToPhpRate,
    wallets
  } = useAppContext();
  
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');

  const getDaysRemaining = (dueDateStr: string) => {
    if (!dueDateStr) return 999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredInstallments = installments.filter(item => {
    const isCompleted = item.paidMonths >= item.monthsToPay;
    if (filter === 'active') return !isCompleted;
    if (filter === 'completed') return isCompleted;
    return true;
  });

  const activeInstallments = installments.filter(i => i.paidMonths < i.monthsToPay);
  
  const totalMonthlyPhp = activeInstallments.reduce((sum, item) => {
    const amountInPhp = item.currency === 'USD' ? item.monthlyAmount * usdToPhpRate : item.monthlyAmount;
    return sum + amountInPhp;
  }, 0);

  const totalRemainingPhp = activeInstallments.reduce((sum, item) => {
    const remainingMonths = Math.max(0, item.monthsToPay - item.paidMonths);
    const remainingVal = remainingMonths * item.monthlyAmount;
    return sum + (item.currency === 'USD' ? remainingVal * usdToPhpRate : remainingVal);
  }, 0);

  const handleDelete = (item: InstallmentType) => {
    showConfirm(
      "Delete Installment",
      `Are you sure you want to remove "${item.productName}"?`,
      () => deleteInstallment(item.id),
      true
    );
  };

  const handlePayMonth = (item: InstallmentType) => {
    showConfirm(
      "Pay Monthly Installment",
      `Pay month ${item.paidMonths + 1} of ${item.monthsToPay} (${item.currency === 'USD' ? '$' : '₱'}${item.monthlyAmount.toLocaleString()}) for "${item.productName}"?`,
      () => payInstallmentMonth(item.id)
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Installments</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddInstallment')} 
          style={[styles.addHeaderBtn, { backgroundColor: colors.primary }]}
        >
          <Plus size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary Card Banner */}
        <LinearGradient
          colors={isDarkMode ? ['#0f172a', '#1e293b'] : ['#059669', '#10b981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryBanner}
        >
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.summaryLabel}>TOTAL MONTHLY OBLIGATION</Text>
              <Text style={styles.summaryMainVal}>
                ₱{totalMonthlyPhp.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.summaryIconCircle}>
              <Layers size={22} color="#ffffff" />
            </View>
          </View>

          <View style={styles.summaryBottomRow}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Remaining Balance</Text>
              <Text style={styles.summaryStatVal}>
                ₱{totalRemainingPhp.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Text>
            </View>
            <View style={styles.summaryStatDivider} />
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Active Plans</Text>
              <Text style={styles.summaryStatVal}>{activeInstallments.length}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterTab, filter === 'active' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterTabText, filter === 'active' ? { color: '#FFF' } : { color: colors.textMuted }]}>
              Active ({activeInstallments.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, filter === 'completed' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterTabText, filter === 'completed' ? { color: '#FFF' } : { color: colors.textMuted }]}>
              Completed ({installments.length - activeInstallments.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, filter === 'all' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' ? { color: '#FFF' } : { color: colors.textMuted }]}>
              All ({installments.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Installment List */}
        {filteredInstallments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Layers size={48} color={colors.textMuted + '66'} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Installments Found</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Tap the + button to record your products, monthly payments, and due dates.
            </Text>
            <TouchableOpacity 
              style={[styles.emptyAddBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AddInstallment')}
            >
              <Plus size={18} color="#ffffff" />
              <Text style={styles.emptyAddBtnText}>Add First Installment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredInstallments.map((item) => {
              const daysRemaining = getDaysRemaining(item.dueDate);
              const isCompleted = item.paidMonths >= item.monthsToPay;
              const isUrgent = !isCompleted && daysRemaining <= 3;
              const progressPct = Math.min(1, item.paidMonths / item.monthsToPay);

              if (isUrgent) {
                return (
                  <LinearGradient
                    key={item.id}
                    colors={['#ef4444', '#dc2626', '#991b1b']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardUrgentGradient}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.cardTitleBox}>
                        <Text style={styles.urgentBadgeText}>
                          🚨 DUE IN {daysRemaining <= 0 ? 'TODAY' : `${daysRemaining} DAYS`}
                        </Text>
                        <Text style={styles.cardProductNameWhite}>{item.productName}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtnUrgent}>
                        <Trash2 size={18} color="rgba(255, 255, 255, 0.9)" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardBodyRow}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.cardSubLabelWhite}>Monthly Payment</Text>
                        <Text 
                          style={styles.cardAmountWhite}
                          numberOfLines={1}
                          adjustsFontSizeToFit={true}
                          minimumFontScale={0.5}
                        >
                          {item.currency === 'USD' ? '$' : '₱'}{item.monthlyAmount.toLocaleString()}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end', flex: 1 }}>
                        <Text style={styles.cardSubLabelWhite}>Total ({item.monthsToPay} mos)</Text>
                        <Text 
                          style={styles.cardTotalWhite}
                          numberOfLines={1}
                          adjustsFontSizeToFit={true}
                          minimumFontScale={0.5}
                        >
                          {item.currency === 'USD' ? '$' : '₱'}{item.totalAmount.toLocaleString()}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressSection}>
                      <View style={styles.progressRowLabels}>
                        <Text style={styles.progressLabelWhite}>
                          Paid: {item.paidMonths} / {item.monthsToPay} Months
                        </Text>
                        <Text style={styles.progressLabelWhite}>
                          {Math.round(progressPct * 100)}%
                        </Text>
                      </View>
                      <View style={styles.progressBarTrackWhite}>
                        <View style={[styles.progressBarFillWhite, { width: `${progressPct * 100}%` }]} />
                      </View>
                    </View>

                    {/* Due Date & Status */}
                    <View style={styles.cardFooterRow}>
                      <View style={styles.dueDateBadgeUrgent}>
                        <Calendar size={14} color="#ffffff" />
                        <Text style={styles.dueDateTextUrgent}>Due: {item.dueDate}</Text>
                      </View>

                      {item.walletId ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                          <Zap size={13} color="#ffffff" />
                          <Text style={{ fontFamily: theme.fonts.bold, fontSize: rf(11), color: '#ffffff' }}>Auto-Deducting</Text>
                        </View>
                      ) : (
                        <TouchableOpacity 
                          onPress={() => handlePayMonth(item)}
                          activeOpacity={0.8}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        >
                          <Text style={{ fontFamily: theme.fonts.bold, fontSize: rf(12), color: '#ffffff', textDecorationLine: 'underline' }}>
                            Mark Month Paid ›
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </LinearGradient>
                );
              }

              return (
                <View 
                  key={item.id}
                  style={[
                    styles.cardStandard, 
                    { 
                      backgroundColor: colors.card, 
                      borderColor: isCompleted ? colors.border : colors.border,
                      opacity: isCompleted ? 0.75 : 1
                    }
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardTitleBox}>
                      <View style={styles.titleIconRow}>
                        <View style={[styles.iconBox, { backgroundColor: isCompleted ? colors.border : colors.primary + '20' }]}>
                          <Layers size={18} color={isCompleted ? colors.textMuted : colors.primary} />
                        </View>
                        <View>
                          <Text style={[styles.cardProductName, { color: colors.text }]}>{item.productName}</Text>
                          {isCompleted ? (
                            <View style={styles.completedBadge}>
                              <CheckCircle2 size={12} color="#10b981" />
                              <Text style={styles.completedBadgeText}>Fully Paid</Text>
                            </View>
                          ) : (
                            <Text style={[styles.cardDueDateSub, { color: colors.textMuted }]}>
                              Due on {item.dueDate}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                      <Trash2 size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardBodyRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.cardSubLabel, { color: colors.textMuted }]}>Monthly Payment</Text>
                      <Text 
                        style={[styles.cardAmount, { color: colors.primary }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.5}
                      >
                        {item.currency === 'USD' ? '$' : '₱'}{item.monthlyAmount.toLocaleString()}
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end', flex: 1 }}>
                      <Text style={[styles.cardSubLabel, { color: colors.textMuted }]}>Total Cost</Text>
                      <Text 
                        style={[styles.cardTotal, { color: colors.text }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.5}
                      >
                        {item.currency === 'USD' ? '$' : '₱'}{item.totalAmount.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressRowLabels}>
                      <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                        Progress ({item.paidMonths}/{item.monthsToPay} mos)
                      </Text>
                      <Text style={[styles.progressLabel, { color: colors.text }]}>
                        {Math.round(progressPct * 100)}%
                      </Text>
                    </View>
                    <View style={[styles.progressBarTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
                      <View style={[styles.progressBarFill, { width: `${progressPct * 100}%`, backgroundColor: isCompleted ? '#10b981' : colors.primary }]} />
                    </View>
                  </View>

                  {/* Footer Status & Actions */}
                  {!isCompleted && (
                    <View style={styles.cardFooterRowStandard}>
                      <View style={{ flex: 1 }}>
                        {item.walletId ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Zap size={14} color={colors.primary} />
                            <Text style={[styles.remainingText, { color: colors.primary, fontFamily: theme.fonts.bold }]}>
                              Auto-Deduct ({wallets.find(w => w.id === item.walletId)?.name || 'Wallet'})
                            </Text>
                          </View>
                        ) : (
                          <Text style={[styles.remainingText, { color: colors.textMuted }]}>
                            {item.monthsToPay - item.paidMonths} months remaining
                          </Text>
                        )}
                      </View>

                      <TouchableOpacity 
                        onPress={() => handlePayMonth(item)}
                        style={{ paddingVertical: 4, paddingHorizontal: 6 }}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontFamily: theme.fonts.semiBold, fontSize: rf(12), color: colors.primary }}>
                          Mark Paid ›
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  addHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  summaryBanner: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(10),
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  summaryMainVal: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(24),
    color: '#ffffff',
  },
  summaryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  summaryStatItem: {
    flex: 1,
  },
  summaryStatLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  summaryStatVal: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(15),
    color: '#ffffff',
  },
  summaryStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  filterTabText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(12),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
    marginTop: 16,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(13),
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  emptyAddBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
    color: '#ffffff',
  },
  listContainer: {
    gap: 16,
  },
  cardUrgentGradient: {
    borderRadius: 24,
    padding: 20,
    elevation: 6,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  urgentBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(10),
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardProductNameWhite: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
    color: '#ffffff',
  },
  deleteBtnUrgent: {
    padding: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardTitleBox: {
    flex: 1,
  },
  cardSubLabelWhite: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardAmountWhite: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(20),
    color: '#ffffff',
  },
  cardTotalWhite: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(15),
    color: '#ffffff',
  },
  cardBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressRowLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabelWhite: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressBarTrackWhite: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
  },
  progressBarFillWhite: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  dueDateBadgeUrgent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueDateTextUrgent: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
    color: '#ffffff',
  },
  payBtnUrgent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  payBtnTextUrgent: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(13),
    color: '#dc2626',
  },
  cardStandard: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
  },
  titleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardProductName: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(16),
  },
  cardDueDateSub: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
    marginTop: 2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  completedBadgeText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(11),
    color: '#10b981',
  },
  deleteBtn: {
    padding: 6,
  },
  cardSubLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
  },
  cardAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
  },
  cardTotal: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
  },
  progressLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardFooterRowStandard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  remainingText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
  },
  payBtnStandard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  payBtnTextStandard: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(12),
    color: '#ffffff',
  },
});
