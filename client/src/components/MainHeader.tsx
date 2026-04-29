import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Modal, Image, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { navigationRef } from '../navigation/navigationUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, User, Settings, LogOut, Info, ChevronRight, Flame, Sprout, TreeDeciduous, Egg, X, Image as ImageIcon, HelpCircle, Bell, Target, AlertCircle, ShoppingCart, Coins } from 'lucide-react-native';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const rf = (size: number) => Math.round(size * scale);


export interface MainHeaderProps {
  activeRoute?: string;
}

export default function MainHeader({ activeRoute: propActiveRoute }: MainHeaderProps) {
  const { username, userImage, streakCount, transactionDates, showConfirm, clearData, colors, isDarkMode, toggleTheme, startTutorial, goals, wallets, debts, groceryLists, totalBalance, transactions } = useAppContext();

  const navigation = useNavigation<any>();
  const [internalActiveRoute, setInternalActiveRoute] = useState('Home');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadDismissed = async () => {
      try {
        const stored = await AsyncStorage.getItem('@dismissedNotifications');
        if (stored) setDismissedIds(JSON.parse(stored));
      } catch (e) { }
    };
    loadDismissed();
  }, []);

  const markAllAsRead = async () => {
    const currentNotifIds = notifications.map(n => n.id);
    const newDismissed = [...new Set([...dismissedIds, ...currentNotifIds])];
    setDismissedIds(newDismissed);
    try {
      await AsyncStorage.setItem('@dismissedNotifications', JSON.stringify(newDismissed));
    } catch (e) { }
  };

  const notifications = useMemo(() => {
    const list = [];
    const todayStr = currentDate.toISOString().split('T')[0];
    const todayIndex = currentDate.getDay();

    // Goals at 100%
    if (goals && wallets) {
      goals.forEach(g => {
        const wallet = wallets.find(w => w.id === g.walletId);
        if (wallet && g.targetAmount > 0 && wallet.balance >= g.targetAmount) {
          list.push({
            id: `goal-${g.id}-complete`,
            title: 'Goal Achieved!',
            message: `Your goal "${g.title}" is 100% complete! 🎉`,
            icon: Target,
            color: colors.primary,
            screen: 'Goals'
          });
        }
      });
    }

    // Active Debts (Due Today or Overdue)
    if (debts && debts.length > 0) {
      const dueToday = debts.filter(d => d.dueDate && d.dueDate === todayStr).length;
      const overdue = debts.filter(d => d.dueDate && d.dueDate < todayStr).length;

      if (dueToday > 0 || overdue > 0) {
        list.push({
          id: `debts-urgent-${todayStr}-${dueToday}-${overdue}`,
          title: dueToday > 0 ? 'Debt Due Today!' : 'Overdue Debt!',
          message: dueToday > 0
            ? `You have ${dueToday} debt${dueToday > 1 ? 's' : ''} to pay today.`
            : `You have ${overdue} overdue debt${overdue > 1 ? 's' : ''}.`,
          icon: AlertCircle,
          color: colors.danger,
          screen: 'Debts'
        });
      } else {
        list.push({
          id: `debts-summary-${debts.length}`,
          title: 'Outstanding Debts',
          message: `You have ${debts.length} active debt${debts.length > 1 ? 's' : ''} to settle.`,
          icon: AlertCircle,
          color: colors.danger,
          screen: 'Debts'
        });
      }
    }

    // Grocery Lists (Scheduled Today or Active)
    if (groceryLists && groceryLists.length > 0) {
      const scheduledToday = groceryLists.filter(l => l.scheduledDays?.includes(todayIndex)).length;
      const activeLists = groceryLists.filter(l => l.items.some(i => !i.completed)).length;

      if (scheduledToday > 0) {
        list.push({
          id: `grocery-today-${todayStr}-${scheduledToday}`,
          title: 'Shopping Day!',
          message: `You have ${scheduledToday} grocery list${scheduledToday > 1 ? 's' : ''} for today.`,
          icon: ShoppingCart,
          color: colors.primary,
          screen: 'Grocery'
        });
      } else if (activeLists > 0) {
        list.push({
          id: `grocery-summary-${activeLists}`,
          title: 'Grocery Lists',
          message: `You have ${activeLists} active shopping list${activeLists > 1 ? 's' : ''}.`,
          icon: ShoppingCart,
          color: colors.primary,
          screen: 'Grocery'
        });
      }
    }

    return list.filter(n => !dismissedIds.includes(n.id));
  }, [goals, wallets, debts, groceryLists, colors, dismissedIds, currentDate]);

  const statusMessage = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const monthSavings = transactions
      .filter(t => t.type === 'deposit' && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const monthSpent = transactions
      .filter(t => t.type === 'withdrawal' && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear)
      .reduce((acc, curr) => acc + curr.amount, 0);

    // 1. Critical Debt Check
    const overdueDebts = debts.filter(d => d.dueDate && d.dueDate < today.toISOString().split('T')[0]).length;
    if (overdueDebts > 0) return "Hey, I noticed a few overdue debts. Shall we clear those first? ";

    // 2. Low Balance Check
    if (totalBalance < 500 && totalBalance > 0) return "Your balance is looking a bit thin! Time for some fresh seeds? ";
    if (totalBalance <= 0 && wallets.length > 0) return "Your garden is a bit dry! Let's add some water to those wallets. ";

    // 3. Spending Check
    if (monthSpent > monthSavings && monthSpent > 0) return "Whoa, you're spending a bit fast! Let's be extra careful today, okay?";

    // 4. Goal Encouragement
    const nearGoal = goals.find(g => {
      const wallet = wallets.find(w => w.id === g.walletId);
      const progress = wallet ? (wallet.balance / g.targetAmount) : 0;
      return progress > 0.8 && progress < 1;
    });
    if (nearGoal) return `You're so close! Just a little more and "${nearGoal.title}" will be fully blooming.`;

    // 5. Positive Reinforcement
    if (monthSavings > monthSpent * 1.5 && monthSavings > 0) return "Wow, your savings are booming! You're really good at this. Keep it up!";

    // Default Nature Wisdom
    const wisdom = [
      "Every small saving is a leaf on your tree of wealth. You're doing great!",
      "I love how you're nurturing your garden today. Keep it up!",
      "Ready for another day of growth? Let's make it count!",
      "Patience is key! Just like a tree, your wealth grows slowly but surely.",
      "Your financial forest is looking beautiful today. Any new plans?",
      "Grow your wealth, one leaf at a time. I'm here to help!",
      "Did you know? Consistent savings are the best fertilizer for goals!"
    ];
    return wisdom[today.getDay() % wisdom.length];
  }, [totalBalance, transactions, debts, goals, wallets, colors]);

  const activeRoute = propActiveRoute || internalActiveRoute;

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute) {
        setInternalActiveRoute(currentRoute.name);
      }
    });

    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const handlePlusPress = () => {
    if (navigationRef.isReady()) {
      navigationRef.setParams({ openAddModal: true } as any);
    }
  };

  const fullDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const styles = getStyles(colors, isDarkMode);

  const handleLogout = () => {
    setDropdownVisible(false);
    showConfirm(
      'Log Out',
      'Are you sure you want to log out? This will clear all your data including wallets, goals, and profile image.',
      async () => {
        await clearData();
      }
    );
  };

  const handleSettings = () => {
    setDropdownVisible(false);
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.headerContent}>
        {/* First Row: Streak (Left) and Notification/Profile (Right) */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[
              styles.streakBadgeCompact,
              streakCount >= 8 ? styles.streakBadgeTree :
                streakCount >= 3 ? styles.streakBadgeSapling :
                  styles.streakBadgeSeed
            ]}
            onPress={() => setStreakModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={{ transform: [{ rotate: '-20deg' }] }}>
              {(() => {
                if (streakCount >= 8) return <TreeDeciduous size={10} color="#15803d" fill="#15803d" />;
                if (streakCount >= 3) return <Sprout size={10} color="#22c55e" fill="#22c55e" />;
                return <Egg size={10} color="#92400e" fill="#92400e" />;
              })()}
            </View>
            <Text style={[
              styles.streakTextSmall,
              streakCount >= 8 ? { color: '#15803d' } :
                streakCount >= 3 ? { color: '#16a34a' } :
                  { color: '#92400e' }
            ]}>
              Growth {streakCount}
            </Text>
          </TouchableOpacity>

          <View style={styles.rightActionsSmall}>
            <TouchableOpacity
              style={styles.iconActionSmall}
              onPress={() => setNotificationModalVisible(true)}
            >
              <Bell size={18} color={colors.text} />
              {notifications.length > 0 && (
                <View style={styles.notificationBadgeSmall}>
                  <Text style={styles.notificationCountText}>{notifications.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileCircleSmall}
              onPress={() => setDropdownVisible(true)}
              activeOpacity={0.8}
            >
              {userImage ? (
                <Image source={{ uri: userImage }} style={styles.headerProfileImage} />
              ) : (
                <User size={18} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Second Row: Greeting and Calendar Date (Right) */}
        <View style={styles.bottomRow}>
          <View style={styles.greetingWrapper}>
            <Text style={styles.welcomeLabel} numberOfLines={1} adjustsFontSizeToFit>Welcome to Leafy</Text>
            <Text style={styles.greetingSmall} numberOfLines={1} adjustsFontSizeToFit>{username || 'User'}</Text>
            <Text style={styles.timeText} numberOfLines={1}>{fullDate}</Text>
          </View>
          <View style={styles.statusBubblePremium}>
            <Text style={styles.statusBubbleText}>{statusMessage}</Text>
          </View>
        </View>
      </View>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <View style={styles.dropdownHeader}>
                  <View style={styles.dropdownProfileCircle}>
                    {userImage ? (
                      <Image source={{ uri: userImage }} style={styles.dropdownProfileImage} />
                    ) : (
                      <User size={24} color={colors.primary} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.dropdownUsername}>{username || 'User'}</Text>
                    <Text style={styles.dropdownUserRole}>Leafy Member</Text>
                  </View>
                </View>

                <View style={styles.dropdownDivider} />

                <TouchableOpacity style={styles.dropdownItem} onPress={handleSettings}>
                  <View style={styles.dropdownItemLeft}>
                    <Settings size={18} color={colors.textMuted} />
                    <Text style={styles.dropdownItemText}>Settings</Text>
                  </View>
                  <ChevronRight size={16} color={colors.border} />
                </TouchableOpacity>



                <View style={styles.dropdownDivider} />

                <TouchableOpacity
                  style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                  onPress={handleLogout}
                >
                  <View style={styles.dropdownItemLeft}>
                    <LogOut size={18} color={colors.danger} />
                    <Text style={[styles.dropdownItemText, { color: colors.danger }]}>Log Out</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={notificationModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setNotificationModalVisible(false)}>
          <View style={styles.notificationOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.notificationDropdown}>
                <View style={styles.notifDropdownHeader}>
                  <Text style={styles.dropdownTitle}>Notifications</Text>
                  {notifications.length > 0 && (
                    <TouchableOpacity onPress={markAllAsRead}>
                      <Text style={styles.markReadText}>Mark all as read</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {notifications.length > 0 ? (
                  <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={notifications.length > 4}
                    style={{ maxHeight: 350 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.notifDropdownItem}
                        onPress={() => {
                          setNotificationModalVisible(false);
                          navigation.navigate(item.screen);
                        }}
                      >
                        <View style={[styles.notifIconCircle, { backgroundColor: item.color + '15' }]}>
                          <item.icon size={16} color={item.color} />
                        </View>
                        <View style={styles.notifTextContent}>
                          <Text style={styles.notifItemTitle} numberOfLines={1}>{item.title}</Text>
                          <Text style={styles.notifItemMessage} numberOfLines={2}>{item.message}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <View style={styles.notifEmptyDropdown}>
                    <Bell size={24} color={colors.textMuted} />
                    <Text style={styles.notifEmptyText}>No new notifications</Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={streakModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setStreakModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setStreakModalVisible(false)}>
          <View style={styles.modalOverlayCenter}>
            <TouchableWithoutFeedback>
              <View style={styles.streakModal}>
                <View style={styles.streakModalHeader}>
                  <Text style={styles.streakModalTitle}>Your Growth Journey</Text>
                  <TouchableOpacity onPress={() => setStreakModalVisible(false)}>
                    <X size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.streakStatsRow}>
                  <View style={styles.streakStatItem}>
                    <Text style={styles.streakStatValue}>{streakCount}</Text>
                    <Text style={styles.streakStatLabel}>Growth Days</Text>
                  </View>
                  <View style={styles.streakStatDivider} />
                  <View style={styles.streakStatItem}>
                    <Text style={styles.streakStatValue}>
                      {streakCount >= 8 ? 'Tree' : streakCount >= 3 ? 'Sapling' : 'Seed'}
                    </Text>
                    <Text style={styles.streakStatLabel}>Tree Stage</Text>
                  </View>
                </View>

                <View style={styles.stepperContainer}>
                  <View style={styles.stepperLine} />
                  <View style={styles.daysRow}>
                    {(() => {
                      const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                      const today = new Date();
                      const currentDayIdx = today.getDay();
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - currentDayIdx);

                      return days.map((day, idx) => {
                        const date = new Date(startOfWeek);
                        date.setDate(startOfWeek.getDate() + idx);
                        const dateStr = date.toISOString().split('T')[0];
                        const isCompleted = transactionDates.includes(dateStr);
                        const isToday = idx === currentDayIdx;

                        return (
                          <View key={idx} style={styles.dayStep}>
                            <View style={[
                              styles.dayCircle,
                              isCompleted && styles.dayCircleCompleted,
                              isToday && styles.dayCircleToday
                            ]}>
                              <Text style={[
                                styles.dayText,
                                isCompleted && styles.dayTextCompleted,
                                isToday && styles.dayTextToday
                              ]}>{day}</Text>
                            </View>
                          </View>
                        );
                      });
                    })()}
                  </View>
                </View>

                <View style={styles.guideContainer}>
                  <Text style={styles.guideTitle}>How Your Forest Grows</Text>

                  <View style={styles.guideRow}>
                    <View style={styles.guideItem}>
                      <View style={[styles.guideIconCircle, { backgroundColor: isDarkMode ? 'rgba(146, 64, 14, 0.1)' : '#fffbeb' }]}>
                        <View style={{ transform: [{ rotate: '-20deg' }] }}>
                          <Egg size={20} color="#92400e" fill="#92400e" />
                        </View>
                      </View>
                      <Text style={styles.guideStageName}>Seed</Text>
                      <Text style={styles.guideStageDesc}>Day 1-2</Text>
                    </View>

                    <View style={styles.guideConnector} />

                    <View style={styles.guideItem}>
                      <View style={[styles.guideIconCircle, { backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4' }]}>
                        <Sprout size={20} color="#22c55e" fill="#22c55e" />
                      </View>
                      <Text style={styles.guideStageName}>Sapling</Text>
                      <Text style={styles.guideStageDesc}>Day 3-7</Text>
                    </View>

                    <View style={styles.guideConnector} />

                    <View style={styles.guideItem}>
                      <View style={[styles.guideIconCircle, { backgroundColor: colors.primary + '15' }]}>
                        <TreeDeciduous size={20} color={colors.primary} fill={colors.primary} />
                      </View>
                      <Text style={styles.guideStageName}>Tree</Text>
                      <Text style={styles.guideStageDesc}>Day 8+</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeStreakBtn}
                  onPress={() => setStreakModalVisible(false)}
                >
                  <Text style={styles.closeStreakBtnText}>Keep Growing</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1000,
  },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    backgroundColor: colors.background,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomRow: {
    marginTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  calendarDateBox: {
    width: 44,
    height: 48,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarMonthBox: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 2,
    alignItems: 'center',
  },
  calendarMonthText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    color: '#ffffff',
  },
  calendarDayBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  calendarDayText: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginTop: -2,
  },
  greetingWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  timeText: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  welcomeLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(10),
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 1,
  },
  rightActionsSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconActionSmall: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadgeSmall: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  notificationCountText: {
    color: '#ffffff',
    fontSize: 7,
    fontFamily: theme.fonts.bold,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  profileCircleSmall: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '33',
    overflow: 'hidden',
  },
  headerProfileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  realtimeDateSmall: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  greetingSmall: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: rf(24),
  },
  statusBubblePremium: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: '60%',
  },
  statusBubbleText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(9),
    color: isDarkMode ? '#ffffff' : colors.text,
    fontStyle: 'italic',
    lineHeight: rf(13),
    textAlign: 'right',
  },
  headerRightWrapper: {
    alignItems: 'flex-end',
    gap: 4,
  },
  usernameBoldSmall: {
    fontFamily: theme.fonts.bold,
  },
  streakBadgeCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  streakTextSmall: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60, // Positioned below profile icon
    paddingRight: 20,
  },
  dropdownMenu: {
    backgroundColor: colors.card,
    width: 280,
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dropdownProfileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dropdownProfileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  dropdownUsername: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  dropdownUserRole: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: colors.primary,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 48,
  },

  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownItemText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: isDarkMode ? 'rgba(249, 115, 22, 0.1)' : '#fff7ed',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(249, 115, 22, 0.2)' : '#ffedd5',
  },
  streakText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: '#f97316',
  },
  streakBadgeSeed: {
    backgroundColor: isDarkMode ? 'rgba(146, 64, 14, 0.1)' : '#fffbeb',
    borderColor: isDarkMode ? 'rgba(146, 64, 14, 0.2)' : '#fef3c7',
  },
  streakBadgeSapling: {
    backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4',
    borderColor: isDarkMode ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
  },
  streakBadgeTree: {
    backgroundColor: isDarkMode ? 'rgba(21, 128, 61, 0.1)' : '#f0fdf4',
    borderColor: isDarkMode ? 'rgba(21, 128, 61, 0.2)' : '#dcfce7',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  streakModal: {
    backgroundColor: colors.card,
    width: '100%',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  streakModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakModalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  streakStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakStatItem: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: colors.primary,
  },
  streakStatLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  streakStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  stepperContainer: {
    height: 70,
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepperLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 40,
    height: 2,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  dayStep: {
    alignItems: 'center',
    width: 35,
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayCircleToday: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  dayText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: colors.textMuted,
  },
  dayTextCompleted: {
    color: '#ffffff',
  },
  dayTextToday: {
    color: colors.primary,
  },
  guideContainer: {
    marginTop: 4,
    marginBottom: 16,
    padding: 12,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fcfcfc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guideTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guideItem: {
    alignItems: 'center',
    flex: 1,
  },
  guideIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  guideStageName: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
  guideStageDesc: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
  },
  guideConnector: {
    width: 20,
    height: 1,
    backgroundColor: colors.border,
    marginTop: -16,
  },
  closeStreakBtn: {
    backgroundColor: colors.primary,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  closeStreakBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  emptySubText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  notificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 65,
    paddingRight: 50,
  },
  notificationDropdown: {
    width: 280,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  notifDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dropdownTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  markReadText: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    color: colors.primary,
  },
  notifBadgeCount: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  notifBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: theme.fonts.bold,
  },
  notifDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  notifIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifTextContent: {
    flex: 1,
  },
  notifItemTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: colors.text,
  },
  notifItemMessage: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  notifEmptyDropdown: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  notifEmptyText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyText: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
});
