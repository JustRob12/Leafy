import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Calendar, Filter, Trash2 } from 'lucide-react-native';
import { useScrollHideTabBar } from '../hooks/useScrollHideTabBar';
import { useScrollToTop } from '@react-navigation/native';

export default function HistoryScreen() {
  const { transactions, deleteTransaction, showConfirm, showFeedback, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const { handleScroll } = useScrollHideTabBar();
  const scrollViewRef = React.useRef<ScrollView>(null);
  useScrollToTop(scrollViewRef);

  const handleDeleteTx = (id: string, name: string) => {
    showConfirm(
      "Delete Transaction",
      `Are you sure you want to delete "${name}"?`,
      () => {
        deleteTransaction(id);
        showFeedback('delete', 'Transaction Removed');
      }
    );
  };

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const changeMonth = (diff: number) => {
    let newMonth = selectedMonth + diff;
    let newYear = selectedYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const formatTxDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getTxIcon = (type: string) => {
    if (type === 'deposit') return <ArrowDownRight size={20} color={colors.success} />;
    return <ArrowUpRight size={20} color={colors.danger} />;
  };

  return (
    <View style={styles.container}>
      {/* FILTER CONTROL */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterNavBtn} onPress={() => changeMonth(-1)}>
          <ArrowLeft size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.filterBadge}>
          <Calendar size={18} color={colors.primary} />
          <Text style={styles.filterBadgeText}>{months[selectedMonth]} {selectedYear}</Text>
        </View>

        <TouchableOpacity style={styles.filterNavBtn} onPress={() => changeMonth(1)}>
          <ArrowLeft size={20} color={colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Filter size={48} color={colors.border} />
            <Text style={styles.emptyStateText}>No transactions found for {months[selectedMonth]} {selectedYear}.</Text>
          </View>
        ) : (
          filteredTransactions.map(tx => {
            const isDeposit = tx.type === 'deposit';
            return (
              <View key={tx.id} style={styles.txItem}>
                <View style={styles.txLeft}>
                  <View style={[
                    styles.txIconWrapper,
                    isDeposit ? 
                      { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5' } : 
                      { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2' }
                  ]}>
                    {getTxIcon(tx.type)}
                  </View>
                  <View>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txDate}>{formatTxDate(tx.date)}</Text>
                    <Text style={[isDeposit ? styles.txAmountPositive : styles.txAmountNegative, { marginTop: 4 }]}>
                      {isDeposit ? '+' : '-'}₱{tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteTx(tx.id, tx.title)}>
                  <Trash2 size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: colors.background,
  },
  filterNavBtn: {
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#a7f3d0',
  },
  filterBadgeText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 140,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 16,
    textAlign: 'center',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: theme.spacing.md,
    borderRadius: 16,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  txIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  txTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  txDate: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  txAmountPositive: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.success,
  },
  txAmountNegative: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.danger,
  },
});
