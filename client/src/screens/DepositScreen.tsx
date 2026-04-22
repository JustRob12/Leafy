import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Dimensions, Platform, KeyboardAvoidingView, FlatList, Easing, Keyboard } from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronLeft, Plus, Search
} from 'lucide-react-native';
import MainHeader from '../components/MainHeader';

const { width, height } = Dimensions.get('window');

export default function DepositScreen() {
  const { colors, isDarkMode, wallets, addTransaction, showFeedback } = useAppContext();
  const navigation = useNavigation<any>();
  const styles = getStyles(colors, isDarkMode);

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [walletSearchQuery, setWalletSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const searchInputRef = useRef<TextInput>(null);

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

  const handleDeposit = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;
    if (!selectedWalletId) {
      showFeedback('error', 'Please select a wallet');
      return;
    }

    await addTransaction({
      title: 'Added Savings',
      amount: numericAmount,
      type: 'deposit',
      walletId: selectedWalletId
    });
    navigation.navigate('Main');
  };

  const filteredWallets = wallets.filter(w => 
    w.name.toLowerCase().includes(walletSearchQuery.toLowerCase()) ||
    w.purpose.toLowerCase().includes(walletSearchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.text} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrapper}>
          <Text style={styles.headerTitle}>Add Savings</Text>
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
                style={[styles.depositBtnFinal, (!amount || !selectedWalletId) && styles.depositBtnDisabled]}
                onPress={handleDeposit}
                disabled={!amount || !selectedWalletId}
              >
                <Text style={styles.depositBtnText}>Confirm Deposit</Text>
              </TouchableOpacity>
            )}
          </>
        )}
        <View style={{ height: 30 }} />
      </View>
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
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  amountDisplayWrapperCompact: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 30,
  },
  currencyPrefixCompact: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    color: colors.primary,
    marginRight: 6,
  },
  amountTextCompact: {
    fontFamily: theme.fonts.bold,
    fontSize: 48,
    color: colors.text,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    height: 44,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
  },
  searchBarInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  walletSliderContent: {
    paddingRight: 20,
    marginBottom: 10,
    paddingVertical: 4,
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
  keypadBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 15,
    marginBottom: 20,
  },
  keypadButtonCompact: {
    width: (width - 80) / 3,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderRadius: 14,
  },
  keypadButtonTextCompact: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 20,
    color: colors.text,
  },
  depositBtnFinal: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 10,
  },
  depositBtnDisabled: {
    backgroundColor: colors.textMuted + '44',
    shadowOpacity: 0,
    elevation: 0,
  },
  depositBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#fff',
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
    fontSize: 16,
    color: '#fff',
  },
});
