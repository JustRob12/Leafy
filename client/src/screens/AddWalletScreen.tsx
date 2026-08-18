import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image as RNImage, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, User, AlertTriangle, ShoppingBag, Plane, Wallet as WalletIcon, QrCode, Image as ImageIcon, X, ChevronRight, Search, Building2, Smartphone, Sparkles, Globe } from 'lucide-react-native';
import { useAppContext, WalletCategory } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AdvancedColorPicker from '../components/AdvancedColorPicker';
import WalletBrandLogo from '../components/WalletBrandLogo';
import { PHILIPPINE_BANKS_AND_WALLETS, BankBrandItem } from '../constants/philippineBanks';

const { height } = Dimensions.get('window');

export default function AddWalletScreen() {
  const { addWallet, editWallet, colors, isDarkMode, showConfirm, deleteWallet } = useAppContext();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = getStyles(colors, isDarkMode);

  const editingWallet = route.params?.wallet;
  const isEditing = !!editingWallet;

  const [walletName, setWalletName] = useState(editingWallet?.name || '');
  const [category, setCategory] = useState<WalletCategory>(editingWallet?.category || 'Personal');
  const [purpose, setPurpose] = useState(editingWallet?.purpose || 'Personal');
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(editingWallet?.qrCodeImage || null);
  const [iconType, setIconType] = useState<'purpose' | 'preset' | 'custom'>(editingWallet?.iconType || 'purpose');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(editingWallet?.presetLogo || null);
  const [customIcon, setCustomIcon] = useState<string | null>(editingWallet?.customIcon || null);
  const [walletColor, setWalletColor] = useState<string>(editingWallet?.color || colors.primary);
  const [logoModalVisible, setLogoModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Banks' | 'Digital Bank' | 'E-Wallet' | 'International'>('All');

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

  const [interestRate, setInterestRate] = useState(editingWallet?.interestRate?.toString() || '');

  const handleSave = async () => {
    if (walletName.trim()) {
      const rateNum = parseFloat(interestRate) || 0;
      if (isEditing) {
        await editWallet(editingWallet.id, {
          name: walletName.trim(),
          purpose: purpose,
          qrCodeImage: qrCodeImage || undefined,
          iconType,
          presetLogo: selectedPreset || undefined,
          customIcon: customIcon || undefined,
          color: walletColor,
          category: category,
          interestRate: rateNum,
        });
      } else {
        await addWallet({
          name: walletName.trim(),
          purpose: purpose,
          qrCodeImage: qrCodeImage || undefined,
          iconType,
          presetLogo: selectedPreset || undefined,
          customIcon: customIcon || undefined,
          color: walletColor,
          category: category,
          interestRate: rateNum,
          lastInterestDate: new Date().toISOString()
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

        <Text style={styles.inputLabel}>Wallet Category</Text>
        <View style={styles.categoryRow}>
          {(['E-Wallet', 'Banks', 'Personal'] as WalletCategory[]).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>


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
            <WalletBrandLogo logoKey={selectedPreset} size={42} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.previewLogoName}>
                {PHILIPPINE_BANKS_AND_WALLETS.find(l => l.id === selectedPreset)?.name || selectedPreset}
              </Text>
              <Text style={{ fontFamily: theme.fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                {PHILIPPINE_BANKS_AND_WALLETS.find(l => l.id === selectedPreset)?.category || 'Brand Logo'}
              </Text>
            </View>
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

        <Text style={styles.inputLabel}>Daily Interest Rate (% p.a.)</Text>
        <View style={styles.interestInputContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="e.g., 3.5, 6.0..."
            placeholderTextColor={colors.textMuted}
            value={interestRate}
            onChangeText={setInterestRate}
            keyboardType="decimal-pad"
          />
          <View style={styles.percentBadge}>
            <Text style={styles.percentBadgeText}>% p.a.</Text>
          </View>
        </View>
        <Text style={styles.inputSubtitle}>Interest will be calculated and credited daily based on your balance.</Text>
        <AdvancedColorPicker
          color={walletColor}
          onColorChange={setWalletColor}
          colors={colors}
          isDarkMode={isDarkMode}
        />

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
              <View style={{ flex: 1 }}>
                <Text style={styles.logoModalTitle}>Philippine Banks & Logos</Text>
                <Text style={styles.logoModalSubtitle}>Select your bank or e-wallet to set brand logo</Text>
              </View>
              <TouchableOpacity onPress={() => setLogoModalVisible(false)} style={styles.logoModalClose}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Search size={20} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Type to search"
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                  <X size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Tabs */}
            <View style={{ maxHeight: 44, marginBottom: 16 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabsContainer}>
                {(['All', 'Banks', 'Digital Bank', 'E-Wallet', 'International'] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.modalFilterTab, isActive && styles.modalFilterTabActive]}
                      onPress={() => setActiveTab(tab)}
                    >
                      <Text style={[styles.modalFilterTabText, isActive && styles.modalFilterTabTextActive]}>
                        {tab === 'All' ? `All (${PHILIPPINE_BANKS_AND_WALLETS.length})` : tab}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Brand Logo Grid */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.logoGrid}
            >
              {PHILIPPINE_BANKS_AND_WALLETS
                .filter((item) => {
                  const matchesTab = activeTab === 'All' || item.category === activeTab;
                  const q = searchQuery.toLowerCase().trim();
                  const matchesQuery = !q ||
                    item.name.toLowerCase().includes(q) ||
                    item.shortName.toLowerCase().includes(q) ||
                    (item.description && item.description.toLowerCase().includes(q));
                  return matchesTab && matchesQuery;
                })
                .map((logo) => {
                  const isSelected = selectedPreset === logo.id && iconType === 'preset';
                  return (
                    <TouchableOpacity
                      key={logo.id}
                      style={[styles.logoItem, isSelected && styles.logoItemActive]}
                      onPress={() => {
                        setSelectedPreset(logo.id);
                        setIconType('preset');

                        // Auto-fill wallet name if empty or previous bank name
                        if (!walletName.trim() || PHILIPPINE_BANKS_AND_WALLETS.some(b => b.name === walletName.trim())) {
                          setWalletName(logo.name);
                        }
                        if (logo.category === 'Banks' || logo.category === 'Digital Bank') {
                          setCategory('Banks');
                        } else if (logo.category === 'E-Wallet' || logo.category === 'International') {
                          setCategory('E-Wallet');
                        }
                        if (logo.brandColor) {
                          setWalletColor(logo.brandColor);
                        }
                        if (logo.suggestedInterestRate && !interestRate) {
                          setInterestRate(logo.suggestedInterestRate.toString());
                        }

                        setLogoModalVisible(false);
                        setSearchQuery('');
                      }}
                    >
                      <View style={[styles.logoIconBox, isSelected && { borderColor: colors.primary, borderWidth: 2 }]}>
                        <WalletBrandLogo logoKey={logo.id} size={44} />
                      </View>
                      <Text
                        style={[styles.logoItemName, isSelected && { color: colors.primary, fontFamily: theme.fonts.bold }]}
                        numberOfLines={2}
                      >
                        {logo.shortName || logo.name}
                      </Text>
                      {logo.category === 'Digital Bank' && logo.suggestedInterestRate && (
                        <View style={styles.interestBadge}>
                          <Text style={styles.interestBadgeText}>{logo.suggestedInterestRate}% p.a.</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
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
  interestInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  percentBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  percentBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: colors.primary,
  },
  inputSubtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 24,
    marginLeft: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  categoryChip: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  categoryChipTextActive: {
    color: '#ffffff',
    fontFamily: theme.fonts.bold,
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
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewLogo: {
    width: 42,
    height: 42,
    borderRadius: 10,
  },
  previewLogoName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
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
    borderWidth: 1.5,
    borderColor: '#000000',
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  logoModalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: height * 0.85,
    padding: 24,
  },
  logoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logoModalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  logoModalSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoModalClose: {
    padding: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  categoryTabsContainer: {
    gap: 8,
    paddingRight: 16,
  },
  modalFilterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalFilterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalFilterTabText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  modalFilterTabTextActive: {
    color: '#ffffff',
    fontFamily: theme.fonts.bold,
  },
  logoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 40,
    paddingTop: 8,
  },
  logoItem: {
    width: (Dimensions.get('window').width - 48 - 24) / 3, // 3 columns
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    borderRadius: 16,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
  },
  logoItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '12',
  },
  logoIconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  logoItemName: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 14,
  },
  interestBadge: {
    marginTop: 4,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  interestBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    color: colors.primary,
  },
});
