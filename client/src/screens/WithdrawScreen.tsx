import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Dimensions, Platform, KeyboardAvoidingView, FlatList, Easing, Keyboard, Image as RNImage } from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronLeft, Plus, Utensils, Car, Receipt, Heart, ShoppingBag, 
  MoreHorizontal, Coffee, Home, Gift, Smartphone, Gamepad, 
  CreditCard, Briefcase, Camera, Film, Music, Globe, Map, Search, Check, ArrowRight
} from 'lucide-react-native';
import WalletDropdown from '../components/WalletDropdown';
import MainHeader from '../components/MainHeader';

const { width, height } = Dimensions.get('window');

const ICON_MAP: { [key: string]: any } = {
  Utensils, Car, Receipt, Heart, ShoppingBag, MoreHorizontal,
  Coffee, Home, Gift, Smartphone, Gamepad, CreditCard,
  Briefcase, Camera, Film, Music, Globe, Map
};

const AVAILABLE_ICONS = Object.keys(ICON_MAP);

const BRAND_LOGOS: { [key: string]: any } = {
  'gcash.png': require('../../public/walletimages/gcash.png'),
  'maya.png': require('../../public/walletimages/maya.png'),
  'paypal.png': require('../../public/walletimages/paypal.png'),
  'wise.png': require('../../public/walletimages/wise.png'),
  'maribank.png': require('../../public/walletimages/maribank.png'),
  'gotyme.png': require('../../public/walletimages/gotyme.png'),
};

