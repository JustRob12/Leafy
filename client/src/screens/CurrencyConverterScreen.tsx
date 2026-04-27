import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, RefreshCcw, ArrowRightLeft, TrendingUp, Globe, Coins } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
];

export default function CurrencyConverterScreen() {
  const { colors, isDarkMode } = useAppContext();
  const navigation = useNavigation();
  
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('PHP');
  const [activeField, setActiveField] = useState<'from' | 'to'>('from');
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
      const data = await response.json();
      
      if (data.rates && data.rates[toCurrency]) {
        setResult(data.rates[toCurrency]);
        setRate(data.rates[toCurrency] / parseFloat(amount));
        setLastUpdated(data.date);
      } else {
        setError('Could not fetch rates. Please try again.');
      }
    } catch (err) {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, [fromCurrency, toCurrency]);

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleGridSelect = (code: string) => {
    if (activeField === 'from') {
      if (code === toCurrency) {
        // Swap if selecting the same as 'to'
        swapCurrencies();
      } else {
        setFromCurrency(code);
      }
      setActiveField('to'); // Auto-switch to 'to' for better flow
    } else {
      if (code === fromCurrency) {
        // Swap if selecting the same as 'from'
        swapCurrencies();
      } else {
        setToCurrency(code);
      }
    }
  };

  const styles = getStyles(colors, isDarkMode);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Currency Converter</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.converterCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>
                {CURRENCIES.find(c => c.code === fromCurrency)?.flag}
              </Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                onFocus={() => setActiveField('from')}
              />
            </View>
          </View>

          <View style={styles.selectionRow}>
            <View style={styles.pickerWrapper}>
              <Text style={styles.label}>From</Text>
              <TouchableOpacity 
                style={[styles.pickerButton, activeField === 'from' && styles.pickerButtonActive]}
                onPress={() => setActiveField('from')}
              >
                <Text style={[styles.pickerText, activeField === 'from' && styles.pickerTextActive]}>{fromCurrency}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.swapButton} onPress={swapCurrencies}>
              <ArrowRightLeft size={20} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.pickerWrapper}>
              <Text style={styles.label}>To</Text>
              <TouchableOpacity 
                style={[styles.pickerButton, activeField === 'to' && styles.pickerButtonActive]}
                onPress={() => setActiveField('to')}
              >
                <Text style={[styles.pickerText, activeField === 'to' && styles.pickerTextActive]}>{toCurrency}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.convertButton, loading && styles.convertButtonDisabled]} 
            onPress={fetchRate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.convertButtonText}>Convert Now</Text>
            )}
          </TouchableOpacity>
        </View>

        {result !== null && !loading && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Result</Text>
            <Text style={styles.resultAmount}>
              {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
            </Text>
            <View style={styles.rateInfo}>
              <TrendingUp size={14} color={colors.primary} />
              <Text style={styles.rateText}>
                1 {fromCurrency} = {rate?.toFixed(4)} {toCurrency}
              </Text>
            </View>
            {lastUpdated && (
              <Text style={styles.updateDateText}>
                Updated on: {new Date(lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            )}
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.currencyGrid}>
          <Text style={styles.gridTitle}>
            Select {activeField === 'from' ? 'Base' : 'Target'} Currency
          </Text>
          <View style={styles.gridContainer}>
            {CURRENCIES.map((item) => (
              <TouchableOpacity 
                key={item.code} 
                style={[
                  styles.gridItem, 
                  (fromCurrency === item.code || toCurrency === item.code) && styles.gridItemActive,
                  (activeField === 'from' ? fromCurrency === item.code : toCurrency === item.code) && styles.gridItemPrimary
                ]}
                onPress={() => handleGridSelect(item.code)}
              >
                <Text style={styles.gridFlag}>{item.flag}</Text>
                <Text style={styles.gridCode}>{item.code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Globe size={18} color={colors.primary} />
            <Text style={styles.infoTitle}>About the Data</Text>
          </View>
          <Text style={styles.infoDesc}>
            Exchange rates are provided by the Frankfurter API and updated daily by the European Central Bank.
          </Text>
        </View>
      </ScrollView>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  converterCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencySymbol: {
    fontSize: 20,
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    height: 56,
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: colors.text,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pickerWrapper: {
    width: '40%',
  },
  pickerButton: {
    height: 50,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  convertButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  convertButtonDisabled: {
    opacity: 0.7,
  },
  convertButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  resultCard: {
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#a7f3d0',
  },
  resultLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
  },
  resultAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
  },
  rateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  rateText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  errorContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#ef4444',
    fontFamily: theme.fonts.medium,
    textAlign: 'center',
  },
  infoSection: {
    marginTop: 30,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: colors.text,
  },
  infoDesc: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  currencyGrid: {
    marginTop: 30,
  },
  gridTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '22.5%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridItemActive: {
    borderColor: colors.primary,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.05)' : '#f0fdf4',
  },
  gridItemPrimary: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  gridFlag: {
    fontSize: 20,
    marginBottom: 4,
  },
  gridCode: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: colors.text,
  },
  pickerButtonActive: {
    borderColor: colors.primary,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    borderWidth: 2,
  },
  pickerTextActive: {
    color: colors.primary,
  },
  updateDateText: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 8,
    opacity: 0.8,
  },
});
