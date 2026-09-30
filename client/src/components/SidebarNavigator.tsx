import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { User, Settings, Sun, Moon } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { ProfileMenuModal } from './HeaderModals';
import { theme } from '../theme';
import { rf, useResponsive } from '../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SidebarNavigator({ state, descriptors, navigation }: BottomTabBarProps) {
  const { userImage, colors, isDarkMode, toggleTheme, showConfirm, clearData } = useAppContext();
  const { sidebarWidth } = useResponsive();
  const insets = useSafeAreaInsets();

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const styles = getStyles(colors, isDarkMode, sidebarWidth);

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
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 14),
          paddingLeft: Math.max(insets.left, 10),
          paddingBottom: Math.max(insets.bottom, 14),
        }
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* TOP: USER PROFILE ICON ONLY */}
        <View style={styles.topSection}>
          <TouchableOpacity
            style={styles.profileAvatarWrapper}
            onPress={() => setDropdownVisible(true)}
            activeOpacity={0.8}
          >
            {userImage ? (
              <Image source={{ uri: userImage }} style={styles.profileAvatar} />
            ) : (
              <User size={22} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* MIDDLE: NAVIGATION LINKS */}
        <View style={styles.navSection}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const Icon = options.tabBarIcon;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.8}
                style={[
                  styles.navItem,
                  isFocused && styles.navItemActive,
                ]}
              >
                <View style={styles.navItemContent}>
                  <View style={[styles.navIconWrapper, isFocused && styles.navIconWrapperActive]}>
                    {Icon && Icon({
                      color: isFocused ? '#FFFFFF' : colors.textMuted,
                      size: 19,
                      focused: isFocused,
                    })}
                  </View>
                  <Text
                    style={[
                      styles.navLabel,
                      isFocused ? styles.navLabelActive : { color: colors.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {route.name}
                  </Text>
                </View>
                {isFocused && <View style={styles.activeIndicatorDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* BOTTOM FOOTER: DARK MODE & SETTINGS (ICONS ONLY) */}
        <View style={styles.footerSection}>
          <View style={styles.footerDivider} />

          <View style={styles.footerRow}>
            {/* Dark Mode Toggle Icon Button */}
            <TouchableOpacity
              style={styles.footerBtn}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              {isDarkMode ? (
                <Sun size={20} color="#fbbf24" />
              ) : (
                <Moon size={20} color={colors.textMuted} />
              )}
            </TouchableOpacity>

            {/* Settings Icon Button */}
            <TouchableOpacity
              style={styles.footerBtn}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.7}
            >
              <Settings size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* USER PROFILE / LOGOUT MODAL */}
      <ProfileMenuModal
        visible={dropdownVisible}
        onClose={() => setDropdownVisible(false)}
        onSettings={handleSettings}
        onLogout={handleLogout}
        alignLeft
      />
    </View>
  );
}

const getStyles = (colors: any, isDarkMode: boolean, sidebarWidth: number) =>
  StyleSheet.create({
    container: {
      width: sidebarWidth,
      height: '100%',
      backgroundColor: colors.card,
      borderRightWidth: 1,
      borderRightColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      zIndex: 50,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 3, height: 0 },
      shadowOpacity: isDarkMode ? 0.3 : 0.06,
      shadowRadius: 10,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    topSection: {
      alignItems: 'center',
      marginBottom: 12,
      paddingTop: 4,
    },
    profileAvatarWrapper: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + '18',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: colors.primary + '40',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.08,
      shadowRadius: 4,
    },
    profileAvatar: {
      width: '100%',
      height: '100%',
    },
    navSection: {
      flex: 1,
      gap: 8,
      marginVertical: 12,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: 14,
      position: 'relative',
    },
    navItemActive: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 4,
    },
    navItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    navIconWrapper: {
      width: 30,
      height: 30,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    navIconWrapperActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
    },
    navLabel: {
      fontFamily: theme.fonts.medium,
      fontSize: rf(13),
    },
    navLabelActive: {
      fontFamily: theme.fonts.bold,
      color: '#FFFFFF',
    },
    activeIndicatorDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#ffffff',
    },
    footerSection: {
      paddingTop: 8,
      alignItems: 'center',
    },
    footerDivider: {
      width: '100%',
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 10,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      gap: 12,
      marginBottom: 6,
    },
    footerBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
