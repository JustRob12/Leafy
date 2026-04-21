import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { Plus, Building2, DollarSign, Trash2, RefreshCw, ChevronLeft, Wallet as WalletIcon, Calendar } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import WalletDropdown from '../components/WalletDropdown';

export default function RecursionScreen() {
  const { recursions, addRecursion, deleteRecursion, processRecursion, wallets, showConfirm, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const navigation = useNavigation<any>();

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      'Delete Recursion',
      `Are you sure you want to delete the recurring income from ${name}? This will not affect previous transactions.`,
      () => deleteRecursion(id)
    );
  };

  const handleProcess = async (id: string) => {
      await processRecursion(id);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getWalletName = (id: string) => {
      const wallet = wallets.find(w => w.id === id);
      return wallet ? wallet.name : 'Unknown Wallet';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recursion</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {recursions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <RefreshCw size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Recursions yet</Text>
            <Text style={styles.emptySubtitle}>Add your monthly salary or recurring income here to easily track it.</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate('AddRecursion')}
            >
              <Plus size={18} color="#ffffff" />
              <Text style={styles.createBtnText}>Add New Recursion</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recursions.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.accentLine} />
              <View style={styles.cardTop}>
                <View style={styles.infoRow}>
                  <View style={styles.iconWrapper}>
                    <Building2 size={18} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.companyName}>{item.companyName}</Text>
                    <Text style={styles.dateText}>Every day {item.dayOfMonth} of the month</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <TouchableOpacity
                    style={styles.trashBtn}
                    onPress={() => handleDelete(item.id, item.companyName)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                  <Text style={styles.amountText}>₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardBottom}>
                <View style={styles.walletInfo}>
                  <WalletIcon size={14} color={colors.textMuted} />
                  <Text style={styles.walletName}>{getWalletName(item.walletId)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.processBtn}
                  onPress={() => handleProcess(item.id)}
                >
                  <Text style={styles.processBtnText}>Add to Wallet</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddRecursion')}
        activeOpacity={0.8}
      >
        <Plus size={30} color="#ffffff" />
      </TouchableOpacity>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 140,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: theme.fonts.bold,
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
    marginBottom: 24,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
    gap: 8,
  },
  createBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: '#ffffff',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? colors.border : theme.colors.primary + '22',
    padding: 16,
    paddingLeft: 22,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.2 : 0.04,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: theme.colors.primary,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
  },
  companyName: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  dateText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  amountText: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.primary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  walletName: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  processBtn: {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  processBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: theme.colors.primary,
  },
  trashBtn: {
    marginBottom: 4,
    padding: 2,
  },
  inputLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  fab: {
    position: 'absolute',
    bottom: 40,
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
