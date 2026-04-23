import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, CreditCard, Calendar } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const SUBS_ICONS: { [key: string]: any } = {
  'capcut.png': require('../../public/subs/capcut.png'),
  'chatgpt.png': require('../../public/subs/chatgpt.png'),
  'disney.png': require('../../public/subs/disney.png'),
  'gemini.png': require('../../public/subs/gemini.png'),
  'netflix.png': require('../../public/subs/netflix.png'),
  'prime.png': require('../../public/subs/prime.png'),
  'spotify.png': require('../../public/subs/spotify.png'),
};

const ICON_LIST = [
  { id: 'netflix.png', name: 'Netflix' },
  { id: 'spotify.png', name: 'Spotify' },
  { id: 'disney.png', name: 'Disney+' },
  { id: 'prime.png', name: 'Prime' },
  { id: 'chatgpt.png', name: 'ChatGPT' },
  { id: 'gemini.png', name: 'Gemini' },
  { id: 'capcut.png', name: 'CapCut' },
];

export default function AddSubscriptionScreen() {
  const { addSubscription, editSubscription, colors, isDarkMode } = useAppContext();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = getStyles(colors, isDarkMode);

  const editingSubscription = route.params?.subscription;
  const isEditing = !!editingSubscription;

  const [title, setTitle] = useState(editingSubscription?.title || '');
  const [amount, setAmount] = useState(editingSubscription?.amount?.toString() || '');
  const [dayOfMonth, setDayOfMonth] = useState(editingSubscription?.dayOfMonth?.toString() || '1');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(editingSubscription?.icon || null);

  const formatAmount = (text: string) => {
    const raw = text.replace(/,/g, '').replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const handleSave = async () => {
    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    const dayNumeric = parseInt(dayOfMonth);
    
    // Basic validation
    if (!title.trim() || isNaN(numericAmount) || numericAmount <= 0) return;
    if (isNaN(dayNumeric) || dayNumeric < 1 || dayNumeric > 31) return;

    const subscriptionData = {
      title: title.trim(),
      amount: numericAmount,
      dayOfMonth: dayNumeric,
      icon: selectedIcon || undefined,
    };

    if (isEditing) {
      await editSubscription(editingSubscription.id, subscriptionData);
    } else {
      await addSubscription(subscriptionData);
    }
    navigation.goBack();
  };

  const isFormValid = title.trim() && amount && dayOfMonth && !isNaN(parseInt(dayOfMonth)) && !isNaN(parseFloat(amount));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Subscription' : 'New Subscription'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.inputLabel}>Subscription Title</Text>
        <View style={styles.inputWrapper}>
          <CreditCard size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Netflix, Spotify"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        <Text style={styles.inputLabel}>Amount (Monthly)</Text>
        <View style={styles.inputWrapper}>
          <Text style={{ fontSize: 18, color: colors.textMuted, fontFamily: theme.fonts.bold, marginRight: 12 }}>₱</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => setAmount(formatAmount(text))}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Calendar size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={dayOfMonth}
            onChangeText={setDayOfMonth}
          />
        </View>

        <Text style={styles.inputLabel}>Select Icon (Optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconRow}>
          <TouchableOpacity 
            style={[styles.iconOption, !selectedIcon && styles.iconOptionActive]}
            onPress={() => setSelectedIcon(null)}
          >
            <CreditCard size={20} color={!selectedIcon ? colors.primary : colors.textMuted} />
          </TouchableOpacity>
          {ICON_LIST.map((icon) => (
            <TouchableOpacity 
              key={icon.id}
              style={[styles.iconOption, selectedIcon === icon.id && styles.iconOptionActive, { borderWidth: 0, backgroundColor: 'transparent' }]}
              onPress={() => setSelectedIcon(icon.id)}
            >
              <Image source={SUBS_ICONS[icon.id]} style={[styles.iconImage, selectedIcon === icon.id && styles.iconImageActive]} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.infoBox}>
          <Calendar size={18} color={colors.primary} />
          <Text style={styles.infoText}>This will track your subscription payment day and alert you 3 days before it's due.</Text>
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, !isFormValid && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!isFormValid}
        >
          <Text style={styles.saveBtnText}>{isEditing ? 'Update Subscription' : 'Save Subscription'}</Text>
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.05)' : '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.2)',
    marginTop: 20,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
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
  iconRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 4,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconOptionActive: {
    borderColor: colors.primary,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    borderWidth: 2,
  },
  iconImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
    resizeMode: 'contain',
  },
  iconImageActive: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
});
