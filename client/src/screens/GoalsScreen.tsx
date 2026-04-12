import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { theme } from '../theme';
import { Target, Plus, Flag, ImagePlus, Camera, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import { useNavigation, useRoute } from '@react-navigation/native';
import WalletDropdown from '../components/WalletDropdown';

export default function GoalsScreen() {
  const { goals, addGoal, editGoal, wallets, showFeedback } = useAppContext();
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageSourceVisible, setImageSourceVisible] = useState(false);
  
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header removed as it is now global */}

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
        ) : (
          goals.map((goal) => {
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
                    <Target size={24} color={theme.colors.primary} />
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
              <ImagePlus size={32} color={theme.colors.textMuted} />
              <Text style={styles.imagePlaceholderText}>Add Cover Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.inputLabel}>Goal Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., New Laptop, Car, Wedding..."
          placeholderTextColor={theme.colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.inputLabel}>Target Amount (₱)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 50000"
          placeholderTextColor={theme.colors.textMuted}
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
                <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Target size={40} color={theme.colors.primary} />
                </View>
              )}
              
              <Text style={{ fontFamily: theme.fonts.bold, fontSize: 24, color: theme.colors.text, marginBottom: 8, textAlign: 'center' }}>{selectedGoal.title}</Text>
              
              <Text style={{ fontFamily: theme.fonts.medium, fontSize: 16, color: theme.colors.textMuted, marginBottom: 20 }}>
                ₱{currentAmount.toLocaleString('en-PH', { minimumFractionDigits: 0 })} / ₱{selectedGoal.targetAmount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
              </Text>

              <View style={[styles.progressBarBg, { height: 12, borderRadius: 6, marginBottom: 8 }]}>
                <View style={[styles.progressBarFill, { width: `${Math.max(0, Math.min(progress, 100))}%` }]} />
              </View>
              <Text style={{ fontFamily: theme.fonts.bold, fontSize: 20, color: theme.colors.primary, alignSelf: 'flex-end', marginBottom: 24 }}>
                {Math.round(Math.min(progress, 100))}%
              </Text>
              
              <TouchableOpacity
                style={{ backgroundColor: '#f1f5f9', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: '100%', alignItems: 'center' }}
                onPress={() => {
                  setEditingGoalId(selectedGoal.id);
                  setTitle(selectedGoal.title);
                  setTargetAmount(selectedGoal.targetAmount.toString());
                  setSelectedWalletId(selectedGoal.walletId);
                  setImageUrl(selectedGoal.imageUrl);
                  setSelectedGoal(null);
                  setTimeout(() => setModalVisible(true), 300); // delay allows view modal to close cleanly
                }}
              >
                <Text style={{ fontFamily: theme.fonts.semiBold, color: theme.colors.text, fontSize: 16 }}>Edit Goal</Text>
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
          <View style={[styles.sourceIcon, { backgroundColor: '#ecfdf5' }]}>
            <Camera size={24} color={theme.colors.primary} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 140, // Uniform safe gap for absolute tab bar
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
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
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
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: 16,
  },
  goalIconLayer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
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
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  goalProgressText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.primary,
  },
  goalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  goalStatLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  goalStatValue: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: theme.colors.text,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  goalTargetText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  imagePickerBtn: {
    width: '100%',
    height: 160,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8fafc',
  },
  modalImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  inputLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 14,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    backgroundColor: theme.colors.border,
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    color: theme.colors.text,
  },
  sourceSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});
