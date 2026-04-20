import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image as RNImage, Modal, Dimensions } from 'react-native';
import { theme } from '../theme';
import { Plane, Plus, Wallet as WalletIcon, ShoppingBag, AlertTriangle, User, MoreHorizontal, Leaf, QrCode, Image as ImageIcon, X, ChevronRight, Search, ChevronUp, ChevronDown } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import { useNavigation, useRoute, useScrollToTop } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useScrollHideTabBar } from '../hooks/useScrollHideTabBar';

export default function WalletsScreen() {
  const [viewingQrCode, setViewingQrCode] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const { wallets, addWallet, editWallet, deleteWallet, reorderWallets, showFeedback, showConfirm, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const { handleScroll } = useScrollHideTabBar();

  const brandLogos: { [key: string]: any } = {
    'gcash.png': require('../../public/walletimages/gcash.png'),
    'maya.png': require('../../public/walletimages/maya.png'),
    'paypal.png': require('../../public/walletimages/paypal.png'),
    'wise.png': require('../../public/walletimages/wise.png'),
    'maribank.png': require('../../public/walletimages/maribank.png'),
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [walletName, setWalletName] = useState('');
  const [purpose, setPurpose] = useState('Personal');
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [iconType, setIconType] = useState<'purpose' | 'preset' | 'custom'>('purpose');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [logoModalVisible, setLogoModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const presetLogos = [
    { name: 'GCash', file: 'gcash.png' },
    { name: 'Maya', file: 'maya.png' },
    { name: 'PayPal', file: 'paypal.png' },
    { name: 'Wise', file: 'wise.png' },
    { name: 'MariBank', file: 'maribank.png' },
  ];

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const scrollViewRef = React.useRef<ScrollView>(null);
  useScrollToTop(scrollViewRef);

  React.useEffect(() => {
    if (route.params?.openAddModal) {
      setModalVisible(true);
      navigation.setParams({ openAddModal: undefined });
    }
  }, [route.params?.openAddModal, navigation]);
  const purposes = [
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

  const handleAddWallet = async () => {
    if (walletName.trim()) {
      setModalVisible(false);
      if (editingWalletId) {
        await editWallet(editingWalletId, {
          name: walletName.trim(),
          purpose: purpose,
          qrCodeImage: qrCodeImage || undefined,
          iconType,
          presetLogo: selectedPreset || undefined,
          customIcon: customIcon || undefined
        });
      } else {
        await addWallet({
          name: walletName.trim(),
          purpose: purpose,
          qrCodeImage: qrCodeImage || undefined,
          iconType,
          presetLogo: selectedPreset || undefined,
          customIcon: customIcon || undefined
        });
      }

      setWalletName('');
      setPurpose('Personal');
      setQrCodeImage(null);
      setEditingWalletId(null);
      setIconType('purpose');
      setSelectedPreset(null);
      setCustomIcon(null);
    }
  };

  const openEditModal = (wallet: any) => {
    setEditingWalletId(wallet.id);
    setWalletName(wallet.name);
    setPurpose(wallet.purpose);
    setQrCodeImage(wallet.qrCodeImage || null);
    setIconType(wallet.iconType || 'purpose');
    setSelectedPreset(wallet.presetLogo || null);
    setCustomIcon(wallet.customIcon || null);
    setModalVisible(true);
  };

  const closeAndResetModal = () => {
    setModalVisible(false);
    setEditingWalletId(null);
    setWalletName('');
    setPurpose('Personal');
    setQrCodeImage(null);
    setIconType('purpose');
    setSelectedPreset(null);
    setCustomIcon(null);
  };

  const handleDeleteWallet = (id: string, name: string) => {
    showConfirm(
      "Delete Wallet",
      `Are you sure you want to delete "${name}"?`,
      () => {
        deleteWallet(id);
      }
    );
  };

  const moveWallet = (index: number, direction: 'up' | 'down') => {
    const newWallets = [...wallets];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < wallets.length) {
      const temp = newWallets[index];
      newWallets[index] = newWallets[newIndex];
      newWallets[newIndex] = temp;
      reorderWallets(newWallets);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {wallets.length > 1 && (
          <TouchableOpacity
            style={[styles.reorderToggle, isReordering && styles.reorderToggleActive]}
            onPress={() => setIsReordering(!isReordering)}
          >
            <Text style={[styles.reorderToggleText, isReordering && { color: '#ffffff' }]}>
              {isReordering ? 'Done Reordering' : 'Customize Order'}
            </Text>
          </TouchableOpacity>
        )}

        {wallets.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <WalletIcon size={32} color={theme.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No wallets yet</Text>
            <Text style={styles.emptySubtitle}>Create your first wallet to start tracking your finances.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => setModalVisible(true)}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.emptyBtnText}>Create Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          wallets.map((wallet, index) => (
            <View
              key={wallet.id}
              style={[styles.premiumCard, isReordering && { borderColor: colors.primary, borderStyle: 'dashed', borderWidth: 2 }]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.cardIconBox}>
                    {(() => {
                      if (wallet.iconType === 'custom' && wallet.customIcon) {
                        return <RNImage source={{ uri: wallet.customIcon }} style={styles.cardIconImage} />;
                      }
                      if (wallet.iconType === 'preset' && wallet.presetLogo) {
                        return <RNImage source={brandLogos[wallet.presetLogo]} style={[styles.cardIconImage, { resizeMode: 'contain' }]} />;
                      }
                      const PurposeIcon = purposes.find(p => p.label === wallet.purpose)?.icon || WalletIcon;
                      return <PurposeIcon size={28} color={colors.primary} />;
                    })()}
                  </View>
                  <Text style={styles.cardName} numberOfLines={1}>{wallet.name}</Text>
                </View>

                <View style={styles.cardHeaderRight}>
                  {isReordering ? (
                    <View style={styles.reorderActionsVertical}>
                      <TouchableOpacity
                        onPress={() => moveWallet(index, 'up')}
                        disabled={index === 0}
                        style={[styles.reorderBtnSmall, index === 0 && { opacity: 0.3 }]}
                      >
                        <ChevronUp size={16} color={colors.text} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => moveWallet(index, 'down')}
                        disabled={index === wallets.length - 1}
                        style={[styles.reorderBtnSmall, index === wallets.length - 1 && { opacity: 0.3 }]}
                      >
                        <ChevronDown size={16} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => openEditModal(wallet)}
                      style={styles.moreActionBtn}
                    >
                      <MoreHorizontal size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardBalanceText}>₱{wallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.purposePill}>
                  <Text style={styles.purposePillText}>{wallet.purpose}</Text>
                </View>

                {wallet.qrCodeImage && (
                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); setViewingQrCode(wallet.qrCodeImage || null); }}
                    style={styles.qrActionBtn}
                  >
                    <QrCode size={18} color={colors.primary} />
                    <Text style={styles.qrActionText}>QR</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
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

      {/* Add Wallet Modal */}
      <ActionSheet
        visible={modalVisible}
        onClose={closeAndResetModal}
        title={editingWalletId ? "Edit Wallet" : "Add New Wallet"}
      >
        <Text style={styles.inputLabel}>Wallet Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., GCash, Maya..."
          placeholderTextColor={colors.textMuted}
          value={walletName}
          onChangeText={setWalletName}
        />

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

        {iconType === 'purpose' && (
          <View style={styles.purposeRow}>
            {purposes.map((p) => {
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
        )}

        {iconType === 'preset' && selectedPreset && (
          <TouchableOpacity style={styles.selectedIconPreview} onPress={() => setLogoModalVisible(true)}>
            <RNImage source={brandLogos[selectedPreset]} style={styles.previewLogo} />
            <Text style={styles.previewLogoName}>{presetLogos.find(l => l.file === selectedPreset)?.name}</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {iconType === 'custom' && customIcon && (
          <TouchableOpacity style={styles.selectedIconPreview} onPress={pickCustomIcon}>
            <RNImage source={{ uri: customIcon }} style={styles.previewLogo} />
            <Text style={styles.previewLogoName}>Custom Icon</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        <Text style={styles.inputLabel}>QR Code Image (Optional)</Text>
        <TouchableOpacity
          style={[styles.imagePicker, qrCodeImage && styles.imagePickerActive]}
          onPress={pickImage}
        >
          {qrCodeImage ? (
            <View style={styles.pickerContent}>
              <RNImage source={{ uri: qrCodeImage }} style={styles.pickerPreview} />
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

        <TouchableOpacity
          style={[styles.saveBtn, !walletName.trim() && styles.saveBtnDisabled]}
          onPress={handleAddWallet}
          disabled={!walletName.trim()}
        >
          <Text style={styles.saveBtnText}>{editingWalletId ? "Update Wallet" : "Create Wallet"}</Text>
        </TouchableOpacity>

        {editingWalletId && (
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: '#fef2f2', borderColor: '#ef4444', borderWidth: 1, marginTop: 12 }]}
            onPress={() => {
              const idToDelete = editingWalletId;
              const nameToDelete = walletName;
              closeAndResetModal();
              handleDeleteWallet(idToDelete, nameToDelete);
            }}
          >
            <Text style={[styles.saveBtnText, { color: '#ef4444' }]}>Delete Wallet</Text>
          </TouchableOpacity>
        )}
      </ActionSheet>

      <Modal
        visible={!!viewingQrCode}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingQrCode(null)}
      >
        <TouchableOpacity
          style={styles.qrModalOverlay}
          activeOpacity={1}
          onPress={() => setViewingQrCode(null)}
        >
          <View style={styles.qrModalContent}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>Wallet QR Code</Text>
              <TouchableOpacity onPress={() => setViewingQrCode(null)} style={styles.qrModalClose}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {viewingQrCode && (
              <RNImage
                source={{ uri: viewingQrCode }}
                style={styles.qrModalImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity
              style={styles.qrModalCloseBtn}
              onPress={() => setViewingQrCode(null)}
            >
              <Text style={styles.qrModalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
                    <RNImage source={brandLogos[logo.file]} style={styles.logoImageGrid} />
                  </View>
                  <Text style={styles.logoItemName}>{logo.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const getStyles = (colors: any, isDarkMode: boolean) => {
  const { height } = Dimensions.get('window');
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: 140, // Increased for FAB
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
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
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
      marginBottom: theme.spacing.xl,
    },
    emptyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: theme.borderRadius.full,
      gap: 8,
    },
    emptyBtnText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 16,
      color: '#ffffff',
    },
    premiumCard: {
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
      borderRadius: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9',
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
      elevation: 4,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    cardHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardIconBox: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      backgroundColor: 'transparent',
    },
    cardName: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    cardBody: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    cardBalanceText: {
      fontFamily: theme.fonts.bold,
      fontSize: 34,
      color: colors.text,
      textAlign: 'center',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    },
    purposePill: {
      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    purposePillText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 11,
      color: colors.primary,
      textTransform: 'uppercase',
    },
    qrActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },
    qrActionText: {
      fontFamily: theme.fonts.bold,
      fontSize: 12,
      color: colors.primary,
    },
    reorderActionsVertical: {
      flexDirection: 'column',
      gap: 4,
    },
    reorderBtnSmall: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8fafc',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9',
    },
    moreActionBtn: {
      padding: 4,
    },
    cardIconImage: {
      width: '100%',
      height: '100%',
      borderRadius: 5,
    },
    iconTypeRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    iconTypeChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconTypeChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    iconTypeChipText: {
      fontFamily: theme.fonts.medium,
      fontSize: 12,
      color: colors.textMuted,
    },
    iconTypeChipTextActive: {
      color: '#ffffff',
    },
    selectedIconPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
      padding: 12,
      borderRadius: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewLogo: {
      width: 40,
      height: 40,
      borderRadius: 0,
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
      borderRadius: 0,
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
    reorderToggle: {
      alignSelf: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
      marginBottom: 16,
    },
    reorderToggleActive: {
      backgroundColor: colors.primary,
    },
    reorderToggleText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 12,
      color: colors.textMuted,
    },
    inputLabel: {
      fontFamily: theme.fonts.medium,
      fontSize: 14,
      color: colors.text,
      marginBottom: theme.spacing.sm,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontFamily: theme.fonts.regular,
      fontSize: 16,
      color: colors.text,
      marginBottom: theme.spacing.lg,
    },
    purposeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: theme.spacing.xl,
    },
    purposeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: theme.borderRadius.full,
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
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    saveBtnDisabled: {
      backgroundColor: colors.border,
    },
    saveBtnText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 16,
      color: '#ffffff',
    },
    imagePicker: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: theme.borderRadius.lg,
      padding: 16,
      marginBottom: theme.spacing.xl,
    },
    imagePickerActive: {
      borderStyle: 'solid',
      borderColor: colors.primary,
      backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.02)',
    },
    pickerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    pickerIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickerPreview: {
      width: 48,
      height: 48,
      borderRadius: 8,
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
      fontSize: 13,
      color: colors.textMuted,
    },
    removeImageBtn: {
      padding: 8,
    },
    qrModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    qrModalContent: {
      backgroundColor: colors.background,
      borderRadius: 32,
      width: '100%',
      maxWidth: 400,
      padding: 24,
      alignItems: 'center',
    },
    qrModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: 24,
    },
    qrModalTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 20,
      color: colors.text,
    },
    qrModalClose: {
      padding: 4,
    },
    qrModalImage: {
      width: Dimensions.get('window').width * 0.7,
      height: Dimensions.get('window').width * 0.7,
      maxWidth: 300,
      maxHeight: 300,
      borderRadius: 16,
      marginBottom: 24,
      backgroundColor: '#ffffff',
    },
    qrModalCloseBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: theme.borderRadius.full,
    },
    qrModalCloseBtnText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 16,
      color: '#ffffff',
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
}
