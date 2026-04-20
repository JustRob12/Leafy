import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Share, Alert, Dimensions, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera, Download, Share2, Leaf, RotateCcw, Type, Palette } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { theme } from '../theme';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * (16 / 9);

const PRESET_COLORS = [
  '#22c55e', // Leafy Green
  '#FFD700', // Gold
  '#FFFFFF', // White
  '#000000', // Black
  '#6366f1', // Indigo
  '#ef4444', // Red
];

type LayoutPosition = 'top-left' | 'top-mid' | 'top-right' | 'mid' | 'bottom-left' | 'bottom-mid' | 'bottom-right';

export default function StatusCardScreen() {
  const { totalBalance, statusCardBg, setStatusCardBg, colors, isDarkMode, showFeedback } = useAppContext();
  const navigation = useNavigation();
  const viewShotRef = useRef<any>(null);
  
  const [layout, setLayout] = useState<LayoutPosition>('mid');
  const [textColor, setTextColor] = useState(PRESET_COLORS[0]);
  
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' }).toUpperCase();

  const handlePickBg = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showFeedback('error', 'Permission needed to access gallery');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled) {
      await setStatusCardBg(result.assets[0].uri);
    }
  };

  const handleResetBg = async () => {
    await setStatusCardBg(null);
    showFeedback('success', 'Background Reset');
  };

  const handleSave = async () => {
    if (!viewShotRef.current) return;
    
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showFeedback('error', 'Permission needed to save to gallery');
        return;
      }

      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
      });

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
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 0.9,
      });

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Customize Status</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card Preview */}
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {statusCardBg ? (
              <Image source={{ uri: statusCardBg }} style={styles.cardBg} />
            ) : (
              <View style={[styles.cardBg, { backgroundColor: colors.primary + '10', justifyContent: 'center', alignItems: 'center' }]}>
                <Image source={require('../../assets/leafylogo.png')} style={{ width: 100, height: 100, opacity: 0.2 }} />
              </View>
            )}
            
            <View style={[
              styles.overlay, 
              (layout.startsWith('top')) && { justifyContent: 'flex-start', paddingTop: 40 },
              (layout === 'mid') && { justifyContent: 'center' },
              (layout.startsWith('bottom')) && { justifyContent: 'flex-end', paddingBottom: 40 },
              (layout.endsWith('left')) && { alignItems: 'flex-start' },
              (layout.endsWith('mid') || layout === 'mid') && { alignItems: 'center' },
              (layout.endsWith('right')) && { alignItems: 'flex-end' },
            ]}>
              {/* FIXED LOGO TOP RIGHT */}
              <Image source={require('../../assets/leafylogo.png')} style={styles.fixedCardLogo} />

              {/* Layout Content */}
              <View style={[
                styles.textContainer,
                (layout.endsWith('left')) && { alignItems: 'flex-start' },
                (layout.endsWith('right')) && { alignItems: 'flex-end' },
              ]}>
                <Text style={[
                  styles.smallText, 
                  { color: textColor },
                  (layout.endsWith('left')) && { textAlign: 'left' },
                  (layout.endsWith('right')) && { textAlign: 'right' },
                ]}>You have earned</Text>
                
                <Text style={[
                  styles.amountText, 
                  { color: textColor },
                  (layout.endsWith('left')) && { textAlign: 'left' },
                  (layout.endsWith('right')) && { textAlign: 'right' },
                ]}>₱{totalBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                
                <Text style={[
                  styles.smallText, 
                  { color: textColor },
                  (layout.endsWith('left')) && { textAlign: 'left' },
                  (layout.endsWith('right')) && { textAlign: 'right' },
                ]}>for the month of {currentMonth}</Text>
              </View>
            </View>
          </View>
        </ViewShot>

        {/* Editor Controls */}
        <View style={styles.editorPanel}>
          {/* Section: Background Actions */}
          <View style={styles.controlSection}>
            <View style={styles.controlsRow}>
              <TouchableOpacity style={[styles.mainActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handlePickBg}>
                <Camera size={20} color={colors.primary} />
                <Text style={[styles.actionBtnText, { color: colors.text }]}>Pick Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.mainActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleResetBg}>
                <RotateCcw size={20} color={colors.primary} />
                <Text style={[styles.actionBtnText, { color: colors.text }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Position Selector */}
          <View style={styles.controlSection}>
            <Text style={[styles.selectorLabel, { color: colors.text }]}>Text Position</Text>
            <View style={styles.layoutGrid}>
              <View style={styles.layoutRow}>
                {(['top-left', 'top-mid', 'top-right'] as const).map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.smallLayoutBtn, { backgroundColor: colors.border + '20' }, layout === l && { backgroundColor: colors.primary }]}
                    onPress={() => setLayout(l)}
                  >
                    <Text style={[styles.layoutBtnText, { color: colors.text }, layout === l && { color: '#ffffff' }]}>{l.split('-')[1]?.toUpperCase() || 'TOP'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.layoutRow}>
                <TouchableOpacity
                  style={[styles.smallLayoutBtn, { flex: 2, backgroundColor: colors.border + '20' }, layout === 'mid' && { backgroundColor: colors.primary }]}
                  onPress={() => setLayout('mid')}
                >
                  <Text style={[styles.layoutBtnText, { color: colors.text }, layout === 'mid' && { color: '#ffffff' }]}>MIDDLE CENTER</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.layoutRow}>
                {(['bottom-left', 'bottom-mid', 'bottom-right'] as const).map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.smallLayoutBtn, { backgroundColor: colors.border + '20' }, layout === l && { backgroundColor: colors.primary }]}
                    onPress={() => setLayout(l)}
                  >
                    <Text style={[styles.layoutBtnText, { color: colors.text }, layout === l && { color: '#ffffff' }]}>{l.split('-')[1]?.toUpperCase() || 'BOT'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Section: Color Picker */}
          <View style={styles.controlSection}>
            <Text style={[styles.selectorLabel, { color: colors.text }]}>Font Color</Text>
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

          {/* Section: Export Actions */}
          <View style={[styles.controlSection, { marginTop: 20 }]}>
            <View style={styles.controlsRow}>
              <TouchableOpacity style={[styles.exportBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleSave}>
                <Download size={22} color={colors.primary} />
                <Text style={[styles.exportBtnText, { color: colors.text }]}>Save to Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.exportBtn, { backgroundColor: colors.primary }]} onPress={handleShare}>
                <Share2 size={22} color="#ffffff" />
                <Text style={[styles.exportBtnText, { color: '#ffffff' }]}>Share Now</Text>
              </TouchableOpacity>
            </View>
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
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  cardBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    padding: 30,
    alignItems: 'center',
  },
  fixedCardLogo: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 35,
    height: 35,
    resizeMode: 'contain',
    zIndex: 10,
  },
  textContainer: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    width: '100%',
  },
  smallText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  amountText: {
    fontFamily: theme.fonts.bold,
    fontSize: 38,
    marginVertical: -2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 15,
  },
  editorPanel: {
    width: '100%',
    padding: 24,
  },
  controlSection: {
    marginBottom: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selectorLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  layoutGrid: {
    gap: 8,
  },
  layoutRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallLayoutBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layoutBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
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
  textInput: {
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    borderWidth: 1,
  },
  mainActionBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
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
  actionBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
  },
  exportBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
  },
});
