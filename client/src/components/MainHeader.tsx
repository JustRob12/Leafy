import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Modal, Image, Alert, FlatList, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useAppContext, getWalletTotalBalanceInPhp } from '../context/AppContext';
import { navigationRef } from '../navigation/navigationUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, User, Settings, LogOut, Info, ChevronRight, Flame, Sprout, TreeDeciduous, Egg, X, Image as ImageIcon, HelpCircle, Bell, Target, AlertCircle, ShoppingCart, Coins, Calendar, CreditCard, Home, Receipt, Sparkles } from 'lucide-react-native';
import { rf } from '../utils/responsive';


import { useHeaderAlerts } from '../hooks/useHeaderAlerts';
import { ProfileMenuModal, NotificationModal, StreakModal } from './HeaderModals';

export interface MainHeaderProps {
  activeRoute?: string;
}

export default function MainHeader({ activeRoute: propActiveRoute }: MainHeaderProps) {
  const { username, userImage, streakCount, transactionDates, showConfirm, clearData, colors, isDarkMode } = useAppContext();

  const navigation = useNavigation<any>();
  const [internalActiveRoute, setInternalActiveRoute] = useState('Home');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  const { notifications, statusMessage, fullDate, markAllAsRead } = useHeaderAlerts();

  const activeRoute = propActiveRoute || internalActiveRoute;

  // Infinite Horizontal Running Marquee for Money Behavior Quote
  const translateX = useRef(new Animated.Value(0)).current;
  const [itemWidth, setItemWidth] = useState(0);

  useEffect(() => {
    if (itemWidth <= 0) return;
    translateX.setValue(0);
    // Smooth reading velocity: ~35-40 pixels per second, minimum 7s per loop
    const duration = Math.max(7000, (itemWidth / 35) * 1000);
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -itemWidth,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [itemWidth, statusMessage]);

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute) {
        setInternalActiveRoute(currentRoute.name);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handlePlusPress = () => {
    if (navigationRef.isReady()) {
      navigationRef.setParams({ openAddModal: true } as any);
    }
  };

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

        {/* Second Row: Greeting and Calendar Date */}
        <View style={styles.bottomRow}>
          <View style={styles.greetingWrapper}>
            <Text style={styles.welcomeLabel} numberOfLines={1} adjustsFontSizeToFit>Welcome to Leon</Text>
            <Text style={styles.greetingSmall} numberOfLines={1} adjustsFontSizeToFit>{username || 'User'}</Text>
            <Text style={styles.timeText} numberOfLines={1}>{fullDate}</Text>
          </View>
        </View>
      </View>

      {/* Infinite Horizontal Running Marquee Quote Under Header */}
      {statusMessage ? (
        <View style={styles.marqueeContainer}>
          <Animated.View style={[styles.marqueeTrack, { transform: [{ translateX }] }]}>
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <View
                key={idx}
                onLayout={idx === 0 ? (e) => {
                  const w = e.nativeEvent.layout.width;
                  if (w > 0 && Math.abs(w - itemWidth) > 1) {
                    setItemWidth(w);
                  }
                } : undefined}
                style={styles.marqueeItem}
              >
                <Sparkles size={11} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.marqueeText}>{statusMessage}</Text>
                <Text style={styles.marqueeSeparator}>✦</Text>
              </View>
            ))}
          </Animated.View>
        </View>
      ) : null}

      <ProfileMenuModal
        visible={dropdownVisible}
        onClose={() => setDropdownVisible(false)}
        onSettings={handleSettings}
        onLogout={handleLogout}
      />

      <NotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
        notifications={notifications}
        onMarkAllAsRead={markAllAsRead}
        onNavigate={(screen) => navigation.navigate(screen)}
      />

      <StreakModal
        visible={streakModalVisible}
        onClose={() => setStreakModalVisible(false)}
        streakCount={streakCount}
        transactionDates={transactionDates}
      />
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
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
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
  marqueeContainer: {
    height: 32,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(16, 185, 129, 0.05)',
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    justifyContent: 'center',
    width: '100%',
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marqueeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  marqueeText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(10.5),
    color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : colors.text,
    letterSpacing: -0.2,
  },
  marqueeSeparator: {
    marginHorizontal: 18,
    color: colors.primary,
    fontSize: 9,
    opacity: 0.5,
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
