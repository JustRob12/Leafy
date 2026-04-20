import React, { useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Download, Share2, Info, ShoppingBag, Utensils, Car, LayoutGrid, Leaf } from 'lucide-react-native';

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
        percent: income > 0 ? Math.round((tx.amount / income) * 100) : 0
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
                {/* BRAND HEADER: Using Leaf icon instead of Image */}
                <View style={styles.brandHeader}>
                    <Leaf size={24} color={textColor} fill={textColor + '22'} />
                    <Text style={[styles.brandName, { color: textColor }]}>Leafy</Text>
                </View>


                {/* TOP SECTION: Graph */}
                <View style={styles.topSection}>
                  <LinearProgressBar percent={stats.expenseRatio} />
                </View>


                {/* GREETING & HERO SECTION */}
                <View style={styles.heroSection}>
                  <View>
                    <Text style={[styles.greeting, { color: textColor }]}>Hello {username || 'Buddy'},</Text>
                    <Text style={[styles.dateLabel, { color: textColor + '88' }]}>{dateStr}</Text>
                  </View>
                  
                  <View style={styles.savingsHero}>
                    <Text style={[styles.headline, { color: textColor }]}>{stats.savedPercent}%</Text>
                    <Text style={[styles.subHeadline, { color: textColor + 'bb' }]}>SAVED THIS MONTH</Text>
                  </View>

                </View>



                {/* MOTIVATION SECTION */}
                <View style={styles.middleSection}>
                  <Text style={[styles.motivation, { color: textColor + '99' }]}>
                    {stats.savedPercent > 40 ? 'You\'re crushing your savings goals this month! Keep it up.' : 'Every peso counts. Try to trim some non-essential spending.'}
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
                          <Text style={[styles.breakdownPercentText, { color: textColor + '99' }]}>{item.percent}%</Text>
                        </View>
                        <View style={[styles.progressTrack, { backgroundColor: textColor + '22' }]}>
                          <View style={[styles.progressFill, { width: `${item.percent}%`, backgroundColor: textColor }]} />
                        </View>
                      </View>
                    ))
                  )}
                </View>

                {/* FOOTER: Empty or can be used for extra padding */}
                <View style={styles.footer} />


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
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  topSection: {
    marginTop: 0,
    marginBottom: 20,
  },

  heroSection: {
    marginBottom: 25,
  },
  dateLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 4,
  },
  savingsHero: {
    marginTop: 20,
  },
  tagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  tagText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    letterSpacing: 1,
  },
  greeting: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  headline: {
    fontFamily: theme.fonts.bold,
    fontSize: 84,
    lineHeight: 84,
  },
  headlineSub: {
    justifyContent: 'center',
  },
  subHeadline: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: -5,
  },

  middleSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  motivation: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  paceContainer: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 15,
    borderRadius: 20,
  },
  paceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paceTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  paceSubtitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    opacity: 0.6,
  },
  breakdownSection: {
    flex: 1,
  },
  breakdownItem: {
    marginBottom: 15,
  },
  breakdownLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  breakdownLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownName: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
  },
  breakdownPercentText: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    paddingTop: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },
  metricItem: {
    flex: 1,
    padding: 15,
    borderRadius: 18,
  },
  metricLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 6,
  },
  metricValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  brandName: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    letterSpacing: 0.5,
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
