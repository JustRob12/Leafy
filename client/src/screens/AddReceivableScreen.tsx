import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, User, FileText, DollarSign } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

export default function AddReceivableScreen() {
  const { addReceivable, colors, isDarkMode } = useAppContext();
  const navigation = useNavigation<any>();
  const styles = getStyles(colors, isDarkMode);

  const [personName, setPersonName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [amount, setAmount] = useState('');

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (personName.trim() && taskName.trim() && !isNaN(numericAmount) && numericAmount > 0) {
      await addReceivable({
        personName: personName.trim(),
        taskName: taskName.trim(),
        amount: numericAmount,
      });
      navigation.goBack();
    }
  };

  const isFormValid = personName.trim() && taskName.trim() && amount && !isNaN(parseFloat(amount));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record Pending Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.inputLabel}>Who owes you?</Text>
        <View style={styles.inputWrapper}>
          <User size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Person's name"
            placeholderTextColor={colors.textMuted}
            value={personName}
            onChangeText={setPersonName}
            autoFocus
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
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, !isFormValid && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!isFormValid}
        >
          <Text style={styles.saveBtnText}>Record Payment</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: colors.card,
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
    marginBottom: 8,
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
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
});
