import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '../theme';
import { Plane, Plus, Wallet as WalletIcon, ShoppingBag, AlertTriangle, User, MoreHorizontal, Leaf } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function WalletsScreen() {
  const { wallets, addWallet, editWallet, deleteWallet, showFeedback, showConfirm } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [walletName, setWalletName] = useState('');
  const [purpose, setPurpose] = useState('Personal');

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

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

  const handleAddWallet = async () => {
    if (walletName.trim()) {
      setModalVisible(false);
      if (editingWalletId) {
        await editWallet(editingWalletId, {
          name: walletName.trim(),
          purpose: purpose
        });
      } else {
        await addWallet({
          name: walletName.trim(),
          purpose: purpose
        });
      }
      
      setWalletName('');
      setPurpose('Personal');
      setEditingWalletId(null);
    }
  };

  const openEditModal = (wallet: any) => {
    setEditingWalletId(wallet.id);
    setWalletName(wallet.name);
    setPurpose(wallet.purpose);
    setModalVisible(true);
  };

  const closeAndResetModal = () => {
    setModalVisible(false);
    setEditingWalletId(null);
    setWalletName('');
    setPurpose('Personal');
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header removed as it is now global */}

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
          wallets.map((wallet) => (
            <View key={wallet.id} style={styles.walletCardHeader}>
              <View style={styles.cardGreenHeader}>
                <View style={styles.cardHeaderTop}>
                  <View style={styles.cardHeaderTitleRow}>
                    <View style={styles.iconContainerHeader}>
                      <WalletIcon size={18} color="#ffffff" />
                    </View>
                    <View>
                      <View style={styles.purposeBadgeHeader}>
                        <Text style={styles.purposeBadgeTextHeader}>{wallet.purpose}</Text>
                      </View>
                      <Text style={styles.cardTypeTextHeader} numberOfLines={1}>{wallet.name}</Text>
                    </View>
                  </View>

                  <View style={styles.headerRight}>
                    <Leaf size={24} color="rgba(255, 255, 255, 0.4)" style={styles.headerLeaf} />
                    <TouchableOpacity onPress={() => openEditModal(wallet)} style={styles.moreBtnHeader}>
                      <MoreHorizontal size={20} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              <View style={styles.cardBody}>
                <Text style={styles.cardBalanceLabel}>Available Balance</Text>
                <Text style={styles.cardBalance}>₱{wallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

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
          placeholderTextColor={theme.colors.textMuted}
          value={walletName}
          onChangeText={setWalletName}
        />

        <Text style={styles.inputLabel}>Purpose</Text>
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
                <Icon size={16} color={isSelected ? theme.colors.card : theme.colors.textMuted} />
                <Text style={[styles.purposeChipText, isSelected && styles.purposeChipTextSelected]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
    paddingVertical: theme.spacing.xxl,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
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
    marginBottom: theme.spacing.xl,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
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
  walletCardHeader: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardGreenHeader: {
    backgroundColor: '#10b981',
    padding: 16,
  },
  cardHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainerHeader: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purposeBadgeHeader: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  purposeBadgeTextHeader: {
    fontFamily: theme.fonts.medium,
    fontSize: 9,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  cardTypeTextHeader: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLeaf: {
    transform: [{ rotate: '-15deg' }],
  },
  moreBtnHeader: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardBody: {
    padding: 16,
  },
  cardBalanceLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  cardBalance: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.text,
  },
  inputLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.text,
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
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    gap: 8,
  },
  purposeChipSelected: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  purposeChipText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  purposeChipTextSelected: {
    color: theme.colors.card,
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
  fabCircle: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
});
