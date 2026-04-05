import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Calendar, Filter, Trash2 } from 'lucide-react-native';

export default function HistoryScreen() {
  const { transactions, deleteTransaction, showConfirm, showFeedback } = useAppContext();
  const navigation = useNavigation();

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

  // Simple Month filtering logic
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Handle month selection
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
    if (type === 'deposit') return <ArrowDownRight size={20} color="#10b981" />;
    return <ArrowUpRight size={20} color="#ef4444" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        {/* Empty block for flex balance */}
        <View style={{ width: 44 }} />
      </View>

      {/* FILTER CONTROL */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterNavBtn} onPress={() => changeMonth(-1)}>
          <ArrowLeft size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.filterBadge}>
          <Calendar size={18} color={theme.colors.primary} />
          <Text style={styles.filterBadgeText}>{months[selectedMonth]} {selectedYear}</Text>
        </View>

        <TouchableOpacity style={styles.filterNavBtn} onPress={() => changeMonth(1)}>
          <ArrowLeft size={20} color={theme.colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Filter size={48} color={theme.colors.border} />
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
                    isDeposit ? { backgroundColor: '#ecfdf5', borderColor: '#ecfdf5' } : { backgroundColor: '#fef2f2', borderColor: '#fef2f2' }
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
                  <Trash2 size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* BOTTOM SAFE AREA BUFFER */}
      {/* <View style={{ paddingBottom: Platform.OS === 'ios' ? 20 : 0 }}>
        <TouchableOpacity style={styles.homeFallbackBtn} onPress={() => navigation.navigate('Home' as never)}>
          <Text style={styles.homeFallbackText}>Back to Home Workspace</Text>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 0,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  filterNavBtn: {
    padding: 10,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  filterBadgeText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.primary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.textMuted,
    marginTop: 16,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  txIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  txTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.text,
  },
  txDate: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  txAmountPositive: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#10b981',
  },
  txAmountNegative: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#ef4444',
  },
  homeFallbackBtn: {
    margin: theme.spacing.lg,
    backgroundColor: theme.colors.border,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  homeFallbackText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    fontSize: 16,
  }
});
