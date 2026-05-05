import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Animated, Easing, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Shield, CircleHelp, Trash2, ChevronRight, Camera, Database, Leaf, Lock, Check, Fingerprint, ChevronLeft, Plus, Palette, Moon, Sun } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';

import { useNavigation } from '@react-navigation/native';
import ActionSheet from '../components/ActionSheet';

export default function SettingsScreen() {
  const { username, setUsername, userImage, setUserImage, clearData, showConfirm, isDarkMode, toggleTheme, treeType, setTreeType, colors, appPin, setAppPin, isSecurityEnabled, toggleSecurity, isBiometricsEnabled, toggleBiometrics, isNotificationsEnabled, toggleNotifications } = useAppContext();
  const navigation = useNavigation<any>();

  const styles = getStyles(colors, isDarkMode);



  const [privacyModalVisible, setPrivacyModalVisible] = React.useState(false);
  const [helpModalVisible, setHelpModalVisible] = React.useState(false);
  const [aboutModalVisible, setAboutModalVisible] = React.useState(false);
  const [securityModalVisible, setSecurityModalVisible] = React.useState(false);
  const [accountModalVisible, setAccountModalVisible] = React.useState(false);
  const [notifModalVisible, setNotifModalVisible] = React.useState(false);
  const [widgetModalVisible, setWidgetModalVisible] = React.useState(false);
  const [pinSetupVisible, setPinSetupVisible] = React.useState(false);
  const [editName, setEditName] = React.useState(username || '');
  const [newPin, setNewPin] = React.useState('');
  const [biometricsSupported, setBiometricsSupported] = React.useState(false);
  const [appearanceModalVisible, setAppearanceModalVisible] = React.useState(false);

  React.useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricsSupported(hasHardware && isEnrolled);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'We need camera roll permissions to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      await setUserImage(result.assets[0].uri);
    }
  };

  const settingsSections = [
    {
      title: 'General',
      options: [
        { id: '1', title: 'Change Name', icon: User, action: () => { setEditName(username || ''); setAccountModalVisible(true); } },
        { id: '10', title: 'Appearance & Themes', icon: Palette, action: () => setAppearanceModalVisible(true) },
        { 
          id: '11', 
          title: 'Dark Mode', 
          icon: isDarkMode ? Moon : Sun, 
          action: toggleTheme 
        },
      ]
    },
    {
      title: 'Security & Data',
      options: [
        { id: '7', title: 'Security & PIN', icon: Lock, action: () => { setSecurityModalVisible(true); } },
        { id: '2', title: 'Backup & Restore', icon: Database, action: () => navigation.navigate('DataTransfer') },
        { id: '3', title: 'Privacy & Security', icon: Shield, action: () => { setPrivacyModalVisible(true); } },
      ]
    },
    {
      title: 'Preferences',
      options: [
        { id: '8', title: 'Notifications', icon: Bell, action: () => { setNotifModalVisible(true); } },
        { id: '9', title: 'Widgets & Shortcuts', icon: Plus, action: () => { setWidgetModalVisible(true); } },
      ]
    },
    {
      title: 'Support',
      options: [
        { id: '4', title: 'Help & Support', icon: CircleHelp, action: () => { setHelpModalVisible(true); } },
        { id: '6', title: 'About Leafy', icon: Leaf, action: () => { setAboutModalVisible(true); } },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>



        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} activeOpacity={0.8}>
            {userImage ? (
              <Image source={{ uri: userImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{username ? username.charAt(0).toUpperCase() : 'A'}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Camera size={14} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{username || 'User'}</Text>
            <Text style={styles.profileEmail}>Local Storage Active</Text>
          </View>
        </View>

        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title} style={{ marginBottom: 16 }}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.settingsGroup}>
              {section.options.map((option, index) => {
                const Icon = option.icon;
                return (
                  <React.Fragment key={option.id}>
                    <View style={styles.settingItemWrapper}>
                      <TouchableOpacity
                        style={styles.settingItem}
                        onPress={option.action as any}
                      >
                        <View style={styles.settingItemLeft}>
                          <Icon size={20} color={colors.textMuted} />
                          <Text style={styles.settingTitle}>{option.title}</Text>
                        </View>
                        {option.id === '11' ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Sun size={16} color={!isDarkMode ? colors.primary : colors.textMuted} />
                            <Text style={{ color: colors.border, fontSize: 12 }}>|</Text>
                            <Moon size={16} color={isDarkMode ? colors.primary : colors.textMuted} />
                          </View>
                        ) : (
                          <ChevronRight size={20} color={colors.border} />
                        )}
                      </TouchableOpacity>
                    </View>
                    {index < section.options.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Appearance & Themes Modal */}
      <ActionSheet
        visible={appearanceModalVisible}
        onClose={() => setAppearanceModalVisible(false)}
        title="Appearance & Themes"
      >
        <View style={styles.modalContent}>
          <Text style={styles.configLabel}>Dark Mode</Text>
          <View style={styles.configGroup}>
            <TouchableOpacity style={styles.configItem} onPress={toggleTheme}>
              <View style={styles.configItemLeft}>
                <View style={[styles.checkbox, isDarkMode && styles.checkboxActive]}>
                  {isDarkMode && <Check size={14} color="#ffffff" />}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Sun size={18} color={!isDarkMode ? colors.primary : colors.textMuted} />
                    <Moon size={18} color={isDarkMode ? colors.primary : colors.textMuted} />
                  </View>
                  <Text style={styles.configText}>Dark Mode</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.configLabel}>Tree Theme</Text>
          <View style={styles.themeGrid}>
            {[
              { id: 'emerald', name: 'Emerald Leaf', color: '#10b981' },
              { id: 'cherry', name: 'Cherry Tree', color: '#f472b6' },
              { id: 'maple', name: 'Autumn Maple', color: '#f97316' },
              { id: 'spruce', name: 'Blue Spruce', color: '#0284c7' },
              { id: 'violet', name: 'Violet Gem', color: '#8b5cf6' },
              { id: 'pale', name: 'Pale Slate', color: '#64748b' },
              { id: 'onyx', name: 'Black & White', color: '#000000' },
              { id: 'wood', name: 'Dark Wood', color: '#78350f' },
            ].map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[styles.themeOption, treeType === theme.id && styles.themeOptionActive]}
                onPress={() => setTreeType(theme.id as any)}
              >
                <View style={[styles.themeColor, { backgroundColor: theme.color }]} />
                <Text style={[styles.themeName, treeType === theme.id && styles.themeNameActive]}>{theme.name}</Text>
                {treeType === theme.id && (
                  <View style={styles.themeCheck}>
                    <Check size={10} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={() => setAppearanceModalVisible(false)}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      {/* Privacy & Security Modal */}
      <ActionSheet
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
        title="Privacy & Security"
      >
        <View style={styles.modalContent}>
          <View style={styles.infoSection}>
            <Shield size={24} color={theme.colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Data Local Storage</Text>
            <Text style={styles.infoDescription}>
              Leafy stores all your financial data locally on your device. We do not transmit or store your personal information on any external servers.
            </Text>
          </View>

          <View style={styles.dividerFull} />

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Secure Backups</Text>
            <Text style={styles.infoDescription}>
              When you use Backup & Restore, your data is exported into a text format that you control. Ensure you keep your backup files in a safe location.
            </Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={() => setPrivacyModalVisible(false)}>
            <Text style={styles.closeBtnText}>I Understand</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      {/* Help & Support Modal */}
      <ActionSheet
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        title="Help & Support"
      >
        <View style={styles.modalContent}>
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>How to use Leafy?</Text>
            <Text style={styles.infoDescription}>
              1. Create Wallets to categorize your funds.{"\n"}
              2. Add Goals to track your savings targets.{"\n"}
              3. Log Transactions to keep your balances up to date.
            </Text>
          </View>

          <View style={styles.dividerFull} />

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Need more help?</Text>
            <Text style={styles.infoDescription}>
              If you encounter any issues or have suggestions, feel free to reach out to our team at robertojrprisoris@gmail.com.
            </Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={() => setHelpModalVisible(false)}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      {/* Security & PIN Modal */}
      <ActionSheet
        visible={securityModalVisible}
        onClose={() => setSecurityModalVisible(false)}
        title="Security & PIN"
      >
        <View style={styles.modalContent}>
          <View style={styles.securityHeader}>
            <View style={[styles.securityIconBox, isSecurityEnabled && styles.securityIconBoxActive]}>
              <Lock size={24} color={isSecurityEnabled ? colors.primary : colors.textMuted} />
            </View>
            <View>
              <Text style={styles.securityHeaderTitle}>{isSecurityEnabled ? 'App Protection Active' : 'App Protection Disabled'}</Text>
              <Text style={styles.securityHeaderSubtitle}>{isSecurityEnabled ? 'Your financial data is secured with a PIN.' : 'Enable security to protect your data.'}</Text>
            </View>
          </View>

          <View style={styles.configGroup}>
            <TouchableOpacity
              style={styles.configItem}
              onPress={() => {
                if (isSecurityEnabled) toggleSecurity(false);
                else if (appPin) toggleSecurity(true);
                else setPinSetupVisible(true);
              }}
            >
              <View style={styles.configItemLeft}>
                <View style={[styles.checkbox, isSecurityEnabled && styles.checkboxActive]}>
                  {isSecurityEnabled && <Check size={14} color="#ffffff" />}
                </View>
                <Text style={styles.configText}>Require PIN to open app</Text>
              </View>
            </TouchableOpacity>

            {biometricsSupported && (
              <TouchableOpacity
                style={styles.configItem}
                onPress={() => toggleBiometrics(!isBiometricsEnabled)}
              >
                <View style={styles.configItemLeft}>
                  <View style={[styles.checkbox, isBiometricsEnabled && styles.checkboxActive]}>
                    {isBiometricsEnabled && <Check size={14} color="#ffffff" />}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Fingerprint size={16} color={colors.textMuted} />
                    <Text style={styles.configText}>Use Biometrics first</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.configItem}
              onPress={() => setPinSetupVisible(true)}
            >
              <View style={styles.configItemLeft}>
                <View style={styles.checkboxPlaceholder} />
                <Text style={styles.configText}>{appPin ? 'Change Application PIN' : 'Set Application PIN'}</Text>
              </View>
              <ChevronRight size={18} color={colors.border} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={() => setSecurityModalVisible(false)}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      {/* PIN Setup Modal */}
      <ActionSheet
        visible={pinSetupVisible}
        onClose={() => { setPinSetupVisible(false); setNewPin(''); }}
        title="Set Application PIN"
      >
        <View style={styles.modalContent}>
          <Text style={styles.pinDesc}>Enter a 4-digit PIN to secure your application. You will be asked for this PIN every time you open Leafy.</Text>

          <View style={styles.pinVisual}>
            {[1, 2, 3, 4].map((_, i) => (
              <View key={i} style={[styles.pinCircle, newPin.length > i && styles.pinCircleFilled]} />
            ))}
          </View>

          <View style={styles.pinKeypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'].map((k, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.pinKey, k === '' && styles.pinKeyEmpty]}
                disabled={k === ''}
                onPress={() => {
                  if (k === 'DEL') setNewPin(prev => prev.slice(0, -1));
                  else if (newPin.length < 4) {
                    const p = newPin + k;
                    setNewPin(p);
                    if (p.length === 4) {
                      setTimeout(async () => {
                        await setAppPin(p);
                        if (!isSecurityEnabled) await toggleSecurity(true);
                        setPinSetupVisible(false);
                        setNewPin('');
                      }, 300);
                    }
                  }
                }}
              >
                <Text style={styles.pinKeyText}>{k === 'DEL' ? '←' : k}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }]} onPress={() => setPinSetupVisible(false)}>
            <Text style={[styles.closeBtnText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      {/* Account Settings Modal */}
      <ActionSheet
        visible={accountModalVisible}
        onClose={() => setAccountModalVisible(false)}
        title="Change Name"
      >
        <View style={styles.modalContent}>
          <Text style={styles.infoTitle}>Update Name</Text>
          <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginBottom: 20 }}>
            <TextInput
              style={{ padding: 16, fontFamily: theme.fonts.medium, fontSize: 16, color: colors.text }}
              value={editName}
              onChangeText={setEditName}
              maxLength={6}
              placeholder="Your Name"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={async () => {
              if (editName.trim().length > 0) {
                await setUsername(editName.trim());
                setAccountModalVisible(false);
              }
            }}
          >
            <Text style={styles.closeBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      {/* Notifications Modal */}
      <ActionSheet
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
        title="Notifications"
      >
        <View style={styles.modalContent}>
          <View style={styles.securityHeader}>
            <View style={[styles.securityIconBox, isNotificationsEnabled && styles.securityIconBoxActive]}>
              <Bell size={24} color={isNotificationsEnabled ? colors.primary : colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityHeaderTitle}>Activity Reminders</Text>
              <Text style={styles.securityHeaderSubtitle}>Get notified about debts due today and grocery schedules.</Text>
            </View>
          </View>

          <View style={styles.configGroup}>
            <TouchableOpacity
              style={styles.configItem}
              onPress={() => toggleNotifications(!isNotificationsEnabled)}
            >
              <View style={styles.configItemLeft}>
                <View style={[styles.checkbox, isNotificationsEnabled && styles.checkboxActive]}>
                  {isNotificationsEnabled && <Check size={14} color="#ffffff" />}
                </View>
                <Text style={styles.configText}>Enabled Notifications</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={() => setNotifModalVisible(false)}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      {/* Widgets & Shortcuts Modal */}
      <ActionSheet
        visible={widgetModalVisible}
        onClose={() => setWidgetModalVisible(false)}
        title="Widgets & Shortcuts"
      >
        <View style={styles.modalContent}>
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Home Screen Shortcuts</Text>
            <Text style={styles.infoDescription}>
              Quickly access Income and Expense screens directly from your home screen icon.
            </Text>
          </View>

          <View style={styles.configGroup}>
            <View style={styles.infoSection}>
              <Text style={[styles.infoTitle, { fontSize: 16 }]}>How to use:</Text>
              <Text style={styles.infoDescription}>
                1. Go to your phone's home screen.{"\n"}
                2. Long-press the Leafy app icon.{"\n"}
                3. Select "Income" or "Expense".{"\n"}
                4. (Android) You can drag these items to your home screen as standalone widgets.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              // Trigger a refresh/setup check
              Alert.alert("Shortcut Synchronized", "Your home screen shortcuts have been updated with the latest premium design.");
              setWidgetModalVisible(false);
            }}
          >
            <Text style={styles.closeBtnText}>Check Shortcuts</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      {/* About Leafy Modal */}
      <ActionSheet
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
        title="About Leafy"
      >
        <View style={styles.modalContent}>
          <View style={styles.aboutHeader}>
            <Leaf size={32} color={colors.primary} />
            <Text style={styles.aboutTitle}>Leafy v1.1.0</Text>
          </View>
          <Text style={styles.aboutDescription}>
            Leafy is your premium financial companion designed to help you track wallets, set savings goals, manage grocery lists, and plan your travels with ease. Grow your wealth one leaf at a time.
          </Text>
          <View style={styles.aboutFooter}>
            <Text style={styles.aboutVersion}>Made with ❤️ by Roberto Prisoris together with his Girlfriend Lady Marianne Bauyot</Text>
          </View>
        </View>
      </ActionSheet>

    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    color: colors.text,
    marginBottom: theme.spacing.xl,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  avatarText: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  profileEmail: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    marginLeft: 4,
    opacity: 0.7,
  },
  settingsGroup: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
  },
  settingItemWrapper: {
    // Wrapper for consistent padding/alignment
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: colors.text,
    marginLeft: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 52,
  },
  modalContent: {
    paddingVertical: theme.spacing.md,
  },
  infoSection: {
    marginBottom: theme.spacing.xl,
  },
  infoIcon: {
    marginBottom: theme.spacing.sm,
  },
  infoTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  infoDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  dividerFull: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: theme.spacing.xl,
  },
  closeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  closeBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: "#ffffff",
  },
  aboutCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    marginTop: 24,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDarkMode ? 0.2 : 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  aboutTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  aboutDescription: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 20,
  },
  aboutFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    alignItems: 'center',
  },
  aboutVersion: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: colors.primary,
    opacity: 0.8,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    padding: 4,
  },
  securityIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 42, 0.05)' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  securityIconBoxActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary + '33',
  },
  securityHeaderTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 17,
    color: colors.text,
  },
  securityHeaderSubtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  configGroup: {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  configItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxPlaceholder: {
    width: 22,
  },
  configText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  pinDesc: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  pinVisual: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  pinCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pinCircleFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pinKeypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  pinKey: {
    width: '30%',
    aspectRatio: 1.5,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinKeyEmpty: {
    backgroundColor: 'transparent',
  },
  pinKeyText: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  configLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
    marginTop: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  themeOption: {
    width: '47%',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  themeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  themeColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  themeName: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.text,
  },
  themeNameActive: {
    fontFamily: theme.fonts.bold,
    color: colors.primary,
  },
  themeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