export default function WithdrawScreen() {
  const { colors, isDarkMode, withdrawPresets, addWithdrawPreset, wallets, addTransaction, showFeedback } = useAppContext();
  const navigation = useNavigation<any>();
  const styles = getStyles(colors, isDarkMode);

  const [step, setStep] = useState(0); // 0: Reason/Preset, 1: Wallet, 2: Amount
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  
  // Custom Preset Modal State
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetIcon, setNewPresetIcon] = useState('Coffee');
  const searchInputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // No keyboard search listeners needed
  }, []);

  const formatDisplayAmount = (raw: string) => {
    if (!raw) return '0.00';
    const parts = raw.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  // Animations
  const transitionTo = (nextStep: number) => {
    setStep(nextStep);
  };

  const handleSelectPreset = (preset: any) => {
    setSelectedPreset(preset);
    if (step === 1) {
      // Finalize if on the presets step
      handleExpense(preset);
    } else {
      setStep(1);
    }
  };

  const handleExpense = async (presetOverride?: any) => {
    const numericAmount = parseFloat(amount);
    const preset = presetOverride || selectedPreset;

    if (isNaN(numericAmount) || numericAmount <= 0) {
      showFeedback('error', 'Please enter a valid amount');
      return;
    }
    if (!selectedWalletId) {
      showFeedback('error', 'Please select a wallet');
      return;
    }
    if (!preset) {
      showFeedback('error', 'Please select an expense reason');
      return;
    }

    const wallet = wallets.find(w => w.id === selectedWalletId);
    if (wallet && numericAmount > wallet.balance) {
      showFeedback('error', 'Insufficient Balance');
      return;
    }

    await addTransaction({
      title: preset.name,
      amount: numericAmount,
      type: 'withdrawal',
      walletId: selectedWalletId,
      icon: preset.iconName
    });
    navigation.navigate('Main');
  };

  const handleAddPreset = async () => {
    if (newPresetName.trim()) {
      await addWithdrawPreset(newPresetName.trim(), newPresetIcon);
      setNewPresetName('');
      setShowAddPreset(false);
    }
  };

  const renderPresetItem = (preset: any) => {
    const Icon = ICON_MAP[preset.iconName] || MoreHorizontal;
    return (
      <TouchableOpacity 
        key={preset.id} 
        style={styles.simplePresetItem}
        onPress={() => handleSelectPreset(preset)}
      >
        <Icon color={colors.primary} size={22} />
        <Text style={styles.simplePresetText} numberOfLines={1}>{preset.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderStep0 = () => {
    const filteredWallets = wallets;

    return (
      <View style={styles.stepContainer}>
        <View style={styles.amountDisplayWrapperCompact}>
          <Text style={styles.currencyPrefixCompact}>₱</Text>
          <Text style={[styles.amountTextCompact, !amount && { color: colors.textMuted + '44' }]}>
            {formatDisplayAmount(amount)}
          </Text>
        </View>

        <Text style={styles.sectionLabelSmall}>SELECT WALLET</Text>
        <FlatList 
          data={filteredWallets}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.walletSliderContent}
          renderItem={({ item: wallet }) => (
            <TouchableOpacity 
              style={[
                styles.miniWalletItem,
                { backgroundColor: wallet.color || (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') },
                selectedWalletId === wallet.id && styles.miniWalletItemSelected
              ]}
              onPress={() => setSelectedWalletId(prev => prev === wallet.id ? null : wallet.id)}
            >
              {selectedWalletId === wallet.id && (
                <View style={styles.selectedIndicator}>
                  <Check size={8} color="#ffffff" strokeWidth={3} />
                </View>
              )}
              <View style={styles.miniWalletIconBox}>
                {(() => {
                  if (wallet.iconType === 'preset' && wallet.presetLogo) {
                    return <RNImage source={BRAND_LOGOS[wallet.presetLogo]} style={styles.miniWalletLogo as any} />;
                  }
                  return <CreditCard size={14} color="#ffffff" />;
                })()}
              </View>
              <Text style={[styles.miniWalletName, { color: '#ffffff' }]} numberOfLines={1}>
                {wallet.name}
              </Text>
              <Text style={[styles.miniWalletBalance, { color: 'rgba(255, 255, 255, 0.8)' }]} numberOfLines={1}>
                ₱{Math.floor(wallet.balance).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
        />

        <View style={styles.keypadBottom}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'DEL'].map((key) => (
              <TouchableOpacity 
                key={key} 
                style={styles.keypadButtonCompact}
                onPress={() => {
                  if (key === 'DEL') {
                    setAmount(prev => prev.slice(0, -1));
                  } else if (key === '.') {
                    if (!amount.includes('.')) setAmount(prev => prev + '.');
                  } else {
                    if (amount.includes('.') && amount.split('.')[1].length >= 2) return;
                    setAmount(prev => prev + key);
                  }
                }}
              >
                <Text style={styles.keypadButtonTextCompact}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        
        <TouchableOpacity 
            style={[styles.expenseBtnFinal, (!amount || !selectedWalletId) && styles.expenseBtnDisabled]}
            onPress={() => setStep(1)}
            disabled={!amount || !selectedWalletId}
          >
            <Text style={styles.expenseBtnText}>Next: Select Reason</Text>
          </TouchableOpacity>
        <View style={{ height: 30 }} />
      </View>
    );
  };

  const renderStep1 = () => {
    const defaultIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const defaultPresets = withdrawPresets.filter(p => defaultIds.includes(p.id));
    const customPresets = withdrawPresets.filter(p => !defaultIds.includes(p.id));

    return (
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.summaryRow}>
             <Text style={styles.summaryTextMain}>₱{formatDisplayAmount(amount)}</Text>
             <ArrowRight size={14} color={colors.textMuted} />
             <Text style={styles.summaryTextWallet}>{wallets.find(w => w.id === selectedWalletId)?.name}</Text>
          </View>

          <Text style={styles.stepTitle}>Expense Reason</Text>
          
          <Text style={styles.sectionLabel}>QUICK PRESETS</Text>
          <View style={styles.simpleGrid}>
            {defaultPresets.map(renderPresetItem)}
          </View>

          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>YOUR PRESETS</Text>
          <View style={styles.simpleGrid}>
            {customPresets.map(renderPresetItem)}
            <TouchableOpacity 
              style={styles.addSimpleItem}
              onPress={() => setShowAddPreset(true)}
            >
              <Plus color={colors.textMuted} size={28} />
              <Text style={[styles.simplePresetText, { color: colors.textMuted }]}>Add New</Text>
            </TouchableOpacity>
          </View>

          {selectedPreset && (
            <TouchableOpacity 
              style={[styles.expenseBtnFinal, { marginTop: 30 }]}
              onPress={() => handleExpense()}
            >
              <Text style={styles.expenseBtnText}>Confirm {selectedPreset.name}</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => step > 0 ? transitionTo(step - 1) : navigation.goBack()}>
          <ChevronLeft color={colors.text} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrapper}>
          <Text style={styles.headerTitle}>Expense</Text>
          <View style={styles.progressDots}>
            {[0, 1].map((i) => (
              <View key={i} style={[styles.dot, step >= i && styles.activeDot, step === i && styles.currentDot]} />
            ))}
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mainContent}>
        {wallets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Please add a wallet first</Text>
            <TouchableOpacity 
              style={styles.addWalletBtn} 
              onPress={() => navigation.navigate('AddWallet')}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addWalletBtnText}>Add Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {step === 0 && renderStep0()}
            {step === 1 && renderStep1()}
          </>
        )}
      </View>

      {/* Add Preset Modal */}
      {showAddPreset && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Preset</Text>
            <Text style={styles.inputLabel}>Preset Name</Text>
            <TextInput 
              style={styles.modalInput}
              placeholder="e.g., Coffee, Subscription..."
              placeholderTextColor={colors.textMuted}
              value={newPresetName}
              onChangeText={setNewPresetName}
              autoFocus
            />
            
            <Text style={styles.inputLabel}>Choose Icon</Text>
            <View style={styles.iconSelector}>
              <FlatList 
                data={AVAILABLE_ICONS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.iconOption, newPresetIcon === item && styles.iconOptionSelected]}
                    onPress={() => setNewPresetIcon(item)}
                  >
                    {React.createElement(ICON_MAP[item], { size: 20, color: newPresetIcon === item ? '#fff' : colors.primary })}
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAddPreset(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAdd} onPress={handleAddPreset}>
                <Text style={styles.modalAddText}>Add Preset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

const rf = (size: number) => Math.round(size * scale);

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrapper: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(20),
    color: colors.text,
    marginBottom: 6,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  currentDot: {
    width: 16,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(28),
    color: colors.text,
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(12),
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  simpleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  simplePresetItem: {
    width: (width - 76) / 4,
    aspectRatio: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    backgroundColor: colors.card,
  },
  addSimpleItem: {
    width: (width - 76) / 4,
    aspectRatio: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
    padding: 6,
    backgroundColor: 'transparent',
  },
  simplePresetText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    color: colors.text,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  presetItem: {
    width: (width - 56) / 3,
    aspectRatio: 1,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  addPresetItem: {
    width: (width - 56) / 3,
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  presetIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  presetText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(13),
    color: colors.text,
  },
  walletSelectionWrapper: {
    marginBottom: 30,
  },
  presetSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    padding: 16,
    borderRadius: 16,
  },
  summaryLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(14),
    color: colors.textMuted,
    marginRight: 10,
  },
  summaryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  summaryIcon: {
    marginRight: 6,
  },
  summaryText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(13),
    color: '#fff',
  },
  amountDisplayWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 40,
  },
  currencyPrefix: {
    fontFamily: theme.fonts.bold,
    fontSize: 32,
    color: colors.primary,
    marginRight: 8,
  },
  amountText: {
    fontFamily: theme.fonts.bold,
    fontSize: 56,
    color: colors.text,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 30,
  },
  keypadButton: {
    width: (width - 70) / 3,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 16,
  },
  keypadButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(20),
    color: colors.text,
  },
  expenseBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  expenseBtnDisabled: {
    backgroundColor: colors.textMuted + '44',
    shadowOpacity: 0,
    elevation: 0,
  },
  expenseBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(16),
    color: '#fff',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: colors.text,
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(14),
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 14,
    padding: 16,
    fontFamily: theme.fonts.medium,
    fontSize: rf(16),
    color: colors.text,
  },
  iconSelector: {
    marginTop: 10,
    marginBottom: 20,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconOptionSelected: {
    backgroundColor: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: colors.textMuted,
  },
  modalAdd: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalAddText: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: '#fff',
  },
  // Compact / Mini Styles
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  amountDisplayWrapperCompact: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 10,
  },
  currencyPrefixCompact: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(24),
    color: colors.primary,
    marginRight: 6,
  },
  amountTextCompact: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(44),
    color: colors.text,
  },
  sectionLabelSmall: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(10),
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  walletMiniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  miniWalletItem: {
    width: (width - 80) / 3.5,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    marginRight: 10,
    padding: 8,
  },
  miniWalletItemSelected: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  miniWalletName: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(10),
    color: colors.text,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  miniWalletBalance: {
    fontFamily: theme.fonts.medium,
    fontSize: 9,
    color: colors.textMuted,
  },
  miniWalletIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  miniWalletLogo: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    height: 40,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  searchBarInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: theme.fonts.medium,
    fontSize: rf(13),
    color: colors.text,
    padding: 0,
  },
  walletSliderContent: {
    paddingRight: 20,
    marginBottom: 0,
    paddingVertical: 4,
  },
  keypadBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  expenseBtnFinal: {
    backgroundColor: colors.danger,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 10,
  },
  keypadButtonCompact: {
    width: (width - 40 - 20) / 3, // Full width minus horizontal padding (20*2) and gaps (10*2)
    height: height * 0.05, 
    minHeight: 40,
    maxHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  keypadButtonTextCompact: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(16),
    color: colors.text,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyStateText: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: 20,
  },
  addWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
    gap: 8,
  },
  addWalletBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(16),
    color: '#fff',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    gap: 12,
  },
  summaryTextMain: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.primary,
  },
  summaryTextWallet: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
