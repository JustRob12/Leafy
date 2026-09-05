import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Dimensions,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import {
  ChevronLeft,
  CreditCard,
  Calendar,
  Search,
  X,
  Globe,
  Sparkles,
} from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  POPULAR_SUBSCRIPTIONS,
  searchAppStoreApi,
  resolveSubscriptionLogo,
  AppStoreSearchResult,
} from '../services/SubscriptionCatalogService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const rf = (size: number) => Math.round(size * scale);

const SUBS_ICONS: { [key: string]: any } = {
  'capcut.png': require('../../public/subs/capcut.png'),
  'chatgpt.png': require('../../public/subs/chatgpt.png'),
  'disney.png': require('../../public/subs/disney.png'),
  'gemini.png': require('../../public/subs/gemini.png'),
  'netflix.png': require('../../public/subs/netflix.png'),
  'prime.png': require('../../public/subs/prime.png'),
  'spotify.png': require('../../public/subs/spotify.png'),
};

export default function AddSubscriptionScreen() {
  const { addSubscription, editSubscription, colors, isDarkMode } = useAppContext();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = getStyles(colors, isDarkMode);

  const editingSubscription = route.params?.subscription;
  const isEditing = !!editingSubscription;

  const [title, setTitle] = useState(editingSubscription?.title || '');
  const [amount, setAmount] = useState(editingSubscription?.amount?.toString() || '');
  const [dayOfMonth, setDayOfMonth] = useState(editingSubscription?.dayOfMonth?.toString() || '1');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(editingSubscription?.icon || null);

  // App Search & API State
  const [searchQuery, setSearchQuery] = useState('');
  const [apiResults, setApiResults] = useState<AppStoreSearchResult[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatAmount = (text: string) => {
    const raw = text.replace(/,/g, '').replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Live Debounced Search against iTunes API when searching apps
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setApiResults([]);
      setIsSearchingApi(false);
      return;
    }

    setIsSearchingApi(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchAppStoreApi(searchQuery);
      setApiResults(results);
      setIsSearchingApi(false);
    }, 350);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Combined Search Results (Presets + Live API matches)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    // 1. Preset matches
    const presetMatches = POPULAR_SUBSCRIPTIONS.filter(
      p =>
        (!!p.localIconKey || (!!p.iconUrl && p.iconUrl.trim().length > 0)) &&
        (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    ).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      icon: p.localIconKey || p.iconUrl!,
      isLocal: !!p.localIconKey,
    }));

    // 2. Live API matches (deduplicated)
    const apiMatches = apiResults
      .filter(a => !presetMatches.some(p => p.name.toLowerCase() === a.name.toLowerCase()))
      .map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        icon: a.iconUrl,
        isLocal: false,
      }));

    return [...presetMatches, ...apiMatches];
  }, [searchQuery, apiResults]);

  const handleSelectApp = (name: string, icon: string) => {
    Vibration.vibrate(15);
    setTitle(name);
    setSelectedIcon(icon);
    setSearchQuery('');
  };

  const handleSave = async () => {
    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    const dayNumeric = parseInt(dayOfMonth);

    // Basic validation
    if (!title.trim() || isNaN(numericAmount) || numericAmount <= 0) return;
    if (isNaN(dayNumeric) || dayNumeric < 1 || dayNumeric > 31) return;

    const finalIcon = selectedIcon || resolveSubscriptionLogo(title.trim()) || undefined;

    const subscriptionData = {
      title: title.trim(),
      amount: numericAmount,
      dayOfMonth: dayNumeric,
      icon: finalIcon,
    };

    if (isEditing) {
      await editSubscription(editingSubscription.id, subscriptionData);
    } else {
      await addSubscription(subscriptionData);
    }
    navigation.goBack();
  };

  const isFormValid =
    title.trim() &&
    amount &&
    dayOfMonth &&
    !isNaN(parseInt(dayOfMonth)) &&
    !isNaN(parseFloat(amount)) &&
    parseFloat(amount) > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Subscription' : 'New Subscription'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar: Displays icons only when searched */}
        <View style={styles.searchSection}>
          <View style={styles.searchBarWrapper}>
            <Search size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search app for logo (e.g. Netflix, ChatGPT, Spotify...)"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {isSearchingApi && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 6 }} />}
            {searchQuery.length > 0 && !isSearchingApi && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                <X size={14} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Results: Only displayed when the user is searching */}
          {searchQuery.trim().length > 0 && (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsHeading}>
                {isSearchingApi
                  ? 'Searching app logos...'
                  : searchResults.length > 0
                  ? `Found ${searchResults.length} Apps with Logos`
                  : 'No apps found with logos'}
              </Text>

              {searchResults.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.searchResultsList}
                >
                  {searchResults.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.searchResultCard}
                      activeOpacity={0.75}
                      onPress={() => handleSelectApp(item.name, item.icon)}
                    >
                      <View style={styles.searchResultIconWrapper}>
                        {item.isLocal && SUBS_ICONS[item.icon] ? (
                          <Image source={SUBS_ICONS[item.icon]} style={styles.searchResultImage} />
                        ) : (
                          <Image source={{ uri: item.icon }} style={styles.searchResultImage} />
                        )}
                      </View>
                      <Text style={styles.searchResultName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.searchResultCategory} numberOfLines={1}>
                        {item.category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        {/* Subscription Details Form */}
        <Text style={styles.inputLabel}>Subscription Title</Text>
        <View style={styles.inputWrapper}>
          <CreditCard size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Netflix, Spotify, ChatGPT"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <Text style={styles.inputLabel}>Amount (Monthly)</Text>
        <View style={styles.inputWrapper}>
          <Text style={{ fontSize: 18, color: colors.textMuted, fontFamily: theme.fonts.bold, marginRight: 12 }}>₱</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={amount}
            onChangeText={text => setAmount(formatAmount(text))}
          />
        </View>

        <Text style={styles.inputLabel}>Billing Day of Month (1 - 31)</Text>
        <View style={styles.inputWrapper}>
          <Calendar size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={dayOfMonth}
            onChangeText={setDayOfMonth}
          />
        </View>

        {/* Selected Icon / Active Icon Preview */}
        {(() => {
          const effectiveIcon = selectedIcon || resolveSubscriptionLogo(title);
          return (
            <>
              <Text style={styles.inputLabel}>Active App Icon</Text>
              <View style={styles.iconPreviewRow}>
                <View style={styles.currentIconBox}>
                  {effectiveIcon && SUBS_ICONS[effectiveIcon] ? (
                    <Image source={SUBS_ICONS[effectiveIcon]} style={styles.currentIconImage} />
                  ) : effectiveIcon && (effectiveIcon.startsWith('http://') || effectiveIcon.startsWith('https://')) ? (
                    <Image source={{ uri: effectiveIcon }} style={styles.currentIconImage} />
                  ) : (
                    <CreditCard size={24} color={colors.primary} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.currentIconLabel} numberOfLines={1}>
                    {title || 'Default Credit Card'}
                  </Text>
                  <Text style={styles.currentIconSub}>
                    {effectiveIcon ? 'Official brand icon matched' : 'Using standard card icon'}
                  </Text>
                </View>
                {selectedIcon && (
                  <TouchableOpacity onPress={() => setSelectedIcon(null)} style={styles.removeIconBtn}>
                    <Text style={styles.removeIconBtnText}>Reset</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          );
        })()}

        <View style={styles.infoBox}>
          <Calendar size={18} color={colors.primary} />
          <Text style={styles.infoText}>
            This tracks your monthly subscription due date and sends notifications 3 days before payment is due.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, !isFormValid && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!isFormValid}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>{isEditing ? 'Update Subscription' : 'Save Subscription'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    backBtn: {
      padding: 8,
      marginLeft: -8,
    },
    headerTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(16),
      color: colors.text,
    },
    scrollContent: {
      padding: 18,
      paddingBottom: 40,
    },
    searchSection: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    searchBarWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
      borderRadius: 14,
      paddingHorizontal: 12,
      height: 44,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      fontFamily: theme.fonts.medium,
      fontSize: rf(13),
      color: colors.text,
    },
    clearSearchBtn: {
      padding: 4,
      borderRadius: 10,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    searchResultsContainer: {
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    searchResultsHeading: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(11),
      color: colors.primary,
      marginBottom: 8,
    },
    searchResultsList: {
      gap: 10,
      paddingVertical: 2,
    },
    searchResultCard: {
      width: 86,
      paddingVertical: 10,
      paddingHorizontal: 6,
      borderRadius: 14,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchResultIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    searchResultImage: {
      width: 42,
      height: 42,
      borderRadius: 10,
      resizeMode: 'contain',
    },
    searchResultName: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(11),
      color: colors.text,
      textAlign: 'center',
    },
    searchResultCategory: {
      fontFamily: theme.fonts.regular,
      fontSize: rf(9.5),
      color: colors.textMuted,
      marginTop: 2,
      textAlign: 'center',
    },
    inputLabel: {
      fontFamily: theme.fonts.semiBold,
      fontSize: rf(13),
      color: colors.text,
      marginBottom: 8,
      marginTop: 6,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      height: 52,
      fontFamily: theme.fonts.medium,
      fontSize: rf(14),
      color: colors.text,
    },
    iconPreviewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    currentIconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
      alignItems: 'center',
      justifyContent: 'center',
    },
    currentIconImage: {
      width: 40,
      height: 40,
      borderRadius: 10,
      resizeMode: 'contain',
    },
    currentIconLabel: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(13),
      color: colors.text,
    },
    currentIconSub: {
      fontFamily: theme.fonts.regular,
      fontSize: rf(10.5),
      color: colors.textMuted,
      marginTop: 1,
    },
    removeIconBtn: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    },
    removeIconBtnText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(11),
      color: colors.textMuted,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.05)' : '#f0fdf4',
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.2)',
      marginTop: 8,
      marginBottom: 12,
    },
    infoText: {
      flex: 1,
      fontFamily: theme.fonts.medium,
      fontSize: rf(11.5),
      color: colors.textMuted,
      lineHeight: 16,
    },
    footer: {
      padding: 18,
      paddingBottom: 32,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 3,
    },
    saveBtnDisabled: {
      opacity: 0.45,
      shadowOpacity: 0,
      elevation: 0,
    },
    saveBtnText: {
      fontFamily: theme.fonts.bold,
      fontSize: rf(15),
      color: '#ffffff',
    },
  });
