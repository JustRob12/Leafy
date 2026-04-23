import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Animated, Easing, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Modal, Platform, StatusBar } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { AudioPlayer, createAudioPlayer } from 'expo-audio';



import { theme } from '../theme';
import { Wallet, ArrowDownRight, Target, Plus, ArrowUpRight, Calculator, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle, ShoppingCart, Plane, RefreshCw, Leaf, Eye, EyeOff, CreditCard } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import ActionSheet from '../components/ActionSheet';
import WalletDropdown from '../components/WalletDropdown';
import AnimatedCounter from '../components/AnimatedCounter';
import { useScrollHideTabBar } from '../hooks/useScrollHideTabBar';
import * as LucideIcons from 'lucide-react-native';

const SUBS_ICONS: { [key: string]: any } = {
  'capcut.png': require('../../public/subs/capcut.png'),
  'chatgpt.png': require('../../public/subs/chatgpt.png'),
  'disney.png': require('../../public/subs/disney.png'),
  'gemini.png': require('../../public/subs/gemini.png'),
  'netflix.png': require('../../public/subs/netflix.png'),
  'prime.png': require('../../public/subs/prime.png'),
  'spotify.png': require('../../public/subs/spotify.png'),
};

const BRAND_LOGOS: { [key: string]: any } = {
  'gcash.png': require('../../public/walletimages/gcash.png'),
  'maya.png': require('../../public/walletimages/maya.png'),
  'paypal.png': require('../../public/walletimages/paypal.png'),
  'wise.png': require('../../public/walletimages/wise.png'),
  'maribank.png': require('../../public/walletimages/maribank.png'),
  'gotyme.png': require('../../public/walletimages/gotyme.png'),
};

const ICON_MAP: { [key: string]: any } = {
  Utensils: LucideIcons.Utensils,
  Car: LucideIcons.Car,
  Receipt: LucideIcons.Receipt,
  Heart: LucideIcons.Heart,
  ShoppingBag: LucideIcons.ShoppingBag,
  MoreHorizontal: LucideIcons.MoreHorizontal,
  Coffee: LucideIcons.Coffee,
  Home: LucideIcons.Home,
  Gift: LucideIcons.Gift,
  Smartphone: LucideIcons.Smartphone,
  Gamepad: LucideIcons.Gamepad,
  Briefcase: LucideIcons.Briefcase,
  Camera: LucideIcons.Camera,
  Film: LucideIcons.Film,
  Music: LucideIcons.Music,
  Globe: LucideIcons.Globe,
  Map: LucideIcons.Map,
  Search: LucideIcons.Search,
};


