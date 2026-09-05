import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image as RNImage, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, User, AlertTriangle, ShoppingBag, Plane, Wallet as WalletIcon, QrCode, Image as ImageIcon, X, ChevronRight, Search, Building2, Smartphone, Sparkles, Globe, Check, Coins, CreditCard } from 'lucide-react-native';
import { useAppContext, WalletCategory } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AdvancedColorPicker from '../components/AdvancedColorPicker';
import WalletBrandLogo from '../components/WalletBrandLogo';
import { PHILIPPINE_BANKS_AND_WALLETS, BankBrandItem } from '../constants/philippineBanks';

const { height, width } = Dimensions.get('window');

const POPULAR_TOP_BANKS: BankBrandItem[] = [
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'gcash.png')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'maya.png')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'bdo')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'bpi')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'unionbank')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'gotyme.png')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'maribank.png')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'seabank')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'shopeepay')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'cimb')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'landbank')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'metrobank')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'securitybank')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'rcbc')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'tonik')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'wise.png')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'paypal.png')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'coinsph')!,
  PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === 'grabpay')!,
].filter(Boolean);

export default function AddWalletScreen() {
  const { addWallet, editWallet, colors, isDarkMode } = useAppContext();
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
  const [interestRate, setInterestRate] = useState(editingWallet?.interestRate?.toString() || '');

  const tags = [
    { label: 'Personal', icon: User },
    { label: 'Savings', icon: Coins },
    { label: 'Emergency', icon: AlertTriangle },
    { label: 'Bills', icon: CreditCard },
    { label: 'Shopping', icon: ShoppingBag },
    { label: 'Travel', icon: Plane },
    { label: 'Others', icon: WalletIcon },
  ];

  const handleSelectBank = (bank: BankBrandItem) => {
    setSelectedPreset(bank.id);
    setIconType('preset');
    setWalletName(bank.name);
    if (bank.brandColor) {
      setWalletColor(bank.brandColor);
    }
    if (bank.category === 'Banks' || bank.category === 'Digital Bank') {
      setCategory('Banks');
    } else if (bank.category === 'E-Wallet' || bank.category === 'International') {
      setCategory('E-Wallet');
    }
    if (bank.suggestedInterestRate && !interestRate) {
      setInterestRate(bank.suggestedInterestRate.toString());
    }
  };

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

  const effectiveName = walletName.trim() || (selectedPreset ? (PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === selectedPreset)?.name || '') : '');
  const isFormValid = !!effectiveName;

  const handleSave = async () => {
    if (effectiveName) {
      const rateNum = parseFloat(interestRate) || 0;
      if (isEditing) {
        await editWallet(editingWallet.id, {
          name: effectiveName,
          purpose: purpose,
          qrCodeImage: qrCodeImage || undefined,
          iconType,
          presetLogo: (iconType === 'preset' ? selectedPreset : undefined) || undefined,
          customIcon: (iconType === 'custom' ? customIcon : undefined) || undefined,
          color: walletColor,
          category: category,
          interestRate: rateNum,
        });
      } else {
        await addWallet({
          name: effectiveName,
          purpose: purpose,
          qrCodeImage: qrCodeImage || undefined,
          iconType,
          presetLogo: (iconType === 'preset' ? selectedPreset : undefined) || undefined,
          customIcon: (iconType === 'custom' ? customIcon : undefined) || undefined,
          color: walletColor,
          category: category,
          interestRate: rateNum,
          lastInterestDate: new Date().toISOString()
        });
      }
      navigation.navigate('Main', { screen: 'Wallets' });
    }
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
        {/* Bank & E-Wallet Picker Carousel ABOVE Wallet Name */}
        <View style={styles.bankPickerHeader}>
          <Text style={styles.inputLabel}>Bank / E-Wallet Brand (Optional)</Text>
          <TouchableOpacity onPress={() => setLogoModalVisible(true)} style={styles.seeAllBanksBtn}>
            <Text style={styles.seeAllBanksText}>Browse All</Text>
            <ChevronRight size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bankCarousel}
        >
          {POPULAR_TOP_BANKS.map((bank) => {
            const isSelected = selectedPreset === bank.id && iconType === 'preset';
            return (
              <TouchableOpacity
                key={bank.id}
                style={[styles.bankCard, isSelected && styles.bankCardSelected]}
                onPress={() => handleSelectBank(bank)}
                activeOpacity={0.75}
              >
                <View style={styles.bankLogoWrapper}>
                  <WalletBrandLogo logoKey={bank.id} size={36} />
                  {isSelected && (
                    <View style={styles.bankSelectedBadge}>
                      <Check size={9} color="#ffffff" strokeWidth={3} />
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.bankCardName, isSelected && { color: colors.primary, fontFamily: theme.fonts.bold }]}
                  numberOfLines={1}
                >
                  {bank.shortName || bank.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Wallet Name Input */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <Text style={styles.inputLabel}>Wallet Name</Text>
          {selectedPreset && iconType === 'preset' && (
            <Text style={{ fontFamily: theme.fonts.medium, fontSize: 11, color: colors.primary }}>
              Auto-filled from {PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === selectedPreset)?.shortName || 'Bank'}
            </Text>
          )}
        </View>
        <TextInput
          style={styles.input}
          placeholder="e.g., GCash, Maya, Savings, Main Account..."
          placeholderTextColor={colors.textMuted}
          value={walletName}
          onChangeText={setWalletName}
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

        {/* Wallet Icon (Default or Custom Photo only) */}
        <Text style={styles.inputLabel}>Wallet Icon</Text>
        <View style={styles.iconTypeRow}>
          <TouchableOpacity
            style={[styles.iconTypeChip, iconType === 'purpose' && styles.iconTypeChipActive]}
            onPress={() => setIconType('purpose')}
          >
            <Text style={[styles.iconTypeChipText, iconType === 'purpose' && styles.iconTypeChipTextActive]}>Default</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconTypeChip, iconType === 'custom' && styles.iconTypeChipActive]}
            onPress={pickCustomIcon}
          >
            <Text style={[styles.iconTypeChipText, iconType === 'custom' && styles.iconTypeChipTextActive]}>Custom Photo</Text>
          </TouchableOpacity>
        </View>

        {iconType === 'preset' && selectedPreset && (
          <View style={styles.selectedIconPreview}>
            <WalletBrandLogo logoKey={selectedPreset} size={42} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.previewLogoName}>
                {PHILIPPINE_BANKS_AND_WALLETS.find(l => l.id === selectedPreset)?.name || selectedPreset}
              </Text>
              <Text style={{ fontFamily: theme.fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                Official brand logo applied (Tap bank above to switch)
              </Text>
            </View>
          </View>
        )}

        {iconType === 'custom' && customIcon && (
          <TouchableOpacity style={styles.selectedIconPreview} onPress={pickCustomIcon}>
            <RNImage source={{ uri: customIcon }} style={styles.previewLogo as any} />
            <Text style={styles.previewLogoName}>Custom Photo Icon</Text>
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
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, !isFormValid && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!isFormValid}
        >
          <Text style={styles.saveBtnText}>{isEditing ? "Update Wallet" : "Create Wallet"}</Text>
        </TouchableOpacity>
      </View>

      {/* Full Bank & E-Wallet Catalog Modal */}
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
                <Text style={styles.logoModalTitle}>Philippine Banks & E-Wallets</Text>
                <Text style={styles.logoModalSubtitle}>Select your bank or e-wallet to set brand name & logo</Text>
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
                placeholder="Search banks, e-wallets..."
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
                        handleSelectBank(logo);
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
  bankPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  seeAllBanksBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  seeAllBanksText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: colors.primary,
  },
  bankCarousel: {
    gap: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  bankCard: {
    width: 78,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bankCardSelected: {
    borderColor: colors.primary,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5',
    borderWidth: 1.5,
  },
  bankLogoWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  bankSelectedBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  bankCardName: {
    fontFamily: theme.fonts.medium,
    fontSize: 10.5,
    color: colors.text,
    textAlign: 'center',
  },
  inputLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
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
    marginBottom: 20,
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
  iconTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  iconTypeChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
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
    marginRight: 12,
  },
  previewLogoName: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  logoModalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: height * 0.85,
  },
  logoModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logoModalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  logoModalSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoModalClose: {
    padding: 4,
    marginLeft: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  categoryTabsContainer: {
    gap: 8,
    paddingBottom: 4,
  },
  modalFilterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalFilterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalFilterTabText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
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
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  logoItem: {
    width: (width - 64) / 3,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoItemActive: {
    borderColor: colors.primary,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    borderWidth: 2,
  },
  logoIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    backgroundColor: colors.primary + '18',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  interestBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    color: colors.primary,
  },
});
