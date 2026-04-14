import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { Calculator as CalcIcon, Delete, X, Divide, Minus, Plus, Equal, ArrowLeft } from 'lucide-react-native';
import WalletDropdown from '../components/WalletDropdown';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const BUTTON_WIDTH = (width - 64) / 4;

export default function CalculatorScreen() {
  const navigation = useNavigation<any>();
  const { wallets, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [currentValue, setCurrentValue] = useState('0');
  const [expression, setExpression] = useState('');
  const [isResult, setIsResult] = useState(false);

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);

  const handleNumber = (num: string) => {
    if (isResult) {
      setCurrentValue(num);
      setIsResult(false);
    } else {
      if (num === '.' && currentValue.includes('.')) return;
      setCurrentValue(currentValue === '0' && num !== '.' ? num : currentValue + num);
    }
  };

  const handleOperator = (op: string) => {
    setExpression(currentValue + ' ' + op + ' ');
    setCurrentValue('0');
    setIsResult(false);
  };

  const calculate = () => {
    try {
      const fullExpression = expression + currentValue;
      // Basic math parser (replaces lucide icons symbols if needed)
      // We'll use Function for simplicity in this sandbox, but with sanitized input
      const result = eval(fullExpression.replace('×', '*').replace('÷', '/'));
      setCurrentValue(String(Number(result.toFixed(2))));
      setExpression('');
      setIsResult(true);
    } catch {
      setCurrentValue('Error');
      setExpression('');
    }
  };

  const clear = () => {
    setCurrentValue('0');
    setExpression('');
    setIsResult(false);
  };

  const backspace = () => {
    if (currentValue.length > 1) {
      setCurrentValue(currentValue.slice(0, -1));
    } else {
      setCurrentValue('0');
    }
  };

  const useWalletBalance = () => {
    if (selectedWallet) {
      // Round to 2 decimal places to avoid floating point precision issues (e.g. 331.94000000004)
      const roundedBalance = Number(selectedWallet.balance.toFixed(2));
      setCurrentValue(String(roundedBalance));
      setIsResult(false);
    }
  };

  const CalcButton = ({ label, onPress, type = 'number', icon: Icon }: any) => {
    let bgColor = colors.card;
    let textColor = colors.text;

    if (type === 'operator') {
      bgColor = isDarkMode ? '#1e293b' : '#f1f5f9';
      textColor = colors.primary;
    } else if (type === 'equal') {
      bgColor = colors.primary;
      textColor = '#ffffff';
    } else if (type === 'clear') {
      bgColor = isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2';
      textColor = colors.danger;
    }

    return (
      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: bgColor }]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {Icon ? (
          <Icon size={24} color={textColor} />
        ) : (
          <Text style={[styles.btnText, { color: textColor }]}>{label}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Wallet Selector & Balance Info */}
      <View style={styles.walletSection}>
        <Text style={styles.sectionLabel}>Reference Wallet</Text>
        <WalletDropdown 
          selectedWalletId={selectedWalletId}
          onSelectWallet={setSelectedWalletId}
        />
        {selectedWallet && (
          <TouchableOpacity style={styles.balanceShortcut} onPress={useWalletBalance}>
            <Text style={styles.balanceLabel}>Wallet Balance:</Text>
            <Text style={styles.balanceValue}>₱{selectedWallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
            <Text style={styles.balanceHint}>(Tap to Use)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Display Area */}
      <View style={styles.displayArea}>
        <Text style={styles.expressionText}>{expression}</Text>
        <Text style={styles.currentValueText} numberOfLines={1} adjustsFontSizeToFit>
          {currentValue}
        </Text>
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        <View style={styles.row}>
          <CalcButton label="C" onPress={clear} type="clear" />
          <CalcButton label="÷" icon={Divide} onPress={() => handleOperator('/')} type="operator" />
          <CalcButton label="×" icon={X} onPress={() => handleOperator('*')} type="operator" />
          <CalcButton label="DEL" icon={Delete} onPress={backspace} type="operator" />
        </View>

        <View style={styles.row}>
          <CalcButton label="7" onPress={() => handleNumber('7')} />
          <CalcButton label="8" onPress={() => handleNumber('8')} />
          <CalcButton label="9" onPress={() => handleNumber('9')} />
          <CalcButton label="-" icon={Minus} onPress={() => handleOperator('-')} type="operator" />
        </View>

        <View style={styles.row}>
          <CalcButton label="4" onPress={() => handleNumber('4')} />
          <CalcButton label="5" onPress={() => handleNumber('5')} />
          <CalcButton label="6" onPress={() => handleNumber('6')} />
          <CalcButton label="+" icon={Plus} onPress={() => handleOperator('+')} type="operator" />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 3, flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                 <CalcButton label="1" onPress={() => handleNumber('1')} />
                 <CalcButton label="2" onPress={() => handleNumber('2')} />
                 <CalcButton label="3" onPress={() => handleNumber('3')} />
              </View>
              <View style={[styles.row, { marginTop: 12 }]}>
                 <CalcButton label="0" onPress={() => handleNumber('0')} style={{ flex: 2 }} />
                 <CalcButton label="." onPress={() => handleNumber('.')} />
              </View>
            </View>
          </View>
          <CalcButton icon={Equal} onPress={calculate} type="equal" />
        </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  walletSection: {
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  sectionLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  balanceShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    padding: 12,
    borderRadius: 12,
    marginTop: -8,
    gap: 8,
  },
  balanceLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  balanceValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: colors.primary,
  },
  balanceHint: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: colors.primary,
    opacity: 0.7,
  },
  displayArea: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  expressionText: {
    fontFamily: theme.fonts.medium,
    fontSize: 20,
    color: colors.textMuted,
    marginBottom: 8,
    textAlign: 'right',
    width: '100%',
  },
  currentValueText: {
    fontFamily: theme.fonts.bold,
    fontSize: 64,
    color: colors.text,
    textAlign: 'right',
    width: '100%',
  },
  keypad: {
    padding: 24,
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: isDarkMode ? 0.3 : 0.05,
    shadowRadius: 20,
    elevation: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: BUTTON_WIDTH,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
  },
});
