import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Shield, CircleHelp, Trash2, ChevronRight } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';

export default function SettingsScreen() {
  const { username, clearData, showConfirm } = useAppContext();

  const settingsOptions = [
    { id: '1', title: 'Account Settings', icon: User },
    { id: '2', title: 'Notifications', icon: Bell },
    { id: '3', title: 'Privacy & Security', icon: Shield },
    { id: '4', title: 'Help & Support', icon: CircleHelp },
  ];

  const handleClearData = () => {
    showConfirm(
      "Clear All Data",
      "Are you sure you want to clear all your local data? This will reset your name, wallets, transactions, and goals. This action cannot be undone.",
      async () => {
        await clearData();
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.profileSection}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{username ? username.charAt(0).toUpperCase() : 'A'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{username || 'User'}</Text>
            <Text style={styles.profileEmail}>Local Storage Active</Text>
          </View>
        </View>

        <View style={styles.settingsGroup}>
          {settingsOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <React.Fragment key={option.id}>
                <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingItemLeft}>
                    <Icon size={20} color={theme.colors.textMuted} />
                    <Text style={styles.settingTitle}>{option.title}</Text>
                  </View>
                  <ChevronRight size={20} color={theme.colors.border} />
                </TouchableOpacity>
                {index < settingsOptions.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            );
          })}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleClearData}>
          <Trash2 size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Clear App Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: 90, // Safe padding for floating tab bar
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.card,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.text,
  },
  profileEmail: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  settingsGroup: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 52,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: '#fef2f2',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 8,
  },
});
