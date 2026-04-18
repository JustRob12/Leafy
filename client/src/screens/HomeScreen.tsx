import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Animated, Easing, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { theme } from '../theme';
import { Wallet, ArrowDownRight, Target, Plus, ArrowUpRight, Calculator, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle, ShoppingCart, Plane } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import ActionSheet from '../components/ActionSheet';
import WalletDropdown from '../components/WalletDropdown';
import AnimatedCounter from '../components/AnimatedCounter';

export default function HomeScreen() {
  const { totalBalance, totalReceivables, totalDebts, wallets, transactions, addTransaction, showFeedback, showConfirm, goals, colors, isDarkMode } = useAppContext();
  const navigation = useNavigation<any>();

  const styles = getStyles(colors, isDarkMode);

  const SCREEN_WIDTH = Dimensions.get('window').width;
  const WALLET_ITEM_WIDTH = 100; // Tighter ticker

  // Carousel logic
  const carouselData = goals.length > 0 ? [...goals, ...goals, ...goals] : []; // Tripled for infinite
  const [activeGoalIndex, setActiveGoalIndex] = useState(goals.length);
  const flatListRef = useRef<FlatList>(null);
  const scrollXAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDragging = useRef(false);

  // Wallet Carousel logic (Opposite Direction)
  const walletCarouselData = wallets.length > 0 ? [...wallets, ...wallets, ...wallets] : [];
  const [activeWalletIndex, setActiveWalletIndex] = useState(wallets.length);
  const walletFlatListRef = useRef<FlatList>(null);
  const walletScrollXAnim = useRef(new Animated.Value(0)).current;
  const walletAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const isWalletDragging = useRef(false);



  // Function to run snappy, timed step animation
  const runAnimation = (startOffset: number) => {
    if (goals.length <= 1) return;

    // Clear any existing timer/animation
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationRef.current) animationRef.current.stop();

    const setWidth = goals.length * SCREEN_WIDTH;
    const currentStep = Math.round(startOffset / SCREEN_WIDTH);
    const nextOffset = (currentStep + 1) * SCREEN_WIDTH;

    // WAIT for 5 seconds on the current item
    timeoutRef.current = setTimeout(() => {
      if (isDragging.current) return;

      // ANIMATE to the next item
      animationRef.current = Animated.timing(scrollXAnim, {
        toValue: nextOffset,
        duration: 1500,
        easing: Easing.inOut(Easing.poly(3)), // Smoother transition
        useNativeDriver: false,
      });

      animationRef.current.start(({ finished }) => {
        if (finished) {
          let finalizedOffset = nextOffset;

          // Seamless loop jump logic
          if (nextOffset >= setWidth * 2) {
            finalizedOffset = setWidth;
            scrollXAnim.setValue(finalizedOffset);
            flatListRef.current?.scrollToOffset({ offset: finalizedOffset, animated: false });
          }

          runAnimation(finalizedOffset);
        }
      });
    }, 4000);
  };

  // Function to run continuous animation for wallets (OPPOSITE: Right to Left -> Left to Right)
  const runWalletAnimation = (startValue: number) => {
    if (wallets.length <= 1) return;

    const setWidth = wallets.length * WALLET_ITEM_WIDTH;
    const endValue = 0; // Animating backwards to 0

    // Duration based on distance to 0
    const remainingDistance = startValue;
    const duration = remainingDistance * (8000 / WALLET_ITEM_WIDTH); // Faster ticker

    walletAnimationRef.current = Animated.timing(walletScrollXAnim, {
      toValue: endValue,
      duration: Math.max(0, duration),
      easing: Easing.linear,
      useNativeDriver: false,
    });

    walletAnimationRef.current.start(({ finished }) => {
      if (finished) {
        const resetValue = setWidth;
        walletScrollXAnim.setValue(resetValue);
        runWalletAnimation(resetValue);
      }
    });
  };

  useEffect(() => {
    if (goals.length > 1) {
      const setWidth = goals.length * SCREEN_WIDTH;
      // Initial state
      scrollXAnim.setValue(setWidth);

      // Local timer to ensure FlatList is ready before initial jump
      const initialJump = setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: setWidth, animated: false });
      }, 100);

      // Listener to drive the FlatList scroll position
      const listenerId = scrollXAnim.addListener(({ value }) => {
        if (!isDragging.current) {
          flatListRef.current?.scrollToOffset({ offset: value, animated: false });
          // Update active index for pagination dots occasionally
          const index = Math.round(value / SCREEN_WIDTH);
          if (index !== activeGoalIndex) {
            setActiveGoalIndex(index);
          }
        }
      });

      runAnimation(setWidth);

      return () => {
        clearTimeout(initialJump);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        scrollXAnim.removeListener(listenerId);
        animationRef.current?.stop();
      };
    }
  }, [goals.length]);



  useEffect(() => {
    if (wallets.length > 1) {
      const setWidth = wallets.length * WALLET_ITEM_WIDTH;
      walletScrollXAnim.setValue(setWidth);

      const initialJump = setTimeout(() => {
        walletFlatListRef.current?.scrollToOffset({ offset: setWidth, animated: false });
      }, 100);

      const listenerId = walletScrollXAnim.addListener(({ value }) => {
        if (!isWalletDragging.current) {
          walletFlatListRef.current?.scrollToOffset({ offset: value, animated: false });
          const index = Math.round(value / WALLET_ITEM_WIDTH);
          if (index !== activeWalletIndex) {
            setActiveWalletIndex(index);
          }
        }
      });

      runWalletAnimation(setWidth);

      return () => {
        clearTimeout(initialJump);
        walletScrollXAnim.removeListener(listenerId);
        walletAnimationRef.current?.stop();
      };
    }
  }, [wallets.length]);

  const handleScrollBegin = () => {
    isDragging.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    animationRef.current?.stop();
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isDragging.current = false;
    const currentOffset = event.nativeEvent.contentOffset.x;
    const setWidth = goals.length * SCREEN_WIDTH;

    // seamless infinite loop logic
    let nextOffset = currentOffset;
    if (currentOffset < setWidth) {
      nextOffset = currentOffset + setWidth;
    } else if (currentOffset >= setWidth * 2) {
      nextOffset = currentOffset - setWidth;
    }

    scrollXAnim.setValue(nextOffset);
    flatListRef.current?.scrollToOffset({ offset: nextOffset, animated: false });

    const index = Math.round(nextOffset / SCREEN_WIDTH);
    setActiveGoalIndex(index);

    // Resume slow slide from new position
    runAnimation(nextOffset);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isDragging.current) {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / SCREEN_WIDTH);
      setActiveGoalIndex(index);
    }
  };

  const handleWalletScrollBegin = () => {
    isWalletDragging.current = true;
    walletAnimationRef.current?.stop();
  };

  const handleWalletScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isWalletDragging.current = false;
    const currentOffset = event.nativeEvent.contentOffset.x;
    const setWidth = wallets.length * WALLET_ITEM_WIDTH;

    let nextOffset = currentOffset;
    if (currentOffset <= 0) {
      nextOffset = setWidth;
    } else if (currentOffset >= setWidth * 2) {
      nextOffset = setWidth;
    }

    walletScrollXAnim.setValue(nextOffset);
    walletFlatListRef.current?.scrollToOffset({ offset: nextOffset, animated: false });

    const index = Math.round(nextOffset / WALLET_ITEM_WIDTH);
    setActiveWalletIndex(index);
    runWalletAnimation(nextOffset);
  };

  const onWalletScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isWalletDragging.current) {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / WALLET_ITEM_WIDTH);
      setActiveWalletIndex(index);
    }
  };

  const [savingsModalVisible, setSavingsModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);

  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);


  const handleTransaction = async (type: 'deposit' | 'withdrawal') => {
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount > 0 && selectedWalletId) {
      if (type === 'withdrawal') {
        const wallet = wallets.find(w => w.id === selectedWalletId);
        if (wallet && numericAmount > wallet.balance) {
          showFeedback('delete', 'Insufficient balance in selected wallet!');
          return;
        }
      }

      let txTitle = type === 'deposit' ? 'Added Savings' : 'Withdrawal';
      if (type === 'withdrawal' && reason.trim().length > 0) {
        txTitle = reason.trim();
      }

      setSavingsModalVisible(false);
      setWithdrawModalVisible(false);

      await addTransaction({
        title: txTitle,
        amount: numericAmount,
        type: type,
        walletId: selectedWalletId
      });
      setAmount('');
      setReason('');
      setSelectedWalletId(null);
    }
  };

  const getTxIcon = (type: string) => {
    if (type === 'deposit') return <ArrowDownRight size={18} color={theme.colors.primary} />;
    return <ArrowUpRight size={18} color="#ef4444" />;
  };

  const formatTxDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const day = d.toLocaleDateString(undefined, { weekday: 'short' });
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${day}, ${time}`;
    } catch {
      return '';
    }
  };

  const monthlySpent = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* PREMIUM BALANCE CARD (Glass Green Palette) */}
        <View style={styles.premiumCard}>
          <View style={styles.glowEffect} />
          <View style={styles.premiumCardTop}>
            <Text style={styles.premiumLabel}>Total Balance</Text>
          </View>
          <AnimatedCounter 
            value={totalBalance} 
            style={styles.premiumAmount} 
          />

          <View style={styles.dividerLight} />

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardFooterLabel}>Monthly Spent</Text>
              <Text style={styles.cardFooterValue}>₱{monthlySpent.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardFooterLabel}>To be Received</Text>
              <Text style={styles.cardFooterValue}>₱{totalReceivables.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          </View>
        </View>


        {/* QUICK ACTIONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionItem} onPress={() => setSavingsModalVisible(true)}>
            <View style={styles.actionIconBorder}>
              <Plus size={20} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Add Savings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => setWithdrawModalVisible(true)}>
            <View style={styles.actionIconBorder}>
              <ArrowUpRight size={20} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Withdraw</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Calculator')}>
            <View style={styles.actionIconBorder}>
              <Calculator size={20} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Calculator</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Calendar')}>
            <View style={styles.actionIconBorder}>
              <CalendarIcon size={20} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Receivables')}>
            <View style={styles.actionIconBorder}>
              <Clock size={20} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Debts')}>
            <View style={styles.actionIconBorder}>
              <AlertCircle size={20} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Debt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Grocery')}>
            <View style={styles.actionIconBorder}>
              <ShoppingCart size={20} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Grocery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Travel')}>
            <View style={styles.actionIconBorder}>
              <Plane size={20} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Travel</Text>
          </TouchableOpacity>
        </View>

        {/* WALLETS TICKER (Keep moving wallets, remove header) */}

        {/* WALLET TICKER (Opposite Direction, tightly packed) */}
        {wallets.length > 0 && (
          <View style={styles.walletTickerContainer}>
            <FlatList
              ref={walletFlatListRef}
              data={walletCarouselData}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={false}
              onScroll={onWalletScroll}
              onMomentumScrollEnd={handleWalletScrollEnd}
              scrollEventThrottle={16}
              onScrollBeginDrag={handleWalletScrollBegin}
              onScrollEndDrag={handleWalletScrollEnd}
              getItemLayout={(_, index) => ({
                length: WALLET_ITEM_WIDTH,
                offset: WALLET_ITEM_WIDTH * index,
                index,
              })}
              renderItem={({ item: wallet }) => (
                <View style={[styles.walletSlide, { width: WALLET_ITEM_WIDTH }]}>
                  <View style={styles.walletMinimalCard}>
                    <View style={styles.walletPill}>
                      <Wallet size={10} color={theme.colors.primary} />
                      <Text style={styles.walletNameText} numberOfLines={1}>{wallet.name}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {/* ACTIVE GOALS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
            <Text style={styles.seeAllText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyGoalCard}>
            <Text style={styles.emptyGoalText}>You have no Goal yet</Text>
            <TouchableOpacity style={styles.emptyGoalBtn} onPress={() => navigation.navigate('Goals')}>
              <Text style={styles.emptyGoalBtnText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={carouselData}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              horizontal
              pagingEnabled={true}
              snapToAlignment="center"
              snapToInterval={SCREEN_WIDTH}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              onMomentumScrollEnd={handleScrollEnd}
              scrollEventThrottle={16}
              onScrollBeginDrag={handleScrollBegin}
              onScrollEndDrag={handleScrollEnd}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              renderItem={({ item: goal, index }) => {
                const linkedWallet = wallets.find(w => w.id === goal.walletId);
                const currentAmount = linkedWallet ? linkedWallet.balance : 0;
                const progress = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0;

                // Position-based interpolation for fade and scale
                const inputRange = [
                  (index - 1) * SCREEN_WIDTH,
                  index * SCREEN_WIDTH,
                  (index + 1) * SCREEN_WIDTH,
                ];

                const opacity = scrollXAnim.interpolate({
                  inputRange,
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: 'clamp',
                });

                const scale = scrollXAnim.interpolate({
                  inputRange,
                  outputRange: [0.9, 1, 0.9],
                  extrapolate: 'clamp',
                });

                return (
                  <View style={[styles.goalSlide, { width: SCREEN_WIDTH }]}>
                    <Animated.View
                      style={[
                        styles.goalCard,
                        {
                          opacity,
                          transform: [{ scale }]
                        }
                      ]}
                    >
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('Goals')}
                      >
                      <View style={styles.goalRow}>
                        <View style={styles.goalLeft}>
                          <View style={styles.goalIconWrapper}>
                            {goal.imageUrl ? (
                              <Image source={{ uri: goal.imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 14 }} />
                            ) : (
                              <Target size={20} color={theme.colors.primary} />
                            )}
                          </View>
                          <View>
                            <Text style={styles.goalTitle}>{goal.title}</Text>
                            <Text style={styles.goalAmountText}>₱{currentAmount.toLocaleString('en-PH', { minimumFractionDigits: 0 })} / ₱{goal.targetAmount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${Math.max(0, Math.min(progress, 100))}%` }]} />
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
                );
              }}
            />

            {goals.length > 1 && (
              <View style={styles.pagination}>
                {goals.slice(0, 5).map((_, i) => {
                  const isActive = (activeGoalIndex % goals.length) === i;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        isActive ? styles.activeDot : styles.inactiveDot
                      ]}
                    />
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* RECENT TRANSACTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAllText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {transactions.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontFamily: theme.fonts.medium, color: theme.colors.textMuted }}>No recent transactions.</Text>
            </View>
          ) : (
            transactions.slice(0, 3).map(tx => {
              const isDeposit = tx.type === 'deposit';
              return (
                <View key={tx.id} style={styles.txItem}>
                  <View style={styles.txLeft}>
                    <View>
                      <Text style={styles.txTitle}>{tx.title}</Text>
                      <Text style={styles.txDate}>{formatTxDate(tx.date)}</Text>
                      <Text style={[isDeposit ? styles.txAmountPositive : styles.txAmountNegative, { marginTop: 4 }]}>
                        {isDeposit ? '+' : '-'}₱{tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={[
                      styles.txIconWrapper,
                      isDeposit ? { backgroundColor: '#ecfdf5', borderColor: '#ecfdf5' } : { backgroundColor: '#fef2f2', borderColor: '#fef2f2' }
                    ]}>
                      {getTxIcon(tx.type)}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>



        <View style={{ height: 20 }} />
      </ScrollView>

      <ActionSheet
        visible={savingsModalVisible || withdrawModalVisible}
        onClose={() => { setSavingsModalVisible(false); setWithdrawModalVisible(false); }}
        title={savingsModalVisible ? 'Add Savings' : 'Withdraw Funds'}
      >
        {(() => {
          const selectedWallet = wallets.find(w => w.id === selectedWalletId);
          const isInsufficient = withdrawModalVisible && selectedWallet && parseFloat(amount) > selectedWallet.balance;
          const isInvalidAmount = isNaN(parseFloat(amount)) || parseFloat(amount) <= 0;

          return wallets.length === 0 ? (
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <Text style={{ fontFamily: theme.fonts.medium, color: theme.colors.textMuted }}>You need a wallet to {savingsModalVisible ? 'add savings' : 'withdraw funds'}.</Text>
              <TouchableOpacity style={styles.saveBtn} onPress={() => { setSavingsModalVisible(false); setWithdrawModalVisible(false); navigation.navigate('Wallets'); }}>
                <Text style={styles.saveBtnText}>Go Create Wallet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                <Text style={styles.inputLabel}>Select Wallet</Text>
                {selectedWallet && (
                  <Text style={{ fontFamily: theme.fonts.medium, fontSize: 13, color: theme.colors.textMuted }}>
                    Available: ₱{selectedWallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                  </Text>
                )}
              </View>
              <WalletDropdown
                selectedWalletId={selectedWalletId}
                onSelectWallet={setSelectedWalletId}
              />

              <Text style={styles.inputLabel}>Amount (₱)</Text>
              <TextInput
                style={[styles.input, isInsufficient && { borderColor: '#ef4444', color: '#ef4444' }]}
                placeholder="e.g., 500"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              {isInsufficient && (
                <Text style={{ color: '#ef4444', fontSize: 12, fontFamily: theme.fonts.medium, marginTop: -12, marginBottom: 12 }}>
                  * Amount exceeds wallet balance
                </Text>
              )}

              {withdrawModalVisible && (
                <>
                  <Text style={styles.inputLabel}>Reason</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Groceries, Rent, Bills..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={reason}
                    onChangeText={setReason}
                  />
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  (!selectedWalletId || isInvalidAmount || isInsufficient) && styles.saveBtnDisabled,
                  withdrawModalVisible && !(!selectedWalletId || isInvalidAmount || isInsufficient) && { backgroundColor: '#ef4444' } // Red for withdraw
                ]}
                onPress={() => handleTransaction(savingsModalVisible ? 'deposit' : 'withdrawal')}
                disabled={!selectedWalletId || isInvalidAmount || isInsufficient}
              >
                <Text style={styles.saveBtnText}>{savingsModalVisible ? 'Deposit to Wallet' : 'Withdraw from Wallet'}</Text>
              </TouchableOpacity>
            </>
          );
        })()}
      </ActionSheet>

    </View>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 140,
  },
  premiumCard: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
  },
  glowEffect: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
  },
  premiumCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  premiumLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: '#ecfdf5',
  },
  premiumAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 34,
    color: '#ffffff',
    marginTop: 8,
    marginBottom: theme.spacing.md,
    letterSpacing: -0.5,
    zIndex: 1,
  },
  dividerLight: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  cardFooterLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: '#d1fae5',
  },
  cardFooterValue: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: '#ffffff',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    columnGap: '1.3%',
    marginBottom: theme.spacing.sm, // Reduced from xl
    paddingHorizontal: theme.spacing.xs,
  },
  actionItem: {
    alignItems: 'center',
    width: '24%',
    marginBottom: 16,
  },
  actionIconBorder: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    color: colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: colors.text,
  },
  seeAllText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.primary,
  },
  emptyGoalCard: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: theme.spacing.xl,
  },
  emptyGoalText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
  emptyGoalBtn: {
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
  },
  emptyGoalBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  goalsList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  carouselContainer: {
    marginBottom: theme.spacing.xl,
    marginHorizontal: -theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalSlide: {
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
  },
  goalCard: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: colors.border,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  goalIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  goalAmountText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  goalPercentage: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  transactionsList: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  txTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  txDate: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  txAmountNegative: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: colors.danger,
  },
  txAmountPositive: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: colors.primary,
  },
  inputLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: colors.text,
    marginBottom: theme.spacing.lg,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  saveBtnDisabled: {
    backgroundColor: colors.border,
  },
  saveBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: '#ffffff',
  },
  walletTickerContainer: {
    marginBottom: theme.spacing.md,
    marginHorizontal: -theme.spacing.lg,
    marginTop: -theme.spacing.xs, // Pull it closer to buttons
  },
  walletSlide: {
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletMinimalCard: {
    width: '100%',
    alignItems: 'center',
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
    width: '95%',
    justifyContent: 'center',
  },
  walletNameText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 10,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  pendingCard: {
    backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.12)' : '#fffbeb',
    borderRadius: 18,
    padding: 14,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)',
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pendingIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: isDarkMode ? '#fcd34d' : '#b45309',
    marginBottom: 1,
  },
  pendingAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  pendingActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.05)' : '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pendingActionText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    color: colors.primary,
  },

});
