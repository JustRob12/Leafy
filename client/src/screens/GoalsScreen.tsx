import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { theme } from '../theme';
import { Target, Plus, Flag, ImagePlus, Camera, Image as ImageIcon, Wallet } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import { useNavigation, useRoute, useScrollToTop } from '@react-navigation/native';
import WalletDropdown from '../components/WalletDropdown';
import { useScrollHideTabBar } from '../hooks/useScrollHideTabBar';

export default function GoalsScreen() {
  const { goals, addGoal, editGoal, deleteGoal, wallets, showFeedback, showConfirm, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const navigation = useNavigation<any>();
  const scrollViewRef = React.useRef<ScrollView>(null);
  useScrollToTop(scrollViewRef);
  const { handleScroll } = useScrollHideTabBar();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageSourceVisible, setImageSourceVisible] = useState(false);
  const [filterWalletId, setFilterWalletId] = useState<string | 'all'>('all');
  
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  const route = useRoute<any>();

  React.useEffect(() => {
    if (route.params?.openAddModal) {
      setModalVisible(true);
      navigation.setParams({ openAddModal: undefined });
    }
  }, [route.params?.openAddModal, navigation]);

  const handleSelectImage = async () => {
    setImageSourceVisible(false);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    setImageSourceVisible(false);
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showFeedback('error', 'Camera permission is required to take photos.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleAddGoal = async () => {
    const amount = parseFloat(targetAmount);
    if (title.trim() && !isNaN(amount) && amount > 0 && selectedWalletId) {
      setModalVisible(false);
      if (editingGoalId) {
        await editGoal(editingGoalId, {
          title: title.trim(),
          targetAmount: amount,
          walletId: selectedWalletId,
          imageUrl
        });
      } else {
        await addGoal({
          title: title.trim(),
          targetAmount: amount,
          walletId: selectedWalletId,
          imageUrl
        });
      }
      
      setTitle('');
      setTargetAmount('');
      setSelectedWalletId(null);
      setImageUrl(undefined);
      setEditingGoalId(null);
    }
  };

  const closeAndResetModal = () => {
    setModalVisible(false);
    setEditingGoalId(null);
    setTitle('');
    setTargetAmount('');
    setSelectedWalletId(null);
    setImageUrl(undefined);
  };

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
              onPress={() => setModalVisible(true)}
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
                    <Image source={{ uri: goal.imageUrl }} style={styles.goalImage} />
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
      
      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Add Goal Modal */}
      <ActionSheet 
        visible={modalVisible} 
        onClose={closeAndResetModal}
        title={editingGoalId ? "Edit Goal" : "Create New Goal"}
      >
        <TouchableOpacity style={styles.imagePickerBtn} onPress={() => setImageSourceVisible(true)}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="contain" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <ImagePlus size={32} color={colors.textMuted} />
              <Text style={styles.imagePlaceholderText}>Add Cover Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.inputLabel}>Goal Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., New Laptop, Car, Wedding..."
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.inputLabel}>Target Amount (₱)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 50000"
          placeholderTextColor={colors.textMuted}
          value={targetAmount}
          onChangeText={setTargetAmount}
          keyboardType="numeric"
        />

        <Text style={styles.inputLabel}>Linked Wallet</Text>
        <WalletDropdown
          selectedWalletId={selectedWalletId}
          onSelectWallet={setSelectedWalletId}
        />

        <TouchableOpacity
          style={[styles.saveBtn, (!title.trim() || !targetAmount || !selectedWalletId) && styles.saveBtnDisabled]}
          onPress={handleAddGoal}
          disabled={!title.trim() || !targetAmount || !selectedWalletId}
        >
          <Text style={styles.saveBtnText}>{editingGoalId ? "Update Goal" : "Save Goal"}</Text>
        </TouchableOpacity>
      </ActionSheet>

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
                  <Image source={{ uri: selectedGoal.imageUrl }} style={styles.modalImage} resizeMode="contain" />
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
                  setEditingGoalId(selectedGoal.id);
                  setTitle(selectedGoal.title);
                  setTargetAmount(selectedGoal.targetAmount.toString());
                  setSelectedWalletId(selectedGoal.walletId);
                  setImageUrl(selectedGoal.imageUrl);
                  setSelectedGoal(null);
                  setTimeout(() => setModalVisible(true), 300);
                }}
              >
                <Text style={{ fontFamily: theme.fonts.semiBold, color: colors.text, fontSize: 16 }}>Edit Goal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: '#fef2f2', borderColor: '#ef4444', borderWidth: 1, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 12 }}
                onPress={() => {
                  const idToDelete = selectedGoal.id;
                  const titleToDelete = selectedGoal.title;
                  setSelectedGoal(null);
                  showConfirm(
                    "Delete Goal",
                    `Are you sure you want to delete "${titleToDelete}"?`,
                    () => deleteGoal(idToDelete)
                  );
                }}
              >
                <Text style={{ fontFamily: theme.fonts.semiBold, color: '#ef4444', fontSize: 16 }}>Delete Goal</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
      </ActionSheet>

      {/* Image Source Selection */}
      <ActionSheet
        visible={imageSourceVisible}
        onClose={() => setImageSourceVisible(false)}
        title="Select Image Source"
      >
        <TouchableOpacity style={styles.sourceOption} onPress={handleTakePhoto}>
          <View style={[styles.sourceIcon, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5' }]}>
            <Camera size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.sourceTitle}>Take Photo</Text>
            <Text style={styles.sourceSubtitle}>Use your camera to capture an image</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sourceOption} onPress={handleSelectImage}>
          <View style={[styles.sourceIcon, { backgroundColor: '#eff6ff' }]}>
            <ImageIcon size={24} color="#3b82f6" />
          </View>
          <View>
            <Text style={styles.sourceTitle}>Choose from Library</Text>
            <Text style={styles.sourceSubtitle}>Pick an image from your gallery</Text>
          </View>
        </TouchableOpacity>
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
  imagePickerBtn: {
    width: '100%',
    height: 160,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
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
  inputLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    backgroundColor: colors.border,
  },
  saveBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: '#ffffff',
  },
  sourceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  sourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  sourceSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
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
