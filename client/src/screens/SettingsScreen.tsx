import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Animated, Easing, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Shield, CircleHelp, Trash2, ChevronRight, Camera, Database, Leaf, Lock, Check, Fingerprint } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import ActionSheet from '../components/ActionSheet';

export default function SettingsScreen() {
  const { username, userImage, setUserImage, clearData, showConfirm, isDarkMode, toggleTheme, colors, appPin, setAppPin, isSecurityEnabled, toggleSecurity, isBiometricsEnabled, toggleBiometrics } = useAppContext();
  const navigation = useNavigation<any>();

  const styles = getStyles(colors, isDarkMode);



  const [privacyModalVisible, setPrivacyModalVisible] = React.useState(false);
  const [helpModalVisible, setHelpModalVisible] = React.useState(false);
  const [aboutModalVisible, setAboutModalVisible] = React.useState(false);
  const [securityModalVisible, setSecurityModalVisible] = React.useState(false);
  const [accountModalVisible, setAccountModalVisible] = React.useState(false);
  const [pinSetupVisible, setPinSetupVisible] = React.useState(false);
  const [editName, setEditName] = React.useState(username || '');
  const [newPin, setNewPin] = React.useState('');
  const [biometricsSupported, setBiometricsSupported] = React.useState(false);

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

  const settingsOptions = [
    { id: '1', title: 'Account Settings', icon: User, action: () => { setEditName(username || ''); setAccountModalVisible(true); } },
    { id: '2', title: 'Backup & Restore', icon: Database, action: () => navigation.navigate('DataTransfer') },
    { id: '3', title: 'Privacy & Security', icon: Shield, action: () => { setPrivacyModalVisible(true); } },
    { id: '7', title: 'Security & PIN', icon: Lock, action: () => { setSecurityModalVisible(true); } },
    { id: '4', title: 'Help & Support', icon: CircleHelp, action: () => { setHelpModalVisible(true); } },
    { id: '6', title: 'About Leafy', icon: Leaf, action: () => { setAboutModalVisible(true); } },
  ];

  return (
    <SafeAreaView style={styles.container}>
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

        <View style={styles.settingsGroup}>
          {settingsOptions.map((option, index) => {
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
                    <ChevronRight size={20} color={colors.border} />
                  </TouchableOpacity>
                </View>
                {index < settingsOptions.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

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
        title="Account Settings"
      >
        <View style={styles.modalContent}>
          <Text style={styles.infoTitle}>Update Name</Text>
          <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginBottom: 20 }}>
            <TextInput
              style={{ padding: 16, fontFamily: theme.fonts.medium, fontSize: 16, color: colors.text }}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your Name"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={async () => {
              if (editName.trim().length > 0) {
                // @ts-ignore
                await useAppContext().setUsername(editName.trim());
                setAccountModalVisible(false);
              }
            }}
          >
            <Text style={styles.closeBtnText}>Save Changes</Text>
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
    paddingBottom: 90,
  },
  scrollContent: {
    padding: theme.spacing.lg,
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
    marginBottom: theme.spacing.xl,
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
    padding: theme.spacing.md,
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
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
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
});
