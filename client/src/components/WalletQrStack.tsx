import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  Vibration,
  Modal,
  LayoutChangeEvent,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { QrCode, Download, Share2, Maximize2, X, Layers } from 'lucide-react-native';
import { useAppContext, WalletType } from '../context/AppContext';
import { theme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =========================================================================
// ISO/IEC 7810 ID-1 Standard Dimensions (Exact specification from diagram)
// Width: 85.60 mm (3.370")
// Height: 53.98 mm (2.125")
// Corner Radius: 3.00 mm (0.118")
// =========================================================================
export const ID1_CARD_WIDTH_MM = 85.60;
export const ID1_CARD_HEIGHT_MM = 53.98;
export const ID1_CORNER_RADIUS_MM = 3.00;

export const ID1_ASPECT_RATIO = ID1_CARD_WIDTH_MM / ID1_CARD_HEIGHT_MM; // ~1.58577
export const ID1_RADIUS_RATIO = ID1_CORNER_RADIUS_MM / ID1_CARD_WIDTH_MM; // ~0.035047

export default function WalletQrStack() {
  const { wallets, username, colors, isDarkMode, showFeedback } = useAppContext();

  // Filter only wallets that have a QR code image
  const qrWallets = useMemo(() => {
    return wallets.filter(
      (w) => !!w.qrCodeImage && typeof w.qrCodeImage === 'string' && w.qrCodeImage.trim().length > 0
    );
  }, [wallets]);

  // Responsive dynamic measurement of card width based on phone size
  const [containerWidth, setContainerWidth] = useState(
    Math.min(SCREEN_WIDTH - 40, 480)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [enlargedModalVisible, setEnlargedModalVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);

  // ViewShot ref for capturing the WHOLE card in the action modal (untransformed, stationary)
  const wholeCardViewShotRef = useRef<any>(null);

  // PanResponder and Animation values for swipeable card stack
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const stackAnim = useRef(new Animated.Value(0)).current;
  const isSwipingOut = useRef(false);

  // Stable refs to prevent PanResponder closure stalls
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const qrWalletsRef = useRef(qrWallets);
  qrWalletsRef.current = qrWallets;

  const cardWidthRef = useRef(containerWidth);
  cardWidthRef.current = containerWidth;

  // Calculate proportional ID-1 credit card dimensions and responsive sizes
  const cardWidth = Math.round(containerWidth);
  const cardHeight = Math.round(cardWidth / ID1_ASPECT_RATIO);
  const cardRadius = Math.round(cardWidth * ID1_RADIUS_RATIO); // Exactly 3mm proportional radius
  const deckContainerHeight = cardHeight + Math.round(cardHeight * 0.08); // Space for stack depth

  // Element sizes scaled proportionally to the card dimensions
  const qrBoxSize = Math.round(cardHeight * 0.70);
  const qrBoxRadius = Math.round(cardRadius * 0.75);
  const cardPaddingH = Math.round(cardWidth * 0.045);
  const cardPaddingV = Math.round(cardHeight * 0.065);

  const usernameLength = (username || '').length;
  const cardholderNameFontSize = Math.max(
    usernameLength > 12 ? 9.5 : 11,
    Math.round(cardWidth * (usernameLength > 12 ? 0.028 : 0.033))
  );
  const cardholderLetterSpacing = Math.max(
    usernameLength > 12 ? 1.1 : 1.6,
    Math.round(cardWidth * (usernameLength > 12 ? 0.0038 : 0.0055))
  );

  // Dynamically update layout width on phone rotation or resizing
  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - containerWidth) > 1) {
      setContainerWidth(w);
    }
  };

  // Keep currentIndex bounded and reset animation values cleanly without any visual snapback
  useEffect(() => {
    if (qrWallets.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= qrWallets.length) {
      setCurrentIndex(0);
    }
    // Seamless reset: the incoming card is already rendered at the top, so values reset smoothly
    pan.setValue({ x: 0, y: 0 });
    fadeAnim.setValue(1);
    stackAnim.setValue(0);
    isSwipingOut.current = false;
  }, [qrWallets.length, currentIndex]);

  const activeWallet = qrWallets[currentIndex] || null;

  const handleCardTap = (wallet: WalletType) => {
    setSelectedWallet(wallet);
    setEnlargedModalVisible(true);
  };

  const handleCardHold = (wallet: WalletType) => {
    try {
      Vibration.vibrate(50);
    } catch (_) { }
    setSelectedWallet(wallet);
    setActionModalVisible(true);
  };

  // Ultra-fluid glitch-free PanResponder (created ONCE via useRef)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,

      // Capture horizontal swipes early so parent ScrollView never cancels horizontal drags
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        if (qrWalletsRef.current.length <= 1 || isSwipingOut.current) return false;
        return (
          Math.abs(gestureState.dx) > 7 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.15
        );
      },

      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (qrWalletsRef.current.length <= 1 || isSwipingOut.current) return false;
        return (
          Math.abs(gestureState.dx) > 7 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.15
        );
      },

      // Strictly lock gesture: prevent parent ScrollView from canceling mid-drag
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: () => {
        pan.stopAnimation();
        stackAnim.stopAnimation();
      },

      onPanResponderMove: (evt, gestureState) => {
        if (isSwipingOut.current) return;
        pan.setValue({ x: gestureState.dx, y: gestureState.dy * 0.1 });
        const width = cardWidthRef.current;
        const progress = Math.min(1, Math.abs(gestureState.dx) / (width * 0.42));
        stackAnim.setValue(progress);
      },

      onPanResponderRelease: (evt, gestureState) => {
        if (isSwipingOut.current) return;

        const width = cardWidthRef.current;
        const swipeThreshold = Math.min(75, width * 0.20);
        const isSwipeRight = gestureState.dx > swipeThreshold || gestureState.vx > 0.35;
        const isSwipeLeft = gestureState.dx < -swipeThreshold || gestureState.vx < -0.35;

        if (isSwipeRight || isSwipeLeft) {
          isSwipingOut.current = true;
          const direction = isSwipeRight ? 1 : -1;
          const exitX = direction * (width * 1.45);

          Animated.parallel([
            Animated.timing(pan.x, {
              toValue: exitX,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(stackAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // GLITCH-FREE HANDOFF:
            // Top card is fully off-screen with opacity 0.
            // 2nd card is at stackAnim = 1 (scale 1.0, translateY 0).
            // Increment index: the useEffect([currentIndex]) will reset values
            // seamlessly right as React renders the promoted card!
            setCurrentIndex((prev) => (prev + 1) % qrWalletsRef.current.length);
          });
        } else {
          // Spring back smoothly with physics
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 7,
              tension: 45,
              useNativeDriver: true,
            }),
            Animated.spring(stackAnim, {
              toValue: 0,
              friction: 7,
              tension: 45,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },

      onPanResponderTerminate: () => {
        if (isSwipingOut.current) return;
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 7,
            tension: 45,
            useNativeDriver: true,
          }),
          Animated.spring(stackAnim, {
            toValue: 0,
            friction: 7,
            tension: 45,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  // If no wallets have a QR code, do not render this section
  if (qrWallets.length === 0 || !activeWallet) {
    return null;
  }

  // Animation interpolations for the active top card
  const rotateInterpolation = pan.x.interpolate({
    inputRange: [-cardWidth, 0, cardWidth],
    outputRange: ['-14deg', '0deg', '14deg'],
  });

  const nextCardOffsetY = Math.round(cardHeight * 0.055);
  const thirdCardOffsetY = Math.round(cardHeight * 0.10);

  // Animation interpolations for the 2nd card (directly below the top card)
  const nextCardScale = stackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
    extrapolate: 'clamp',
  });

  const nextCardTranslateY = stackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [nextCardOffsetY, 0],
    extrapolate: 'clamp',
  });

  const nextCardOpacity = stackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
    extrapolate: 'clamp',
  });

  // Animation interpolations for the 3rd card in stack
  const thirdCardScale = stackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 0.94],
    extrapolate: 'clamp',
  });

  const thirdCardTranslateY = stackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [thirdCardOffsetY, nextCardOffsetY],
    extrapolate: 'clamp',
  });

  const thirdCardOpacity = stackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 0.88],
    extrapolate: 'clamp',
  });

  // Next card in the stack
  const nextWallet = qrWallets.length > 1 ? qrWallets[(currentIndex + 1) % qrWallets.length] : null;
  // 3rd card in stack (if 3 or more wallets)
  const thirdWallet = qrWallets.length > 2 ? qrWallets[(currentIndex + 2) % qrWallets.length] : null;

  // Save the WHOLE card to Gallery
  const handleDownloadCard = async () => {
    if (!wholeCardViewShotRef.current) return;
    try {
      const uri = await captureRef(wholeCardViewShotRef, {
        format: 'png',
        quality: 1,
      });

      // Request only write / photo permissions (never audio)
      try {
        await MediaLibrary.requestPermissionsAsync(true, ['photo']);
      } catch (permErr) {
        console.warn('requestPermissionsAsync warning (bypassing to direct save):', permErr);
      }

      try {
        await MediaLibrary.saveToLibraryAsync(uri);
        setActionModalVisible(false);
        try {
          showFeedback('success', 'Whole Card saved to Gallery!');
        } catch (_) { }
        Alert.alert('Saved to Gallery', 'Your whole card has been saved to your photo gallery.');
        return;
      } catch (saveErr) {
        console.warn('saveToLibraryAsync failed, opening sharing fallback:', saveErr);
      }

      // Seamless fallback: open device share sheet if direct gallery write is restricted
      if (await Sharing.isAvailableAsync()) {
        setActionModalVisible(false);
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Save ${selectedWallet?.name || 'Wallet'} Card`,
        });
      } else {
        Alert.alert('Save Failed', 'Please grant photo permissions in Settings to save cards.');
      }
    } catch (err) {
      console.error('Failed to capture or save whole card:', err);
      try {
        showFeedback('error', 'Failed to save card');
      } catch (_) { }
      Alert.alert('Save Failed', 'Could not save the card to your gallery.');
    }
  };

  // Share the WHOLE card
  const handleShareCard = async () => {
    if (!wholeCardViewShotRef.current) return;
    try {
      const uri = await captureRef(wholeCardViewShotRef, {
        format: 'png',
        quality: 1,
      });
      setActionModalVisible(false);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Share ${selectedWallet?.name || 'Wallet'} Card`,
        });
      } else {
        showFeedback('error', 'Sharing not available on device');
      }
    } catch (err) {
      console.error('Failed to share whole card:', err);
      showFeedback('error', 'Failed to share card');
    }
  };

  // Helper for generating card gradient colors: original color fading into pure white
  const getCardGradient = (wallet: WalletType): [string, string, ...string[]] => {
    const originalColor =
      wallet.color && wallet.color.startsWith('#')
        ? wallet.color
        : colors.primary || '#10b981';
    // Smooth transition from original color to white
    return [originalColor, '#ffffff'];
  };

  // Helper to dynamically calculate font size and line height based on name length
  const getWalletNameStyle = (name: string, cWidth: number) => {
    const len = (name || '').trim().length;
    if (len > 30) {
      return {
        fontSize: Math.max(11, Math.round(cWidth * 0.031)),
        lineHeight: Math.max(14, Math.round(cWidth * 0.038)),
      };
    }
    if (len > 20) {
      return {
        fontSize: Math.max(12.5, Math.round(cWidth * 0.035)),
        lineHeight: Math.max(15.5, Math.round(cWidth * 0.043)),
      };
    }
    if (len > 12) {
      return {
        fontSize: Math.max(14, Math.round(cWidth * 0.040)),
        lineHeight: Math.max(17.5, Math.round(cWidth * 0.049)),
      };
    }
    return {
      fontSize: Math.max(16, Math.round(cWidth * 0.046)),
      lineHeight: Math.max(20, Math.round(cWidth * 0.056)),
    };
  };

  // Renders the authentic ATM / Visa Card content (NO balance or amount display)
  const renderCardContent = (
    wallet: WalletType,
    isTopCard = false,
    customWidth?: number,
    customHeight?: number,
    customRadius?: number
  ) => {
    const cWidth = customWidth || cardWidth;
    const cHeight = customHeight || cardHeight;
    const cRadius = customRadius || cardRadius;
    const cQrSize = Math.round(cHeight * 0.70);
    const cQrRadius = Math.round(cRadius * 0.75);

    const cardColors = getCardGradient(wallet);
    const nameStyle = getWalletNameStyle(wallet.name, cWidth);

    return (
      <LinearGradient
        colors={cardColors}
        start={{ x: 0, y: 0.15 }}
        end={{ x: 1, y: 0.95 }}
        style={[
          styles.cardGradient,
          {
            width: cWidth,
            height: cHeight,
            borderRadius: cRadius,
            paddingHorizontal: Math.round(cWidth * 0.045),
            paddingVertical: Math.round(cHeight * 0.065),
          },
        ]}
      >
        {/* Subtle decorative curved background lines */}
        <View style={styles.cardDecorativeCircle} pointerEvents="none" />
        <View style={styles.cardDecorativeCircle2} pointerEvents="none" />

        {/* Card Body */}
        <View style={styles.cardRow}>
          {/* LEFT: Big QR Code Display */}
          <View style={styles.qrContainer}>
            <View
              style={[
                styles.qrWhiteBox,
                {
                  width: cQrSize,
                  height: cQrSize,
                  borderRadius: cQrRadius,
                },
              ]}
            >
              <Image
                source={{ uri: wallet.qrCodeImage }}
                style={[styles.qrImage, { borderRadius: Math.max(4, cQrRadius - 4) }]}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* RIGHT: ATM / Visa Style Card Details */}
          <View style={[styles.cardDetails, { height: cQrSize }]}>
            {/* Top row: Category Badge (SIM chip and WiFi icon removed) */}
            <View style={styles.cardTopRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText} numberOfLines={1}>
                  {wallet.category ? wallet.category.toUpperCase() : 'WALLET'}
                </Text>
              </View>
            </View>

            {/* Wallet Name: Bold Medium, supports 2 to 3 lines with dynamic sizing */}
            <View style={styles.nameContainer}>
              <Text
                style={[
                  styles.walletNameText,
                  {
                    fontSize: nameStyle.fontSize,
                    lineHeight: nameStyle.lineHeight,
                  },
                ]}
                numberOfLines={3}
              >
                {wallet.name}
              </Text>
            </View>

            {/* User Name in ATM / Visa Embossed Font */}
            <View style={styles.cardholderWrapper}>
              <Text style={styles.cardholderLabel}>CARDHOLDER</Text>
              <Text
                style={[
                  styles.cardholderName,
                  {
                    fontSize: cardholderNameFontSize,
                    letterSpacing: cardholderLetterSpacing,
                  },
                ]}
                numberOfLines={1}
              >
                {username ? username.toUpperCase() : 'VALUED CLIENT'}
              </Text>
            </View>

            {/* Bottom Row: Always identical on all cards to prevent any layout shift */}
            <View style={styles.cardBottomRow}>
              <TouchableOpacity
                style={styles.holdHintPill}
                onPress={() => handleCardHold(wallet)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Download size={10} color="#334155" />
                <Text style={styles.holdHintText}>HOLD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* SECTION HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <QrCode size={17} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Cards</Text>
          {qrWallets.length > 1 && (
            <View style={[styles.countBadge, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
              <Text style={[styles.countBadgeText, { color: colors.primary }]}>{qrWallets.length}</Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {qrWallets.length > 1 && (
            <View style={styles.swipeHintGroup}>
              <Layers size={13} color={colors.textMuted} />
              <Text style={[styles.swipeHintText, { color: colors.textMuted }]}>
                Swipe ({currentIndex + 1}/{qrWallets.length})
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.headerDownloadBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
            onPress={() => activeWallet && handleCardHold(activeWallet)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Download size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* CARD STACK CONTAINER (Exact ID-1 aspect ratio: 85.6mm x 53.98mm) */}
      <View style={[styles.deckContainer, { width: cardWidth, height: deckContainerHeight }]}>
        {/* 3rd Card in Stack (if 3 or more) */}
        {thirdWallet && (
          <Animated.View
            key={`third-${thirdWallet.id}`}
            style={[
              styles.cardWrapper,
              styles.stackedCardThird,
              {
                width: cardWidth,
                height: cardHeight,
                borderRadius: cardRadius,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                transform: [{ scale: thirdCardScale }, { translateY: thirdCardTranslateY }],
                opacity: thirdCardOpacity,
              },
            ]}
          >
            {renderCardContent(thirdWallet, false)}
          </Animated.View>
        )}

        {/* 2nd Card in Stack (The card directly below the top card) */}
        {nextWallet && (
          <Animated.View
            key={`next-${nextWallet.id}`}
            style={[
              styles.cardWrapper,
              styles.stackedCardNext,
              {
                width: cardWidth,
                height: cardHeight,
                borderRadius: cardRadius,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                transform: [
                  { scale: nextCardScale },
                  { translateY: nextCardTranslateY },
                ],
                opacity: nextCardOpacity,
              },
            ]}
          >
            {renderCardContent(nextWallet, false)}
          </Animated.View>
        )}

        {/* TOP ACTIVE CARD (Glitch-free, responsive gesture and fade) */}
        <Animated.View
          key={`top-${activeWallet.id}`}
          {...panResponder.panHandlers}
          style={[
            styles.cardWrapper,
            styles.topCard,
            {
              width: cardWidth,
              height: cardHeight,
              borderRadius: cardRadius,
              opacity: fadeAnim,
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { rotate: rotateInterpolation },
              ],
            },
          ]}
        >
          <Pressable
            onPress={() => handleCardTap(activeWallet)}
            onLongPress={() => handleCardHold(activeWallet)}
            delayLongPress={280}
            style={{ width: '100%', height: '100%' }}
          >
            {renderCardContent(activeWallet, true)}
          </Pressable>
        </Animated.View>
      </View>

      {/* PAGINATION DOTS (If 2 or more wallets) */}
      {qrWallets.length > 1 && (
        <View style={styles.paginationRow}>
          {qrWallets.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  setCurrentIndex(idx);
                  pan.setValue({ x: 0, y: 0 });
                }}
                style={[
                  styles.paginationDot,
                  isActive
                    ? [styles.paginationDotActive, { backgroundColor: colors.primary }]
                    : [styles.paginationDotInactive, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }],
                ]}
              />
            );
          })}
        </View>
      )}

      {/* ACTION MODAL (Triggered on Hold) -> Shows and downloads the WHOLE CARD */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActionModalVisible(false)}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedWallet?.name} Card
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Whole Card Export & Options
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setActionModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
              >
                <X size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* PREVIEW OF THE WHOLE CARD TO BE DOWNLOADED (Wrapped with ViewShot) */}
            <View style={styles.cardPreviewWrapper}>
              <ViewShot
                ref={wholeCardViewShotRef}
                options={{ format: 'png', quality: 1 }}
              >
                <View
                  collapsable={false}
                  style={[
                    styles.cardWrapper,
                    {
                      width: Math.min(cardWidth, 340),
                      height: Math.round(Math.min(cardWidth, 340) / ID1_ASPECT_RATIO),
                      borderRadius: Math.round(Math.min(cardWidth, 340) * ID1_RADIUS_RATIO),
                      position: 'relative',
                    },
                  ]}
                >
                  {selectedWallet &&
                    renderCardContent(
                      selectedWallet,
                      false,
                      Math.min(cardWidth, 340),
                      Math.round(Math.min(cardWidth, 340) / ID1_ASPECT_RATIO),
                      Math.round(Math.min(cardWidth, 340) * ID1_RADIUS_RATIO)
                    )}
                </View>
              </ViewShot>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
                onPress={handleDownloadCard}
                activeOpacity={0.8}
              >
                <Download size={18} color="#ffffff" />
                <Text style={styles.modalActionBtnText}>Download Whole Card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtnSecondary, { borderColor: colors.border, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc' }]}
                onPress={handleShareCard}
                activeOpacity={0.8}
              >
                <Share2 size={18} color={colors.text} />
                <Text style={[styles.modalActionBtnTextSecondary, { color: colors.text }]}>Share Whole Card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtnSecondary, { borderColor: colors.border, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc' }]}
                onPress={() => {
                  setActionModalVisible(false);
                  setEnlargedModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Maximize2 size={18} color={colors.text} />
                <Text style={[styles.modalActionBtnTextSecondary, { color: colors.text }]}>Enlarge QR Code Only</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ENLARGED QR CODE MODAL (For instant merchant scanning) */}
      <Modal
        visible={enlargedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEnlargedModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.enlargedModalOverlay}
          activeOpacity={1}
          onPress={() => setEnlargedModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.enlargedModalBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.enlargedHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.enlargedTitle, { color: colors.text }]}>
                  {selectedWallet?.name || 'QR Code'}
                </Text>
                <Text style={[styles.enlargedSubtitle, { color: colors.textMuted }]}>
                  {username ? username.toUpperCase() : 'CARDHOLDER'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setEnlargedModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* High-contrast QR Display Box (No shadow) */}
            <View style={[styles.enlargedQrBox, { borderColor: colors.border }]}>
              {selectedWallet?.qrCodeImage ? (
                <Image
                  source={{ uri: selectedWallet.qrCodeImage }}
                  style={styles.enlargedQrImage}
                  resizeMode="contain"
                />
              ) : null}
            </View>

            {/* Quick Actions */}
            <View style={styles.enlargedActionsRow}>
              <TouchableOpacity
                style={[styles.enlargedActionBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setEnlargedModalVisible(false);
                  setActionModalVisible(true);
                }}
              >
                <Download size={18} color="#ffffff" />
                <Text style={styles.enlargedActionText}>Save Whole Card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.enlargedActionBtn,
                  {
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setEnlargedModalVisible(false)}
              >
                <Text style={[styles.enlargedActionText, { color: colors.text }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
    width: '100%',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
    marginLeft: 2,
  },
  countBadgeText: {
    fontSize: 11,
    fontFamily: theme.fonts.bold,
  },
  swipeHintGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swipeHintText: {
    fontSize: 11,
    fontFamily: theme.fonts.medium,
  },
  headerDownloadBtn: {
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cardWrapper: {
    overflow: 'hidden',
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
  },
  topCard: {
    zIndex: 10,
  },
  stackedCardNext: {
    zIndex: 8,
  },
  stackedCardThird: {
    zIndex: 6,
    opacity: 0.72,
  },
  cardGradient: {
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  cardDecorativeCircle: {
    position: 'absolute',
    top: -40,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  cardDecorativeCircle2: {
    position: 'absolute',
    bottom: -50,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0, 0, 0, 0.025)',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWhiteBox: {
    backgroundColor: '#ffffff',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  categoryBadgeText: {
    fontSize: 8.5,
    fontFamily: theme.fonts.bold,
    color: '#334155',
    letterSpacing: 0.8,
  },
  nameContainer: {
    height: 44,
    justifyContent: 'center',
  },
  walletNameText: {
    fontFamily: theme.fonts.bold,
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  cardholderWrapper: {
    height: 32,
    justifyContent: 'center',
  },
  cardholderLabel: {
    fontSize: 7.5,
    fontFamily: theme.fonts.semiBold,
    color: '#64748b',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  cardholderName: {
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  cardBottomRow: {
    height: 22,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  holdHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  holdHintText: {
    fontSize: 8,
    fontFamily: theme.fonts.bold,
    color: '#334155',
    letterSpacing: 0.8,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  paginationDot: {
    height: 5,
    borderRadius: 2.5,
  },
  paginationDotActive: {
    width: 18,
  },
  paginationDotInactive: {
    width: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
  },
  cardPreviewWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    paddingVertical: 6,
  },
  modalActions: {
    gap: 10,
    marginTop: 10,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  modalActionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: theme.fonts.semiBold,
  },
  modalActionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalActionBtnTextSecondary: {
    fontSize: 14,
    fontFamily: theme.fonts.semiBold,
  },
  enlargedModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  enlargedModalBox: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  enlargedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 16,
  },
  enlargedTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
  },
  enlargedSubtitle: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  enlargedQrBox: {
    width: 250,
    height: 250,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    marginBottom: 20,
  },
  enlargedQrImage: {
    width: '100%',
    height: '100%',
  },
  enlargedActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  enlargedActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  enlargedActionText: {
    fontSize: 13,
    fontFamily: theme.fonts.semiBold,
    color: '#ffffff',
  },
});
