import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import { Plus, User, FileText, DollarSign, Trash2, Clock, ChevronLeft } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import WalletDropdown from '../components/WalletDropdown';
import { useNavigation } from '@react-navigation/native';

export default function ReceivablesScreen() {
  const { receivables, addReceivable, payReceivable, deleteReceivable, showConfirm, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const navigation = useNavigation<any>();

  // Pay Modal State
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedReceivableId, setSelectedReceivableId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);


  const handleOpenPayModal = (id: string, currentAmount: number) => {
    setSelectedReceivableId(id);
    setPayAmount(currentAmount.toString());
    setPayModalVisible(true);
  };

  const handlePayConfirm = async () => {
    const numericAmount = parseFloat(payAmount);
    if (selectedReceivableId && selectedWalletId && !isNaN(numericAmount) && numericAmount > 0) {
      await payReceivable(selectedReceivableId, numericAmount, selectedWalletId);
      setPayModalVisible(false);
      setSelectedReceivableId(null);
      setPayAmount('');
      setSelectedWalletId(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      'Delete Record',
      `Are you sure you want to delete the pending payment from ${name}? This action cannot be undone.`,
      () => deleteReceivable(id)
    );
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>

          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Who hasn't paid yet?</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {receivables.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Clock size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>All clear!</Text>
            <Text style={styles.emptySubtitle}>No pending payments recorded. Great job keeping track!</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate('AddReceivable')}
            >
              <Plus size={18} color="#ffffff" />
              <Text style={styles.createBtnText}>Record Pending Payment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          receivables.map((item) => (
            <View key={item.id} style={styles.receivableCard}>
              <View style={styles.cardTop}>
                <View style={styles.personInfo}>
                  <View>
                    <Text style={styles.personName}>{item.personName}</Text>
                    <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <TouchableOpacity
                    style={styles.trashBtnTop}
                    onPress={() => handleDelete(item.id, item.personName)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                  <Text style={styles.amountText}>₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardBottom}>
                <View style={styles.taskInfo}>
                  <FileText size={14} color={colors.textMuted} />
                  <Text style={styles.taskName}>{item.taskName}</Text>
                </View>
                <TouchableOpacity
                  style={styles.paidBtn}
                  onPress={() => handleOpenPayModal(item.id, item.amount)}
                >
                  <Text style={styles.paidBtnText}>Mark Paid</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddReceivable')}
        activeOpacity={0.8}
      >
        <Plus size={30} color="#ffffff" />
      </TouchableOpacity>


      <ActionSheet
        visible={payModalVisible}
        onClose={() => { setPayModalVisible(false); setSelectedReceivableId(null); }}
        title="Process Payment"
      >
        {(() => {
          const item = receivables.find(r => r.id === selectedReceivableId);
          if (!item) return null;

          return (
            <>
              <View style={styles.payInfoRow}>
                <View>
                  <Text style={styles.payLabel}>From</Text>
                  <Text style={styles.payValue}>{item.personName}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.payLabel}>Total Due</Text>
                  <Text style={styles.payValue}>₱{item.amount.toLocaleString()}</Text>
                </View>
              </View>

              <Text style={styles.inputLabel}>Select Wallet to Receive Funds</Text>
              <WalletDropdown
                selectedWalletId={selectedWalletId}
                onSelectWallet={setSelectedWalletId}
              />

              <Text style={styles.inputLabel}>Payment Amount (₱)</Text>
              <View style={styles.inputWrapper}>
                <DollarSign size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={payAmount}
                  onChangeText={setPayAmount}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  (!selectedWalletId || !payAmount || parseFloat(payAmount) <= 0) && styles.saveBtnDisabled
                ]}
                onPress={handlePayConfirm}
                disabled={!selectedWalletId || !payAmount || parseFloat(payAmount) <= 0}
              >
                <Text style={styles.saveBtnText}>
                  {parseFloat(payAmount) >= item.amount ? 'Mark Fully Paid' : 'Record Partial Payment'}
                </Text>
              </TouchableOpacity>
            </>
          );
        })()}
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
  addBtnHeader: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  receivableCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? colors.border : colors.primary + '22',
    padding: 16,
    paddingHorizontal: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.2 : 0.04,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
  },
  personName: {
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
    color: colors.primary,
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
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  taskName: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  paidBtn: {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paidBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: colors.primary,
  },
  trashBtnTop: {
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
  payInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  payLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  payValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  fab: {
    position: 'absolute',
    bottom: 120,
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
