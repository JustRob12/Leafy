import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, Target, Plus, Flag, ImagePlus, Camera, Image as ImageIcon, Wallet } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import { useNavigation, useRoute } from '@react-navigation/native';
import WalletDropdown from '../components/WalletDropdown';

const { width } = Dimensions.get('window');

export default function AddGoalScreen() {
  const { addGoal, editGoal, deleteGoal, wallets, showFeedback, showConfirm, colors, isDarkMode } = useAppContext();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = getStyles(colors, isDarkMode);

  const editingGoal = route.params?.goal;
  const isEditing = !!editingGoal;

  const [title, setTitle] = useState(editingGoal?.title || '');
  const [targetAmount, setTargetAmount] = useState(editingGoal?.targetAmount?.toString() || '');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(editingGoal?.walletId || null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(editingGoal?.imageUrl);
  const [imageSourceVisible, setImageSourceVisible] = useState(false);

  const handleSelectImage = async () => {
    setImageSourceVisible(false);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const amount = parseFloat(targetAmount);
    if (title.trim() && !isNaN(amount) && amount > 0 && selectedWalletId) {
      if (isEditing) {
        await editGoal(editingGoal.id, {
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
      navigation.goBack();
    }
  };

  const handleDelete = () => {
    showConfirm(
      "Delete Goal",
      `Are you sure you want to delete "${title}"?`,
      () => {
        deleteGoal(editingGoal.id);
        navigation.goBack();
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Update Goal' : 'New Goal'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.imagePickerBtn} onPress={() => setImageSourceVisible(true)}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.previewImage as any} resizeMode="contain" />
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
          placeholder="e.g., New Laptop, Secret Savings..."
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          autoFocus={!isEditing}
        />

        <Text style={styles.inputLabel}>Target Amount (₱)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
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

        {isEditing && (
          <TouchableOpacity
            style={styles.deleteLink}
            onPress={handleDelete}
          >
            <Text style={styles.deleteLinkText}>Delete this goal</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, (!title.trim() || !targetAmount || !selectedWalletId) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!title.trim() || !targetAmount || !selectedWalletId}
        >
          <Text style={styles.saveBtnText}>{isEditing ? "Update Goal" : "Save Goal"}</Text>
        </TouchableOpacity>
      </View>

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
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  imagePickerBtn: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.card,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  inputLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  deleteLink: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  deleteLinkText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: '#ef4444',
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
});
