import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Modal, Image, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { navigationRef } from '../navigation/navigationUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, User, Settings, LogOut, Info, ChevronRight, Moon, Sun, Flame, Sprout, TreeDeciduous, Egg, X } from 'lucide-react-native';

export interface MainHeaderProps {
  activeRoute?: string;
}

export default function MainHeader({ activeRoute: propActiveRoute }: MainHeaderProps) {
  const { username, userImage, streakCount, transactionDates, showConfirm, clearData, colors, isDarkMode, toggleTheme } = useAppContext();
  const navigation = useNavigation<any>();

  const styles = getStyles(colors, isDarkMode);
  const [internalActiveRoute, setInternalActiveRoute] = useState('Home');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [streakModalVisible, setStreakModalVisible] = useState(false);

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

  // Use the user's specific request: show on Calculator as well
  // if (activeRoute === 'Calculator') return null;

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const handlePlusPress = () => {
    if (navigationRef.isReady()) {
      navigationRef.setParams({ openAddModal: true } as any);
    }
  };

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

  const isHome = activeRoute === 'Home' || activeRoute === 'Main';
  const showPlus = activeRoute === 'Wallets' || activeRoute === 'Goals';
  const displayTitle = (activeRoute === 'Main' || activeRoute === 'Home') ? 'Dashboard' : activeRoute;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.realtimeDate}>{formattedDate}</Text>
            <Text style={styles.greeting}>Hello, {username || 'User'}</Text>
            <Text style={styles.appMessage}>Welcome to Leafy</Text>
          </View>

          <View style={styles.rightActions}>
            <TouchableOpacity 
              style={[
                styles.streakBadge,
                streakCount >= 8 ? styles.streakBadgeTree : 
                streakCount >= 3 ? styles.streakBadgeSapling : 
                styles.streakBadgeSeed
              ]}
              onPress={() => setStreakModalVisible(true)}
              activeOpacity={0.7}
            >
              {(() => {
                if (streakCount >= 8) return <TreeDeciduous size={16} color="#15803d" fill="#15803d" />;
                if (streakCount >= 3) return <Sprout size={16} color="#22c55e" fill="#22c55e" />;
                return <Egg size={16} color="#92400e" fill="#92400e" />;
              })()}
              <Text style={[
                styles.streakText,
                streakCount >= 8 ? { color: '#15803d' } : 
                streakCount >= 3 ? { color: '#16a34a' } : 
                { color: '#92400e' }
              ]}>{streakCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileCircle}
              onPress={() => setDropdownVisible(true)}
              activeOpacity={0.8}
            >
              {userImage ? (
                <Image source={{ uri: userImage }} style={styles.headerProfileImage} />
              ) : (
                <User size={22} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Title row removed to save space */}
      </View>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
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
                    <Text style={styles.dropdownUserRole}>Premium Member</Text>
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

                {/* <TouchableOpacity style={styles.dropdownItem} onPress={() => { setDropdownVisible(false); Alert.alert('App Information', 'Leafy v1.0.0\nSecure Local Finance Manager\nCreated with ❤️'); }}>
                  <View style={styles.dropdownItemLeft}>
                    <Info size={18} color={colors.textMuted} />
                    <Text style={styles.dropdownItemText}>App Information</Text>
                  </View>
                  <ChevronRight size={16} color={colors.border} />
                </TouchableOpacity> */}

                <View style={styles.dropdownItem}>
                  <View style={styles.dropdownItemLeft}>
                    {isDarkMode ? <Moon size={18} color={colors.textMuted} /> : <Sun size={18} color={colors.textMuted} />}
                    <Text style={styles.dropdownItemText}>Dark Mode</Text>
                  </View>
                  <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#e2e8f0', true: colors.primary }}
                    thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.dropdownDivider} />

                <TouchableOpacity
                  style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                  onPress={handleLogout}
                >
                  <View style={styles.dropdownItemLeft}>
                    <LogOut size={18} color="#ef4444" />
                    <Text style={[styles.dropdownItemText, { color: '#ef4444' }]}>Log Out</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Streak Detail Modal */}
      <Modal
        visible={streakModalVisible}
        transparent
        animationType="fade"
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
                    <Text style={styles.streakStatLabel}>Day Streak</Text>
                  </View>
                  <View style={styles.streakStatDivider} />
                  <View style={styles.streakStatItem}>
                    <Text style={styles.streakStatValue}>
                      {streakCount >= 8 ? 'Tree' : streakCount >= 3 ? 'Sapling' : 'Seed'}
                    </Text>
                    <Text style={styles.streakStatLabel}>Current Stage</Text>
                  </View>
                </View>

                {/* WEEKLY STEPPER */}
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

                {/* GROWTH GUIDE */}
                <View style={styles.guideContainer}>
                  <Text style={styles.guideTitle}>How Your Forest Grows</Text>
                  
                  <View style={styles.guideRow}>
                    <View style={styles.guideItem}>
                      <View style={[styles.guideIconCircle, { backgroundColor: isDarkMode ? 'rgba(146, 64, 14, 0.1)' : '#fffbeb' }]}>
                        <Egg size={20} color="#92400e" fill="#92400e" />
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
                      <View style={[styles.guideIconCircle, { backgroundColor: isDarkMode ? 'rgba(21, 128, 61, 0.1)' : '#f0fdf4' }]}>
                        <TreeDeciduous size={20} color="#15803d" fill="#15803d" />
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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    height: 100,
    justifyContent: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bottomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  screenTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 30,
    color: colors.primary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 10,
  },
  addBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: '#ffffff',
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#a7f3d0',
    overflow: 'hidden',
  },
  headerProfileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  realtimeDate: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  greeting: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  appMessage: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  dropdownMenu: {
    backgroundColor: colors.card,
    width: 220,
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
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
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
    paddingVertical: 5,
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
});
