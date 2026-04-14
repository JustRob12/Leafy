import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../theme';
import { ChevronLeft, ChevronRight, Calculator, Calendar as CalendarIcon, ArrowDownRight, ArrowUpRight } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 7;

export default function CalendarScreen() {
  const { transactions, wallets, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const daysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDayTransactions = (day: number) => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getDate() === day &&
             txDate.getMonth() === month &&
             txDate.getFullYear() === year;
    });
  };

  const getDayStatus = (day: number) => {
    const dayTransactions = getDayTransactions(day);
    if (dayTransactions.length === 0) return null;

    const hasDeposit = dayTransactions.some(tx => tx.type === 'deposit');
    const hasWithdrawal = dayTransactions.some(tx => tx.type === 'withdrawal');

    if (hasDeposit && hasWithdrawal) return 'mixed';
    if (hasDeposit) return 'deposit';
    if (hasWithdrawal) return 'withdrawal';
    return null;
  };

  const renderDays = () => {
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);
    const days = [];

    // Empty spots for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      const status = getDayStatus(d);
      const isToday = d === new Date().getDate() && 
                      month === new Date().getMonth() && 
                      year === new Date().getFullYear();

      days.push(
        <TouchableOpacity 
          key={d} 
          style={styles.dayCell}
          onPress={() => {
            const date = new Date(year, month, d);
            setSelectedDate(date);
            setIsModalVisible(true);
          }}
        >
          <View style={[
            styles.dayCircle,
            isToday && styles.todayCircle,
            status === 'deposit' && styles.depositCircle,
            status === 'withdrawal' && styles.withdrawalCircle,
            status === 'mixed' && styles.mixedCircle,
          ]}>
            <Text style={[
              styles.dayText,
              isToday && styles.todayText,
              !!status && styles.activeDayText
            ]}>{d}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const selectedTransactions = selectedDate 
    ? getDayTransactions(selectedDate.getDate())
    : [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER MINI CARD */}
        <View style={styles.calendarHeaderCard}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.monthInfo}>
            <Text style={styles.monthText}>{monthNames[month]}</Text>
            <Text style={styles.yearText}>{year}</Text>
          </View>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* CALENDAR GRID */}
        <View style={styles.calendarBody}>
          <View style={styles.weekRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <View key={i} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {renderDays()}
          </View>
        </View>

        {/* LEGEND */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Savings</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.legendText}>Withdraw</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.legendText}>Both</Text>
          </View>
        </View>

      </ScrollView>

      {/* TRANSACTION MODAL */}
      <ActionSheet 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)}
        title={selectedDate ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` : 'Transactions'}
      >
        {selectedTransactions.length === 0 ? (
          <View style={styles.emptyTransactions}>
            <Text style={styles.emptyText}>No activity on this day.</Text>
          </View>
        ) : (
          selectedTransactions.map(tx => {
            const isDeposit = tx.type === 'deposit';
            const wallet = wallets.find(w => w.id === tx.walletId);
            return (
              <View key={tx.id} style={styles.txItem}>
                <View style={styles.txLeft}>
                  <View style={[
                    styles.txIconWrapper,
                    isDeposit ? 
                      { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5' } : 
                      { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }
                  ]}>
                    {isDeposit ? <ArrowDownRight size={18} color={colors.success} /> : <ArrowUpRight size={18} color={colors.danger} />}
                  </View>
                  <View>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txWallet}>{wallet?.name || 'Unknown Wallet'}</Text>
                  </View>
                </View>
                <Text style={[
                  styles.txAmount,
                  isDeposit ? styles.txAmountPositive : styles.txAmountNegative
                ]}>
                  {isDeposit ? '+' : '-'}₱{tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            );
          })
        )}
      </ActionSheet>
    </View>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  calendarHeaderCard: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.05,
    shadowRadius: 10,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
  },
  monthInfo: {
    alignItems: 'center',
  },
  monthText: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  yearText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  calendarBody: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.3 : 0.03,
    shadowRadius: 15,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: theme.spacing.sm,
  },
  dayHeader: {
    width: COLUMN_WIDTH,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  activeDayText: {
    color: '#ffffff',
    fontFamily: theme.fonts.bold,
  },
  todayCircle: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  todayText: {
    color: colors.primary,
    fontFamily: theme.fonts.bold,
  },
  depositCircle: {
    backgroundColor: colors.success,
  },
  withdrawalCircle: {
    backgroundColor: colors.danger,
  },
  mixedCircle: {
    backgroundColor: colors.warning,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: theme.spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  emptyTransactions: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: theme.fonts.medium,
    color: colors.textMuted,
    fontSize: 15,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  txWallet: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  txAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
  },
  txAmountPositive: {
    color: colors.success,
  },
  txAmountNegative: {
    color: colors.danger,
  },
});
