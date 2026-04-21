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
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

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
                style={styles.goalCard}
                onPress={() => setSelectedGoal(goal)}
              >
                <View style={styles.goalIconLayer}>
                  {goal.imageUrl ? (
                    <Image source={{ uri: goal.imageUrl }} style={styles.goalImage as any} />
                  ) : (
                    <Target size={24} color={colors.primary} />
                  )}
                </View>
                
                <View style={styles.goalContent}>
                  <View style={styles.goalTitleRow}>
                    <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
                    <Text style={styles.goalProgressText}>{Math.round(Math.min(progress, 100))}%</Text>
                  </View>
                  
                  <View style={styles.goalStatsRow}>
                    <Text style={styles.goalStatLabel}>Total Saved</Text>
                    <Text style={styles.goalStatValue}>₱{currentAmount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</Text>
                  </View>

                   <View style={styles.walletBadge}>
                    <Wallet size={12} color={colors.textMuted} />
                    <Text style={styles.walletBadgeText}>{linkedWallet?.name || 'Unknown Wallet'}</Text>
                  </View>

                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${Math.max(0, Math.min(progress, 100))}%` }]} />
                  </View>
                  
                  <View style={styles.goalFooter}>
                    <Text style={styles.goalTargetText}>Target: ₱{goal.targetAmount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</Text>
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


      {/* View Goal Modal */}
      <ActionSheet
        visible={!!selectedGoal}
        onClose={() => setSelectedGoal(null)}
        title="Goal Details"
      >
        {selectedGoal && (() => {
          const linkedWallet = wallets.find(w => w.id === selectedGoal.walletId);
          const currentAmount = linkedWallet ? linkedWallet.balance : 0;
          const progress = selectedGoal.targetAmount > 0 ? (currentAmount / selectedGoal.targetAmount) * 100 : 0;

          return (
            <View style={{ alignItems: 'center', paddingBottom: 20 }}>
              {selectedGoal.imageUrl ? (
                <View style={styles.modalImageContainer}>
                  <Image source={{ uri: selectedGoal.imageUrl }} style={styles.modalImage as any} resizeMode="contain" />
                </View>
              ) : (
                <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Target size={40} color={colors.primary} />
                </View>
              )}
              
              <Text style={{ fontFamily: theme.fonts.bold, fontSize: 24, color: colors.text, marginBottom: 8, textAlign: 'center' }}>{selectedGoal.title}</Text>
              
              <Text style={{ fontFamily: theme.fonts.medium, fontSize: 16, color: colors.textMuted, marginBottom: 4 }}>
                ₱{currentAmount.toLocaleString('en-PH', { minimumFractionDigits: 0 })} / ₱{selectedGoal.targetAmount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#f8fafc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20, gap: 6 }}>
                <Wallet size={14} color={colors.primary} />
                <Text style={{ fontFamily: theme.fonts.semiBold, fontSize: 13, color: colors.text }}>{linkedWallet?.name}</Text>
              </View>

              <View style={[styles.progressBarBg, { height: 12, borderRadius: 6, marginBottom: 24 }]}>
                <View style={[styles.progressBarFill, { width: `${Math.max(0, Math.min(progress, 100))}%` }]} />
              </View>
              
              <TouchableOpacity
                style={{ backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: '100%', alignItems: 'center' }}
                onPress={() => {
                  const goalToEdit = { ...selectedGoal };
                  setSelectedGoal(null);
                  navigation.navigate('AddGoal', { goal: goalToEdit });
                }}
              >
                <Text style={{ fontFamily: theme.fonts.semiBold, color: colors.text, fontSize: 16 }}>Edit Goal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ marginTop: 12, paddingVertical: 12, width: '100%', alignItems: 'center' }}
                onPress={() => {
                  const goalId = selectedGoal.id;
                  const goalTitle = selectedGoal.title;
                  setSelectedGoal(null);
                  showConfirm(
                    "Delete Goal",
                    `Are you sure you want to delete "${goalTitle}"?`,
                    () => deleteGoal(goalId)
                  );
                }}
              >
                <Text style={{ fontFamily: theme.fonts.semiBold, color: '#ef4444', fontSize: 16 }}>Delete Goal</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
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
  goalCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.3 : 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  goalIconLayer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  goalImage: {
    width: '100%',
    height: '100%',
  },
  goalContent: {
    flex: 1,
  },
  goalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  goalProgressText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.primary,
  },
  goalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  goalStatLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  goalStatValue: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: colors.text,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  walletBadgeText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  goalTargetText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
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
