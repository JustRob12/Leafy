import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { Delete, XCircle } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const rf = (size: number) => Math.round(size * scale);

interface CalculatorKeypadProps {
  onDigit: (digit: string) => void;
  onDot: () => void;
  onOperator: (op: '+' | '-') => void;
  onClear: () => void;
  onBackspace: () => void;
  onEquals: () => void;
}

export default function CalculatorKeypad({
  onDigit,
  onDot,
  onOperator,
  onClear,
  onBackspace,
  onEquals,
}: CalculatorKeypadProps) {
  const { colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);

  return (
    <View style={styles.container}>
      {/* Row 1: [+] [1] [2] [3] */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, styles.opBtn]}
          onPress={() => onOperator('+')}
          activeOpacity={0.65}
        >
          <Text style={styles.opText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.numBtn]}
          onPress={() => onDigit('1')}
          activeOpacity={0.65}
        >
          <Text style={styles.numText}>1</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.numBtn]}
          onPress={() => onDigit('2')}
          activeOpacity={0.65}
        >
          <Text style={styles.numText}>2</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.numBtn]}
          onPress={() => onDigit('3')}
          activeOpacity={0.65}
        >
          <Text style={styles.numText}>3</Text>
        </TouchableOpacity>
      </View>

      {/* Row 2: [-] [4] [5] [6] */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, styles.opBtn]}
          onPress={() => onOperator('-')}
          activeOpacity={0.65}
        >
          <Text style={styles.opText}>−</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.numBtn]}
          onPress={() => onDigit('4')}
          activeOpacity={0.65}
        >
          <Text style={styles.numText}>4</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.numBtn]}
          onPress={() => onDigit('5')}
          activeOpacity={0.65}
        >
          <Text style={styles.numText}>5</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.numBtn]}
          onPress={() => onDigit('6')}
          activeOpacity={0.65}
        >
          <Text style={styles.numText}>6</Text>
        </TouchableOpacity>
      </View>

      {/* Row 3: [ⓧ] [7] [8] [9] */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, styles.clearBtn]}
          onPress={onClear}
          activeOpacity={0.65}
        >
          <XCircle size={rf(22)} color="#ef4444" strokeWidth={2.2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.numBtn]}
          onPress={() => onDigit('7')}
          activeOpacity={0.65}
        >
          <Text style={styles.numText}>7</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.numBtn]}
          onPress={() => onDigit('8')}
          activeOpacity={0.65}
        >
          <Text style={styles.numText}>8</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.numBtn]}
          onPress={() => onDigit('9')}
          activeOpacity={0.65}
        >
          <Text style={styles.numText}>9</Text>
        </TouchableOpacity>
      </View>

      {/* Row 4: [=] [.] [0] [⌫] */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, styles.equalBtn, { backgroundColor: colors.primary }]}
          onPress={onEquals}
          activeOpacity={0.65}
        >
          <Text style={styles.equalText}>=</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.numBtn]}
          onPress={onDot}
          activeOpacity={0.65}
        >
          <Text style={styles.dotText}>.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.numBtn]}
          onPress={() => onDigit('0')}
          activeOpacity={0.65}
        >
          <Text style={styles.numText}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.numBtn]}
          onPress={onBackspace}
          activeOpacity={0.65}
        >
          <Delete size={rf(20)} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      gap: 10,
      marginVertical: 10,
    },
    row: {
      flexDirection: 'row',
      gap: 10,
    },
    btn: {
      flex: 1,
      height: rf(54),
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    numBtn: {
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : '#f1f5f9',
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.03)',
    },
    numText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(21),
      color: colors.text,
    },
    dotText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(26),
      color: colors.text,
      lineHeight: rf(26),
    },
    opBtn: {
      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.16)' : '#eaf8f0',
      borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.2)',
    },
    opText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(24),
      color: colors.primary,
      lineHeight: rf(26),
    },
    clearBtn: {
      backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
      borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.15)',
    },
    equalBtn: {
      borderColor: 'transparent',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    equalText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(24),
      color: '#ffffff',
      lineHeight: rf(26),
    },
  });
