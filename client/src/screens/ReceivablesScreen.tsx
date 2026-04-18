import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '../theme';
import { Plus, User, FileText, DollarSign, Trash2, Clock, ChevronLeft } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import { useNavigation } from '@react-navigation/native';

export default function ReceivablesScreen() {
  const { receivables, addReceivable, deleteReceivable, showConfirm, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [personName, setPersonName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddReceivable = async () => {
    const numericAmount = parseFloat(amount);
    if (personName.trim() && taskName.trim() && !isNaN(numericAmount) && numericAmount > 0) {
      await addReceivable({
        personName: personName.trim(),
        taskName: taskName.trim(),
        amount: numericAmount,
      });
      setModalVisible(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setPersonName('');
    setTaskName('');
    setAmount('');
  };

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      "Mark as Paid?",
      `Has "${name}" paid for the task? This will remove it from the list.`,
      () => deleteReceivable(id)
    );
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Who hasn't paid yet?</Text>
        <TouchableOpacity style={styles.addBtnHeader} onPress={() => setModalVisible(true)}>
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
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
              onPress={() => setModalVisible(true)}
            >
              <Plus size={18} color="#ffffff" />
              <Text style={styles.createBtnText}>Record Pending Payment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          receivables.map((item) => (
            <View key={item.id} style={styles.receivableCard}>
              <View style={styles.accentLine} />
              <View style={styles.cardTop}>
                <View style={styles.personInfo}>
                  <View style={styles.userIconWrapper}>
                    <User size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.personName}>{item.personName}</Text>
                    <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                  </View>
                </View>
                <Text style={styles.amountText}>₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardBottom}>
                <View style={styles.taskInfo}>
                  <FileText size={14} color={colors.textMuted} />
                  <Text style={styles.taskName}>{item.taskName}</Text>
                </View>
                <TouchableOpacity
                  style={styles.paidBtn}
                  onPress={() => handleDelete(item.id, item.personName)}
                >
                  <Text style={styles.paidBtnText}>Mark Paid</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <ActionSheet
        visible={modalVisible}
        onClose={() => { setModalVisible(false); resetForm(); }}
        title="New Pending Payment"
      >
        <Text style={styles.inputLabel}>Who owes you?</Text>
        <View style={styles.inputWrapper}>
          <User size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Person's name"
            placeholderTextColor={colors.textMuted}
            value={personName}
            onChangeText={setPersonName}
          />
        </View>

        <Text style={styles.inputLabel}>What for?</Text>
        <View style={styles.inputWrapper}>
          <FileText size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Task description"
            placeholderTextColor={colors.textMuted}
            value={taskName}
            onChangeText={setTaskName}
          />
        </View>

        <Text style={styles.inputLabel}>How much?</Text>
        <View style={styles.inputWrapper}>
          <DollarSign size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, (!personName.trim() || !taskName.trim() || !amount) && styles.saveBtnDisabled]}
          onPress={handleAddReceivable}
          disabled={!personName.trim() || !taskName.trim() || !amount}
        >
          <Text style={styles.saveBtnText}>Record Payment</Text>
        </TouchableOpacity>
      </ActionSheet>
    </View>
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
    paddingTop: theme.spacing.xl,
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
    paddingBottom: 100,
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
    paddingLeft: 22,
    shadowColor: colors.primary,
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
    backgroundColor: colors.primary,
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
});
