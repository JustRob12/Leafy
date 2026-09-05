import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { theme } from '../theme';
import { useAppContext, DEFAULT_INCOME_PRESETS, IncomePresetType } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Plus,
  TrendingUp,
  Briefcase,
  Laptop,
  Store,
  Coins,
  Award,
  Gift,
  Home,
  Receipt,
  Sparkles,
  ShoppingBag,
  MoreHorizontal,
  Coffee,
  Heart,
  Car,
  Utensils,
  CreditCard,
  Smartphone,
  Globe,
  Map,
  X,
} from 'lucide-react-native';
import CalculatorKeypad from '../components/CalculatorKeypad';
import BottomWalletBar from '../components/BottomWalletBar';
import WalletPickerModal from '../components/WalletPickerModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const rf = (size: number) => Math.round(size * scale);

const ICON_MAP: { [key: string]: any } = {
  Briefcase,
  Laptop,
  Store,
  Coins,
  Award,
  TrendingUp,
  Gift,
  Home,
  Receipt,
  Sparkles,
  ShoppingBag,
  MoreHorizontal,
  Coffee,
  Heart,
  Car,
  Utensils,
  CreditCard,
  Smartphone,
  Globe,
  Map,
};

const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export default function DepositScreen() {
  const {
    colors,
    isDarkMode,
    wallets,
    transactions,
    addTransaction,
    showFeedback,
    usdToPhpRate,
    incomePresets,
    addIncomePreset,
  } = useAppContext();
  const navigation = useNavigation<any>();
  const styles = useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

  const [selectedPreset, setSelectedPreset] = useState<IncomePresetType | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [expression, setExpression] = useState('');
  const [isResult, setIsResult] = useState(false);
  const [currency, setCurrency] = useState<'PHP' | 'USD'>('PHP');
  const [showWalletPicker, setShowWalletPicker] = useState(false);

  // Custom Preset Modal State
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetIcon, setNewPresetIcon] = useState('Briefcase');

  // Auto-select first wallet if available
  useEffect(() => {
    if (wallets && wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  // Safe arithmetic evaluator
  const evaluateMath = (expr: string): number => {
    if (!expr.trim()) return 0;
    const parts = expr.trim().split(/\s+/);
    let total = parseFloat(parts[0]) || 0;
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i];
      const val = parseFloat(parts[i + 1]) || 0;
      if (op === '+') total += val;
      else if (op === '-' || op === '−') total -= val;
    }
    return isNaN(total) ? 0 : total;
  };

  const handleDigit = (digit: string) => {
    if (isResult) {
      setAmount(digit);
      setIsResult(false);
    } else {
      if (amount === '0') {
        setAmount(digit);
      } else {
        if (amount.includes('.')) {
          const decimals = amount.split('.')[1];
          if (decimals && decimals.length >= 2) return;
        }
        setAmount(prev => prev + digit);
      }
    }
  };

  const handleDot = () => {
    if (isResult) {
      setAmount('0.');
      setIsResult(false);
    } else {
      if (!amount) {
        setAmount('0.');
      } else if (!amount.includes('.')) {
        setAmount(prev => prev + '.');
      }
    }
  };

  const handleOperator = (op: '+' | '-') => {
    const currentVal = amount || '0';
    if (expression && !isResult) {
      const computed = evaluateMath(expression + currentVal);
      const rounded = String(Math.round(computed * 100) / 100);
      setExpression(rounded + ' ' + op + ' ');
      setAmount(rounded);
      setIsResult(true);
    } else {
      setExpression(currentVal + ' ' + op + ' ');
      setIsResult(true);
    }
  };

  const handleEquals = () => {
    if (expression) {
      const currentVal = amount || '0';
      const computed = evaluateMath(expression + currentVal);
      const rounded = String(Math.max(0, Math.round(computed * 100) / 100));
      setAmount(rounded);
      setExpression('');
      setIsResult(true);
    }
  };

  const handleClear = () => {
    setAmount('');
    setExpression('');
    setIsResult(false);
  };

  const handleBackspace = () => {
    if (isResult) {
      setAmount('');
      setExpression('');
      setIsResult(false);
    } else if (amount.length > 0) {
      setAmount(prev => prev.slice(0, -1));
    }
  };

  const handleIncome = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showFeedback('error', 'Please enter a valid amount');
      return;
    }
    if (!selectedWalletId) {
      showFeedback('error', 'Please select a wallet');
      return;
    }

    const presetTitle = selectedPreset ? selectedPreset.name : 'Income';
    const title = currency === 'USD' ? `${presetTitle} (USD)` : presetTitle;
    const icon = selectedPreset ? selectedPreset.iconName : 'TrendingUp';

    // 1. Show the confirmation modal first
    showFeedback('success', '');

    // 2. Wait for modal to display before clearing inputs and adding to recent income
    setTimeout(async () => {
      await addTransaction({
        title,
        amount: numericAmount,
        currency,
        exchangeRate: currency === 'USD' ? usdToPhpRate : 1,
        type: 'deposit',
        walletId: selectedWalletId,
        icon,
      }, { skipFeedback: true });
      setAmount('');
      setExpression('');
      setIsResult(false);
      setSelectedPreset(null);
    }, 400);
  };

  const handleAddPreset = async () => {
    if (newPresetName.trim()) {
      const created = await addIncomePreset(newPresetName.trim(), newPresetIcon);
      setNewPresetName('');
      setShowAddPreset(false);
      if (created) {
        setSelectedPreset(created);
      }
    }
  };

  const formatDisplayAmount = (raw: string) => {
    if (!raw) return '0.00';
    const parts = raw.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const effectivePresets =
    incomePresets && incomePresets.length > 0 ? incomePresets : DEFAULT_INCOME_PRESETS;
  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  const numericAmount = parseFloat(amount) || 0;

  // Recent income transactions (excluding daily interest)
  const recentIncomes = (transactions || [])
    .filter(tx => tx.type === 'deposit' && tx.category !== 'interest')
    .slice(0, 15);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft color={colors.text} size={28} />
        </TouchableOpacity>

        {/* Selected Wallet Amount Badge (Medium-sized, Simple Badge) */}
        {selectedWallet ? (
          <TouchableOpacity
            style={styles.walletHeaderBadge}
            onPress={() => setShowWalletPicker(true)}
            activeOpacity={0.75}
          >
            <View style={[styles.walletBadgeDot, { backgroundColor: selectedWallet.color || colors.primary }]} />
            <Text style={[styles.walletBadgeName, { color: colors.text }]} numberOfLines={1}>
              {selectedWallet.name}
            </Text>
            <Text style={[styles.walletBadgeDivider, { color: colors.textMuted }]}>•</Text>
            <Text style={[styles.walletBadgeBalance, { color: colors.primary }]}>
              {currency === 'USD'
                ? `$${(selectedWallet.usdBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `₱${(selectedWallet.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.headerTitle}>Income</Text>
          </View>
        )}

        <View style={{ width: 44 }} />
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
          <View style={styles.contentFlex}>
            {/* Currency Toggle */}
            <View style={styles.currencyToggleContainer}>
              <TouchableOpacity
                style={[styles.currencyPill, currency === 'PHP' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setCurrency('PHP')}
                activeOpacity={0.8}
              >
                <Text style={styles.currencyFlag}>🇵🇭</Text>
                <Text style={[styles.currencyPillText, currency === 'PHP' && styles.currencyPillTextActive]}>
                  PHP (₱)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.currencyPill, currency === 'USD' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setCurrency('USD')}
                activeOpacity={0.8}
              >
                <Text style={styles.currencyFlag}>🇺🇸</Text>
                <Text style={[styles.currencyPillText, currency === 'USD' && styles.currencyPillTextActive]}>
                  USD ($)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Display Area (Amount + Formula + Selected Preset Badge) */}
            <View style={styles.displaySection}>
              {expression ? (
                <Text style={[styles.expressionPreview, { color: colors.textMuted }]}>
                  {expression} {isResult ? '' : amount}
                </Text>
              ) : null}

              <View style={styles.amountDisplayRow}>
                <Text style={[styles.currencyPrefix, { color: colors.primary }]}>
                  {currency === 'USD' ? '$' : '₱'}
                </Text>
                <Text
                  style={[
                    styles.amountText,
                    { color: colors.text },
                    !amount && { color: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatDisplayAmount(amount)}
                </Text>
              </View>

              {currency === 'USD' && (
                <View style={styles.conversionHintWrapper}>
                  <Text style={[styles.conversionHintText, { color: colors.textMuted }]}>
                    {numericAmount > 0
                      ? `≈ ₱${(numericAmount * usdToPhpRate).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : `1 USD = ₱${usdToPhpRate.toFixed(2)}`}
                  </Text>
                </View>
              )}

              {/* Selected Preset Badge */}
              <View style={styles.statusHintRow}>
                {selectedPreset ? (
                  <View style={[styles.selectedPresetBadge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '30' }]}>
                    {(() => {
                      const Icon = ICON_MAP[selectedPreset.iconName] || TrendingUp;
                      return <Icon size={12} color={colors.primary} style={{ marginRight: 4 }} />;
                    })()}
                    <Text style={[styles.selectedPresetBadgeText, { color: colors.primary }]}>
                      {selectedPreset.name}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.bottomSection}>
              {/* Horizontally Scrollable Recent Incomes */}
              {recentIncomes.length > 0 && (
                <View style={styles.recentSection}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recentScrollContent}
                  >
                    {recentIncomes.map((tx) => {
                      const cleanTitle = tx.title.replace(/^Added Income\s*(\((PHP|USD)\))?/i, 'Income').trim();
                      const displayAmt = `+${tx.currency === 'USD' ? '$' : '₱'}${tx.amount.toLocaleString('en-US', {
                        minimumFractionDigits: tx.amount % 1 === 0 ? 0 : 2,
                        maximumFractionDigits: 2,
                      })}`;
                      const Icon = tx.icon && ICON_MAP[tx.icon] ? ICON_MAP[tx.icon] : TrendingUp;
                      return (
                        <TouchableOpacity
                          key={tx.id}
                          style={styles.recentChip}
                          onPress={() => {
                            setAmount(String(tx.amount));
                            if (tx.currency) setCurrency(tx.currency);
                            const matchPreset = effectivePresets.find(
                              p => p.name.toLowerCase() === tx.title.replace(/\s*\(USD\)/i, '').trim().toLowerCase()
                            );
                            if (matchPreset) setSelectedPreset(matchPreset);
                            setIsResult(false);
                          }}
                          activeOpacity={0.75}
                        >
                          <Icon size={11} color={colors.primary} style={{ marginRight: 4 }} />
                          <Text style={styles.recentChipTitle} numberOfLines={1}>
                            {cleanTitle}
                          </Text>
                          <Text style={styles.recentChipAmount}>
                            {displayAmt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Presets Row: Small chips right above keyboard */}
              <View style={styles.presetsContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetsScrollContent}
                >
                  {/* Add Preset Button Chip */}
                  <TouchableOpacity
                    style={[
                      styles.smallPresetChip,
                      styles.addPresetChip,
                      {
                        backgroundColor: isDarkMode ? 'rgba(16,185,129,0.15)' : '#eaf8f0',
                        borderColor: isDarkMode ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.25)',
                      },
                    ]}
                    onPress={() => setShowAddPreset(true)}
                    activeOpacity={0.7}
                  >
                    <Plus size={13} color={colors.primary} strokeWidth={2.5} />
                    <Text style={[styles.smallPresetText, { color: colors.primary, fontFamily: theme.fonts.bold }]}>
                      Add
                    </Text>
                  </TouchableOpacity>

                  {/* Preset Items */}
                  {effectivePresets.map(preset => {
                    const Icon = ICON_MAP[preset.iconName] || TrendingUp;
                    const isSelected = selectedPreset?.id === preset.id;
                    return (
                      <TouchableOpacity
                        key={preset.id}
                        style={[
                          styles.smallPresetChip,
                          {
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                            borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                          },
                          isSelected && {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                          },
                        ]}
                        onPress={() =>
                          setSelectedPreset((prev: any) => (prev?.id === preset.id ? null : preset))
                        }
                        activeOpacity={0.75}
                      >
                        <Icon
                          size={13}
                          color={isSelected ? '#ffffff' : colors.primary}
                          strokeWidth={2}
                        />
                        <Text
                          style={[
                            styles.smallPresetText,
                            { color: isSelected ? '#ffffff' : colors.text },
                          ]}
                          numberOfLines={1}
                        >
                          {preset.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 4x4 Calculator Keypad */}
              <CalculatorKeypad
                onDigit={handleDigit}
                onDot={handleDot}
                onOperator={handleOperator}
                onClear={handleClear}
                onBackspace={handleBackspace}
                onEquals={handleEquals}
              />

              {/* Bottom Action Bar: [Account/Wallet Picker] + [Save Income] */}
              <BottomWalletBar
                selectedWallet={selectedWallet}
                onOpenWalletPicker={() => setShowWalletPicker(true)}
                onSave={handleIncome}
                saveLabel="Income"
                disabled={!amount || numericAmount <= 0 || !selectedWalletId}
              />
            </View>
          </View>
        )}
      </View>

      {/* Wallet Picker Modal */}
      <WalletPickerModal
        visible={showWalletPicker}
        onClose={() => setShowWalletPicker(false)}
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onSelectWallet={setSelectedWalletId}
      />

      {/* Add Custom Income Preset Modal */}
      {showAddPreset && (
        <Modal visible={showAddPreset} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>New Income Preset</Text>
                <TouchableOpacity onPress={() => setShowAddPreset(false)} style={styles.modalCloseBtn}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalInputLabel, { color: colors.textMuted }]}>PRESET REASON / NAME</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  },
                ]}
                placeholder="e.g., Salary, Freelance, Commission..."
                placeholderTextColor={colors.textMuted}
                value={newPresetName}
                onChangeText={setNewPresetName}
                autoFocus
              />

              <Text style={[styles.modalInputLabel, { color: colors.textMuted, marginTop: 14 }]}>CHOOSE ICON</Text>
              <View style={styles.iconSelector}>
                <FlatList
                  data={AVAILABLE_ICONS}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.iconOption,
                        { borderColor: colors.border },
                        newPresetIcon === item && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setNewPresetIcon(item)}
                    >
                      {React.createElement(ICON_MAP[item], {
                        size: 20,
                        color: newPresetIcon === item ? '#fff' : colors.primary,
                      })}
                    </TouchableOpacity>
                  )}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                  onPress={() => setShowAddPreset(false)}
                >
                  <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalSaveBtn,
                    { backgroundColor: colors.primary },
                    !newPresetName.trim() && { opacity: 0.5 },
                  ]}
                  onPress={handleAddPreset}
                  disabled={!newPresetName.trim()}
                >
                  <Text style={styles.modalSaveText}>Create Preset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'ios' ? 56 : 36,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 6,
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    },
    headerTitleWrapper: {
      alignItems: 'center',
    },
    headerTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(20),
      color: colors.text,
    },
    mainContent: {
      flex: 1,
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    },
    contentFlex: {
      flex: 1,
      justifyContent: 'space-between',
    },
    currencyToggleContainer: {
      flexDirection: 'row',
      alignSelf: 'center',
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 24,
      padding: 4,
      gap: 6,
      marginTop: 4,
    },
    currencyPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    currencyFlag: {
      fontSize: rf(15),
      marginRight: 6,
    },
    currencyPillText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(13),
      color: colors.textMuted,
    },
    currencyPillTextActive: {
      color: '#ffffff',
    },
    displaySection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10,
    },
    expressionPreview: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(16),
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    amountDisplayRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
    },
    currencyPrefix: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(28),
      marginRight: 6,
    },
    amountText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(46),
      letterSpacing: -0.5,
    },
    conversionHintWrapper: {
      marginTop: 6,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    },
    conversionHintText: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(12),
    },
    statusHintRow: {
      marginTop: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 24,
    },
    selectedPresetBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
    },
    selectedPresetBadgeText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(12),
    },
    bottomSection: {
      justifyContent: 'flex-end',
    },
    presetsContainer: {
      marginBottom: 6,
    },
    presetsScrollContent: {
      gap: 6,
      paddingVertical: 2,
    },
    smallPresetChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 16,
      borderWidth: 1,
      gap: 5,
    },
    addPresetChip: {},
    smallPresetText: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(12),
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateText: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(16),
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
    walletHeaderBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      paddingHorizontal: 13,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
      maxWidth: SCREEN_WIDTH * 0.65,
    },
    walletBadgeDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      marginRight: 6,
    },
    walletBadgeName: {
      fontFamily: theme.fonts.semiBold,
      fontSize: rf(13),
      maxWidth: 100,
    },
    walletBadgeDivider: {
      marginHorizontal: 5,
      fontSize: rf(11),
    },
    walletBadgeBalance: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(13.5),
    },
    recentSection: {
      marginBottom: 8,
    },
    recentScrollContent: {
      paddingHorizontal: 2,
      gap: 8,
    },
    recentChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      gap: 6,
    },
    recentChipTitle: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(12),
      color: colors.text,
      maxWidth: 90,
    },
    recentChipAmount: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(12),
      color: colors.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      maxWidth: 380,
      borderRadius: 24,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    modalTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(18),
    },
    modalCloseBtn: {
      padding: 4,
    },
    modalInputLabel: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(11),
      letterSpacing: 0.6,
      marginBottom: 6,
    },
    modalInput: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(15),
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 4,
    },
    iconSelector: {
      marginBottom: 20,
    },
    iconOption: {
      width: 42,
      height: 42,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 10,
    },
    modalCancelBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalCancelText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(14),
    },
    modalSaveBtn: {
      flex: 1.5,
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalSaveText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(14),
      color: '#ffffff',
    },
  });

