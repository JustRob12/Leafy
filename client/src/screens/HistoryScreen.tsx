import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Calendar, Filter, Trash2 } from 'lucide-react-native';
import { useScrollHideTabBar } from '../hooks/useScrollHideTabBar';
import { useScrollToTop } from '@react-navigation/native';
import * as LucideIcons from 'lucide-react-native';
import { Image } from 'react-native';

const BRAND_LOGOS: { [key: string]: any } = {
  'gcash.png': require('../../public/walletimages/gcash.png'),
  'maya.png': require('../../public/walletimages/maya.png'),
  'paypal.png': require('../../public/walletimages/paypal.png'),
  'wise.png': require('../../public/walletimages/wise.png'),
  'maribank.png': require('../../public/walletimages/maribank.png'),
  'gotyme.png': require('../../public/walletimages/gotyme.png'),
};

const ICON_MAP: { [key: string]: any } = {
  Utensils: LucideIcons.Utensils,
  Car: LucideIcons.Car,
  Receipt: LucideIcons.Receipt,
  Heart: LucideIcons.Heart,
  ShoppingBag: LucideIcons.ShoppingBag,
  MoreHorizontal: LucideIcons.MoreHorizontal,
  Coffee: LucideIcons.Coffee,
  Home: LucideIcons.Home,
  Gift: LucideIcons.Gift,
  Smartphone: LucideIcons.Smartphone,
  Gamepad: LucideIcons.Gamepad,
  Briefcase: LucideIcons.Briefcase,
  Camera: LucideIcons.Camera,
  Film: LucideIcons.Film,
  Music: LucideIcons.Music,
  Globe: LucideIcons.Globe,
  Map: LucideIcons.Map,
  Search: LucideIcons.Search,
};

export default function HistoryScreen() {
  const { transactions, deleteTransaction, showConfirm, showFeedback, colors, isDarkMode, wallets } = useAppContext();
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
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');

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
      const matchesMonthYear = txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear;
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      return matchesMonthYear && matchesType;
    });
  }, [transactions, selectedMonth, selectedYear, typeFilter]);

  const formatTxDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getTxIcon = (tx: any) => {
    const isDeposit = tx.type === 'deposit';
    
    if (isDeposit) {
      const wallet = wallets.find(w => w.id === tx.walletId);
      if (wallet?.iconType === 'preset' && wallet.presetLogo) {
        return <Image source={BRAND_LOGOS[wallet.presetLogo]} style={styles.txBrandLogo as any} />;
      }
      return <LucideIcons.ArrowDownRight size={20} color={colors.success} />;
    } else {
      if (tx.icon && ICON_MAP[tx.icon]) {
        const IconComp = ICON_MAP[tx.icon];
        return <IconComp size={20} color={colors.danger} />;
      }
      return <LucideIcons.ArrowUpRight size={20} color={colors.danger} />;
    }
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

      {/* TYPE FILTER CHIPS */}
      <View style={styles.typeFilterRow}>
        <TouchableOpacity 
          style={[styles.typeChip, typeFilter === 'all' && styles.typeChipActiveAll]}
          onPress={() => setTypeFilter('all')}
        >
          <Text style={[styles.typeChipText, typeFilter === 'all' && styles.typeChipTextActive]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.typeChip, typeFilter === 'deposit' && styles.typeChipActiveDeposit]}
          onPress={() => setTypeFilter('deposit')}
        >
          <ArrowDownRight size={14} color={typeFilter === 'deposit' ? '#ffffff' : colors.success} style={{ marginRight: 4 }} />
          <Text style={[styles.typeChipText, typeFilter === 'deposit' && styles.typeChipTextActive]}>Deposits</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.typeChip, typeFilter === 'withdrawal' && styles.typeChipActiveWithdraw]}
          onPress={() => setTypeFilter('withdrawal')}
        >
          <ArrowUpRight size={14} color={typeFilter === 'withdrawal' ? '#ffffff' : colors.danger} style={{ marginRight: 4 }} />
          <Text style={[styles.typeChipText, typeFilter === 'withdrawal' && styles.typeChipTextActive]}>Withdrawals</Text>
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
                        { backgroundColor: colors.primary + '15', borderColor: colors.primary + '33' } : 
                        { backgroundColor: colors.danger + '15', borderColor: colors.danger + '33' }
                    ]}>
                    {getTxIcon(tx)}
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

const rf = (size: number) => Math.round(size * scale);

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
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  filterBadgeText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(14),
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
    fontSize: rf(16),
    color: colors.textMuted,
    marginTop: 16,
    textAlign: 'center',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
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
    fontSize: rf(14),
    color: colors.text,
  },
  txDate: {
    fontFamily: theme.fonts.regular,
    fontSize: rf(11),
    color: colors.textMuted,
    marginTop: 2,
  },
  txAmountPositive: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(15),
    color: colors.success,
  },
  txAmountNegative: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(15),
    color: colors.danger,
  },
  typeFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActiveAll: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipActiveDeposit: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  typeChipActiveWithdraw: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  typeChipText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
    color: colors.textMuted,
  },
  typeChipTextActive: {
    color: '#ffffff',
    fontFamily: theme.fonts.bold,
  },
  txBrandLogo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});