export default function HomeScreen() {
  const { totalBalance, totalReceivables, totalDebts, wallets, debts, transactions, addTransaction, showFeedback, showConfirm, goals, colors, isDarkMode, treeType, isTutorialActive, stopTutorial, groceryLists, subscriptions, recursions } = useAppContext();

  const navigation = useNavigation<any>();
  const { handleScroll } = useScrollHideTabBar();
  const scrollViewRef = useRef<ScrollView>(null);
  useScrollToTop(scrollViewRef);

  const styles = getStyles(colors, isDarkMode);

  const SCREEN_WIDTH = Dimensions.get('window').width;
  const WALLET_ITEM_WIDTH = 100; // Tighter ticker

  // Goal Fade Carousel Logic
  const [activeGoalIndex, setActiveGoalIndex] = useState(0);
  const [moreActionsVisible, setMoreActionsVisible] = useState(false);
  const goalFadeAnim = useRef(new Animated.Value(1)).current;
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (goals.length <= 1) return;

    const startFadeTransition = () => {
      fadeTimerRef.current = setTimeout(() => {
        // 1. Fade out current
        Animated.timing(goalFadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          // 2. Change index
          setActiveGoalIndex((prev) => (prev + 1) % goals.length);
          // 3. Fade in new
          Animated.timing(goalFadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }).start(() => {
            startFadeTransition();
          });
        });
      }, 5000); // 5 seconds per goal
    };
    startFadeTransition();
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [goals.length]);

  const topSubscriptions = useMemo(() => {
    const getRemaining = (day: number) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      let targetDate = new Date(currentYear, currentMonth, day);
      if (targetDate < today) {
        targetDate = new Date(currentYear, currentMonth + 1, day);
      }
      const diffTime = targetDate.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return [...subscriptions]
      .sort((a, b) => getRemaining(a.dayOfMonth) - getRemaining(b.dayOfMonth))
      .slice(0, 3);
  }, [subscriptions]);

  const paydayInfo = useMemo(() => {
    if (recursions.length === 0) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    const countdowns = recursions.map(r => {
      let targetDate: Date;

      if (r.frequency === 'weekly') {
        targetDate = new Date(today);
        const targetDay = r.dayOfWeek ?? 1;
        const currentDay = today.getDay();
        let daysUntil = (targetDay - currentDay + 7) % 7;
        if (daysUntil === 0) daysUntil = 7; // Next week if today is the day
        targetDate.setDate(today.getDate() + daysUntil);
      } else if (r.frequency === 'bi-monthly') {
        const d15 = new Date(currentYear, currentMonth, 15);
        const d30 = new Date(currentYear, currentMonth, 30);
        if (today < d15) targetDate = d15;
        else if (today < d30) targetDate = d30;
        else targetDate = new Date(currentYear, currentMonth + 1, 15);
      } else {
        // Monthly
        const day = r.dayOfMonth || 1;
        targetDate = new Date(currentYear, currentMonth, day);
        if (targetDate <= today) {
          targetDate = new Date(currentYear, currentMonth + 1, day);
        }
      }

      const diffTime = targetDate.getTime() - today.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { days, company: r.companyName, amount: r.amount };
    }).filter(c => !isNaN(c.days));
    
    if (countdowns.length === 0) return null;
    return countdowns.sort((a, b) => a.days - b.days)[0];
  }, [recursions]);






  // Tutorial Logic
  const [currentStep, setCurrentStep] = useState(0);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [targetLayout, setTargetLayout] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const soundRef = useRef<AudioPlayer | null>(null);


  const balanceRef = useRef<View>(null);
  const addSavingsRef = useRef<View>(null);
  const withdrawRef = useRef<View>(null);
  const calculatorRef = useRef<View>(null);
  const calendarRef = useRef<View>(null);
  const pendingRef = useRef<View>(null);
  const debtRef = useRef<View>(null);
  const groceryRef = useRef<View>(null);
  const travelRef = useRef<View>(null);
  const recursionRef = useRef<View>(null);

  const tutorialRefs = [
    balanceRef, addSavingsRef, withdrawRef, calculatorRef,
    calendarRef, pendingRef, debtRef, groceryRef, travelRef,
    recursionRef
  ];

  const tutorialSteps = [
    { title: 'Total Balance', description: 'View your combined net worth across all active wallets in one real-time total.', borderRadius: 24 },
    { title: 'Add Savings', description: 'Quickly record new deposits and watch your individual wallet balances grow.', borderRadius: 16 },
    { title: 'Withdraw', description: 'Log your daily expenses and outgoings to keep your spending habits on track.', borderRadius: 16 },
    { title: 'Calculator', description: 'Use the built-in math tool to instantly calculate totals without leaving the app.', borderRadius: 16 },
    { title: 'Calendar', description: 'Visualize your daily spending patterns and financial history over any period of time.', borderRadius: 16 },
    { title: 'Pending', description: 'Track the money people owe you and stay updated on all incoming receivables.', borderRadius: 16 },
    { title: 'Debt', description: 'Monitor your outstanding balances and stay organized as you work toward being debt-free.', borderRadius: 16 },
    { title: 'Grocery', description: 'Create and manage shopping lists to streamline your errands and stay within budget.', borderRadius: 16 },
    { title: 'Travel', description: 'Log your trip expenses as you go to keep your vacation spending organized.', borderRadius: 16 },
    { title: 'Recursion', description: 'Manage your recurring income like monthly salary and easily add it to your wallets.', borderRadius: 16 },
  ];


  const playStepSound = async (stepIndex: number) => {
    try {
      // 1. Aggressively unload any existing sound
      if (soundRef.current) {
        soundRef.current.pause();
        soundRef.current = null;
      }

      // 2. Check if tutorial is still active before loading next
      if (!isTutorialActive) return;

      // Map step to audio file
      const sounds = [
        require('../../assets/sound/TotalBalance.mp3'),
        require('../../assets/sound/AddSavings.mp3'),
        require('../../assets/sound/Withdraw.mp3'),
        require('../../assets/sound/Calculator.mp3'),
        require('../../assets/sound/Calendar.mp3'),
        require('../../assets/sound/Pending.mp3'),
        require('../../assets/sound/Debt.mp3'),
        require('../../assets/sound/Grocery.mp3'),
        require('../../assets/sound/Travel.mp3'),
        null, // No sound for Recursion yet
      ];

      const source = sounds[stepIndex];
      if (!source) return;

      // 3. Create the new sound player
      const player = createAudioPlayer(source);

      // 4. Final check before playing - user might have skipped during loading
      if (!isTutorialActive) {
        player.pause();
        return;
      }

      soundRef.current = player;
      player.play();
    } catch (error) {
      console.log('Error playing step sound:', error);
    }
  };


  const measureTarget = (stepIndex: number) => {
    const ref = tutorialRefs[stepIndex];
    if (ref && ref.current) {
      ref.current.measureInWindow((x, y, width, height) => {
        // Since the Modal is statusBarTranslucent, we must add the status bar height 
        // to the measured Y on Android to align correctly.
        const adjustedY = Platform.OS === 'android' ? y + (StatusBar.currentHeight || 0) : y;
        setTargetLayout({ x, y: adjustedY, w: width, h: height });
      });
    }
  };






  useEffect(() => {
    if (isTutorialActive) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      setCurrentStep(0);
      setTimeout(() => {
        measureTarget(0);
      }, 50);
    }
  }, [isTutorialActive]);

  useEffect(() => {
    const handleTutorialState = async () => {
      if (isTutorialActive) {
        playStepSound(currentStep);
        measureTarget(currentStep);
      } else {
        // Force stop and unload when tutorial is deactivated
        if (soundRef.current) {
          const soundToUnload = soundRef.current;
          soundRef.current = null;
          try {
            soundToUnload.pause();
          } catch (e) {
            // Shadow ignore errors during cleanup
          }
        }
      }
    };

    handleTutorialState();
  }, [currentStep, isTutorialActive]);


  // General cleanup for sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.pause();
        soundRef.current = null;
      }
    };
  }, []);


  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      stopTutorial();
    }
  };

  const handleSkip = () => {
    stopTutorial();
  };



  const getTxIcon = (tx: any) => {
    const isDeposit = tx.type === 'deposit';
    
    if (isDeposit) {
      const wallet = wallets.find(w => w.id === tx.walletId);
      if (wallet?.iconType === 'preset' && wallet.presetLogo) {
        return <Image source={BRAND_LOGOS[wallet.presetLogo]} style={styles.txBrandLogo as any} />;
      }
      return <ArrowDownRight size={18} color={theme.colors.primary} />;
    } else {
      if (tx.icon && ICON_MAP[tx.icon]) {
        const IconComp = ICON_MAP[tx.icon];
        return <IconComp size={18} color="#ef4444" />;
      }
      return <ArrowUpRight size={18} color="#ef4444" />;
    }
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

  const getThemeDecorIcon = (size: number, rotation: string) => {
    const iconProps = { size, color: "#ffffff", opacity: 0.3, style: { transform: [{ rotate: rotation }] } as any };
    
    switch (treeType) {
      case 'cherry':
        return <LucideIcons.Flower2 {...iconProps} />;
      case 'maple':
        return <LucideIcons.Wind {...iconProps} />;
      case 'spruce':
        return <LucideIcons.CloudSnow {...iconProps} />;
      default:
        return <Leaf {...iconProps} />;
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayIndex = new Date().getDay();
  const pendingDebts = debts.filter(d => d.dueDate === todayStr).length;
  const pendingGroceries = groceryLists.filter(list => list.scheduledDays && list.scheduledDays.includes(todayIndex)).length;
  
  // Subscription due soon count
  const pendingSubscriptions = subscriptions.filter(sub => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    let targetDate = new Date(currentYear, currentMonth, sub.dayOfMonth);
    if (targetDate < today) {
      targetDate = new Date(currentYear, currentMonth + 1, sub.dayOfMonth);
    }
    const diffTime = targetDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return daysRemaining <= 3;
  }).length;

  const totalMoreBadge = pendingDebts + pendingGroceries + pendingSubscriptions;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >

        {/* PREMIUM BALANCE CARD (Glass Green Palette) */}
        <View ref={balanceRef} collapsable={false} style={styles.premiumCard}>

          <View style={styles.decorLeaf1}>{getThemeDecorIcon(50, '45deg')}</View>
          <View style={styles.decorLeaf2}>{getThemeDecorIcon(80, '-20deg')}</View>
          <View style={styles.decorLeaf3}>{getThemeDecorIcon(40, '15deg')}</View>
          <View style={styles.decorLeaf4}>{getThemeDecorIcon(60, '70deg')}</View>
          <View style={styles.decorLeaf5}>{getThemeDecorIcon(30, '-45deg')}</View>

          <View style={styles.premiumCardTop}>
            <Text style={styles.premiumLabel}>Total Balance</Text>
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setIsBalanceHidden(!isBalanceHidden)}
              activeOpacity={0.7}
            >
              {isBalanceHidden ? <EyeOff size={18} color="#d1fae5" /> : <Eye size={18} color="#d1fae5" />}
            </TouchableOpacity>
          </View>

          {isBalanceHidden ? (
            <Text style={styles.premiumAmount}>₱ ******</Text>
          ) : (
            <AnimatedCounter
              value={totalBalance}
              style={styles.premiumAmount}
              shouldAnimate={totalBalance < 1000000}
            />
          )}


          <View style={styles.dividerLight} />

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardFooterLabel}>Monthly Spent</Text>
              <Text style={styles.cardFooterValue}>
                {isBalanceHidden ? "₱ ******" : `₱${monthlySpent.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardFooterLabel}>To be Received</Text>
              <Text style={styles.cardFooterValue}>
                {isBalanceHidden ? "₱ ******" : `₱${totalReceivables.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </Text>
            </View>
          </View>
        </View>

        {/* PAYDAY COUNTDOWN */}
        {paydayInfo && (
          <View style={styles.paydayContainer}>
            <View style={styles.paydayIconWrapper}>
              <RefreshCw size={16} color={isDarkMode ? '#4ade80' : '#166534'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paydayText}>
                You have <Text style={styles.paydayHighlight}>{paydayInfo.days} days</Text> until your payday from <Text style={styles.paydayHighlight}>{paydayInfo.company}</Text>
              </Text>
            </View>
            <Text style={styles.paydayAmount}>+₱{paydayInfo.amount.toLocaleString()}</Text>
          </View>
        )}


        {/* QUICK ACTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore</Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Deposit')}>
            <View ref={addSavingsRef} collapsable={false} style={styles.actionIconBorder}>
              <Plus size={20} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Add Savings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Withdraw')}>
            <View ref={withdrawRef} collapsable={false} style={styles.actionIconBorder}>
              <ArrowUpRight size={20} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Withdraw</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Calendar')}>
            <View ref={calendarRef} collapsable={false} style={styles.actionIconBorder}>
              <CalendarIcon size={20} color={colors.text} />
            </View>
            <Text style={styles.actionText}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => setMoreActionsVisible(true)}>
            <View style={styles.actionIconBorder}>
              <LucideIcons.MoreHorizontal size={20} color={colors.text} />
              {totalMoreBadge > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{totalMoreBadge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.actionText}>More</Text>
          </TouchableOpacity>
        </View>




        {/* ACTIVE GOALS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
            <Text style={styles.seeAllText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>

        {
          goals.length === 0 ? (
            <View style={styles.emptyGoalCard}>
              <Text style={styles.emptyGoalText}>You have no Goal yet</Text>
              <TouchableOpacity style={styles.emptyGoalBtn} onPress={() => navigation.navigate('Goals')}>
                <Text style={styles.emptyGoalBtnText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.carouselContainer}>
              {(() => {
                const goal = goals[activeGoalIndex];
                if (!goal) return null;

                const linkedWallet = wallets.find(w => w.id === goal.walletId);
                const currentAmount = linkedWallet ? linkedWallet.balance : 0;
                const progress = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0;

                return (
                  <Animated.View
                    style={[
                      styles.goalCard,
                      {
                        opacity: goalFadeAnim,
                      }
                    ]}
                  >
                    <View style={styles.goalGlowBig} />
                    <View style={styles.goalGlowSmall} />
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => navigation.navigate('GoalDetail', { goal })}
                    >
                      <View style={styles.goalRow}>
                        <View style={styles.goalLeft}>
                          <View style={styles.goalIconWrapper}>
                            {goal.imageUrl ? (
                              <Image source={{ uri: goal.imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 14 }} />
                            ) : (
                              <Target size={20} color="#ffffff" />
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
                );
              })()}
            </View>
          )
        }

        {/* SUBSCRIPTIONS */}
        {subscriptions.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Subscriptions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Subscription')}>
                <Text style={styles.seeAllText}>MANAGE</Text>
              </TouchableOpacity>
            </View>
            <View style={{ gap: 12 }}>
              {topSubscriptions.map((sub) => {
                // Calculate days remaining
                const today = new Date();
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth();
                let targetDate = new Date(currentYear, currentMonth, sub.dayOfMonth);
                if (targetDate < today) {
                  targetDate = new Date(currentYear, currentMonth + 1, sub.dayOfMonth);
                }
                const diffTime = targetDate.getTime() - today.getTime();
                const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isDueSoon = daysRemaining <= 3;

                return (
                  <TouchableOpacity 
                    key={sub.id} 
                    style={[styles.homeSubCard, isDueSoon && styles.homeSubCardDueSoon]}
                    onPress={() => navigation.navigate('Subscription')}
                  >
                    <View style={[styles.homeSubIconWrapper, isDueSoon && styles.homeSubIconWrapperDueSoon, sub.icon && { backgroundColor: 'transparent', borderWidth: 0 }]}>
                      {sub.icon ? (
                        <Image source={SUBS_ICONS[sub.icon]} style={styles.homeSubIcon} />
                      ) : (
                        <CreditCard size={18} color={isDueSoon ? '#ffffff' : colors.primary} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.homeSubTitle, isDueSoon && styles.homeSubTitleDueSoon]} numberOfLines={1}>{sub.title}</Text>
                      <Text style={[styles.homeSubDays, isDueSoon && styles.homeSubDaysDueSoon]}>
                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                      </Text>
                    </View>
                    <Text style={[styles.homeSubAmount, isDueSoon && styles.homeSubAmountDueSoon]}>₱{sub.amount.toLocaleString()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
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
            transactions.slice(0, 4).map(tx => {
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
                      isDeposit ? { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#ecfdf5', borderColor: 'transparent' } : { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fef2f2', borderColor: 'transparent' }
                    ]}>
                      {getTxIcon(tx)}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* INSIGHTS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Insights</Text>
        </View>
        <View style={styles.insightsCard}>
          <View style={styles.insightsRow}>
            <View style={styles.insightInfo}>
              <Text style={styles.insightLabel}>Monthly Activity</Text>
              {(() => {
                const now = new Date();
                const thisMonth = now.getMonth();
                const thisYear = now.getFullYear();
                
                const monthSavings = transactions
                  .filter(t => t.type === 'deposit' && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear)
                  .reduce((acc, curr) => acc + curr.amount, 0);
                  
                const monthSpent = transactions
                  .filter(t => t.type === 'withdrawal' && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear)
                  .reduce((acc, curr) => acc + curr.amount, 0);

                const total = monthSavings + monthSpent;
                const savingsPerc = total > 0 ? (monthSavings / total) * 100 : 50;
                const spentPerc = total > 0 ? (monthSpent / total) * 100 : 50;

                const getWeekOfMonth = (date: Date) => {
                  const day = date.getDate();
                  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
                  return Math.ceil((day + firstDay) / 7);
                };

                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                const currentWeekTitle = `Week ${getWeekOfMonth(new Date())} of ${monthNames[new Date().getMonth()]}`;
                const dayLabels = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
                
                // Get labels for the last 7 days ending today
                const activeLabels = [...Array(7)].map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  return dayLabels[d.getDay()];
                });

                // Daily Activity for Line Graph (Last 7 Days)
                const last7Days = [...Array(7)].map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  d.setHours(0,0,0,0);
                  return d;
                });

                const dailyPoints = last7Days.map(day => {
                  const dayTotal = transactions
                    .filter(t => {
                      const tDate = new Date(t.date);
                      tDate.setHours(0,0,0,0);
                      return tDate.getTime() === day.getTime();
                    })
                    .reduce((acc, curr) => acc + (curr.type === 'deposit' ? curr.amount : -curr.amount), 0);
                  return dayTotal;
                });

                const maxVal = Math.max(...dailyPoints.map(Math.abs), 1000);
                const chartHeight = 80;
                const chartWidth = Dimensions.get('window').width - 80;

                // Function to get control points for a smooth curve
                const getSmoothPath = (pts: {x: number, y: number}[]) => {
                  if (pts.length === 0) return '';
                  let d = `M ${pts[0].x} ${pts[0].y}`;
                  for (let i = 0; i < pts.length - 1; i++) {
                    const p0 = pts[i];
                    const p1 = pts[i + 1];
                    const cp1x = p0.x + (p1.x - p0.x) / 2;
                    const cp1y = p0.y;
                    const cp2x = p0.x + (p1.x - p0.x) / 2;
                    const cp2y = p1.y;
                    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
                  }
                  return d;
                };

                const pts = dailyPoints.map((val, i) => {
                  const x = (i / 6) * chartWidth;
                  const y = (chartHeight / 2) - (val / maxVal) * (chartHeight / 4) * 1.5; // Scale slightly smaller to fit
                  return { x, y };
                });

                const smoothPath = getSmoothPath(pts);
                const areaPath = `${smoothPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

                return (
                  <>
                    <Text style={styles.insightDescription}>
                      You've saved <Text style={{ color: colors.primary }}>₱{monthSavings.toLocaleString()}</Text> and spent <Text style={{ color: '#ef4444' }}>₱{monthSpent.toLocaleString()}</Text> this month.
                    </Text>
                    
                    <View style={styles.miniChartContainer}>
                      <View style={styles.miniChartHeader}>
                        <View style={styles.chartLegend}>
                          <Text style={styles.legendText}>{currentWeekTitle}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.lineChartWrapper}>
                        <Svg height={chartHeight} width={chartWidth}>
                          <Defs>
                            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                              <Stop offset="0" stopColor={colors.primary} stopOpacity="0.3" />
                              <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
                            </LinearGradient>
                          </Defs>

                          {/* Zero Line */}
                          <Path 
                            d={`M 0 ${chartHeight/2} L ${chartWidth} ${chartHeight/2}`} 
                            stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} 
                            strokeWidth="1" 
                          />

                          {/* Area Fill */}
                          <Path
                            d={areaPath}
                            fill="url(#grad)"
                          />

                          {/* Smooth Line */}
                          <Path
                            d={smoothPath}
                            fill="none"
                            stroke={colors.primary}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {pts.map((p, i) => (
                            <Circle 
                              key={i} 
                              cx={p.x} 
                              cy={p.y} 
                              r="4" 
                              fill={colors.primary} 
                              stroke={colors.card}
                              strokeWidth="2"
                            />
                          ))}
                        </Svg>
                        <View style={styles.chartLabelsRow}>
                          {activeLabels.map((label, i) => (
                            <Text key={i} style={styles.chartLabelText}>{label}</Text>
                          ))}
                        </View>
                      </View>
                      
                      <View style={styles.chartValues}>
                        <Text style={styles.chartValueText}>{last7Days[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
                        <Text style={styles.chartValueText}>Today</Text>
                      </View>
                    </View>
                  </>
                );
              })()}
            </View>
          </View>
        </View>



        <View style={{ height: 20 }} />
      </ScrollView >

      {/* MORE ACTIONS MODAL */}
      <ActionSheet
        visible={moreActionsVisible}
        onClose={() => setMoreActionsVisible(false)}
        title="More Actions"
      >
        <View style={styles.moreActionsGrid}>
          <TouchableOpacity style={styles.moreActionItem} onPress={() => { setMoreActionsVisible(false); navigation.navigate('Calculator'); }}>
            <View style={styles.moreActionIconBox}>
              <Calculator size={22} color={colors.text} />
            </View>
            <Text style={styles.moreActionText}>Calculator</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moreActionItem} onPress={() => { setMoreActionsVisible(false); navigation.navigate('Receivables'); }}>
            <View style={styles.moreActionIconBox}>
              <Clock size={22} color={colors.text} />
            </View>
            <Text style={styles.moreActionText}>Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moreActionItem} onPress={() => { setMoreActionsVisible(false); navigation.navigate('Debts'); }}>
            <View style={styles.moreActionIconBox}>
              <AlertCircle size={22} color={colors.text} />
              {pendingDebts > 0 && (
                <View style={styles.gridBadge}>
                  <Text style={styles.gridBadgeText}>{pendingDebts}</Text>
                </View>
              )}
            </View>
            <Text style={styles.moreActionText}>Debt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moreActionItem} onPress={() => { setMoreActionsVisible(false); navigation.navigate('Grocery'); }}>
            <View style={styles.moreActionIconBox}>
              <ShoppingCart size={22} color={colors.text} />
              {pendingGroceries > 0 && (
                <View style={styles.gridBadge}>
                  <Text style={styles.gridBadgeText}>{pendingGroceries}</Text>
                </View>
              )}
            </View>
            <Text style={styles.moreActionText}>Grocery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moreActionItem} onPress={() => { setMoreActionsVisible(false); navigation.navigate('Travel'); }}>
            <View style={styles.moreActionIconBox}>
              <Plane size={22} color={colors.text} />
            </View>
            <Text style={styles.moreActionText}>Travel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moreActionItem} onPress={() => { setMoreActionsVisible(false); navigation.navigate('Recursion'); }}>
            <View style={styles.moreActionIconBox}>
              <RefreshCw size={22} color={colors.text} />
            </View>
            <Text style={styles.moreActionText}>Recursion</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moreActionItem} onPress={() => { setMoreActionsVisible(false); navigation.navigate('Subscription'); }}>
            <View style={styles.moreActionIconBox}>
              <CreditCard size={22} color={colors.text} />
              {pendingSubscriptions > 0 && (
                <View style={styles.gridBadge}>
                  <Text style={styles.gridBadgeText}>{pendingSubscriptions}</Text>
                </View>
              )}
            </View>
            <Text style={styles.moreActionText}>Subscription</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>


      {/* TUTORIAL OVERLAY */}
      < Modal visible={isTutorialActive} transparent animationType="fade" statusBarTranslucent={true} >

        <View style={styles.tutorialContainer}>
          {targetLayout && (
            <>
              {/* Single-view spotlight with rounded borders using massive border width */}
              <View
                style={[
                  styles.spotlight,
                  {
                    left: targetLayout.x - 2000,
                    top: targetLayout.y - 2000,
                    width: targetLayout.w + 4000,
                    height: targetLayout.h + 4000,
                    borderWidth: 2000,
                    borderRadius: (tutorialSteps[currentStep].borderRadius || 16) + 2000,
                  }
                ]}
              />

              {/* Subtle highlight border */}
              <View
                style={[
                  styles.highlight,
                  {
                    left: targetLayout.x - 2,
                    top: targetLayout.y - 2,
                    width: targetLayout.w + 4,
                    height: targetLayout.h + 4,
                    borderRadius: tutorialSteps[currentStep].borderRadius || 16,
                  }
                ]}
              />
            </>
          )}


          <View style={[
            styles.tooltip,
            targetLayout ? { top: targetLayout.y + targetLayout.h + 32 } : { top: '30%' }
          ]}>

            <Text style={styles.tooltipTitle}>{tutorialSteps[currentStep].title}</Text>
            <Text style={styles.tooltipDesc}>{tutorialSteps[currentStep].description}</Text>

            <View style={styles.tooltipActions}>
              <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                <Text style={styles.skipBtnText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
                <Text style={styles.nextBtnText}>
                  {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal >



    </View >
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
    marginBottom: 24, // More space from balance card
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
  decorLeaf1: {
    position: 'absolute',
    top: -10,
    right: 20,
    zIndex: 0,
  },
  decorLeaf2: {
    position: 'absolute',
    top: 30,
    left: -20,
    zIndex: 0,
  },
  decorLeaf3: {
    position: 'absolute',
    bottom: 20,
    right: 50,
    zIndex: 0,
  },
  decorLeaf4: {
    position: 'absolute',
    bottom: -15,
    left: 40,
    zIndex: 0,
  },
  decorLeaf5: {
    position: 'absolute',
    top: 60,
    right: -10,
    zIndex: 0,
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
    minHeight: 40, // Prevent layout jump
  },
  eyeButton: {
    padding: 4,
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
    paddingTop: 8, // Very close to the Explore label
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    columnGap: '1.3%',
    marginBottom: 20, // Reduced space after Explore
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
    marginBottom: 4, // Tighten gap with buttons below
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
    marginBottom: 24, // Reduced space after Goals
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalSlide: {
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
  },
  goalCard: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: '100%',
    overflow: 'hidden',
  },
  goalGlowBig: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 70,
  },
  goalGlowSmall: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 40,
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
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: '#ffffff',
  },
  goalAmountText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  goalPercentage: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  transactionsList: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: theme.spacing.md,
    marginBottom: 24, // Reduced space after Recent
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
  tutorialContainer: {
    flex: 1,
  },
  spotlight: {
    position: 'absolute',
    borderColor: 'rgba(0,0,0,0.7)',
    backgroundColor: 'transparent',
  },
  highlight: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  tooltipTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  tooltipDesc: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 20,
  },
  tooltipActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipBtnText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  nextBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: '#ffffff',
  },


  insightsCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24, // Reduced space
  },
  insightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  insightInfo: {
    flex: 1,
  },
  insightLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  insightDescription: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  miniChartContainer: {
    marginTop: 8,
  },
  miniChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
  },
  chartValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  chartValueText: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    color: colors.textMuted,
  },
  lineChartWrapper: {
    height: 80,
    justifyContent: 'center',
    marginVertical: 12,
  },
  txBrandLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  moreActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  moreActionItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 20,
  },
  moreActionIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moreActionText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: colors.text,
  },
  homeSubCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 0,
  },
  homeSubCardDueSoon: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  homeSubIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeSubIconWrapperDueSoon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  homeSubTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: colors.text,
  },
  homeSubTitleDueSoon: {
    color: '#ffffff',
  },
  homeSubDays: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  homeSubDaysDueSoon: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  homeSubAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
  homeSubAmountDueSoon: {
    color: '#ffffff',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontFamily: theme.fonts.bold,
  },
  gridBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.card,
  },
  gridBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: theme.fonts.bold,
  },
  homeSubIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  chartLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width - 80,
    marginTop: 8,
  },
  chartLabelText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    color: colors.textMuted,
    width: 20,
    textAlign: 'center',
  },
  paydayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.1)' : '#f0fdf4',
    marginHorizontal: 20,
    marginTop: 6,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(74, 222, 128, 0.2)' : '#dcfce7',
    gap: 10,
  },
  paydayIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.1)' : '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paydayText: {
    flex: 1,
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: isDarkMode ? '#dcfce7' : '#166534',
  },
  paydayHighlight: {
    fontFamily: theme.fonts.bold,
    color: isDarkMode ? '#4ade80' : '#15803d',
  },
  paydayAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: isDarkMode ? '#4ade80' : '#16a34a',
  },
});
