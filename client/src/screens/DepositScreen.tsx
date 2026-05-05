import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Dimensions, Platform, KeyboardAvoidingView, FlatList, Easing, Keyboard, Image as RNImage } from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronLeft, Plus, Search, Check, CreditCard
} from 'lucide-react-native';
import MainHeader from '../components/MainHeader';

const { width, height } = Dimensions.get('window');

const BRAND_LOGOS: { [key: string]: any } = {
  'gcash.png': require('../../public/walletimages/gcash.png'),
  'maya.png': require('../../public/walletimages/maya.png'),
  'paypal.png': require('../../public/walletimages/paypal.png'),
  'wise.png': require('../../public/walletimages/wise.png'),
  'maribank.png': require('../../public/walletimages/maribank.png'),
  'gotyme.png': require('../../public/walletimages/gotyme.png'),
};

export default function DepositScreen() {
  const { colors, isDarkMode, wallets, addTransaction, showFeedback } = useAppContext();
  const navigation = useNavigation<any>();
  const styles = getStyles(colors, isDarkMode);

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // No keyboard search listeners needed
  }, []);

  const handleIncome = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;
    if (!selectedWalletId) {
      showFeedback('error', 'Please select a wallet');
      return;
    }

    await addTransaction({
      title: 'Added Income',
      amount: numericAmount,
      type: 'deposit',
      walletId: selectedWalletId
    });
    navigation.navigate('Main');
  };

  const filteredWallets = wallets;

  const formatDisplayAmount = (raw: string) => {
    if (!raw) return '0.00';
    const parts = raw.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.text} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrapper}>
          <Text style={styles.headerTitle}>Income</Text>
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
                {formatDisplayAmount(amount)}
              </Text>
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
                    { backgroundColor: wallet.color || (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') },
                    selectedWalletId === wallet.id && styles.miniWalletItemSelected
                  ]}
                  onPress={() => setSelectedWalletId(wallet.id)}
                >
                  {selectedWalletId === wallet.id && (
                    <View style={styles.selectedIndicator}>
                      <Check size={10} color="#ffffff" strokeWidth={3} />
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
                        setAmount(prev => prev + key);
                      }
                    }}
                  >
                    <Text style={styles.keypadButtonTextCompact}>{key}</Text>
                  </TouchableOpacity>
                ))}
              </View>

            <TouchableOpacity 
                style={[styles.incomeBtnFinal, (!amount || !selectedWalletId) && styles.incomeBtnDisabled]}
                onPress={handleIncome}
                disabled={!amount || !selectedWalletId}
              >
                <Text style={styles.incomeBtnText}>Confirm Income</Text>
              </TouchableOpacity>
          </>
        )}
        <View style={{ height: 30 }} />
      </View>
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
    backgroundColor: colors.card,
    opacity: 0.8,
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
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  amountDisplayWrapperCompact: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  currencyPrefixCompact: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(26),
    color: colors.primary,
    marginRight: 6,
  },
  amountTextCompact: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(48),
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
    fontSize: rf(14),
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
    fontSize: rf(12),
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
    width: (width - 40 - 24) / 3, // Full width minus horizontal padding (20*2) and gaps (12*2)
    height: height * 0.05, 
    minHeight: 40,
    maxHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
  },
  keypadButtonTextCompact: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(18),
    color: colors.text,
  },
  incomeBtnFinal: {
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
  incomeBtnDisabled: {
    backgroundColor: colors.textMuted + '44',
    shadowOpacity: 0,
    elevation: 0,
  },
  incomeBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(16),
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
    fontSize: rf(18),
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
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
});
