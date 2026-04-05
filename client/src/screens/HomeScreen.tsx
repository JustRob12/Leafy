import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Dimensions, Alert } from 'react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, TrendingUp, ArrowDownRight, Bell, Target, Plus, X, ArrowUpRight, Trash2, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import ActionSheet from '../components/ActionSheet';
import WalletDropdown from '../components/WalletDropdown';

export default function HomeScreen() {
  const { username, totalBalance, wallets, transactions, addTransaction, deleteTransaction, showFeedback, showConfirm, goals } = useAppContext();
  const navigation = useNavigation<any>();

  const [savingsModalVisible, setSavingsModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);

  const [amount, setAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  const handleTransaction = async (type: 'deposit' | 'withdrawal') => {
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount > 0 && selectedWalletId) {
      await addTransaction({
        title: type === 'deposit' ? 'Added Savings' : 'Withdrawal',
        amount: numericAmount,
        type: type,
        walletId: selectedWalletId
      });
      setAmount('');
      setSelectedWalletId(null);
      setSavingsModalVisible(false);
      setWithdrawModalVisible(false);
      showFeedback('success', type === 'deposit' ? 'Successfully Deposited' : 'Successfully Withdrawn');
    }
  };

  const handleDeleteTx = (id: string, title: string) => {
    showConfirm(
      "Delete Transaction",
      `Delete "${title}"? This will reverse the wallet balance.`,
      () => {
        deleteTransaction(id);
        showFeedback('delete', 'Transaction Removed');
      }
    );
  };

  const getTxIcon = (type: string) => {
    if (type === 'deposit') return <ArrowDownRight size={18} color={theme.colors.primary} />;
    return <ArrowUpRight size={18} color="#ef4444" />;
  };

  const formatTxDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const day = d.toLocaleDateString(undefined, { weekday: 'short' });
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${day}, ${time}`;
    } catch {
      return '';
    }
  };

  const monthlySpent = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {username || 'Alex'}</Text>
            <Text style={styles.subtitle}>Welcome back</Text>
          </View>
          {/* <TouchableOpacity style={styles.notificationBtn}>
            <Bell size={20} color={theme.colors.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity> */}
        </View>

        {/* PREMIUM BALANCE CARD (Glass Green Palette) */}
        <View style={styles.premiumCard}>
          <View style={styles.glowEffect} />
          <View style={styles.premiumCardTop}>
            <Text style={styles.premiumLabel}>Total Balance</Text>
            {/* <View style={styles.badgePremium}>
              <TrendingUp size={14} color="#064e3b" />
              <Text style={styles.badgePremiumText}>Active</Text>
            </View> */}
          </View>
          <Text style={styles.premiumAmount}>₱{totalBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>

          <View style={styles.dividerLight} />

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardFooterLabel}>Monthly Spent</Text>
              <Text style={styles.cardFooterValue}>₱{monthlySpent.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardFooterLabel}>Available</Text>
              <Text style={styles.cardFooterValue}>₱{totalBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Wallets')}>
            <View style={styles.actionIconBorder}>
              <Wallet size={20} color={theme.colors.text} />
            </View>
            <Text style={styles.actionText}>Wallets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => setSavingsModalVisible(true)}>
            <View style={styles.actionIconBorder}>
              <Plus size={20} color={theme.colors.text} />
            </View>
            <Text style={styles.actionText}>Add Savings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => setWithdrawModalVisible(true)}>
            <View style={styles.actionIconBorder}>
              <ArrowUpRight size={20} color={theme.colors.text} />
            </View>
            <Text style={styles.actionText}>Withdraw</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Goals')}>
            <View style={styles.actionIconBorder}>
              <Target size={20} color={theme.colors.text} />
            </View>
            <Text style={styles.actionText}>Add Goal</Text>
          </TouchableOpacity>
        </View>

        {/* ACTIVE GOALS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
            <Text style={styles.seeAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyGoalCard}>
            <Text style={styles.emptyGoalText}>You have no Goal yet</Text>
            <TouchableOpacity style={styles.emptyGoalBtn} onPress={() => navigation.navigate('Goals')}>
              <Text style={styles.emptyGoalBtnText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.goalsList}>
            {goals.slice(0, 3).map(goal => {
              const linkedWallet = wallets.find(w => w.id === goal.walletId);
              const currentAmount = linkedWallet ? linkedWallet.balance : 0;
              const progress = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0;

              return (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalRow}>
                    <View style={styles.goalLeft}>
                      <View style={styles.goalIconWrapper}>
                        <Target size={20} color={theme.colors.primary} />
                      </View>
                      <View>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                        <Text style={styles.goalAmountText}>₱{currentAmount.toLocaleString('en-PH', { minimumFractionDigits: 0 })} / ₱{goal.targetAmount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</Text>
                      </View>
                    </View>
                    <Text style={styles.goalPercentage}>{Math.round(Math.min(progress, 100))}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${Math.max(0, Math.min(progress, 100))}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* RECENT TRANSACTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {transactions.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontFamily: theme.fonts.medium, color: theme.colors.textMuted }}>No recent transactions.</Text>
            </View>
          ) : (
            transactions.slice(0, 3).map(tx => {
              const isDeposit = tx.type === 'deposit';
              return (
                <View key={tx.id} style={styles.txItem}>
                  <View style={styles.txLeft}>
                    <View>
                      <Text style={styles.txTitle}>{tx.title}</Text>
                      <Text style={styles.txDate}>{formatTxDate(tx.date)}</Text>
                      <Text style={[isDeposit ? styles.txAmountPositive : styles.txAmountNegative, { marginTop: 4 }]}>
                        {isDeposit ? '+' : '-'}₱{tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={[
                      styles.txIconWrapper,
                      isDeposit ? { backgroundColor: '#ecfdf5', borderColor: '#ecfdf5' } : { backgroundColor: '#fef2f2', borderColor: '#fef2f2' }
                    ]}>
                      {getTxIcon(tx.type)}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <ActionSheet
        visible={savingsModalVisible || withdrawModalVisible}
        onClose={() => { setSavingsModalVisible(false); setWithdrawModalVisible(false); }}
        title={savingsModalVisible ? 'Add Savings' : 'Withdraw Funds'}
      >
        {wallets.length === 0 ? (
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <Text style={{ fontFamily: theme.fonts.medium, color: theme.colors.textMuted }}>You need a wallet to {savingsModalVisible ? 'add savings' : 'withdraw funds'}.</Text>
            <TouchableOpacity style={styles.saveBtn} onPress={() => { setSavingsModalVisible(false); setWithdrawModalVisible(false); navigation.navigate('Wallets'); }}>
              <Text style={styles.saveBtnText}>Go Create Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.inputLabel}>Select Wallet</Text>
            <WalletDropdown
              selectedWalletId={selectedWalletId}
              onSelectWallet={setSelectedWalletId}
            />

            <Text style={styles.inputLabel}>Amount (₱)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 500"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!selectedWalletId || isNaN(parseFloat(amount))) && styles.saveBtnDisabled,
                withdrawModalVisible && !(!selectedWalletId || isNaN(parseFloat(amount))) && { backgroundColor: '#ef4444' } // Red for withdraw
              ]}
              onPress={() => handleTransaction(savingsModalVisible ? 'deposit' : 'withdrawal')}
              disabled={!selectedWalletId || isNaN(parseFloat(amount))}
            >
              <Text style={styles.saveBtnText}>{savingsModalVisible ? 'Deposit to Wallet' : 'Withdraw from Wallet'}</Text>
            </TouchableOpacity>
          </>
        )}
      </ActionSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100, // Safe padding for absolute floating tab bar
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },

  // Premium Balance Card - Now "Glass Green" palette
  premiumCard: {
    backgroundColor: '#10b981', // Vivid Green base
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
  },
  glowEffect: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
  },
  premiumCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  premiumLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: '#ecfdf5',
  },
  badgePremium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34d399',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgePremiumText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: '#064e3b',
    marginLeft: 4,
  },
  premiumAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 34,
    color: '#ffffff',
    marginTop: 8,
    marginBottom: theme.spacing.md,
    letterSpacing: -0.5,
    zIndex: 1,
  },
  dividerLight: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  cardFooterLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: '#d1fae5',
  },
  cardFooterValue: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: '#ffffff',
    marginTop: 2,
  },

  // Quick Actions
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  actionItem: {
    alignItems: 'center',
    width: '24%',
  },
  actionIconBorder: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.text,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: theme.colors.text,
  },
  seeAllText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.primary,
  },

  // Active Goals
  emptyGoalCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  emptyGoalText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
  emptyGoalBtn: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
  },
  emptyGoalBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.primary,
  },
  goalsList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  goalCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  goalIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.text,
  },
  goalAmountText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  goalPercentage: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },

  // Transactions list
  transactionsList: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  txTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: theme.colors.text,
  },
  txDate: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  txAmountNegative: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: '#ef4444',
  },
  txAmountPositive: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: theme.colors.primary,
  },
  inputLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  saveBtnDisabled: {
    backgroundColor: theme.colors.border,
  },
  saveBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.card,
  },
});
