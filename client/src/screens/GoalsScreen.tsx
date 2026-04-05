import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, Image } from 'react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Target, Plus, X, Flag, Trash2, Edit2, MoreHorizontal, ImagePlus } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import { useNavigation } from '@react-navigation/native';
import WalletDropdown from '../components/WalletDropdown';

export default function GoalsScreen() {
  const { goals, addGoal, editGoal, deleteGoal, wallets, showFeedback, showConfirm } = useAppContext();
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [activeOptionsGoalId, setActiveOptionsGoalId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  
  // Goal Detail Modal State
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  const pickImage = async () => {
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

  const handleAddGoal = async () => {
    const amount = parseFloat(targetAmount);
    if (title.trim() && !isNaN(amount) && amount > 0 && selectedWalletId) {
      if (editingGoalId) {
        await editGoal(editingGoalId, {
          title: title.trim(),
          targetAmount: amount,
          walletId: selectedWalletId,
          imageUrl
        });
        showFeedback('success', 'Goal Updated');
      } else {
        await addGoal({
          title: title.trim(),
          targetAmount: amount,
          walletId: selectedWalletId,
          imageUrl
        });
        showFeedback('success', 'Goal Defined');
      }
      
      setTitle('');
      setTargetAmount('');
      setSelectedWalletId(null);
      setImageUrl(undefined);
      setEditingGoalId(null);
      setModalVisible(false);
    }
  };

  const openEditModal = (goal: any) => {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount.toString());
    setSelectedWalletId(goal.walletId);
    setImageUrl(goal.imageUrl);
    setModalVisible(true);
  };

  const closeAndResetModal = () => {
    setModalVisible(false);
    setEditingGoalId(null);
    setTitle('');
    setTargetAmount('');
    setSelectedWalletId(null);
    setImageUrl(undefined);
  };

  const handleDeleteGoal = (id: string, name: string) => {
    showConfirm(
      "Delete Goal",
      `Are you sure you want to delete "${name}"?`,
      () => {
        deleteGoal(id);
        showFeedback('delete', 'Goal Removed');
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Saving Goals</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => {
            setEditingGoalId(null);
            setTitle('');
            setTargetAmount('');
            setSelectedWalletId(null);
            setModalVisible(true);
          }}>
            <Plus size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Target size={32} color={theme.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptySubtitle}>Set a target for a specific wallet.</Text>
          </View>
        ) : (
          goals.map(goal => {
            const linkedWallet = wallets.find(w => w.id === goal.walletId);
            const currentAmount = linkedWallet ? linkedWallet.balance : 0;
            const progress = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0;
            
            return (
              <TouchableOpacity key={goal.id} style={styles.goalCard} onPress={() => setSelectedGoal(goal)} activeOpacity={0.9}>
                <View style={styles.goalHeaderWrap}>
                  <View style={styles.glowEffect} />

                  <View style={styles.goalHeaderInner}>
                    <View style={styles.goalIconWrapper}>
                      {goal.imageUrl ? (
                        <Image source={{ uri: goal.imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
                      ) : (
                        <Flag size={20} color={theme.colors.primary} />
                      )}
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle} numberOfLines={2}>{goal.title}</Text>
                      <Text style={styles.goalAmount}>₱{currentAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ₱{goal.targetAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                      {linkedWallet && (
                        <Text style={styles.linkedWalletText}>Linked to: {linkedWallet.name}</Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => openEditModal(goal)} style={styles.moreBtnHeader}>
                    <MoreHorizontal size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.goalBody}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <ActionSheet 
        visible={modalVisible} 
        onClose={closeAndResetModal}
        title={editingGoalId ? "Edit Goal" : "Set New Goal"}
      >

              {wallets.length === 0 ? (
                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                  <Text style={{ fontFamily: theme.fonts.medium, color: theme.colors.textMuted }}>You need a wallet to link a goal.</Text>
                  <TouchableOpacity style={styles.saveBtn} onPress={() => { setModalVisible(false); navigation.navigate('Wallets'); }}>
                    <Text style={styles.saveBtnText}>Go Create Wallet</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Goal Cover (Optional)</Text>
                  <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                    ) : (
                      <>
                        <ImagePlus size={24} color={theme.colors.textMuted} />
                        <Text style={styles.imagePickerText}>Upload Image</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <Text style={styles.inputLabel}>Goal Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., New Laptop"
                    placeholderTextColor={theme.colors.textMuted}
                    value={title}
                    onChangeText={setTitle}
                  />

                  <Text style={styles.inputLabel}>Target Amount (₱)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 25000"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="numeric"
                    value={targetAmount}
                    onChangeText={setTargetAmount}
                  />

                  <Text style={styles.inputLabel}>Link to Wallet</Text>
                  <WalletDropdown 
                    selectedWalletId={selectedWalletId} 
                    onSelectWallet={setSelectedWalletId} 
                  />

                  <TouchableOpacity 
                    style={[
                      styles.saveBtn, 
                      (!title.trim() || isNaN(parseFloat(targetAmount)) || !selectedWalletId) && styles.saveBtnDisabled
                    ]} 
                    onPress={handleAddGoal}
                    disabled={!title.trim() || isNaN(parseFloat(targetAmount)) || !selectedWalletId}
                  >
                    <Text style={styles.saveBtnText}>{editingGoalId ? "Update Goal" : "Create Goal"}</Text>
                  </TouchableOpacity>

                  {editingGoalId && (
                    <TouchableOpacity
                      style={[styles.saveBtn, { backgroundColor: '#fef2f2', borderColor: '#ef4444', borderWidth: 1, marginTop: 12 }]}
                      onPress={() => {
                        const idToDelete = editingGoalId;
                        const nameToDelete = title;
                        closeAndResetModal();
                        handleDeleteGoal(idToDelete, nameToDelete);
                      }}
                    >
                      <Text style={[styles.saveBtnText, { color: '#ef4444' }]}>Delete Goal</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
      </ActionSheet>

      {/* Goal Details Modal */}
      <Modal
        visible={!!selectedGoal}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedGoal(null)}
      >
        <View style={styles.detailModalOverlay}>
          <View style={styles.detailModalBody}>
            <TouchableOpacity style={styles.detailModalClose} onPress={() => setSelectedGoal(null)}>
              <X size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.detailModalImageWrap}>
              {selectedGoal?.imageUrl ? (
                <Image source={{ uri: selectedGoal.imageUrl }} style={styles.detailModalImage} />
              ) : (
                <Flag size={64} color={theme.colors.primary} />
              )}
            </View>

            <Text style={styles.detailModalTitle}>{selectedGoal?.title}</Text>
            
            <View style={{ width: '100%', marginVertical: 16 }}>
              {(() => {
                if (!selectedGoal) return null;
                const linkWallet = wallets.find(w => w.id === selectedGoal.walletId);
                const curAm = linkWallet ? linkWallet.balance : 0;
                const prog = selectedGoal.targetAmount > 0 ? (curAm / selectedGoal.targetAmount) * 100 : 0;
                return (
                  <>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${Math.min(prog, 100)}%` }]} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                      <Text style={styles.detailModalAmount}>₱{curAm.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Saved</Text>
                      <Text style={styles.detailModalTarget}>₱{selectedGoal.targetAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>
                  </>
                );
              })()}
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    color: theme.colors.text,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  goalCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  goalHeaderWrap: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#10b981',
    position: 'relative',
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  goalHeaderInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  goalBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  goalIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  goalInfo: {
    flex: 1,
    marginRight: 10,
  },
  goalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: '#ffffff',
  },
  goalAmount: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: '#d1fae5',
    marginTop: 4,
  },
  linkedWalletText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  moreBtnHeader: {
    padding: 6,
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
  imagePickerBtn: {
    width: '100%',
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailModalBody: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    alignItems: 'center',
  },
  detailModalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    zIndex: 10,
  },
  detailModalImageWrap: {
    width: 140,
    height: 140,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    overflow: 'hidden',
  },
  detailModalImage: {
    width: '100%',
    height: '100%',
  },
  detailModalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.text,
    textAlign: 'center',
  },
  detailModalAmount: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.text,
  },
  detailModalTarget: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.textMuted,
  },
});
