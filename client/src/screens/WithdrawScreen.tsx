import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  FlatList,
  Modal,
} from 'react-native';
import { theme } from '../theme';
import { useAppContext, DEFAULT_WITHDRAW_PRESETS, getWalletTotalBalanceInPhp } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  Plus,
  ArrowRightLeft,
  Utensils,
  Car,
  Receipt,
  Heart,
  ShoppingBag,
  MoreHorizontal,
  Coffee,
  Home,
  Gift,
  Smartphone,
  Gamepad,
  CreditCard,
  Briefcase,
  Camera,
  Film,
  Music,
  Globe,
  Map,
  TrendingDown,
  ClipboardPaste,
  Trash2,
  X,
  Check,
} from 'lucide-react-native';
import CalculatorKeypad from '../components/CalculatorKeypad';
import BottomWalletBar from '../components/BottomWalletBar';
import WalletPickerModal from '../components/WalletPickerModal';
import { getNumberFromClipboard } from '../utils/clipboardUtils';
import { PRESET_ICON_MAP, AVAILABLE_PRESET_ICONS } from '../constants/presetIcons';

import { rf, useResponsive } from '../utils/responsive';

const ICON_MAP = PRESET_ICON_MAP;
const AVAILABLE_ICONS = AVAILABLE_PRESET_ICONS;
const defaultIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function WithdrawScreen() {
  const {
    colors,
    isDarkMode,
    withdrawPresets,
    addWithdrawPreset,
    deleteWithdrawPreset,
    wallets,
    transactions,
    addTransaction,
    showFeedback,
    usdToPhpRate,
  } = useAppContext();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isLandscape } = useResponsive();
  const styles = useMemo(() => getStyles(colors, isDarkMode, isLandscape), [colors, isDarkMode, isLandscape]);

  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(
    route.params?.selectedWalletId || route.params?.walletId || null
  );
  const [amount, setAmount] = useState<string>(route.params?.amount || '');
  const [expression, setExpression] = useState<string>(route.params?.expression || '');
  const [isResult, setIsResult] = useState(false);
  const [showWalletPicker, setShowWalletPicker] = useState(false);

  // Custom Preset Modal State
  const [showAllPresets, setShowAllPresets] = useState(false);
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetIcon, setNewPresetIcon] = useState('Coffee');

  // Auto-select first wallet if available
  useEffect(() => {
    if (wallets && wallets.length > 0 && !selectedWalletId) {
      const initialId = route.params?.selectedWalletId || route.params?.walletId;
      setSelectedWalletId(initialId || wallets[0].id);
    }
  }, [wallets, selectedWalletId]);

  useEffect(() => {
    if (route.params?.amount !== undefined) {
      setAmount(route.params.amount);
    }
    if (route.params?.expression !== undefined) {
      setExpression(route.params.expression);
    }
    if (route.params?.selectedWalletId) {
      setSelectedWalletId(route.params.selectedWalletId);
    }
  }, [route.params]);

  const handleSwitchToIncome = () => {
    if (typeof navigation.replace === 'function') {
      navigation.replace('Deposit', {
        amount,
        expression,
        selectedWalletId,
        currency: route.params?.currency || 'PHP',
      });
    } else {
      navigation.navigate('Deposit', {
        amount,
        expression,
        selectedWalletId,
        currency: route.params?.currency || 'PHP',
      });
    }
  };

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

  const handlePaste = async () => {
    const pasted = await getNumberFromClipboard();
    if (pasted) {
      setAmount(pasted);
      setExpression('');
      setIsResult(false);
    } else {
      showFeedback('error', 'No valid number in clipboard');
    }
  };

  const handleExpense = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showFeedback('error', 'Please enter a valid amount');
      return;
    }
    if (!selectedWalletId) {
      showFeedback('error', 'Please select a wallet');
      return;
    }

    const wallet = wallets.find(w => w.id === selectedWalletId);
    if (wallet && numericAmount > getWalletTotalBalanceInPhp(wallet, usdToPhpRate)) {
      showFeedback('error', 'Insufficient Balance');
      return;
    }

    const title = selectedPreset ? selectedPreset.name : 'Expense';
    const icon = selectedPreset ? selectedPreset.iconName : 'Receipt';

    // 1. Show the confirmation modal first
    showFeedback('success', '');

    // 2. Wait for modal to display before clearing inputs and adding to recent expenses
    setTimeout(async () => {
      await addTransaction({
        title,
        amount: numericAmount,
        type: 'withdrawal',
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
      const created = await addWithdrawPreset(newPresetName.trim(), newPresetIcon);
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
    withdrawPresets && withdrawPresets.length > 0 ? withdrawPresets : DEFAULT_WITHDRAW_PRESETS;
  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  const numericAmount = parseFloat(amount) || 0;
  const customPresets = useMemo(() => {
    return effectivePresets.filter(p => !defaultIds.includes(p.id) && p.name !== 'Others');
  }, [effectivePresets]);

  // Main 3-row layout: Top 11 presets + 1 'Others' preset = 12 items forming an exact 4-col x 3-row grid
  const mainRowPresets = useMemo(() => {
    const withoutOthers = effectivePresets.filter(p => p.name !== 'Others' && p.iconName !== 'MoreHorizontal');
    const topItems = withoutOthers.slice(0, 11);
    const othersPreset = effectivePresets.find(p => p.name === 'Others') || {
      id: 'others-special',
      name: 'Others',
      iconName: 'MoreHorizontal',
    };
    return [...topItems, othersPreset];
  }, [effectivePresets]);

  const presetsIn3Rows = useMemo(() => {
    const rows: any[][] = [[], [], []];
    mainRowPresets.forEach((p, idx) => {
      rows[idx % 3].push(p);
    });
    return rows;
  }, [mainRowPresets]);

  const handlePresetPress = (preset: any) => {
    if (preset.name === 'Others' || preset.iconName === 'MoreHorizontal') {
      setShowAllPresets(true);
    } else {
      setSelectedPreset((prev: any) => (prev?.id === preset.id ? null : preset));
    }
  };

  // Recent expense transactions
  const recentExpenses = (transactions || [])
    .filter(tx => tx.type === 'withdrawal')
    .slice(0, 15);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft color={colors.text} size={28} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrapper}>
          <Text style={styles.headerTitle}>Expense</Text>
        </View>

        <TouchableOpacity
          style={styles.switchTypeBtn}
          onPress={handleSwitchToIncome}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Switch to Income"
        >
          <ArrowRightLeft size={13} color={colors.primary} />
          <Text style={styles.switchTypeBtnText}>Income</Text>
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
        ) : isLandscape ? (
          <View style={styles.contentFlex}>
            {/* Left Column in Landscape: Display + Hints + Recents + Presets */}
            <View style={styles.leftColLandscape}>
              <View style={styles.displaySection}>
                {expression ? (
                  <Text style={[styles.expressionPreview, { color: colors.textMuted }]}>
                    {expression} {isResult ? '' : amount}
                  </Text>
                ) : null}

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handlePaste}
                  style={styles.amountDisplayRow}
                >
                  <Text style={[styles.currencyPrefix, { color: colors.primary }]}>₱</Text>
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
                </TouchableOpacity>

                {/* Picked Wallet Balance Display (Only display, not a dropdown) */}
                {selectedWallet ? (
                  <View style={styles.walletDisplayBadge}>
                    <View style={[styles.walletBadgeDot, { backgroundColor: selectedWallet.color || colors.primary }]} />
                    <Text style={[styles.walletBadgeName, { color: colors.text }]} numberOfLines={1}>
                      {selectedWallet.name}
                    </Text>
                    <Text style={[styles.walletBadgeDivider, { color: colors.textMuted }]}>•</Text>
                    <Text style={[styles.walletBadgeBalance, { color: colors.primary }]}>
                      ₱{(selectedWallet.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                ) : null}

                {/* Bottom of picked wallet display: Paste Button & Selected Preset Badge */}
                <View style={styles.statusHintRow}>
                  <TouchableOpacity
                    style={[styles.pasteBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
                    onPress={handlePaste}
                    activeOpacity={0.7}
                  >
                    <ClipboardPaste size={12} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={[styles.pasteBadgeText, { color: colors.primary }]}>
                      Paste
                    </Text>
                  </TouchableOpacity>

                  {selectedPreset ? (
                    <View style={[styles.selectedPresetBadge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '30' }]}>
                      {(() => {
                        const Icon = ICON_MAP[selectedPreset.iconName] || MoreHorizontal;
                        return <Icon size={12} color={colors.primary} style={{ marginRight: 4 }} />;
                      })()}
                      <Text style={[styles.selectedPresetBadgeText, { color: colors.primary }]}>
                        {selectedPreset.name}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Presets in 3 Rows */}
              <View style={styles.presetsContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presets3RowScrollContent}
                >
                  <View style={styles.presets3RowColumnWrapper}>
                    {presetsIn3Rows.map((rowPresets, rIdx) => (
                      <View key={rIdx} style={styles.presetSingleRow}>
                        {rowPresets.map(preset => {
                          const isSelected = selectedPreset?.id === preset.id || selectedPreset?.name === preset.name;
                          const Icon = PRESET_ICON_MAP[preset.iconName] || MoreHorizontal;
                          return (
                            <TouchableOpacity
                              key={preset.id}
                              style={[
                                styles.smallPresetChip,
                                isSelected && styles.smallPresetChipActive,
                                (preset.name === 'Others' || preset.iconName === 'MoreHorizontal') && styles.smallPresetChipOthers,
                              ]}
                              onPress={() => handlePresetPress(preset)}
                              activeOpacity={0.75}
                            >
                              <Icon
                                size={11}
                                color={isSelected ? '#ffffff' : (preset.name === 'Others' ? colors.primary : colors.danger)}
                                style={{ marginRight: 3 }}
                              />
                              <Text
                                style={[
                                  styles.smallPresetText,
                                  isSelected && styles.smallPresetTextActive,
                                  (preset.name === 'Others' || preset.iconName === 'MoreHorizontal') && { color: isSelected ? '#ffffff' : colors.primary, fontFamily: theme.fonts.bold },
                                ]}
                                numberOfLines={1}
                              >
                                {preset.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Recent Expenses - Placed BELOW presets */}
              {recentExpenses.length > 0 && (
                <View style={styles.recentSection}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recentScrollContent}
                  >
                    {recentExpenses.map((tx) => {
                      const Icon = (tx.icon && PRESET_ICON_MAP[tx.icon]) || TrendingDown;
                      const displayAmt = `-₱${tx.amount.toLocaleString('en-US', {
                        minimumFractionDigits: tx.amount % 1 === 0 ? 0 : 2,
                        maximumFractionDigits: 2,
                      })}`;
                      return (
                        <TouchableOpacity
                          key={tx.id}
                          style={styles.recentChip}
                          onPress={() => {
                            setAmount(String(tx.amount));
                            const matchPreset = effectivePresets.find(p => p.name.toLowerCase() === tx.title.toLowerCase());
                            if (matchPreset) setSelectedPreset(matchPreset);
                            setIsResult(false);
                          }}
                          activeOpacity={0.75}
                        >
                          <Icon size={11} color="#ef4444" style={{ marginRight: 4 }} />
                          <Text style={styles.recentChipTitle} numberOfLines={1}>
                            {tx.title}
                          </Text>
                          <Text style={[styles.recentChipAmount, { color: '#ef4444' }]}>
                            {displayAmt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Right Column in Landscape: Keypad + Bottom Wallet Bar */}
            <View style={styles.rightColLandscape}>
              <CalculatorKeypad
                onDigit={handleDigit}
                onDot={handleDot}
                onOperator={handleOperator}
                onClear={handleClear}
                onBackspace={handleBackspace}
                onEquals={handleEquals}
              />
              <BottomWalletBar
                selectedWallet={selectedWallet}
                onOpenWalletPicker={() => setShowWalletPicker(true)}
                onSave={handleExpense}
                saveLabel="Expense"
                disabled={!amount || numericAmount <= 0 || !selectedWalletId}
              />
            </View>
          </View>
        ) : (
          <View style={styles.contentFlex}>
            {/* Top Display: Amount & Active Formula */}
            <View style={styles.displaySection}>
              {expression ? (
                <Text style={[styles.expressionPreview, { color: colors.textMuted }]}>
                  {expression} {isResult ? '' : amount}
                </Text>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handlePaste}
                style={styles.amountDisplayRow}
              >
                <Text style={[styles.currencyPrefix, { color: colors.primary }]}>₱</Text>
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
              </TouchableOpacity>

              {/* Picked Wallet Balance Display (Only display, not a dropdown) */}
              {selectedWallet ? (
                <View style={styles.walletDisplayBadge}>
                  <View style={[styles.walletBadgeDot, { backgroundColor: selectedWallet.color || colors.primary }]} />
                  <Text style={[styles.walletBadgeName, { color: colors.text }]} numberOfLines={1}>
                    {selectedWallet.name}
                  </Text>
                  <Text style={[styles.walletBadgeDivider, { color: colors.textMuted }]}>•</Text>
                  <Text style={[styles.walletBadgeBalance, { color: colors.primary }]}>
                    ₱{(selectedWallet.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              ) : null}

              {/* Bottom of picked wallet display: Paste Button & Selected Preset Badge */}
              <View style={styles.statusHintRow}>
                <TouchableOpacity
                  style={[styles.pasteBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
                  onPress={handlePaste}
                  activeOpacity={0.7}
                >
                  <ClipboardPaste size={12} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.pasteBadgeText, { color: colors.primary }]}>
                    Paste
                  </Text>
                </TouchableOpacity>

                {selectedPreset ? (
                  <View style={[styles.selectedPresetBadge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '30' }]}>
                    {(() => {
                      const Icon = ICON_MAP[selectedPreset.iconName] || MoreHorizontal;
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
              {/* Presets in 3 Rows */}
              <View style={styles.presetsContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presets3RowScrollContent}
                >
                  <View style={styles.presets3RowColumnWrapper}>
                    {presetsIn3Rows.map((rowPresets, rIdx) => (
                      <View key={rIdx} style={styles.presetSingleRow}>
                        {rowPresets.map(preset => {
                          const isSelected = selectedPreset?.id === preset.id || selectedPreset?.name === preset.name;
                          const Icon = PRESET_ICON_MAP[preset.iconName] || MoreHorizontal;
                          return (
                            <TouchableOpacity
                              key={preset.id}
                              style={[
                                styles.smallPresetChip,
                                isSelected && styles.smallPresetChipActive,
                                (preset.name === 'Others' || preset.iconName === 'MoreHorizontal') && styles.smallPresetChipOthers,
                              ]}
                              onPress={() => handlePresetPress(preset)}
                              activeOpacity={0.75}
                            >
                              <Icon
                                size={11}
                                color={isSelected ? '#ffffff' : (preset.name === 'Others' ? colors.primary : colors.danger)}
                                style={{ marginRight: 3 }}
                              />
                              <Text
                                style={[
                                  styles.smallPresetText,
                                  isSelected && styles.smallPresetTextActive,
                                  (preset.name === 'Others' || preset.iconName === 'MoreHorizontal') && { color: isSelected ? '#ffffff' : colors.primary, fontFamily: theme.fonts.bold },
                                ]}
                                numberOfLines={1}
                              >
                                {preset.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Recent Expenses - Placed BELOW presets */}
              {recentExpenses.length > 0 && (
                <View style={styles.recentSection}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recentScrollContent}
                  >
                    {recentExpenses.map((tx) => {
                      const Icon = (tx.icon && PRESET_ICON_MAP[tx.icon]) || TrendingDown;
                      const displayAmt = `-₱${tx.amount.toLocaleString('en-US', {
                        minimumFractionDigits: tx.amount % 1 === 0 ? 0 : 2,
                        maximumFractionDigits: 2,
                      })}`;
                      return (
                        <TouchableOpacity
                          key={tx.id}
                          style={styles.recentChip}
                          onPress={() => {
                            setAmount(String(tx.amount));
                            const matchPreset = effectivePresets.find(p => p.name.toLowerCase() === tx.title.toLowerCase());
                            if (matchPreset) setSelectedPreset(matchPreset);
                            setIsResult(false);
                          }}
                          activeOpacity={0.75}
                        >
                          <Icon size={11} color="#ef4444" style={{ marginRight: 4 }} />
                          <Text style={styles.recentChipTitle} numberOfLines={1}>
                            {tx.title}
                          </Text>
                          <Text style={[styles.recentChipAmount, { color: '#ef4444' }]}>
                            {displayAmt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* 4x4 Calculator Keypad */}
              <CalculatorKeypad
                onDigit={handleDigit}
                onDot={handleDot}
                onOperator={handleOperator}
                onClear={handleClear}
                onBackspace={handleBackspace}
                onEquals={handleEquals}
              />

              {/* Bottom Action Bar: [Account/Wallet Picker] + [Save Expense] */}
              <BottomWalletBar
                selectedWallet={selectedWallet}
                onOpenWalletPicker={() => setShowWalletPicker(true)}
                onSave={handleExpense}
                saveLabel="Expense"
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

      {/* All Presets Modal (Opened when clicking 'Others') */}
      {showAllPresets && (
        <Modal
          visible={showAllPresets}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAllPresets(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.presetsSheetContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Expense Presets</Text>
                  <Text style={[styles.presetsModalSub, { color: colors.textMuted }]}>
                    Select a preset or add a new one
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowAllPresets(false)} style={styles.modalCloseBtn}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Add New Preset Action Button */}
              <TouchableOpacity
                style={[styles.addPresetActionBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '35' }]}
                onPress={() => {
                  setShowAddPreset(true);
                }}
                activeOpacity={0.8}
              >
                <Plus size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.addPresetActionText, { color: colors.primary }]}>
                  Add New Preset
                </Text>
              </TouchableOpacity>

              {/* Presets List */}
              <ScrollView
                style={styles.presetsModalScrollView}
                contentContainerStyle={styles.presetsModalScrollContent}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                indicatorStyle={isDarkMode ? 'white' : 'black'}
              >
                {customPresets.length > 0 && (
                  <View style={styles.presetSectionWrapper}>
                    <Text style={[styles.presetSectionTitle, { color: colors.textMuted }]}>CUSTOM PRESETS</Text>
                    {customPresets.map((preset) => {
                      const isSelected = selectedPreset?.id === preset.id || selectedPreset?.name === preset.name;
                      const Icon = PRESET_ICON_MAP[preset.iconName] || MoreHorizontal;
                      return (
                        <View
                          key={preset.id}
                          style={[
                            styles.presetCardItem,
                            {
                              backgroundColor: isSelected
                                ? colors.primary + '16'
                                : (isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                              borderColor: isSelected ? colors.primary : (isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                            },
                          ]}
                        >
                          <TouchableOpacity
                            style={styles.presetCardTouchable}
                            onPress={() => {
                              setSelectedPreset(preset);
                              setShowAllPresets(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <View
                              style={[
                                styles.presetIconBox,
                                {
                                  backgroundColor: isSelected
                                    ? colors.primary
                                    : (isDarkMode ? 'rgba(255,255,255,0.1)' : colors.primary + '18'),
                                },
                              ]}
                            >
                              <Icon size={18} color={isSelected ? '#ffffff' : colors.primary} />
                            </View>
                            <Text
                              style={[
                                styles.presetCardTitle,
                                {
                                  color: isSelected ? colors.primary : colors.text,
                                  fontFamily: isSelected ? theme.fonts.bold : theme.fonts.semiBold,
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {preset.name}
                            </Text>
                          </TouchableOpacity>

                          <View style={styles.presetCardActions}>
                            {isSelected && (
                              <View style={[styles.selectedCheckBadge, { backgroundColor: colors.primary }]}>
                                <Check size={12} color="#ffffff" strokeWidth={3} />
                              </View>
                            )}
                            <TouchableOpacity
                              style={styles.deleteCustomPresetRowBtn}
                              onPress={() => deleteWithdrawPreset(preset.id)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              activeOpacity={0.7}
                            >
                              <Trash2 size={15} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                <View style={styles.presetSectionWrapper}>
                  <Text style={[styles.presetSectionTitle, { color: colors.textMuted }]}>ALL PRESETS</Text>
                  {effectivePresets.map((preset) => {
                    const isSelected = selectedPreset?.id === preset.id || selectedPreset?.name === preset.name;
                    const Icon = PRESET_ICON_MAP[preset.iconName] || MoreHorizontal;
                    return (
                      <TouchableOpacity
                        key={preset.id}
                        style={[
                          styles.presetCardItem,
                          {
                            backgroundColor: isSelected
                              ? colors.primary + '16'
                              : (isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                            borderColor: isSelected ? colors.primary : (isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                          },
                        ]}
                        onPress={() => {
                          setSelectedPreset(preset);
                          setShowAllPresets(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.presetCardTouchable}>
                          <View
                            style={[
                              styles.presetIconBox,
                              {
                                backgroundColor: isSelected
                                  ? colors.primary
                                  : (isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
                              },
                            ]}
                          >
                            <Icon
                              size={18}
                              color={isSelected ? '#ffffff' : colors.text}
                            />
                          </View>
                          <Text
                            style={[
                              styles.presetCardTitle,
                              {
                                color: isSelected ? colors.primary : colors.text,
                                fontFamily: isSelected ? theme.fonts.bold : theme.fonts.semiBold,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {preset.name}
                          </Text>
                        </View>

                        {isSelected && (
                          <View style={[styles.selectedCheckBadge, { backgroundColor: colors.primary }]}>
                            <Check size={12} color="#ffffff" strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Add Custom Preset Modal */}
      {showAddPreset && (
        <Modal
          visible={showAddPreset}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddPreset(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Add Preset</Text>
                <TouchableOpacity onPress={() => setShowAddPreset(false)} style={styles.modalCloseBtn}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalInputLabel, { color: colors.textMuted }]}>PRESET NAME</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  },
                ]}
                placeholder="e.g., Coffee, Tuition, Rent..."
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

const getStyles = (colors: any, isDarkMode: boolean, isLandscape?: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'ios' ? (isLandscape ? 16 : 56) : (isLandscape ? 12 : 36),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: isLandscape ? 2 : 6,
      maxWidth: isLandscape ? 900 : 540,
      width: '100%',
      alignSelf: 'center',
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
      paddingBottom: isLandscape ? 8 : (Platform.OS === 'ios' ? 24 : 16),
      maxWidth: isLandscape ? 900 : 540,
      width: '100%',
      alignSelf: 'center',
    },
    contentFlex: {
      flex: 1,
      justifyContent: 'space-between',
      flexDirection: isLandscape ? 'row' : 'column',
      gap: isLandscape ? 20 : 0,
    },
    leftColLandscape: {
      flex: 1.1,
      justifyContent: 'flex-start',
      paddingVertical: 4,
      gap: 10,
    },
    rightColLandscape: {
      flex: 1,
      maxWidth: 440,
      justifyContent: 'flex-end',
      paddingBottom: 2,
    },
    displaySection: {
      alignItems: 'center',
      paddingTop: isLandscape ? 2 : 4,
      paddingBottom: 4,
    },
    expressionPreview: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(15),
      marginBottom: 2,
      letterSpacing: 0.5,
    },
    amountDisplayRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      width: '100%',
    },
    currencyPrefix: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(24),
      marginRight: 4,
    },
    amountText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(36),
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    statusHintRow: {
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 6,
      minHeight: 22,
    },
    pasteBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 10,
      borderWidth: 1,
    },
    pasteBadgeText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(11.5),
    },
    selectedPresetBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 10,
      borderWidth: 1,
    },
    selectedPresetBadgeText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(11.5),
    },
    walletBalanceHint: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(11.5),
    },
    bottomSection: {
      flex: isLandscape ? undefined : 1,
      justifyContent: 'flex-end',
    },
    presetsContainer: {
      marginTop: 2,
      marginBottom: 6,
    },
    presets3RowScrollContent: {
      paddingHorizontal: 2,
    },
    presets3RowColumnWrapper: {
      flexDirection: 'column',
      gap: 5,
    },
    presetSingleRow: {
      flexDirection: 'row',
      gap: 5,
    },
    smallPresetChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      height: 27,
      borderRadius: 14,
      borderWidth: 1,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
      borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    },
    smallPresetChipActive: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
    },
    smallPresetChipOthers: {
      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
      borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)',
    },
    smallPresetText: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(11),
      color: colors.text,
    },
    smallPresetTextActive: {
      color: '#ffffff',
      fontFamily: theme.fonts.bold,
    },
    recentSection: {
      marginBottom: 6,
    },
    recentScrollContent: {
      paddingHorizontal: 2,
      gap: 6,
    },
    recentChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
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
    walletDisplayBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : colors.card,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : colors.border,
      marginTop: 6,
      marginBottom: 5,
      alignSelf: 'center',
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
      maxWidth: 80,
    },
    walletBadgeDivider: {
      marginHorizontal: 5,
      fontSize: rf(11),
    },
    walletBadgeBalance: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(13.5),
    },
    switchTypeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 11,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.08)',
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.32)' : 'rgba(16, 185, 129, 0.22)',
      gap: 5,
    },
    switchTypeBtnText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(12),
      color: colors.primary,
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
    },
    presetsSheetContent: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 18,
      width: '100%',
      maxWidth: 420,
      maxHeight: '85%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 20,
    },
    presetsModalSub: {
      fontFamily: theme.fonts.regular,
      fontSize: rf(12),
      marginTop: 2,
    },
    addPresetActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 11,
      paddingHorizontal: 16,
      borderRadius: 14,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      marginBottom: 16,
    },
    addPresetActionText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(13.5),
    },
    presetsModalScrollView: {
      maxHeight: 460,
    },
    presetsModalScrollContent: {
      paddingBottom: 16,
    },
    presetSectionWrapper: {
      marginBottom: 16,
    },
    presetSectionTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(11),
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    presetCardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      marginBottom: 8,
    },
    presetCardTouchable: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    presetIconBox: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    presetCardTitle: {
      fontSize: rf(14.5),
      flexShrink: 1,
    },
    presetCardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    selectedCheckBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteCustomPresetRowBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#fee2e2',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#fca5a5',
    },
  });
