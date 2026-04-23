import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image as RNImage, Modal, Dimensions } from 'react-native';
import { theme } from '../theme';
import { Plus, Wallet as WalletIcon, MoreHorizontal, QrCode, X, ChevronUp, ChevronDown, User, AlertTriangle, ShoppingBag, Plane, Eye, EyeOff } from 'lucide-react-native';
import { useAppContext, WalletCategory } from '../context/AppContext';
import { useNavigation, useRoute, useScrollToTop } from '@react-navigation/native';
import { useScrollHideTabBar } from '../hooks/useScrollHideTabBar';

export default function WalletsScreen() {
  const [viewingQrCode, setViewingQrCode] = useState<string | null>(null);
  const [showBalances, setShowBalances] = useState(true);
  const { wallets, addWallet, editWallet, deleteWallet, showFeedback, showConfirm, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const { handleScroll } = useScrollHideTabBar();

  const brandLogos: { [key: string]: any } = {
    'gcash.png': require('../../public/walletimages/gcash.png'),
    'maya.png': require('../../public/walletimages/maya.png'),
    'paypal.png': require('../../public/walletimages/paypal.png'),
    'wise.png': require('../../public/walletimages/wise.png'),
    'maribank.png': require('../../public/walletimages/maribank.png'),
    'gotyme.png': require('../../public/walletimages/gotyme.png'),
  };

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const scrollViewRef = React.useRef<ScrollView>(null);
  useScrollToTop(scrollViewRef);

  React.useEffect(() => {
    if (route.params?.openAddModal) {
      navigation.navigate('AddWallet');
      navigation.setParams({ openAddModal: undefined });
    }
  }, [route.params?.openAddModal, navigation]);

  const purposes = [
    { label: 'Personal', icon: User },
    { label: 'Emergency', icon: AlertTriangle },
    { label: 'Shopping', icon: ShoppingBag },
    { label: 'Travel', icon: Plane },
  ];

  const groupedWallets = useMemo(() => {
    const categories: WalletCategory[] = ['E-Wallet', 'Banks', 'Personal'];
    return categories.map(cat => ({
      title: cat,
      data: wallets.filter(w => (w.category || 'Personal') === cat)
        .sort((a, b) => b.balance - a.balance)
    })).filter(group => group.data.length > 0);
  }, [wallets]);

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {wallets.length > 0 && (
          <TouchableOpacity
            style={[styles.visibilityToggle, !showBalances && styles.visibilityToggleActive]}
            onPress={() => setShowBalances(!showBalances)}
          >
            {showBalances ? <Eye size={18} color={colors.textMuted} /> : <EyeOff size={18} color={colors.primary} />}
            <Text style={[styles.visibilityToggleText, !showBalances && { color: colors.primary }]}>
              {showBalances ? 'Hide Balances' : 'Balances Hidden'}
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
              onPress={() => navigation.navigate('AddWallet')}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.emptyBtnText}>Create Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {groupedWallets.map((group) => (
              <View key={group.title} style={styles.categorySection}>
                <Text style={styles.categoryLabel}>{group.title}</Text>
                <View style={styles.gridContainer}>
                  {group.data.map((wallet) => (
                    <View key={wallet.id} style={styles.premiumCardWrapper}>
                      <View style={[styles.premiumCard, { backgroundColor: wallet.color || colors.primary }]}>
                        <View style={styles.cardHeader}>
                          <View style={styles.cardHeaderLeft}>
                            <View style={styles.cardIconBox}>
                              <View style={styles.headerGlow} />
                              {(() => {
                                if (wallet.iconType === 'custom' && wallet.customIcon) {
                                  return <RNImage source={{ uri: wallet.customIcon }} style={styles.cardIconImage as any} />;
                                }
                                if (wallet.iconType === 'preset' && wallet.presetLogo) {
                                  return <RNImage source={brandLogos[wallet.presetLogo]} style={[styles.cardIconImage as any, { resizeMode: 'contain' }]} />;
                                }
                                const PurposeIcon = purposes.find(p => p.label === wallet.purpose)?.icon || WalletIcon;
                                return <PurposeIcon size={16} color="#ffffff" />;
                              })()}
                            </View>
                            <Text style={[styles.cardName, { color: '#ffffff' }]} numberOfLines={1}>{wallet.name}</Text>
                          </View>

                          <View style={styles.cardHeaderRight}>
                            <TouchableOpacity
                              onPress={() => navigation.navigate('AddWallet', { wallet })}
                              style={styles.moreActionBtn}
                            >
                              <MoreHorizontal size={14} color="rgba(255, 255, 255, 0.7)" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.cardBody}>
                          <Text 
                            style={[
                              styles.cardBalanceText, 
                              wallet.balance >= 1000000 ? { fontSize: 13 } : wallet.balance >= 100000 ? { fontSize: 15 } : {}
                            ]} 
                            numberOfLines={1} 
                            adjustsFontSizeToFit
                          >
                            {showBalances 
                              ? `₱${wallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : '₱*****'
                            }
                          </Text>
                        </View>

                        <View style={styles.cardFooter}>
                          <View style={[styles.purposePill, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                            <Text style={[styles.purposePillText, { color: '#ffffff' }]}>{wallet.purpose}</Text>
                          </View>

                          {wallet.qrCodeImage && (
                            <TouchableOpacity
                              onPress={(e) => { e.stopPropagation(); setViewingQrCode(wallet.qrCodeImage || null); }}
                              style={[styles.qrActionBtn, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                            >
                              <QrCode size={14} color="#ffffff" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddWallet')}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>

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
                style={styles.qrModalImage as any}
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
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      gap: 12,
    },
    categorySection: {
      marginBottom: 24,
    },
    categoryLabel: {
      fontFamily: theme.fonts.bold,
      fontSize: 14,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
      marginLeft: 4,
    },
    premiumCardWrapper: {
      width: (Dimensions.get('window').width - theme.spacing.lg * 2 - 12) / 2,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
    premiumCard: {
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9',
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 8,
      paddingHorizontal: 10,
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      position: 'relative',
    },
    headerGlow: {
      position: 'absolute',
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      left: -20,
      top: -20,
    },
    cardHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardIconBox: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 6,
      backgroundColor: 'transparent',
    },
    cardName: {
      fontFamily: theme.fonts.bold,
      fontSize: 12,
      color: '#ffffff',
      flex: 1,
    },
    cardBody: {
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
      backgroundColor: 'transparent',
    },
    cardBalanceText: {
      fontFamily: theme.fonts.bold,
      fontSize: 18,
      color: '#ffffff',
      textAlign: 'center',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 8,
      paddingHorizontal: 10,
    },
    purposePill: {
      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 6,
    },
    purposePillText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 9,
      color: colors.primary,
      textTransform: 'uppercase',
    },
    qrActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 6,
    },
    qrActionText: {
      fontFamily: theme.fonts.bold,
      fontSize: 10,
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
    colorRow: {
      flexDirection: 'row',
      paddingBottom: 16,
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
  visibilityToggle: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  visibilityToggleActive: {
    borderColor: colors.primary + '33',
    backgroundColor: colors.primary + '08',
  },
  visibilityToggleText: {
    fontFamily: theme.fonts.bold,
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
