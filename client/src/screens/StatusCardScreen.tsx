import React, { useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Download, Share2, Info, ShoppingBag, Utensils, Car, LayoutGrid } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import ViewShot, { captureRef } from 'react-native-view-shot';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.92;
const CARD_HEIGHT = CARD_WIDTH * (1.8); // Slightly taller than 16:9 to accommodate more data

const PRESET_COLORS = [
  '#FFFFFF', // White
  '#22c55e', // Leafy Green
  '#FFD700', // Gold
  '#000000', // Black
  '#6366f1', // Indigo
  '#ef4444', // Red
];

// Keywords for categorization
const CAT_KEYWORDS = {
  Food: ['mcdonald', 'food', 'eat', 'coffee', 'jollibee', 'grocery', 'restaurant', 'cafe', 'burger', 'pizza', 'meal', 'water', 'snack'],
  Transport: ['grab', 'gas', 'fuel', 'commute', 'travel', 'taxi', 'shell', 'petron', 'car', 'ride', 'fare', 'toll', 'parking'],
  Fun: ['movie', 'netflix', 'game', 'fun', 'entertainment', 'cinema', 'spotify', 'leisure', 'gift', 'shopping', 'luxury'],
};

export default function StatusCardScreen() {
  const { totalBalance, transactions, username, colors, isDarkMode, showFeedback } = useAppContext();
  const navigation = useNavigation();
  const viewShotRef = useRef<any>(null);
  
  const [textColor, setTextColor] = useState(PRESET_COLORS[0]);
  
  // DATA PROCESSING
  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // 1. Filter Transactions for Current Month
    const monthlyTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
    });

    const income = monthlyTransactions
      .filter(tx => tx.type === 'deposit')
      .reduce((acc, tx) => acc + tx.amount, 0);

    const expenses = monthlyTransactions
      .filter(tx => tx.type === 'withdrawal')
      .reduce((acc, tx) => acc + tx.amount, 0);

    // 2. Individual Withdrawal Breakdown (Latest from History)
    const withdrawalHistory = monthlyTransactions
      .filter(tx => tx.type === 'withdrawal')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Show latest 5 withdrawals

    const totalSpent = expenses || 1;
    
    // 3. Formatting Metrics
    const saved = Math.max(income - expenses, 0);
    const savedPercent = income > 0 ? Math.round((saved / income) * 100) : 0;
    const expenseRatio = income > 0 ? Math.round((expenses / income) * 100) : (expenses > 0 ? 100 : 0);

    return {
      income,
      expenses,
      saved,
      savedPercent,
      expenseRatio,
      breakdown: withdrawalHistory.map(tx => ({
        name: tx.title,
        amount: tx.amount,
        icon: LayoutGrid,
        percent: Math.round((tx.amount / totalSpent) * 100)
      }))
    };
  }, [transactions]);

  const dateStr = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  }, []);

  const handleSave = async () => {
    if (!viewShotRef.current) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showFeedback('error', 'Permission needed to save to gallery');
        return;
      }
      const uri = await captureRef(viewShotRef, { format: 'png', quality: 1 });
      await MediaLibrary.saveToLibraryAsync(uri);
      showFeedback('success', 'Saved to Gallery');
    } catch (e) {
      console.error(e);
      showFeedback('error', 'Failed to save image');
    }
  };

  const handleShare = async () => {
    if (!viewShotRef.current) return;
    try {
      const uri = await captureRef(viewShotRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        showFeedback('error', 'Sharing is not available');
      }
    } catch (e) {
      console.error(e);
      showFeedback('error', 'Failed to share image');
    }
  };

  const LinearProgressBar = ({ percent }: any) => {
    return (
      <View style={styles.paceContainer}>
        <View style={styles.paceHeader}>
          <Text style={[styles.paceTitle, { color: textColor }]}>MONTHLY PACE</Text>
          <Text style={[styles.paceSubtitle, { color: textColor + 'aa' }]}>{percent}% SPENT</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: textColor + '22', height: 10, borderRadius: 5 }]}>
          <View style={[styles.progressFill, { width: `${Math.min(percent, 100)}%`, backgroundColor: textColor, height: 10, borderRadius: 5 }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Story Status</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Instruction Banner */}
        <View style={[styles.instructionBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
          <Info size={20} color={colors.primary} />
          <Text style={[styles.instructionText, { color: colors.text }]}>
            Capture your progress and share it with your friends!
          </Text>
        </View>

        {/* Card Preview Area */}
        <View style={styles.previewContainer}>
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={styles.viewShot}>
            <View style={styles.premiumCard}>
              <View style={styles.cardContent}>
                {/* TOP SECTION: Bar Graph Above All */}
                <View style={styles.topSection}>
                  <Text style={[styles.dateLabel, { color: textColor + 'aa' }]}>{dateStr}</Text>
                  
                  <LinearProgressBar percent={stats.expenseRatio} />

                  <View style={[styles.tagPill, { backgroundColor: textColor + '22', marginTop: 15 }]}>
                    <Text style={[styles.tagText, { color: textColor }]}>SAVINGS</Text>
                  </View>
                  
                  <Text style={[styles.greeting, { color: textColor }]}>Hey {username || 'Buddy'},</Text>
                  <Text style={[styles.headline, { color: textColor }]}>{stats.savedPercent}%</Text>
                  <Text style={[styles.subHeadline, { color: textColor + 'bb' }]}>saved this month</Text>
                </View>

                {/* MIDDLE SECTION: Simplified Motivation */}
                <View style={styles.middleSection}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>Monthly Goal</Text>
                  <Text style={[styles.motivation, { color: textColor + '99' }]}>
                    {stats.savedPercent > 40 ? 'You are doing great with your monthly savings!' : 'Let\'s try to keep those monthly expenses lean.'}
                  </Text>
                </View>

                {/* BREAKDOWN SECTION */}
                <View style={styles.breakdownSection}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>Expense breakdown</Text>
                  {stats.breakdown.length === 0 ? (
                    <Text style={[styles.motivation, { color: textColor + '66' }]}>No withdrawals recorded this month.</Text>
                  ) : (
                    stats.breakdown.map((item, idx) => (
                      <View key={idx} style={styles.breakdownItem}>
                        <View style={styles.breakdownLabelRow}>
                          <View style={styles.breakdownLabelLeft}>
                            <item.icon size={16} color={textColor + '99'} />
                            <Text style={[styles.breakdownName, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
                          </View>
                          <Text style={[styles.breakdownPercentText, { color: textColor + '99' }]}>₱{item.amount.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.progressTrack, { backgroundColor: textColor + '22' }]}>
                          <View style={[styles.progressFill, { width: `${item.percent}%`, backgroundColor: textColor }]} />
                        </View>
                      </View>
                    ))
                  )}
                </View>

                {/* FOOTER */}
                <View style={styles.footer}>
                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricLabel, { color: textColor + '88' }]}>INCOME</Text>
                      <Text style={[styles.metricValue, { color: textColor }]}>₱{Math.round(stats.income).toLocaleString()}</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricLabel, { color: textColor + '88' }]}>EXPENSES</Text>
                      <Text style={[styles.metricValue, { color: textColor }]}>₱{Math.round(stats.expenses).toLocaleString()}</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricLabel, { color: textColor + '88' }]}>SAVED</Text>
                      <Text style={[styles.metricValue, { color: textColor }]}>₱{Math.round(stats.saved).toLocaleString()}</Text>
                    </View>
                  </View>

                  <View style={styles.brandRow}>
                    <Image source={require('../../assets/leafylogo.png')} style={styles.brandLogo} />
                    <Text style={[styles.brandName, { color: textColor }]}>Leafy</Text>
                  </View>
                </View>
              </View>
            </View>
          </ViewShot>
        </View>

        {/* Editor Controls */}
        <View style={styles.exportPanel}>
          <View style={styles.controlSection}>
            <Text style={[styles.selectorLabel, { color: colors.text }]}>Accent Color</Text>
            <View style={styles.colorRow}>
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorCircle, 
                    { backgroundColor: c },
                    textColor === c && { borderWidth: 3, borderColor: colors.text }
                  ]}
                  onPress={() => setTextColor(c)}
                />
              ))}
            </View>
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity 
              style={[styles.exportBtn, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={handleSave}
            >
              <Download size={22} color={colors.primary} />
              <Text style={[styles.exportBtnText, { color: colors.text }]}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.exportBtn, { backgroundColor: colors.primary }]} 
              onPress={handleShare}
            >
              <Share2 size={22} color="#ffffff" />
              <Text style={[styles.exportBtnText, { color: '#ffffff' }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
  },
  scrollContent: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  instructionBox: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  previewContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9', // Gray background for preview as requested
  },
  viewShot: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  premiumCard: {
    flex: 1,
    padding: 25,
    backgroundColor: 'transparent',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    marginTop: 0,
  },
  dateLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  tagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  tagText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  greeting: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    marginBottom: 0,
  },
  headline: {
    fontFamily: theme.fonts.bold,
    fontSize: 72,
    lineHeight: 76,
    marginVertical: -5,
  },
  subHeadline: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    opacity: 0.8,
  },
  middleSection: {
    marginTop: 15,
  },
  sectionTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    marginBottom: 4,
  },
  motivation: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  paceContainer: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 16,
    marginBottom: 5,
  },
  paceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paceTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    letterSpacing: 1,
  },
  paceSubtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    letterSpacing: 1,
  },
  breakdownSection: {
    marginTop: 15,
  },
  breakdownItem: {
    marginBottom: 12,
  },
  breakdownLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
  },
  breakdownPercentText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    marginTop: 15,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 10,
  },
  metricItem: {
    alignItems: 'flex-start',
  },
  metricLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 5,
  },
  metricValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  brandName: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    letterSpacing: 1,
  },
  exportPanel: {
    width: '100%',
    padding: 24,
  },
  controlSection: {
    marginBottom: 24,
  },
  selectorLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 14,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  exportBtn: {
    flex: 1,
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
  },
  exportBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
  },
});
