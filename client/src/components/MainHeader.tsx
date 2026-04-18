import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Modal, Image, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { navigationRef } from '../navigation/navigationUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, User, Settings, LogOut, Info, ChevronRight, Moon, Sun } from 'lucide-react-native';

export interface MainHeaderProps {
  activeRoute?: string;
}

export default function MainHeader({ activeRoute: propActiveRoute }: MainHeaderProps) {
  const { username, userImage, showConfirm, clearData, colors, isDarkMode, toggleTheme } = useAppContext();
  const navigation = useNavigation<any>();

  const styles = getStyles(colors, isDarkMode);
  const [internalActiveRoute, setInternalActiveRoute] = useState('Home');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownVisible, setDropdownVisible] = useState(false);

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

  // Use the user's specific request: hide on Calculator
  if (activeRoute === 'Calculator') return null;

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
            <Text style={styles.appMessage}>Welcome to Leafy the Personal Finance Tracker</Text>
          </View>

          <View style={styles.rightActions}>
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
  }
});
