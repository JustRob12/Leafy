import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Animated, 
  Dimensions, 
  Platform, 
  FlatList, 
  Image as RNImage,
  Modal
} from 'react-native';
import { theme } from '../theme';
import { useAppContext, DEFAULT_WITHDRAW_PRESETS, getWalletTotalBalanceInPhp } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronLeft, Plus, Utensils, Car, Receipt, Heart, ShoppingBag, 
  MoreHorizontal, Coffee, Home, Gift, Smartphone, Gamepad, 
  CreditCard, Briefcase, Camera, Film, Music, Globe, Map, Search, Check, ArrowRight, X, ListFilter, Sliders
} from 'lucide-react-native';

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

const defaultIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function WithdrawScreen() {
  const { colors, isDarkMode, withdrawPresets, addWithdrawPreset, deleteWithdrawPreset, wallets, addTransaction, showFeedback, usdToPhpRate } = useAppContext();
  const navigation = useNavigation<any>();
  const styles = getStyles(colors, isDarkMode);

  const [step, setStep] = useState(0); // 0: Keypad & Amount, 1: Full Presets Page
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  
  // Custom Preset Modal State
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetIcon, setNewPresetIcon] = useState('Coffee');

  // Auto-select first wallet if available
  useEffect(() => {
    if (wallets && wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  const formatDisplayAmount = (raw: string) => {
    if (!raw) return '0.00';
    const parts = raw.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const handleSelectPreset = (preset: any) => {
    setSelectedPreset(preset);
    if (step === 1) {
      setStep(0); // Go back to keypad/amount step once preset is chosen
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
      showFeedback('error', 'Please select an expense preset / reason');
      return;
    }

    const wallet = wallets.find(w => w.id === selectedWalletId);
    if (wallet && numericAmount > getWalletTotalBalanceInPhp(wallet, usdToPhpRate)) {
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
      const created = await addWithdrawPreset(newPresetName.trim(), newPresetIcon);
      setNewPresetName('');
      setShowAddPreset(false);
      if (created) {
        setSelectedPreset(created);
      }
    }
  };

  const effectivePresets = (withdrawPresets && withdrawPresets.length > 0) ? withdrawPresets : DEFAULT_WITHDRAW_PRESETS;
  const customPresets = effectivePresets.filter(p => !defaultIds.includes(p.id));
  const quickPresets = effectivePresets.filter(p => defaultIds.includes(p.id));

  const renderPresetItem = (preset: any) => {
    const Icon = ICON_MAP[preset.iconName] || MoreHorizontal;
    const isCustom = !defaultIds.includes(preset.id);
    const isSelected = selectedPreset?.id === preset.id;

    return (
      <TouchableOpacity 
        key={preset.id} 
        style={[
          styles.simplePresetItem, 
          { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.border },
          isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
        ]}
        onPress={() => handleSelectPreset(preset)}
      >
        <View style={styles.presetItemLeft}>
          <Icon color={isSelected ? '#ffffff' : colors.primary} size={20} />
          <Text style={[styles.simplePresetText, { color: isSelected ? '#ffffff' : colors.text }]} numberOfLines={1}>
            {preset.name}
          </Text>
        </View>

        {isCustom && (
          <TouchableOpacity 
            style={styles.deletePresetBadge} 
            onPress={(e) => {
              e.stopPropagation();
              deleteWithdrawPreset(preset.id);
              if (selectedPreset?.id === preset.id) {
                setSelectedPreset(null);
              }
            }}
          >
            <X size={14} color={isSelected ? '#ffffff' : '#ef4444'} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderStep0 = () => {
    return (
      <View style={styles.stepContainer}>
        {/* Amount Display */}
        <View style={styles.amountDisplayWrapperCompact}>
          <Text style={[styles.currencyPrefixCompact, { color: colors.primary }]}>₱</Text>
          <Text style={[styles.amountTextCompact, { color: colors.text }, !amount && { color: colors.textMuted + '44' }]}>
            {formatDisplayAmount(amount)}
          </Text>
        </View>

        {/* Wallet Selector Header */}
        <Text style={[styles.sectionLabelSmall, { color: colors.textMuted }]}>SELECT WALLET</Text>
        <FlatList 
          data={wallets}
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
              onPress={() => setSelectedWalletId(wallet.id)}
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
                ₱{Math.floor(getWalletTotalBalanceInPhp(wallet, usdToPhpRate)).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Preset Selector Header */}
        <View style={styles.presetHeaderRow}>
          <Text style={[styles.sectionLabelSmall, { color: colors.textMuted }]}>PRESET / REASON (OPTIONAL)</Text>
          <TouchableOpacity onPress={() => setStep(1)} style={styles.allPresetsLink}>
            <Text style={[styles.allPresetsLinkText, { color: colors.primary }]}>All Presets Page ›</Text>
          </TouchableOpacity>
        </View>

        {/* Preset Horizontal Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetSliderContent}>
          {effectivePresets.map((preset) => {
            const Icon = ICON_MAP[preset.iconName] || MoreHorizontal;
            const isSelected = selectedPreset?.id === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.miniPresetChip,
                  { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.border },
                  isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setSelectedPreset((prev: any) => prev?.id === preset.id ? null : preset)}
              >
                <Icon size={14} color={isSelected ? '#ffffff' : colors.text} />
                <Text style={[styles.miniPresetChipText, { color: isSelected ? '#ffffff' : colors.text }]}>{preset.name}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Add Preset Chip Button */}
          <TouchableOpacity
            style={[
              styles.miniPresetChip,
              { backgroundColor: isDarkMode ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)', borderColor: colors.primary }
            ]}
            onPress={() => setShowAddPreset(true)}
          >
            <Plus size={14} color={colors.primary} />
            <Text style={[styles.miniPresetChipText, { color: colors.primary, fontFamily: theme.fonts.bold }]}>+ Add Preset</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Keypad */}
        <View style={styles.keypadBottom}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'DEL'].map((key) => (
            <TouchableOpacity 
              key={key} 
              style={[styles.keypadButtonCompact, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
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
              <Text style={[styles.keypadButtonTextCompact, { color: colors.text }]}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={[
            styles.expenseBtnFinal, 
            { backgroundColor: colors.primary },
            (!amount || !selectedWalletId) && styles.expenseBtnDisabled
          ]}
          onPress={() => {
            if (selectedPreset) {
              handleExpense();
            } else {
              setStep(1);
            }
          }}
          disabled={!amount || !selectedWalletId}
        >
          <Text style={styles.expenseBtnText}>
            {selectedPreset ? `Confirm ${selectedPreset.name} Expense` : 'Next: Select Expense Preset'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStep1 = () => {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          {/* Summary Row */}
          <View style={[styles.summaryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryTextMain, { color: colors.primary }]}>₱{formatDisplayAmount(amount)}</Text>
            <ArrowRight size={14} color={colors.textMuted} />
            <Text style={[styles.summaryTextWallet, { color: colors.text }]}>
              {wallets.find(w => w.id === selectedWalletId)?.name || 'Select Wallet'}
            </Text>
          </View>

          {/* Add Preset Top Banner Button */}
          <TouchableOpacity
            style={[styles.bigAddPresetCard, { backgroundColor: isDarkMode ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)', borderColor: colors.primary }]}
            onPress={() => setShowAddPreset(true)}
            activeOpacity={0.8}
          >
            <Plus size={22} color={colors.primary} />
            <Text style={[styles.bigAddPresetText, { color: colors.primary }]}>+ Add New Custom Preset</Text>
          </TouchableOpacity>

          <Text style={[styles.stepTitle, { color: colors.text }]}>Expense Presets & Reasons</Text>

          {/* Custom User Presets Section */}
          {customPresets.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.primary, marginTop: 12 }]}>YOUR CUSTOM PRESETS</Text>
              <View style={styles.simpleGrid}>
                {customPresets.map(renderPresetItem)}
              </View>
            </>
          )}
          
          {/* Default Quick Presets Section */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 18 }]}>QUICK PRESETS</Text>
          <View style={styles.simpleGrid}>
            {quickPresets.map(renderPresetItem)}
          </View>

          {selectedPreset && (
            <TouchableOpacity 
              style={[styles.expenseBtnFinal, { backgroundColor: colors.primary, marginTop: 30 }]}
              onPress={() => handleExpense()}
            >
              <Text style={styles.expenseBtnText}>Confirm {selectedPreset.name} Expense</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => step > 0 ? setStep(step - 1) : navigation.goBack()}>
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

        {/* Page Switcher Button */}
        <TouchableOpacity 
          style={[styles.headerPresetToggleBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]} 
          onPress={() => setStep(step === 1 ? 0 : 1)}
        >
          <ListFilter size={16} color={colors.primary} />
          <Text style={[styles.headerPresetToggleText, { color: colors.primary }]}>
            {step === 1 ? 'Amount' : 'Presets'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {wallets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.text }]}>Please add a wallet first</Text>
            <TouchableOpacity 
              style={[styles.addWalletBtn, { backgroundColor: colors.primary }]} 
              onPress={() => navigation.navigate('AddWallet')}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addWalletBtnText}>Add Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          step === 0 ? renderStep0() : renderStep1()
        )}
      </View>

      {/* Add Custom Preset Modal */}
      <Modal
        visible={showAddPreset}
        transparent
        animationType="none"
        onRequestClose={() => setShowAddPreset(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Custom Preset</Text>

            <Text style={[styles.modalInputLabel, { color: colors.text }]}>Preset Name</Text>
            <TextInput 
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc' }]}
              placeholder="e.g., Coffee, Tuition, Rent, Netflix..."
              placeholderTextColor={colors.textMuted}
              value={newPresetName}
              onChangeText={setNewPresetName}
              autoFocus
            />
            
            <Text style={[styles.modalInputLabel, { color: colors.text, marginTop: 14 }]}>Choose Icon</Text>
            <View style={styles.iconSelector}>
              <FlatList 
                data={AVAILABLE_ICONS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.iconOption, 
                      { borderColor: colors.border },
                      newPresetIcon === item && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setNewPresetIcon(item)}
                  >
                    {React.createElement(ICON_MAP[item], { size: 20, color: newPresetIcon === item ? '#fff' : colors.primary })}
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalCancel, { backgroundColor: colors.border }]} 
                onPress={() => setShowAddPreset(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalAdd, { backgroundColor: colors.primary }]} 
                onPress={handleAddPreset}
              >
                <Text style={styles.modalAddText}>Save Preset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const rf = (size: number) => Math.round(size * (width / 375));

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
    marginBottom: 4,
  },
  headerPresetToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  headerPresetToggleText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(13),
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  currentDot: {
    width: 14,
    backgroundColor: colors.primary,
  },
  mainContent: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  amountDisplayWrapperCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  currencyPrefixCompact: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(32),
    marginRight: 6,
  },
  amountTextCompact: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(38),
  },
  sectionLabelSmall: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(11),
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  walletSliderContent: {
    gap: 10,
    paddingBottom: 10,
  },
  miniWalletItem: {
    width: 120,
    padding: 12,
    borderRadius: 16,
    position: 'relative',
  },
  miniWalletItemSelected: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniWalletIconBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  miniWalletLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  miniWalletName: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(12),
  },
  miniWalletBalance: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
    marginTop: 2,
  },
  presetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  allPresetsLink: {
    paddingVertical: 2,
  },
  allPresetsLinkText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(12),
  },
  presetSliderContent: {
    gap: 8,
    paddingBottom: 12,
  },
  miniPresetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  miniPresetChipText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(13),
  },
  keypadBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  keypadButtonCompact: {
    width: '31%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  keypadButtonTextCompact: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(20),
  },
  expenseBtnFinal: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  expenseBtnDisabled: {
    opacity: 0.5,
  },
  expenseBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(16),
    color: '#ffffff',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryTextMain: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(20),
  },
  summaryTextWallet: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(15),
  },
  bigAddPresetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 20,
  },
  bigAddPresetText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(15),
  },
  stepTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
    marginBottom: 12,
  },
  sectionLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(12),
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  simpleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  simplePresetItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  presetItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  simplePresetText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(14),
    flex: 1,
  },
  deletePresetBadge: {
    padding: 4,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyStateText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
    marginBottom: 16,
  },
  addWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  addWalletBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(15),
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInputLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(13),
    marginBottom: 6,
  },
  modalInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: theme.fonts.medium,
    fontSize: rf(15),
  },
  iconSelector: {
    marginVertical: 12,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancel: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
  },
  modalAdd: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAddText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
    color: '#ffffff',
  },
});
