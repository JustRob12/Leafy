import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Dimensions, Platform, KeyboardAvoidingView, FlatList, Easing, Keyboard } from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronLeft, Plus, Utensils, Car, Receipt, Heart, ShoppingBag, 
  MoreHorizontal, Coffee, Home, Gift, Smartphone, Gamepad, 
  CreditCard, Briefcase, Camera, Film, Music, Globe, Map, Search
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

export default function WithdrawScreen() {
  const { colors, isDarkMode, withdrawPresets, addWithdrawPreset, wallets, addTransaction, showFeedback } = useAppContext();
  const navigation = useNavigation<any>();
  const styles = getStyles(colors, isDarkMode);

  const [step, setStep] = useState(0); // 0: Reason/Preset, 1: Wallet, 2: Amount
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [walletSearchQuery, setWalletSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Custom Preset Modal State
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetIcon, setNewPresetIcon] = useState('Coffee');
  const searchInputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsSearching(true);
    });
    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsSearching(false);
      searchInputRef.current?.blur();
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // Animations
  const transitionTo = (nextStep: number) => {
    setStep(nextStep);
  };

  const handleSelectPreset = (preset: any) => {
    setSelectedPreset(preset);
    setStep(1);
  };

  const handleWithdraw = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;
    if (!selectedWalletId) {
      showFeedback('error', 'Please select a wallet');
      return;
    }

    if (selectedPreset) {
      const wallet = wallets.find(w => w.id === selectedWalletId);
      if (wallet && numericAmount > wallet.balance) {
        showFeedback('error', 'Insufficient Balance');
        return;
      }

      await addTransaction({
        title: selectedPreset.name,
        amount: numericAmount,
        type: 'withdrawal',
        walletId: selectedWalletId
      });
      navigation.navigate('Main');
    }
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
        <Icon color={colors.primary} size={28} />
        <Text style={styles.simplePresetText} numberOfLines={1}>{preset.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderStep0 = () => {
    const defaultIds = ['1', '2', '3', '4', '5', '6'];
    const defaultPresets = withdrawPresets.filter(p => defaultIds.includes(p.id));
    const customPresets = withdrawPresets.filter(p => !defaultIds.includes(p.id));

    return (
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.stepTitle}>Withdraw Reason</Text>
          
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
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  };

  const renderStep1 = () => {
    const filteredWallets = wallets.filter(w => 
      w.name.toLowerCase().includes(walletSearchQuery.toLowerCase()) ||
      w.purpose.toLowerCase().includes(walletSearchQuery.toLowerCase())
    );

    return (
      <View style={styles.stepContainer}>
        <View style={styles.compactHeader}>
          <View style={styles.summaryTag}>
            <View style={styles.summaryIcon}>
              {ICON_MAP[selectedPreset?.iconName] && React.createElement(ICON_MAP[selectedPreset?.iconName], { size: 14, color: '#fff' })}
            </View>
            <Text style={styles.summaryText}>{selectedPreset?.name}</Text>
          </View>
        </View>

        <View style={styles.amountDisplayWrapperCompact}>
          <Text style={styles.currencyPrefixCompact}>₱</Text>
          <Text style={[styles.amountTextCompact, !amount && { color: colors.textMuted + '44' }]}>
            {amount || '0.00'}
          </Text>
        </View>

        <View style={styles.searchBarWrapper}>
          <Search size={14} color={colors.textMuted} />
          <TextInput 
            ref={searchInputRef}
            style={styles.searchBarInput}
            placeholder="Search wallet..."
            placeholderTextColor={colors.textMuted}
            value={walletSearchQuery}
            onChangeText={setWalletSearchQuery}
            onFocus={() => setIsSearching(true)}
            onBlur={() => setIsSearching(false)}
          />
        </View>

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
                selectedWalletId === wallet.id && styles.miniWalletItemSelected
              ]}
              onPress={() => setSelectedWalletId(wallet.id)}
            >
              <Text style={[styles.miniWalletName, selectedWalletId === wallet.id && { color: '#fff' }]} numberOfLines={1}>
                {wallet.name}
              </Text>
              <Text style={[styles.miniWalletBalance, selectedWalletId === wallet.id && { color: '#fff' }]} numberOfLines={1}>
                ₱{Math.floor(wallet.balance).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
        />

        {!isSearching && (
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
                    setAmount(prev => prev + key);
                  }
                }}
              >
                <Text style={styles.keypadButtonTextCompact}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {!isSearching && (
          <TouchableOpacity 
            style={[styles.withdrawBtnFinal, (!amount || !selectedWalletId) && styles.withdrawBtnDisabled]}
            onPress={handleWithdraw}
            disabled={!amount || !selectedWalletId}
          >
            <Text style={styles.withdrawBtnText}>Confirm Withdrawal</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 30 }} />
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
          <Text style={styles.headerTitle}>Withdraw</Text>
          <View style={styles.progressDots}>
            {[0, 1].map((i) => (
              <View key={i} style={[styles.dot, step >= i && styles.activeDot, step === i && styles.currentDot]} />
            ))}
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mainContent}>
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
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
    marginBottom: 30,
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
    fontSize: 20,
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
    fontSize: 28,
    color: colors.text,
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
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
    width: (width - 64) / 3,
    aspectRatio: 1,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    padding: 10,
  },
  addSimpleItem: {
    width: (width - 64) / 3,
    aspectRatio: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
    padding: 10,
    backgroundColor: 'transparent',
  },
  simplePresetText: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    color: colors.text,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    fontSize: 13,
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
    fontSize: 14,
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
    fontSize: 13,
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
    fontSize: 20,
    color: colors.text,
  },
  withdrawBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  withdrawBtnDisabled: {
    backgroundColor: colors.textMuted + '44',
    shadowOpacity: 0,
    elevation: 0,
  },
  withdrawBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
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
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 14,
    padding: 16,
    fontFamily: theme.fonts.medium,
    fontSize: 16,
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
    marginBottom: 20,
  },
  amountDisplayWrapperCompact: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
  },
  currencyPrefixCompact: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: colors.primary,
    marginRight: 6,
  },
  amountTextCompact: {
    fontFamily: theme.fonts.bold,
    fontSize: 44,
    color: colors.text,
  },
  sectionLabelSmall: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
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
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    marginRight: 10,
    padding: 8,
  },
  miniWalletItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  miniWalletName: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    color: colors.text,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  miniWalletBalance: {
    fontFamily: theme.fonts.medium,
    fontSize: 9,
    color: colors.textMuted,
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
    fontSize: 13,
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
  withdrawBtnFinal: {
    backgroundColor: '#ef4444',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 10,
  },
  keypadButtonCompact: {
    width: (width - 80) / 3,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderRadius: 12,
  },
  keypadButtonTextCompact: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: colors.text,
  },
});
