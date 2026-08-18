import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Animated, Easing, TextInput, Vibration, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Shield, CircleHelp, Trash2, ChevronRight, Camera, Database, Leaf, Lock, Check, Fingerprint, ChevronLeft, Plus, Palette, Moon, Sun, Smartphone, Sparkles, RefreshCw, ExternalLink, Eye, EyeOff, Layers, Type, Sliders, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';
import { requestPinTotalBalanceWidget, syncWidgetBalance, getWidgetConfig, saveWidgetConfig, WIDGET_THEMES, WidgetConfig, DEFAULT_WIDGET_CONFIG } from '../services/WidgetService';
import { requestNotificationPermissions, sendTestNotification, checkNotificationPermissionStatus } from '../services/NotificationService';

import { useNavigation } from '@react-navigation/native';
import ActionSheet from '../components/ActionSheet';

export default function SettingsScreen() {
  const { username, setUsername, userImage, setUserImage, clearData, showConfirm, showFeedback, isDarkMode, toggleTheme, treeType, setTreeType, colors, appPin, setAppPin, isSecurityEnabled, toggleSecurity, isBiometricsEnabled, toggleBiometrics, isNotificationsEnabled, toggleNotifications, totalBalance, wallets } = useAppContext();
  const navigation = useNavigation<any>();

  const styles = getStyles(colors, isDarkMode);

  const [privacyModalVisible, setPrivacyModalVisible] = React.useState(false);
  const [helpModalVisible, setHelpModalVisible] = React.useState(false);
  const [aboutModalVisible, setAboutModalVisible] = React.useState(false);
  const [securityModalVisible, setSecurityModalVisible] = React.useState(false);
  const [accountModalVisible, setAccountModalVisible] = React.useState(false);
  const [notifModalVisible, setNotifModalVisible] = React.useState(false);
  const [hasNotifPermission, setHasNotifPermission] = React.useState(true);
  const [widgetModalVisible, setWidgetModalVisible] = React.useState(false);
  const [widgetConfig, setWidgetConfig] = React.useState<WidgetConfig>(DEFAULT_WIDGET_CONFIG);
  const [isApplyingWidget, setIsApplyingWidget] = React.useState(false);
  const [pinSetupVisible, setPinSetupVisible] = React.useState(false);
  const [editName, setEditName] = React.useState(username || '');
  const [newPin, setNewPin] = React.useState('');
  const [firstPin, setFirstPin] = React.useState('');
  const [pinStep, setPinStep] = React.useState<'create' | 'confirm'>('create');
  const [pinError, setPinError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (widgetModalVisible) {
      getWidgetConfig().then(setWidgetConfig);
    }
  }, [widgetModalVisible]);

  React.useEffect(() => {
    if (notifModalVisible) {
      checkNotificationPermissionStatus().then(setHasNotifPermission);
    }
  }, [notifModalVisible]);

  const resetPinState = () => {
    setNewPin('');
    setFirstPin('');
    setPinStep('create');
    setPinError(null);
  };
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
        { id: '9', title: 'Phone Widgets & Shortcuts', icon: Smartphone, action: () => { setWidgetModalVisible(true); } },
      ]
    },
    {
      title: 'Support',
      options: [
        { id: '4', title: 'Help & Support', icon: CircleHelp, action: () => { setHelpModalVisible(true); } },
        { id: '6', title: 'About Leapon', icon: Leaf, action: () => { setAboutModalVisible(true); } },
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
              Leapon stores all your financial data locally on your device. We do not transmit or store your personal information on any external servers.
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
            <Text style={styles.infoTitle}>How to use Leapon?</Text>
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
        onClose={() => { setPinSetupVisible(false); resetPinState(); }}
        title={pinStep === 'create' ? "Set Application PIN" : "Confirm Application PIN"}
      >
        <View style={styles.modalContent}>
          <Text style={[styles.pinDesc, pinError ? { color: '#ef4444', fontFamily: theme.fonts.bold } : null]}>
            {pinError || (pinStep === 'create'
              ? 'Enter a 6-digit PIN to secure your application. You will be asked for this PIN every time you open Leapon.'
              : 'Re-enter your 6-digit PIN to verify and complete setup.')}
          </Text>

          <View style={styles.pinVisual}>
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <View key={i} style={[styles.pinCircle, newPin.length > i && styles.pinCircleFilled, pinError ? { backgroundColor: '#ef4444' } : null]} />
            ))}
          </View>

          <View style={styles.pinKeypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'].map((k, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.pinKey, k === '' && styles.pinKeyEmpty]}
                disabled={k === ''}
                onPress={() => {
                  setPinError(null);
                  if (k === 'DEL') {
                    setNewPin(prev => prev.slice(0, -1));
                  } else if (newPin.length < 6) {
                    const p = newPin + k;
                    setNewPin(p);
                    if (p.length === 6) {
                      if (pinStep === 'create') {
                        setTimeout(() => {
                          setFirstPin(p);
                          setNewPin('');
                          setPinStep('confirm');
                        }, 200);
                      } else {
                        if (p === firstPin) {
                          setTimeout(async () => {
                            await setAppPin(p);
                            if (!isSecurityEnabled) await toggleSecurity(true);
                            setPinSetupVisible(false);
                            resetPinState();
                            showFeedback('success', 'PIN Security Enabled');
                          }, 300);
                        } else {
                          Vibration.vibrate([0, 50, 50, 50]);
                          setPinError("PINs do not match. Please try again.");
                          setTimeout(() => {
                            setNewPin('');
                            setFirstPin('');
                            setPinStep('create');
                          }, 600);
                        }
                      }
                    }
                  }
                }}
              >
                <Text style={styles.pinKeyText}>{k === 'DEL' ? '←' : k}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }]} onPress={() => { setPinSetupVisible(false); resetPinState(); }}>
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
        title="Notifications & Permissions"
      >
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.securityHeader}>
            <View style={[styles.securityIconBox, isNotificationsEnabled && styles.securityIconBoxActive]}>
              <Bell size={24} color={isNotificationsEnabled ? colors.primary : colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityHeaderTitle}>
                {isNotificationsEnabled ? 'Notifications Active' : 'Notifications Paused'}
              </Text>
              <Text style={styles.securityHeaderSubtitle}>
                Get real-time pop up alerts for Paydays, Subscriptions, Goals, Installments, and Rent.
              </Text>
            </View>
          </View>

          {/* Master Toggle */}
          <View style={styles.configGroup}>
            <TouchableOpacity
              style={styles.configItem}
              onPress={async () => {
                const nextState = !isNotificationsEnabled;
                if (nextState) {
                  const granted = await requestNotificationPermissions();
                  setHasNotifPermission(granted);
                }
                await toggleNotifications(nextState);
                showFeedback('success', nextState ? 'Notifications Enabled' : 'Notifications Disabled');
              }}
            >
              <View style={styles.configItemLeft}>
                <View style={[styles.checkbox, isNotificationsEnabled && styles.checkboxActive]}>
                  {isNotificationsEnabled && <Check size={14} color="#ffffff" />}
                </View>
                <View>
                  <Text style={styles.configText}>Enable App Notifications</Text>
                  <Text style={styles.configSubText}>Receive popup alerts on your phone screen</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Phone Overlays & System Permissions */}
          <Text style={styles.configLabel}>Phone Permissions & Overlays</Text>
          <View style={styles.configGroup}>
            <TouchableOpacity
              style={styles.configItem}
              onPress={() => Linking.openSettings()}
            >
              <View style={styles.configItemLeft}>
                <Smartphone size={20} color={colors.primary} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.configText}>App Permissions & Overlays</Text>
                  <Text style={styles.configSubText}>Allow popup banners & show over other apps</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.border} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.configItem}
              onPress={async () => {
                Vibration.vibrate(25);
                const sent = await sendTestNotification();
                if (sent) {
                  showFeedback('success', 'Test Notification Sent!');
                  Alert.alert(
                    "Test Notification Sent",
                    "A test popup notification has been dispatched to your phone!"
                  );
                } else {
                  Alert.alert(
                    "Notification Permission Needed",
                    "Please allow notifications in your device settings to receive popups."
                  );
                }
              }}
            >
              <View style={styles.configItemLeft}>
                <Sparkles size={20} color="#10b981" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.configText}>Send Test Notification</Text>
                  <Text style={styles.configSubText}>Verify popup alert appears immediately</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.border} />
            </TouchableOpacity>
          </View>

          {/* Supported Notification Triggers Breakdown */}
          <Text style={styles.configLabel}>What You'll Be Notified About</Text>
          <View style={styles.configGroup}>
            <View style={styles.notifFeatureItem}>
              <Text style={styles.notifFeatureIcon}>💰</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifFeatureTitle}>Payday & Salary Alerts</Text>
                <Text style={styles.notifFeatureDesc}>Pop up notification on your recurring payday</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.notifFeatureItem}>
              <Text style={styles.notifFeatureIcon}>📅</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifFeatureTitle}>Subscription Due Dates</Text>
                <Text style={styles.notifFeatureDesc}>Alert on the exact payment day of your subscriptions</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.notifFeatureItem}>
              <Text style={styles.notifFeatureIcon}>💳</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifFeatureTitle}>Installment Payment Days</Text>
                <Text style={styles.notifFeatureDesc}>Payment due alerts for your product installments</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.notifFeatureItem}>
              <Text style={styles.notifFeatureIcon}>🏠</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifFeatureTitle}>Rent Properties Due Dates</Text>
                <Text style={styles.notifFeatureDesc}>Reminders when your monthly rent payment is due</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.notifFeatureItem}>
              <Text style={styles.notifFeatureIcon}>🎯</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifFeatureTitle}>Goal Milestones & Completion</Text>
                <Text style={styles.notifFeatureDesc}>Celebrations when you reach savings targets</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.notifFeatureItem}>
              <Text style={styles.notifFeatureIcon}>💸</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifFeatureTitle}>Debts & Grocery Schedules</Text>
                <Text style={styles.notifFeatureDesc}>Reminders for debt due dates and grocery shopping</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={() => setNotifModalVisible(false)}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </ActionSheet>

      {/* Widgets & Shortcuts Modal */}
      <ActionSheet
        visible={widgetModalVisible}
        onClose={() => setWidgetModalVisible(false)}
        title="Customize Widget"
      >
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Home Screen Phone Widget</Text>
            <Text style={styles.infoDescription}>
              Customize the appearance, information, and quick action shortcuts of the widget displayed on your phone's home screen.
            </Text>
          </View>

          {/* Big Live Interactive Widget Preview */}
          {(() => {
            const activeTheme = WIDGET_THEMES.find(t => t.id === widgetConfig.themeId) || WIDGET_THEMES[0];
            const curr = widgetConfig.currencySymbol || '₱';
            const displayBal = widgetConfig.hideBalance
              ? `${curr} ••••••`
              : `${curr} ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            const cleanTitle = (widgetConfig.customTitle || 'LEAPON').replace(/^[^\w\s]+/, '').trim() || 'LEAPON';

            return (
              <View style={styles.widgetPreviewContainer}>
                <View style={styles.widgetPreviewBadge}>
                  <Sparkles size={12} color="#10b981" />
                  <Text style={styles.widgetPreviewBadgeText}>LIVE PREVIEW • TOTAL BALANCE</Text>
                </View>

                <LinearGradient
                  colors={[activeTheme.gradientFrom, activeTheme.gradientTo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.widgetCard, { borderColor: activeTheme.borderColor }]}
                >
                  {/* Header */}
                  <View style={styles.widgetHeader}>
                    <View style={styles.widgetBrandRow}>
                      <Text style={[styles.widgetBrand, { color: activeTheme.accentColor }]}>
                        {cleanTitle}
                      </Text>
                      <Text style={[styles.widgetSubBrand, { color: activeTheme.subTextColor }]}>
                        {' '}• TOTAL BALANCE
                      </Text>
                    </View>
                    <View style={[styles.widgetLivePill, { backgroundColor: activeTheme.pillBgColor, borderColor: activeTheme.borderColor }]}>
                      <View style={[styles.widgetLiveDot, { backgroundColor: activeTheme.accentColor }]} />
                      <Text style={[styles.widgetLiveText, { color: activeTheme.accentColor }]}>Synced</Text>
                    </View>
                  </View>

                  {/* Big Balance */}
                  <View style={styles.widgetBalanceSection}>
                    <Text style={styles.widgetBalanceAmount} numberOfLines={1} adjustsFontSizeToFit>
                      {displayBal}
                    </Text>
                    {widgetConfig.showWalletCount && (
                      <Text style={styles.widgetWalletCount}>
                        {wallets.length} Active Wallet{wallets.length !== 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>

                  {/* Bottom Accent Line */}
                  <View
                    style={{
                      width: '100%',
                      height: 3,
                      backgroundColor: activeTheme.accentColor,
                      borderRadius: 2,
                      opacity: 0.3,
                      marginTop: 10,
                    }}
                  />
                </LinearGradient>
              </View>
            );
          })()}

          {/* Primary Apply Button */}
          <TouchableOpacity
            style={[styles.applyWidgetBtn, isApplyingWidget && { opacity: 0.7 }]}
            activeOpacity={0.8}
            disabled={isApplyingWidget}
            onPress={async () => {
              setIsApplyingWidget(true);
              Vibration.vibrate(40);
              const success = await saveWidgetConfig(widgetConfig);
              await syncWidgetBalance(totalBalance, wallets.length, widgetConfig);
              setIsApplyingWidget(false);
              if (success) {
                showFeedback('success', 'Widget Settings Applied & Synced!');
                Alert.alert(
                  "Widget Updated Successfully",
                  "Your phone's home screen widget has been updated with your new customizations and latest balance."
                );
              } else {
                showFeedback('error', 'Failed to update widget');
              }
            }}
          >
            <CheckCircle2 size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.applyWidgetBtnText}>
              {isApplyingWidget ? 'Applying to Widget...' : 'Apply Changes to Widget'}
            </Text>
          </TouchableOpacity>

          {/* Section 1: Themes & Color Palette */}
          <Text style={styles.configLabel}>Widget Theme & Style</Text>
          <View style={styles.themeGrid}>
            {WIDGET_THEMES.map((themeOption) => {
              const isSelected = widgetConfig.themeId === themeOption.id;
              return (
                <TouchableOpacity
                  key={themeOption.id}
                  style={[styles.themeOption, isSelected && styles.themeOptionActive]}
                  onPress={() => {
                    setWidgetConfig(prev => ({ ...prev, themeId: themeOption.id }));
                    Vibration.vibrate(15);
                  }}
                >
                  <View
                    style={[
                      styles.themeColor,
                      {
                        backgroundColor: themeOption.previewColor || themeOption.gradientFrom,
                        borderColor: themeOption.borderColor,
                        borderWidth: 1.5,
                      },
                    ]}
                  />
                  <Text style={[styles.themeName, isSelected && styles.themeNameActive]}>
                    {themeOption.name}
                  </Text>
                  {isSelected && (
                    <View style={styles.themeCheck}>
                      <Check size={10} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Section 2: Display Elements & Toggles */}
          <Text style={styles.configLabel}>Display Information</Text>
          <View style={styles.configGroup}>
            <TouchableOpacity
              style={styles.configItem}
              onPress={() => {
                setWidgetConfig(prev => ({ ...prev, showWalletCount: !prev.showWalletCount }));
                Vibration.vibrate(15);
              }}
            >
              <View style={styles.configItemLeft}>
                <View style={[styles.checkbox, widgetConfig.showWalletCount && styles.checkboxActive]}>
                  {widgetConfig.showWalletCount && <Check size={14} color="#ffffff" />}
                </View>
                <View>
                  <Text style={styles.configText}>Show Active Wallets Count</Text>
                  <Text style={styles.configSubText}>Displays total number of connected wallets</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.configItem}
              onPress={() => {
                setWidgetConfig(prev => ({ ...prev, hideBalance: !prev.hideBalance }));
                Vibration.vibrate(15);
              }}
            >
              <View style={styles.configItemLeft}>
                <View style={[styles.checkbox, widgetConfig.hideBalance && styles.checkboxActive]}>
                  {widgetConfig.hideBalance && <Check size={14} color="#ffffff" />}
                </View>
                <View>
                  <Text style={styles.configText}>Privacy Mode (Mask Balance)</Text>
                  <Text style={styles.configSubText}>Replaces balance numbers with dots (••••••)</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Section 3: Currency Symbol */}
          <Text style={styles.configLabel}>Currency Symbol</Text>
          <View style={styles.currencyChipsContainer}>
            {['₱', '$', '€', '£', '¥'].map((curr) => {
              const isSelected = (widgetConfig.currencySymbol || '₱') === curr;
              return (
                <TouchableOpacity
                  key={curr}
                  style={[styles.currencyChip, isSelected && styles.currencyChipActive]}
                  onPress={() => {
                    setWidgetConfig(prev => ({ ...prev, currencySymbol: curr }));
                    Vibration.vibrate(15);
                  }}
                >
                  <Text style={[styles.currencyChipText, isSelected && styles.currencyChipTextActive]}>
                    {curr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Section 4: Widget Title / Label */}
          <Text style={styles.configLabel}>Widget Brand Title</Text>
          <View style={styles.titlePresetRow}>
            {['LEAPON', 'MY FINANCES', 'WEALTH TRACKER', 'MY VAULT'].map((titlePreset) => {
              const cleanCurrent = (widgetConfig.customTitle || 'LEAPON').replace(/^[^\w\s]+/, '').trim();
              const isSelected = cleanCurrent === titlePreset;
              return (
                <TouchableOpacity
                  key={titlePreset}
                  style={[styles.titlePresetBtn, isSelected && styles.titlePresetBtnActive]}
                  onPress={() => {
                    setWidgetConfig(prev => ({ ...prev, customTitle: titlePreset }));
                    Vibration.vibrate(15);
                  }}
                >
                  <Text style={[styles.titlePresetText, isSelected && styles.titlePresetTextActive]}>
                    {titlePreset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Placement & Sync Buttons */}
          <View style={styles.widgetButtonsContainer}>
            <TouchableOpacity
              style={styles.addWidgetBtn}
              activeOpacity={0.8}
              onPress={async () => {
                const success = await requestPinTotalBalanceWidget();
                if (success) {
                  Alert.alert(
                    "Widget Pin Requested",
                    "Please check your phone's home screen or approve the launcher prompt to place the widget."
                  );
                } else {
                  Alert.alert(
                    "Add Widget Manually",
                    "To place this widget on your home screen:\n\n1. Long-press any empty area on your phone's home screen.\n2. Tap 'Widgets' and choose 'Leapon'.\n3. Select 'Total Balance (Horizontal)' and place it on your screen."
                  );
                }
              }}
            >
              <Smartphone size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.addWidgetBtnText}>Add Widget to Phone Screen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.syncWidgetBtn, { borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={async () => {
                await syncWidgetBalance(totalBalance, wallets.length, widgetConfig);
                showFeedback('success', 'Home Widget Synchronized');
                Alert.alert(
                  "Widget Synchronized",
                  `Updated home screen total balance to ${widgetConfig.currencySymbol || '₱'} ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} across ${wallets.length} wallets.`
                );
              }}
            >
              <RefreshCw size={16} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={[styles.syncWidgetBtnText, { color: colors.text }]}>Sync Widget Data Now</Text>
            </TouchableOpacity>
          </View>

          {/* Step-by-Step Instructions */}
          <View style={styles.configGroup}>
            <View style={styles.infoSection}>
              <Text style={[styles.infoTitle, { fontSize: 15 }]}>How to place & resize widget:</Text>
              <Text style={styles.infoDescription}>
                1. Go to your phone's Home Screen.{"\n"}
                2. Touch and hold any empty area.{"\n"}
                3. Tap <Text style={{ fontWeight: 'bold' }}>Widgets</Text> and scroll or search for <Text style={{ fontWeight: 'bold' }}>Leapon</Text>.{"\n"}
                4. Select <Text style={{ fontWeight: 'bold' }}>Total Balance (Horizontal)</Text> and drag it to your screen.{"\n"}
                5. Long-press the widget on your screen and drag its side handles to expand it horizontally as big as you like!
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setWidgetModalVisible(false)}
          >
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </ActionSheet>

      {/* About Leapon Modal */}
      <ActionSheet
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
        title="About Leapon"
      >
        <View style={styles.modalContent}>
          <View style={styles.aboutHeader}>
            <Leaf size={32} color={colors.primary} />
            <Text style={styles.aboutTitle}>Leapon v1.1.0</Text>
          </View>
          <Text style={styles.aboutDescription}>
            Leapon is your premium financial companion designed to help you track wallets, set savings goals, manage grocery lists, and plan your travels with ease. Grow your wealth one leaf at a time.
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
  widgetPreviewContainer: {
    marginVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  widgetPreviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#10b98140',
    gap: 6,
  },
  widgetPreviewBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    color: '#10b981',
    letterSpacing: 0.5,
  },
  widgetCard: {
    width: '100%',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#059669',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  widgetBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widgetBrand: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: '#34d399',
    letterSpacing: 1,
  },
  widgetSubBrand: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 11,
    color: '#a7f3d0',
    letterSpacing: 0.5,
  },
  widgetLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065f46',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderColor: '#10b981',
    borderWidth: 1,
    gap: 4,
  },
  widgetLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  widgetLiveText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    color: '#6ee7b7',
  },
  widgetBalanceSection: {
    marginVertical: 4,
  },
  widgetBalanceAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  widgetWalletCount: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  widgetActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  widgetActionPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetActionPillText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: '#ffffff',
  },
  applyWidgetBtn: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 18,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyWidgetBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: '#ffffff',
  },
  configSubText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  currencyChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  currencyChip: {
    flex: 1,
    minWidth: 48,
    paddingVertical: 10,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '18',
  },
  currencyChipText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  currencyChipTextActive: {
    color: colors.primary,
  },
  titlePresetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  titlePresetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titlePresetBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '18',
  },
  titlePresetText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.text,
  },
  titlePresetTextActive: {
    fontFamily: theme.fonts.bold,
    color: colors.primary,
  },
  widgetButtonsContainer: {
    marginVertical: 12,
    gap: 10,
    width: '100%',
  },
  addWidgetBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addWidgetBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: '#ffffff',
  },
  syncWidgetBtn: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  notifFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  notifFeatureIcon: {
    fontSize: 22,
  },
  notifFeatureTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },
  notifFeatureDesc: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  syncWidgetBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
  },
});

