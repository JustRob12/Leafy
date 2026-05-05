import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  Dimensions, Platform, FlatList, Image as RNImage 
} from 'react-native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronLeft, ArrowRightLeft, CreditCard, Check 
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const BRAND_LOGOS: { [key: string]: any } = {
  'gcash.png': require('../../public/walletimages/gcash.png'),
  'maya.png': require('../../public/walletimages/maya.png'),
  'paypal.png': require('../../public/walletimages/paypal.png'),
  'wise.png': require('../../public/walletimages/wise.png'),
  'maribank.png': require('../../public/walletimages/maribank.png'),
  'gotyme.png': require('../../public/walletimages/gotyme.png'),
};

export default function TransferScreen() {
  const { colors, isDarkMode, wallets, transferMoney, showFeedback } = useAppContext();
  const navigation = useNavigation<any>();
  const styles = getStyles(colors, isDarkMode);

  const [fromWalletId, setFromWalletId] = useState<string | null>(null);
  const [toWalletId, setToWalletId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [tax, setTax] = useState('');
  const [activeInput, setActiveInput] = useState<'amount' | 'tax'>('amount');

  const formatDisplayAmount = (raw: string) => {
    if (!raw) return '0.00';
    const parts = raw.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const handleTransfer = async () => {
    const numericAmount = parseFloat(amount);
    const numericTax = parseFloat(tax) || 0;

    if (isNaN(numericAmount) || numericAmount <= 0) {
      showFeedback('error', 'Please enter a valid amount');
      return;
    }
    if (numericTax >= numericAmount && numericTax > 0) {
      showFeedback('error', 'Fee cannot be greater than or equal to the amount');
      return;
    }
    if (!fromWalletId || !toWalletId) {
      showFeedback('error', 'Please select both wallets');
      return;
    }
    if (fromWalletId === toWalletId) {
      showFeedback('error', 'Cannot transfer to the same wallet');
      return;
    }

    const fromWallet = wallets.find(w => w.id === fromWalletId);
    if (fromWallet && numericAmount > fromWallet.balance) {
      showFeedback('error', 'Insufficient Balance');
      return;
    }

    await transferMoney(fromWalletId, toWalletId, numericAmount, numericTax);
    navigation.navigate('Main');
  };

  const netAmount = Math.max(0, (parseFloat(amount) || 0) - (parseFloat(tax) || 0));

  const renderWalletItem = ({ item: wallet, type }: { item: any, type: 'from' | 'to' }) => {
    const isSelected = type === 'from' ? fromWalletId === wallet.id : toWalletId === wallet.id;
    const isOtherSelected = type === 'from' ? toWalletId === wallet.id : fromWalletId === wallet.id;

    return (
      <TouchableOpacity 
        style={[
          styles.miniWalletItem,
          { backgroundColor: wallet.color || (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') },
          isSelected && styles.miniWalletItemSelected,
          isOtherSelected && { opacity: 0.5 }
        ]}
        onPress={() => {
          if (type === 'from') {
            setFromWalletId(prev => prev === wallet.id ? null : wallet.id);
          } else {
            setToWalletId(prev => prev === wallet.id ? null : wallet.id);
          }
        }}
        disabled={isOtherSelected}
      >
        {isSelected && (
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
          ₱{Math.floor(wallet.balance).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transfer Funds</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={[{ id: 'content' }]}
        keyExtractor={item => item.id}
        renderItem={() => (
          <View style={styles.mainContent}>
            <View style={styles.inputsRow}>
              <TouchableOpacity 
                style={[styles.amountDisplayWrapper, activeInput === 'amount' && styles.activeInputWrapper]} 
                onPress={() => setActiveInput('amount')}
              >
                <Text style={styles.inputLabelSmall}>Transfer Amount</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={styles.currencyPrefix}>₱</Text>
                  <Text style={[styles.amountText, !amount && { color: colors.textMuted + '44' }]}>
                    {formatDisplayAmount(amount)}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.taxDisplayWrapper, activeInput === 'tax' && styles.activeInputWrapper]} 
                onPress={() => setActiveInput('tax')}
              >
                <Text style={styles.inputLabelSmall}>Fee / Tax (Optional)</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={[styles.currencyPrefix, { fontSize: 16 }]}>₱</Text>
                  <Text style={[styles.taxText, !tax && { color: colors.textMuted + '44' }]}>
                    {formatDisplayAmount(tax)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {parseFloat(tax) > 0 && (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryText}>
                  Receiver gets: <Text style={styles.summaryHighlight}>₱{netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                </Text>
              </View>
            )}

            <Text style={styles.sectionLabel}>FROM WALLET</Text>
            <FlatList 
              data={wallets}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.walletSliderContent}
              renderItem={(props) => renderWalletItem({ ...props, type: 'from' })}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <ArrowRightLeft color={colors.textMuted} size={20} />
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.sectionLabel}>TO WALLET</Text>
            <FlatList 
              data={wallets}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.walletSliderContent}
              renderItem={(props) => renderWalletItem({ ...props, type: 'to' })}
            />

            <View style={styles.keypadContainer}>
              <View style={styles.keypad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'DEL'].map((key) => (
                  <TouchableOpacity 
                    key={key} 
                    style={styles.keypadButton}
                    onPress={() => {
                      const setVal = activeInput === 'amount' ? setAmount : setTax;
                      const val = activeInput === 'amount' ? amount : tax;

                      if (key === 'DEL') {
                        setVal(prev => prev.slice(0, -1));
                      } else if (key === '.') {
                        if (!val.includes('.')) setVal(prev => prev + '.');
                      } else {
                        if (val.includes('.') && val.split('.')[1].length >= 2) return;
                        setVal(prev => prev + key);
                      }
                    }}
                  >
                    <Text style={styles.keypadButtonText}>{key}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.transferBtn, (!amount || !fromWalletId || !toWalletId) && styles.transferBtnDisabled]}
              onPress={handleTransfer}
              disabled={!amount || !fromWalletId || !toWalletId}
            >
              <Text style={styles.transferBtnText}>Confirm Transfer</Text>
            </TouchableOpacity>
            
            <View style={{ height: 40 }} />
          </View>
        )}
      />
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
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  mainContent: {
    paddingHorizontal: 20,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  amountDisplayWrapper: {
    flex: 2,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  taxDisplayWrapper: {
    flex: 1.3,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeInputWrapper: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  summaryBox: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderStyle: 'dashed',
  },
  summaryText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  summaryHighlight: {
    fontFamily: theme.fonts.bold,
    color: colors.primary,
  },
  inputLabelSmall: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  currencyPrefix: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.primary,
    marginRight: 4,
  },
  amountText: {
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    color: colors.text,
  },
  taxText: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  sectionLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  walletSliderContent: {
    paddingRight: 20,
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
    marginRight: 12,
    padding: 8,
  },
  miniWalletItemSelected: {
    borderWidth: 2,
    borderColor: '#ffffff',
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
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  keypadContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  keypadButton: {
    width: (width - 40 - 20) / 3,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  keypadButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: colors.text,
  },
  transferBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  transferBtnDisabled: {
    backgroundColor: colors.textMuted + '44',
    shadowOpacity: 0,
    elevation: 0,
  },
  transferBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
});
