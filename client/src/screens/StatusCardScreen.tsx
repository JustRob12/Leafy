import React, { useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Download, Share2, Info, ShoppingBag, Utensils, Car, LayoutGrid, Leaf, Plane, MapPin, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import ViewShot, { captureRef } from 'react-native-view-shot';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import AdvancedColorPicker from '../components/AdvancedColorPicker';

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
  const { totalBalance, transactions, username, colors, isDarkMode, showFeedback, travels } = useAppContext();
  const navigation = useNavigation();
  const viewShotRef = useRef<any>(null);
  
  const [textColor, setTextColor] = useState(PRESET_COLORS[0]);
  const [storyType, setStoryType] = useState<'financial' | 'travel'>('financial');
  const [selectedTravelId, setSelectedTravelId] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [rearrangeMode, setRearrangeMode] = useState(false);
  const [swapSourceIndex, setSwapSourceIndex] = useState<number | null>(null);
  
  // Local state for rearranged images to avoid constant context updates during preview editing
  const [tempImages, setTempImages] = useState<string[]>([]);
  
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

    // 2. CATEGORIZATION LOGIC
    const categoryTotals: { [key: string]: number } = {
      Food: 0,
      Transport: 0,
      Fun: 0,
      Other: 0
    };

    monthlyTransactions
      .filter(tx => tx.type === 'withdrawal')
      .forEach(tx => {
        const title = tx.title.toLowerCase();
        let categorized = false;
        
        for (const [cat, keywords] of Object.entries(CAT_KEYWORDS)) {
          if (keywords.some(k => title.includes(k))) {
            categoryTotals[cat] += tx.amount;
            categorized = true;
            break;
          }
        }
        
        if (!categorized) {
          categoryTotals.Other += tx.amount;
        }
      });

    const totalSpent = expenses || 1;
    
    // 3. Formatting Metrics
    const saved = Math.max(income - expenses, 0);
    const savedPercent = income > 0 ? Math.round((saved / income) * 100) : 0;
    const expenseRatio = income > 0 ? Math.round((expenses / income) * 100) : (expenses > 0 ? 100 : 0);

    // Map categories to breakdown items
    const breakdown = [
      { name: 'Food & Dining', key: 'Food', icon: Utensils },
      { name: 'Transport & Fuel', key: 'Transport', icon: Car },
      { name: 'Lifestyle & Fun', key: 'Fun', icon: ShoppingBag },
      { name: 'Other Expenses', key: 'Other', icon: LayoutGrid },
    ]
    .map(cat => ({
      ...cat,
      amount: categoryTotals[cat.key],
      percent: Math.round((categoryTotals[cat.key] / totalSpent) * 100)
    }))
    .filter(cat => cat.amount > 0) // Only show categories with spending
    .sort((a, b) => b.amount - a.amount); // Show highest spending first

    return {
      income,
      expenses,
      saved,
      savedPercent,
      expenseRatio,
      breakdown
    };
  }, [transactions]);

  const selectedTravel = useMemo(() => {
    if (!selectedTravelId) return null;
    return travels.find(t => t.id === selectedTravelId) || null;
  }, [travels, selectedTravelId]);

  // Sync temp images when travel selection changes
  React.useEffect(() => {
    if (selectedTravel) {
      setTempImages(selectedTravel.images || []);
    } else {
      setTempImages([]);
    }
    setRearrangeMode(false);
    setSwapSourceIndex(null);
  }, [selectedTravelId]);

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

  const pickBackgroundImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [9, 16], // Portrait aspect ratio
        quality: 0.8,
      });

      if (!result.canceled) {
        setBackgroundImage(result.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
      showFeedback('error', 'Failed to pick image');
    }
  };

  const handleSwap = (index: number) => {
    if (swapSourceIndex === null) {
      setSwapSourceIndex(index);
    } else {
      if (swapSourceIndex !== index) {
        const newImages = [...tempImages];
        const temp = newImages[swapSourceIndex];
        newImages[swapSourceIndex] = newImages[index];
        newImages[index] = temp;
        setTempImages(newImages);
        showFeedback('success', 'Photos swapped');
      }
      setSwapSourceIndex(null);
    }
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

        {/* Story Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[styles.typeBtn, storyType === 'financial' && { backgroundColor: colors.primary }]}
            onPress={() => setStoryType('financial')}
          >
            <Text style={[styles.typeBtnText, { color: storyType === 'financial' ? '#fff' : colors.textMuted }]}>Financial</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, storyType === 'travel' && { backgroundColor: colors.primary }]}
            onPress={() => {
              setStoryType('travel');
              setSelectedTravelId(null); // Force show list
            }}
          >
            <Text style={[styles.typeBtnText, { color: storyType === 'travel' ? '#fff' : colors.textMuted }]}>Travel</Text>
          </TouchableOpacity>
        </View>

        {storyType === 'travel' && !selectedTravel && (
          <View style={styles.travelListContainer}>
            <Text style={[styles.listTitle, { color: colors.text }]}>Select a Trip</Text>
            {travels.length > 0 ? (
              travels.map(t => (
                <TouchableOpacity 
                  key={t.id} 
                  style={[styles.travelCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => {
                    setSelectedTravelId(t.id);
                    setTempImages(t.images || []);
                  }}
                >
                  <View style={styles.travelCardIcon}>
                    <Plane size={24} color={colors.primary} />
                  </View>
                  <View style={styles.travelCardContent}>
                    <Text style={[styles.travelCardName, { color: colors.text }]}>{t.name}</Text>
                    <Text style={[styles.travelCardSub, { color: colors.textMuted }]}>{t.location} • {t.images?.length || 0} photos</Text>
                  </View>
                  <ChevronLeft size={20} color={colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noTravelState}>
                <Plane size={48} color={colors.textMuted + '40'} />
                <Text style={[styles.noTravelText, { color: colors.textMuted }]}>No trips recorded yet</Text>
              </View>
            )}
          </View>
        )}

        {storyType === 'travel' && selectedTravel && (
           <TouchableOpacity 
             style={styles.backToListBtn}
             onPress={() => setSelectedTravelId(null)}
           >
             <ChevronLeft size={16} color={colors.primary} />
             <Text style={[styles.backToListText, { color: colors.primary }]}>Back to all trips</Text>
           </TouchableOpacity>
        )}

        {/* Card Preview Area */}
        {(storyType === 'financial' || selectedTravel) && (
          <View style={styles.previewContainer}>
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={styles.viewShot}>
              <View style={styles.premiumCard}>
                {/* Background Layer */}
                {storyType === 'travel' && backgroundImage && (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]}>
                     <Image 
                       source={{ uri: backgroundImage }} 
                       style={[StyleSheet.absoluteFill, { opacity: 0.6 }]} 
                       resizeMode="cover"
                     />
                  </View>
                )}
                
                <View style={styles.cardContent}>
                  {storyType === 'financial' ? (
                    <>
                      {/* ... Financial Content ... */}
                      <View style={styles.heroSection}>
                        <View style={[styles.brandHeader, { justifyContent: 'flex-start', marginBottom: 10 }]}>
                            <Leaf size={20} color={textColor} fill={textColor + '22'} />
                            <Text style={[styles.brandName, { color: textColor, fontSize: 16 }]}>Leafy</Text>
                        </View>
                        <View>
                          <Text style={[styles.greeting, { color: textColor }]}>Hello {username || 'Buddy'},</Text>
                          <Text style={[styles.dateLabel, { color: textColor + '88' }]}>{dateStr}</Text>
                        </View>
                        
                        <View style={styles.savingsHero}>
                          <Text style={[styles.headline, { color: textColor }]}>{stats.savedPercent}%</Text>
                          <Text style={[styles.subHeadline, { color: textColor + 'bb' }]}>SAVED THIS MONTH</Text>
                        </View>
                      </View>

                      <View style={styles.middleSection}>
                        <Text style={[styles.motivation, { color: textColor + '99' }]}>
                          {stats.savedPercent > 40 ? 'You\'re crushing your savings goals this month! Keep it up.' : 'Every peso counts. Try to trim some non-essential spending.'}
                        </Text>
                      </View>

                      <View style={styles.breakdownSection}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Monthly Expenses</Text>
                        <View style={styles.totalExpenseCard}>
                          <Text style={[styles.totalExpensePercent, { color: textColor }]}>{stats.expenseRatio}%</Text>
                          <Text style={[styles.totalExpenseSub, { color: textColor + '99' }]}>TOTAL SPENT THIS MONTH</Text>
                          <View style={[styles.progressTrack, { backgroundColor: textColor + '22', height: 8, borderRadius: 4, marginTop: 12 }]}>
                            <View style={[styles.progressFill, { width: `${Math.min(stats.expenseRatio, 100)}%`, backgroundColor: textColor, height: 8, borderRadius: 4 }]} />
                          </View>
                        </View>
                      </View>
                    </>
                  ) : (
                    <View style={styles.travelStoryLayout}>
                      <View style={[styles.brandHeader, { justifyContent: 'flex-start', marginBottom: 20 }]}>
                          <Leaf size={20} color={textColor} fill={textColor + '22'} />
                          <Text style={[styles.brandName, { color: textColor, fontSize: 16 }]}>Leafy Travel</Text>
                      </View>
                      
                      {selectedTravel && (
                        <>
                          <View style={styles.travelStoryHeader}>
                            <Text style={[styles.travelStoryName, { color: textColor }]}>{selectedTravel.name}</Text>
                            <Text style={[styles.travelStoryDate, { color: textColor + '88' }]}>{selectedTravel.startDate} - {selectedTravel.endDate}</Text>
                          </View>

                          <View style={styles.travelStoryImageGrid}>
                            {(tempImages && tempImages.length > 0) ? (
                              <>
                                {tempImages.slice(0, 9).map((img: string, i: number) => (
                                  <Image 
                                    key={`preview-${img}-${i}`} 
                                    source={{ uri: img }} 
                                    style={styles.travelStoryImage}
                                    resizeMode="cover"
                                  />
                                ))}
                                {tempImages.length < 9 && Array(9 - tempImages.length).fill(0).map((_, i) => (
                                  <View key={`fill-${i}`} style={[styles.travelStoryImageFiller, { backgroundColor: textColor + '08' }]} />
                                ))}
                              </>
                            ) : (
                              <View style={[styles.travelStoryNoImages, { borderColor: textColor + '33' }]}>
                                 <ImageIcon size={48} color={textColor + '33'} />
                                 <Text style={[styles.travelStoryNoImagesText, { color: textColor + '66' }]}>No memories yet</Text>
                              </View>
                            )}
                          </View>

                          <View style={styles.travelStoryFooter}>
                            <View style={styles.travelStoryLocationRow}>
                              <MapPin size={18} color={textColor} />
                              <Text style={[styles.travelStoryLocation, { color: textColor, fontSize: 24 }]}>
                                {selectedTravel.location}
                              </Text>
                            </View>
                          </View>
                        </>
                      )}
                    </View>
                  )}
                  <View style={styles.footer} />
                </View>
              </View>
            </ViewShot>
          </View>
        )}

        {/* Editor Controls */}
        {(storyType === 'financial' || selectedTravel) && (
          <View style={styles.exportPanel}>
            {/* Rearrange Mode Toggle */}
            {storyType === 'travel' && selectedTravel && (tempImages.length > 1) && (
              <View style={styles.controlSection}>
                <View style={styles.rearrangeHeader}>
                  <Text style={[styles.selectorLabel, { color: colors.text }]}>Rearrange Photos</Text>
                  <TouchableOpacity 
                    style={[styles.rearrangeToggle, rearrangeMode && { backgroundColor: colors.primary + '15' }]}
                    onPress={() => {
                      setRearrangeMode(!rearrangeMode);
                      setSwapSourceIndex(null);
                    }}
                  >
                    <Text style={[styles.rearrangeToggleText, { color: colors.primary }]}>
                      {rearrangeMode ? 'Done' : 'Edit Order'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {rearrangeMode && (
                  <View style={styles.rearrangeGrid}>
                    {tempImages.slice(0, 9).map((img, i) => (
                      <TouchableOpacity 
                        key={`rearrange-${img}-${i}`} 
                        style={[
                          styles.rearrangeItem, 
                          swapSourceIndex === i && { borderColor: colors.primary, borderWidth: 3 }
                        ]}
                        onPress={() => handleSwap(i)}
                      >
                        <Image source={{ uri: img }} style={styles.rearrangeImage} />
                        <View style={styles.rearrangeBadge}>
                          <Text style={styles.rearrangeBadgeText}>{i + 1}</Text>
                        </View>
                        {swapSourceIndex === i && (
                          <View style={styles.swapIndicator}>
                            <Text style={styles.swapIndicatorText}>Pick Target</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {!rearrangeMode && (
                  <Text style={[styles.rearrangeHint, { color: colors.textMuted }]}>
                    Tap 'Edit Order' to swap photos in the grid.
                  </Text>
                )}
              </View>
            )}
          <View style={styles.controlSection}>
            <Text style={[styles.selectorLabel, { color: colors.text }]}>Accent Color</Text>
            <AdvancedColorPicker 
              color={textColor} 
              onColorChange={setTextColor} 
              colors={colors} 
              isDarkMode={isDarkMode} 
            />
          </View>

          {storyType === 'travel' && (
            <View style={styles.controlSection}>
              <Text style={[styles.selectorLabel, { color: colors.text }]}>Background Style</Text>
              <View style={styles.bgOptionsRow}>
                <TouchableOpacity 
                  style={[
                    styles.bgOptionBtn, 
                    !backgroundImage && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setBackgroundImage(null)}
                >
                  <Text style={[styles.bgOptionText, { color: !backgroundImage ? colors.primary : colors.text }]}>Transparent</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.bgOptionBtn, 
                    backgroundImage && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={pickBackgroundImage}
                >
                  <ImageIcon size={18} color={backgroundImage ? colors.primary : colors.textMuted} />
                  <Text style={[styles.bgOptionText, { color: backgroundImage ? colors.primary : colors.text }]}>
                    {backgroundImage ? 'Change Photo' : 'Upload Photo'}
                  </Text>
                </TouchableOpacity>

                {backgroundImage && (
                  <TouchableOpacity 
                    style={styles.deleteBgBtn}
                    onPress={() => setBackgroundImage(null)}
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

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
      )}
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
  totalExpenseCard: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  totalExpensePercent: {
    fontFamily: theme.fonts.bold,
    fontSize: 48,
  },
  totalExpenseSub: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: -5,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
  },
  travelSelectorScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  travelSelectorItem: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  travelSelectorName: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
  },
  travelStoryLayout: {
    flex: 1,
  },
  travelStoryHeader: {
    marginBottom: 20,
  },
  travelStoryName: {
    fontFamily: theme.fonts.bold,
    fontSize: 32,
    marginBottom: 4,
  },
   travelStoryLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  travelStoryLocation: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
  },
  travelStoryDate: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
  },
  travelStoryImageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -25, // Stretches to card edges
    marginBottom: 20,
    overflow: 'hidden',
  },
  travelStoryImage: {
    width: CARD_WIDTH / 3 - 0.5,
    height: CARD_WIDTH / 3 - 0.5,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  travelStoryImageFiller: {
    width: CARD_WIDTH / 3 - 0.5,
    height: CARD_WIDTH / 3 - 0.5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  travelStoryNoImages: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  travelStoryNoImagesText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
  },
  travelStoryFooter: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  noTravelState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  noTravelText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
  },
  bgOptionsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  bgOptionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bgOptionText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
  },
  deleteBgBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ef444415',
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelListContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  listTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    marginBottom: 15,
  },
  travelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    gap: 15,
  },
  travelCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelCardContent: {
    flex: 1,
  },
  travelCardName: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    marginBottom: 2,
  },
  travelCardSub: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
  },
  backToListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 15,
    gap: 4,
  },
  backToListText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
  },
  rearrangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rearrangeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rearrangeToggleText: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
  },
  rearrangeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  rearrangeItem: {
    width: (width - 48 - 16) / 3, // 3 column grid in control panel
    height: (width - 48 - 16) / 3,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  rearrangeImage: {
    width: '100%',
    height: '100%',
  },
  rearrangeBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rearrangeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  swapIndicator: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,122,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapIndicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rearrangeHint: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
