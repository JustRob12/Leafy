import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { theme } from '../theme';
import { Target, Plus, Wallet } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import { useNavigation, useRoute, useScrollToTop } from '@react-navigation/native';
import { useScrollHideTabBar } from '../hooks/useScrollHideTabBar';

export default function GoalsScreen() {
  const { goals, addGoal, editGoal, deleteGoal, wallets, showFeedback, showConfirm, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const scrollViewRef = React.useRef<ScrollView>(null);
  useScrollToTop(scrollViewRef);
  const { handleScroll } = useScrollHideTabBar();
  
  const [filterWalletId, setFilterWalletId] = useState<string | 'all'>('all');

  React.useEffect(() => {
    if (route.params?.openAddModal) {
      navigation.navigate('AddGoal');
      navigation.setParams({ openAddModal: undefined });
    }
  }, [route.params?.openAddModal, navigation]);

  const filteredGoals = filterWalletId === 'all' 
    ? goals 
    : goals.filter(g => g.walletId === filterWalletId);

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Wallet Filter Bar */}
        {wallets.length > 0 && goals.length > 0 && (
          <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
              <TouchableOpacity 
                style={[styles.filterChip, filterWalletId === 'all' && styles.filterChipActive]}
                onPress={() => setFilterWalletId('all')}
              >
                <Text style={[styles.filterChipText, filterWalletId === 'all' && styles.filterChipTextActive]}>All Goals</Text>
              </TouchableOpacity>
              {wallets.map(wallet => (
                <TouchableOpacity 
                  key={wallet.id}
                  style={[styles.filterChip, filterWalletId === wallet.id && styles.filterChipActive]}
                  onPress={() => setFilterWalletId(wallet.id)}
                >
                  <Wallet size={14} color={filterWalletId === wallet.id ? '#ffffff' : theme.colors.textMuted} style={{ marginRight: 6 }} />
                  <Text style={[styles.filterChipText, filterWalletId === wallet.id && styles.filterChipTextActive]}>{wallet.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Target size={32} color={theme.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Set your first Goal</Text>
            <Text style={styles.emptySubtitle}>Plan for the things you want to achieve or buy by setting up a goal.</Text>
            <TouchableOpacity 
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('AddGoal')}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.emptyBtnText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        ) : filteredGoals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No goals found</Text>
            <Text style={styles.emptySubtitle}>There are no goals linked to this specific wallet.</Text>
            <TouchableOpacity 
              style={styles.emptyBtn}
              onPress={() => setFilterWalletId('all')}
            >
              <Text style={styles.emptyBtnText}>Show All Goals</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredGoals.map((goal) => {
            const linkedWallet = wallets.find(w => w.id === goal.walletId);
            const currentAmount = linkedWallet ? linkedWallet.balance : 0;
            const progress = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0;

            return (
              <TouchableOpacity 
                key={goal.id} 
                style={styles.shopeeCard}
                onPress={() => navigation.navigate('GoalDetail', { goal })}
              >
                <View style={styles.shopeeImageWrapper}>
                  {goal.imageUrl ? (
                    <Image source={{ uri: goal.imageUrl }} style={styles.shopeeImage as any} />
                  ) : (
                    <Target size={24} color={colors.primary} />
                  )}
                </View>
                
                <View style={styles.shopeeContent}>
                  <View style={styles.shopeeTitleRow}>
                    <Text style={styles.shopeeTitle} numberOfLines={1}>{goal.title}</Text>
                    <Text style={styles.shopeeProgressText}>{Math.round(Math.min(progress, 100))}%</Text>
                  </View>
                  
                  <View style={styles.shopeeMetaRow}>
                    <Wallet size={12} color={colors.textMuted} />
                    <Text style={styles.shopeeWalletName} numberOfLines={1}>{linkedWallet?.name}</Text>
                  </View>

                  <View style={styles.shopeeStatsRow}>
                    <Text style={styles.shopeeStatValue}>₱{currentAmount.toLocaleString()}</Text>
                    <Text style={styles.shopeeStatTotal}> / ₱{goal.targetAmount.toLocaleString()}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddGoal')}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>


      {/* Legacy Modal Removed */}
    </View>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 160, // Increased for FAB
  },
  filterSection: {
    marginBottom: 20,
    marginHorizontal: -theme.spacing.lg,
  },
  filterBar: {
    paddingHorizontal: theme.spacing.lg,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontFamily: theme.fonts.semiBold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 20,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  emptyBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: '#ffffff',
  },
  shopeeCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 12,
  },
  shopeeImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shopeeImage: {
    width: '100%',
    height: '100%',
  },
  shopeeContent: {
    flex: 1,
  },
  shopeeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopeeTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  shopeeProgressText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: colors.primary,
  },
  shopeeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  shopeeWalletName: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
  },
  shopeeStatsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  shopeeStatValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
  shopeeStatTotal: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
  },
  modalImageContainer: {
    width: '100%',
    height: 260,
    borderRadius: 24,
    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 120, // Raised even higher as requested
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
});
