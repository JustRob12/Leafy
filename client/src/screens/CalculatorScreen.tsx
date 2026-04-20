import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { Calculator as CalcIcon, Delete, X, Divide, Minus, Plus, Equal, ChevronLeft } from 'lucide-react-native';
import WalletDropdown from '../components/WalletDropdown';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const BUTTON_WIDTH = (width - 80) / 4; // Slightly narrower

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
    if (expression && !isResult) {
      // Continuous calculation: evaluate the current pair before adding the next operator
      try {
        const fullExpr = expression + currentValue;
        const result = eval(fullExpr.replace('×', '*').replace('÷', '/'));
        const displayResult = String(Number(Number(result).toFixed(2)));
        setExpression(displayResult + ' ' + op + ' ');
        setCurrentValue(displayResult);
        setIsResult(true);
      } catch (e) {
        setCurrentValue('Error');
        setExpression('');
      }
    } else {
      // Initial operator or operator switch
      setExpression(currentValue + ' ' + op + ' ');
      setIsResult(true);
    }
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

  const handleSelectWallet = (id: string | null) => {
    setSelectedWalletId(id);
    if (id) {
      const wallet = wallets.find(w => w.id === id);
      if (wallet) {
        const roundedBalance = Number(wallet.balance.toFixed(2));
        setCurrentValue(String(roundedBalance));
        setIsResult(false);
      }
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

          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Wallet Selector */}
      <View style={styles.walletSection}>
        <Text style={styles.sectionLabel}>Reference Wallet</Text>
        <WalletDropdown
          selectedWalletId={selectedWalletId}
          onSelectWallet={handleSelectWallet}
        />
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
              <View style={[styles.row, { marginTop: 8 }]}>
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
    padding: 16,
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: isDarkMode ? 0.3 : 0.05,
    shadowRadius: 20,
    elevation: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    height: BUTTON_WIDTH - 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
  },
});
