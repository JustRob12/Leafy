import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform, StatusBar, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, Target, Wallet, Edit3, Trash2, X, TrendingUp, AlertCircle, BarChart3, Info } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function GoalDetailScreen() {
  const { wallets, deleteGoal, showConfirm, colors, isDarkMode } = useAppContext();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = getStyles(colors, isDarkMode);

  const goal = route.params?.goal;
  const [isImageFullVisible, setIsImageFullVisible] = React.useState(false);

  if (!goal) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Goal not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const linkedWallet = wallets.find(w => w.id === goal.walletId);
  const currentAmount = linkedWallet ? linkedWallet.balance : 0;
  const progress = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0;
  const remaining = Math.max(0, goal.targetAmount - currentAmount);

  const getAnalyticalText = () => {
    if (progress >= 100) return "Congratulations! You've fully achieved this goal. Your discipline has paid off!";
    if (progress >= 75) return "You're in the home stretch! Just a little more effort and this goal will be yours.";
    if (progress >= 50) return "You've crossed the halfway mark! Your consistent savings are clearly making a difference.";
    if (progress >= 25) return "You're making steady progress. Keep this momentum going to reach your target.";
    return "Every journey starts with a single step. Keep saving regularly to see your progress grow.";
  };

  const handleDelete = () => {
    showConfirm(
      "Delete Goal",
      `Are you sure you want to delete "${goal.title}"?`,
      () => {
        deleteGoal(goal.id);
        navigation.goBack();
      }
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header with Back Button and Title */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnCircle}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{goal.title}</Text>
          <View style={{ width: 44 }} /> 
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Full-Width Stretching Image Section */}
        <View style={styles.bannerImageContainer}>
          {goal.imageUrl ? (
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => setIsImageFullVisible(true)}
              style={styles.bannerImageWrapper}
            >
              <Image source={{ uri: goal.imageUrl }} style={styles.bannerImage as any} resizeMode="contain" />
            </TouchableOpacity>
          ) : (
            <View style={[styles.bannerImageWrapper, styles.imagePlaceholder]}>
              <Target size={40} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Analytical Info Section */}
        <View style={styles.simpleInfo}>
          <View style={styles.progressRow}>
            <Text style={styles.progressPercent}>{Math.round(Math.min(progress, 100))}%</Text>
            <Text style={styles.progressLabel}>Goal Completion</Text>
          </View>


          {/* Analytical Rows List */}
          <View style={styles.statsVerticalList}>
            <View style={styles.statRowItem}>
              <View style={styles.statRowLabelGroup}>
                <TrendingUp size={18} color={colors.primary} />
                <Text style={styles.statRowLabel}>Saved</Text>
              </View>
              <Text style={styles.statRowValue}>₱{currentAmount.toLocaleString()}</Text>
            </View>

            <View style={styles.statRowDivider} />

            <View style={styles.statRowItem}>
              <View style={styles.statRowLabelGroup}>
                <AlertCircle size={18} color="#f59e0b" />
                <Text style={styles.statRowLabel}>Gap</Text>
              </View>
              <Text style={[styles.statRowValue, { color: '#f59e0b' }]}>₱{remaining.toLocaleString()}</Text>
            </View>

            <View style={styles.statRowDivider} />

            <View style={styles.statRowItem}>
              <View style={styles.statRowLabelGroup}>
                <BarChart3 size={18} color="#3b82f6" />
                <Text style={styles.statRowLabel}>Target</Text>
              </View>
              <Text style={[styles.statRowValue, { color: '#3b82f6' }]}>₱{goal.targetAmount.toLocaleString()}</Text>
            </View>
          </View>

          {/* User Description / Notes */}
          {goal.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionLabel}>Notes & Motivation</Text>
              <View style={styles.descriptionCard}>
                <Text style={styles.descriptionText}>{goal.description}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.walletBadge}>
            <Wallet size={16} color={colors.textMuted} />
            <Text style={styles.walletText}>Linked to {linkedWallet?.name || 'Unknown Wallet'}</Text>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Full Screen Image Overlay */}
      <Modal visible={isImageFullVisible} transparent={true} animationType="fade">
        <View style={styles.overlayContainer}>
          <SafeAreaView style={styles.overlayHeader}>
            <TouchableOpacity onPress={() => setIsImageFullVisible(false)} style={styles.closeBtn}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </SafeAreaView>
          
          <View style={styles.overlayImageWrapper}>
            <Image 
              source={{ uri: goal.imageUrl }} 
              style={styles.fullImage as any} 
              resizeMode="contain" 
            />
          </View>
        </View>
      </Modal>

      {/* Floating Actions */}
      <View style={styles.actionFooter}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => navigation.navigate('AddGoal', { goal })}
        >
          <Edit3 size={20} color="#ffffff" />
          <Text style={styles.actionBtnText}>Edit Goal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={handleDelete}
        >
          <Trash2 size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtnCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  bannerImageContainer: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerImageWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.card,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleInfo: {
    alignItems: 'center',
  },
  progressRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  progressPercent: {
    fontFamily: theme.fonts.bold,
    fontSize: 40,
    color: colors.primary,
  },
  progressLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 24,
  },
  walletText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  analysisContainer: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    width: '100%',
  },
  analysisText: {
    flex: 1,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  statsVerticalList: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    width: '100%',
  },
  statRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statRowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statRowLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: colors.textMuted,
  },
  statRowValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  statRowDivider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
    opacity: 0.5,
  },
  descriptionSection: {
    width: '100%',
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  descriptionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  descriptionText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  actionFooter: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    gap: 10,
  },
  deleteBtn: {
    width: 56,
    backgroundColor: isDarkMode ? '#ef444415' : '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef444433',
  },
  actionBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  overlayImageWrapper: {
    width: width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  backBtnText: {
    fontFamily: theme.fonts.semiBold,
    color: '#ffffff',
  },
});
