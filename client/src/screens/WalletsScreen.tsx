import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plane, Plus, X, Wallet as WalletIcon, ShoppingBag, AlertTriangle, User, Trash2, Edit2, MoreHorizontal } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';

export default function WalletsScreen() {
  const { wallets, addWallet, editWallet, deleteWallet, showFeedback, showConfirm } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [walletName, setWalletName] = useState('');
  const [purpose, setPurpose] = useState('Personal');

  const purposes = [
    { label: 'Personal', icon: User },
    { label: 'Emergency', icon: AlertTriangle },
    { label: 'Shopping', icon: ShoppingBag },
    { label: 'Travel', icon: Plane },
  ];

  const handleAddWallet = async () => {
    if (walletName.trim()) {
      if (editingWalletId) {
        await editWallet(editingWalletId, {
          name: walletName.trim(),
          purpose: purpose
        });
        showFeedback('success', 'Wallet Updated');
      } else {
        await addWallet({
          name: walletName.trim(),
          purpose: purpose
        });
        showFeedback('success', 'Wallet Created');
      }
      
      setWalletName('');
      setPurpose('Personal');
      setEditingWalletId(null);
      setModalVisible(false);
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

  const getPurposeIcon = (purposeType: string) => {
    switch (purposeType) {
      case 'Emergency': return <AlertTriangle size={20} color="#ffffff" />;
      case 'Shopping': return <ShoppingBag size={20} color="#ffffff" />;
      default: return <User size={20} color="#ffffff" />;
    }
  };

  const handleDeleteWallet = (id: string, name: string) => {
    showConfirm(
      "Delete Wallet",
      `Are you sure you want to delete "${name}"?`,
      () => {
         deleteWallet(id);
         showFeedback('delete', 'Wallet Removed');
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>My Wallets</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => {
            setEditingWalletId(null);
            setWalletName('');
            setPurpose('Personal');
            setModalVisible(true);
          }}>
            <Plus size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {wallets.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <WalletIcon size={32} color={theme.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No wallets yet</Text>
            <Text style={styles.emptySubtitle}>Add a wallet to start managing your savings.</Text>
          </View>
        ) : (
          wallets.map((wallet) => (
            <View key={wallet.id} style={styles.card}>
              <View style={styles.cardHeaderWrap}>
                <View style={StyleSheet.absoluteFill}>
                  <Svg height="100%" width="100%">
                    <Defs>
                      <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0" stopColor="#34d399" />
                        <Stop offset="1" stopColor="#047857" />
                      </LinearGradient>
                    </Defs>
                    <Rect width="100%" height="100%" fill="url(#grad)" />
                  </Svg>
                </View>
                <View style={styles.cardType}>
                  <View style={{ flexShrink: 1 }}>
                    <View style={styles.purposeBadgeHeader}>
                      <Text style={styles.purposeBadgeTextHeader}>{wallet.purpose}</Text>
                    </View>
                    <Text style={styles.cardTypeTextHeader} numberOfLines={2}>{wallet.name}</Text>
                  </View>
                </View>

                <TouchableOpacity onPress={() => openEditModal(wallet)} style={styles.moreBtnHeader}>
                  <MoreHorizontal size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.cardBody}>
                <Text style={styles.cardBalanceLabel}>Available Balance</Text>
                <Text style={styles.cardBalance}>₱{wallet.balance.toFixed(2)}</Text>
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
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeaderWrap: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  cardType: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
  },
  cardTypeTextHeader: {
    fontFamily: theme.fonts.bold,
    fontSize: 24, // Made the text larger
    color: '#ffffff',
    flexShrink: 1,
    marginTop: 6,
  },
  purposeBadgeHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  purposeBadgeTextHeader: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 11,
    color: '#ffffff',
  },
  cardBalanceLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  cardBalance: {
    fontFamily: theme.fonts.bold,
    fontSize: 32,
    color: theme.colors.text,
    marginTop: 4,
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
  purposeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.xl,
  },
  purposeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  purposeChipSelected: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  purposeChipText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
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
  },
  saveBtnDisabled: {
    backgroundColor: theme.colors.border,
  },
  saveBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.card,
  },
});
