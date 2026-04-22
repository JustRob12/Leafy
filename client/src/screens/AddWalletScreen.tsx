import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image as RNImage, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, User, AlertTriangle, ShoppingBag, Plane, Wallet as WalletIcon, QrCode, Image as ImageIcon, X, ChevronRight, Search } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const { height } = Dimensions.get('window');

export default function AddWalletScreen() {
  const { addWallet, editWallet, colors, isDarkMode, showConfirm, deleteWallet } = useAppContext();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = getStyles(colors, isDarkMode);

  const editingWallet = route.params?.wallet;
  const isEditing = !!editingWallet;

  const [walletName, setWalletName] = useState(editingWallet?.name || '');
  const [purpose, setPurpose] = useState(editingWallet?.purpose || 'Personal');
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(editingWallet?.qrCodeImage || null);
  const [iconType, setIconType] = useState<'purpose' | 'preset' | 'custom'>(editingWallet?.iconType || 'purpose');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(editingWallet?.presetLogo || null);
  const [customIcon, setCustomIcon] = useState<string | null>(editingWallet?.customIcon || null);
  const [walletColor, setWalletColor] = useState<string>(editingWallet?.color || colors.primary);
  const [logoModalVisible, setLogoModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const brandLogos: { [key: string]: any } = {
    'gcash.png': require('../../public/walletimages/gcash.png'),
    'maya.png': require('../../public/walletimages/maya.png'),
    'paypal.png': require('../../public/walletimages/paypal.png'),
    'wise.png': require('../../public/walletimages/wise.png'),
    'maribank.png': require('../../public/walletimages/maribank.png'),
    'gotyme.png': require('../../public/walletimages/gotyme.png'),
  };

  const presetLogos = [
    { name: 'GCash', file: 'gcash.png' },
    { name: 'Maya', file: 'maya.png' },
    { name: 'PayPal', file: 'paypal.png' },
    { name: 'Wise', file: 'wise.png' },
    { name: 'MariBank', file: 'maribank.png' },
    { name: 'GoTyme', file: 'gotyme.png' },
  ];

  const walletPresets = [
    { name: 'Emerald', color: '#10b981' },
    { name: 'Forest', color: '#065f46' },
    { name: 'Teal', color: '#0d9488' },
    { name: 'Cobalt', color: '#3b82f6' },
    { name: 'Sky', color: '#0ea5e9' },
    { name: 'Indigo', color: '#6366f1' },
    { name: 'Violet', color: '#8b5cf6' },
    { name: 'Lavender', color: '#a855f7' },
    { name: 'Fuchsia', color: '#d946ef' },
    { name: 'Rose', color: '#f43f5e' },
    { name: 'Crimson', color: '#ef4444' },
    { name: 'Orange', color: '#f97316' },
    { name: 'Amber', color: '#f59e0b' },
    { name: 'Gold', color: '#d97706' },
    { name: 'Slate', color: '#475569' },
    { name: 'Midnight', color: '#1e1b4b' },
    { name: 'Black', color: '#000000' },
    { name: 'White', color: '#ffffff' },
  ];

  const tags = [
    { label: 'Personal', icon: User },
    { label: 'Emergency', icon: AlertTriangle },
    { label: 'Shopping', icon: ShoppingBag },
    { label: 'Travel', icon: Plane },
  ];

  const pickCustomIcon = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCustomIcon(result.assets[0].uri);
      setIconType('custom');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setQrCodeImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (walletName.trim()) {
      if (isEditing) {
        await editWallet(editingWallet.id, {
          name: walletName.trim(),
          purpose: purpose,
          qrCodeImage: qrCodeImage || undefined,
          iconType,
          presetLogo: selectedPreset || undefined,
          customIcon: customIcon || undefined,
          color: walletColor
        });
      } else {
        await addWallet({
          name: walletName.trim(),
          purpose: purpose,
          qrCodeImage: qrCodeImage || undefined,
          iconType,
          presetLogo: selectedPreset || undefined,
          customIcon: customIcon || undefined,
          color: walletColor
        });
      }
      navigation.goBack();
    }
  };

  const handleDelete = () => {
    showConfirm(
      "Delete Wallet",
      `Are you sure you want to delete "${walletName}"?`,
      () => {
        deleteWallet(editingWallet.id);
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
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Wallet' : 'New Wallet'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.inputLabel}>Wallet Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., GCash, Maya, Savings..."
          placeholderTextColor={colors.textMuted}
          value={walletName}
          onChangeText={setWalletName}
          autoFocus={!isEditing}
        />

        <Text style={styles.inputLabel}>Accent Theme</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
          {walletPresets.map((wp) => (
            <TouchableOpacity
              key={wp.name}
              style={[
                styles.colorOption,
                { backgroundColor: wp.color },
                walletColor === wp.color && styles.colorOptionSelected
              ]}
              onPress={() => setWalletColor(wp.color)}
            >
              {walletColor === wp.color && (
                <View style={styles.colorSelectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.inputLabel}>Wallet Icon</Text>
        <View style={styles.iconTypeRow}>
          <TouchableOpacity
            style={[styles.iconTypeChip, iconType === 'purpose' && styles.iconTypeChipActive]}
            onPress={() => setIconType('purpose')}
          >
            <Text style={[styles.iconTypeChipText, iconType === 'purpose' && styles.iconTypeChipTextActive]}>Default</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconTypeChip, iconType === 'preset' && styles.iconTypeChipActive]}
            onPress={() => setLogoModalVisible(true)}
          >
            <Text style={[styles.iconTypeChipText, iconType === 'preset' && styles.iconTypeChipTextActive]}>Brand Logo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconTypeChip, iconType === 'custom' && styles.iconTypeChipActive]}
            onPress={pickCustomIcon}
          >
            <Text style={[styles.iconTypeChipText, iconType === 'custom' && styles.iconTypeChipTextActive]}>Custom Photo</Text>
          </TouchableOpacity>
        </View>

        {iconType === 'preset' && selectedPreset && (
          <TouchableOpacity style={styles.selectedIconPreview} onPress={() => setLogoModalVisible(true)}>
            <RNImage source={brandLogos[selectedPreset]} style={styles.previewLogo as any} />
            <Text style={styles.previewLogoName}>{presetLogos.find(l => l.file === selectedPreset)?.name}</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {iconType === 'custom' && customIcon && (
          <TouchableOpacity style={styles.selectedIconPreview} onPress={pickCustomIcon}>
            <RNImage source={{ uri: customIcon }} style={styles.previewLogo as any} />
            <Text style={styles.previewLogoName}>Custom Icon</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {iconType === 'purpose' && (
          <View style={styles.selectedIconPreview}>
             <View style={styles.defaultIconBox}>
                {(() => {
                  const CurrentIcon = tags.find(t => t.label === purpose)?.icon || WalletIcon;
                  return <CurrentIcon size={24} color={walletColor} />;
                })()}
             </View>
             <Text style={styles.previewLogoName}>Default ({purpose})</Text>
          </View>
        )}

        <Text style={styles.inputLabel}>Tag</Text>
        <View style={styles.purposeRow}>
          {tags.map((p) => {
            const Icon = p.icon;
            const isSelected = purpose === p.label;
            return (
              <TouchableOpacity
                key={p.label}
                style={[styles.purposeChip, isSelected && styles.purposeChipSelected]}
                onPress={() => setPurpose(p.label)}
              >
                <Icon size={16} color={isSelected ? '#ffffff' : colors.textMuted} />
                <Text style={[styles.purposeChipText, isSelected && styles.purposeChipTextSelected]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>QR Code Image (Optional)</Text>
        <TouchableOpacity
          style={[styles.imagePicker, qrCodeImage && styles.imagePickerActive]}
          onPress={pickImage}
        >
          {qrCodeImage ? (
            <View style={styles.pickerContent}>
              <RNImage source={{ uri: qrCodeImage }} style={styles.pickerPreview as any} />
              <View style={styles.pickerTextContainer}>
                <Text style={styles.pickerTitle}>QR Code Selected</Text>
                <Text style={styles.pickerSubtitle}>Tap to change image</Text>
              </View>
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  setQrCodeImage(null);
                }}
              >
                <X size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.pickerContent}>
              <View style={styles.pickerIconContainer}>
                <ImageIcon size={24} color={colors.textMuted} />
              </View>
              <View style={styles.pickerTextContainer}>
                <Text style={styles.pickerTitle}>Add QR Code</Text>
                <Text style={styles.pickerSubtitle}>For easy scanning of this wallet</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            style={styles.deleteLink}
            onPress={handleDelete}
          >
            <Text style={styles.deleteLinkText}>Delete this wallet</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, !walletName.trim() && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!walletName.trim()}
        >
          <Text style={styles.saveBtnText}>{isEditing ? "Update Wallet" : "Create Wallet"}</Text>
        </TouchableOpacity>
      </View>

      {/* Logo Picker Modal */}
      <Modal
        visible={logoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLogoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoModalContent}>
            <View style={styles.logoModalHeader}>
              <Text style={styles.logoModalTitle}>Select Brand Logo</Text>
              <TouchableOpacity onPress={() => setLogoModalVisible(false)} style={styles.logoModalClose}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Search size={20} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search brands (e.g. GCash)..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.logoGrid}
            >
              {presetLogos.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())).map((logo) => (
                <TouchableOpacity
                  key={logo.file}
                  style={styles.logoItem}
                  onPress={() => {
                    setSelectedPreset(logo.file);
                    setIconType('preset');
                    setLogoModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <View style={styles.logoIconBox}>
                    <RNImage source={brandLogos[logo.file]} style={styles.logoImageGrid as any} />
                  </View>
                  <Text style={styles.logoItemName}>{logo.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  inputLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
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
  colorRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderColor: isDarkMode ? '#ffffff' : colors.primary,
  },
  colorSelectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  iconTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  iconTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconTypeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  iconTypeChipText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  iconTypeChipTextActive: {
    color: '#ffffff',
    fontFamily: theme.fonts.semiBold,
  },
  purposeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  purposeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  purposeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  purposeChipText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  purposeChipTextSelected: {
    color: '#ffffff',
    fontFamily: theme.fonts.semiBold,
  },
  selectedIconPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  defaultIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    resizeMode: 'contain',
    marginRight: 12,
  },
  previewLogoName: {
    flex: 1,
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },
  imagePicker: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  imagePickerActive: {
    borderStyle: 'solid',
    borderColor: colors.primary,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pickerPreview: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  pickerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerTextContainer: {
    flex: 1,
  },
  pickerTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  pickerSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  removeImageBtn: {
    padding: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  logoModalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: height * 0.8,
    padding: 24,
  },
  logoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoModalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  logoModalClose: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  logoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 40,
  },
  logoItem: {
    width: (Dimensions.get('window').width - 48 - 32) / 3, // 3 columns
    alignItems: 'center',
    marginBottom: 8,
  },
  logoIconBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoImageGrid: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  logoItemName: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
});
