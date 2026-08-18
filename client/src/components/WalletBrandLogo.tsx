import React from 'react';
import { View, Text, StyleSheet, Image as RNImage, ViewStyle } from 'react-native';
import Svg, { Path, Rect, Circle, G, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LOCAL_BRAND_ASSETS, PHILIPPINE_BANKS_AND_WALLETS } from '../constants/philippineBanks';

interface WalletBrandLogoProps {
  logoKey?: string;
  size?: number;
  style?: ViewStyle | any;
  showBorder?: boolean;
}

export default function WalletBrandLogo({
  logoKey,
  size = 40,
  style,
  showBorder = false,
}: WalletBrandLogoProps) {
  if (!logoKey) {
    return (
      <View style={[styles.fallbackContainer, { width: size, height: size, borderRadius: size * 0.25 }, style]}>
        <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>₱</Text>
      </View>
    );
  }

  // 1. If it matches a bundled local image asset (e.g. gcash.png, maya.png, etc.)
  if (LOCAL_BRAND_ASSETS[logoKey]) {
    return (
      <RNImage
        source={LOCAL_BRAND_ASSETS[logoKey]}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size * 0.22,
            resizeMode: 'contain',
          },
          style,
        ]}
      />
    );
  }

  const bankInfo = PHILIPPINE_BANKS_AND_WALLETS.find(b => b.id === logoKey);
  const borderRadius = size * 0.24;

  // 2. Custom Crafted SVG / Vector Brand Logos for Philippine Banks
  switch (logoKey) {
    case 'bdo':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#002D72', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="bdoGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#00358e" />
                <Stop offset="100%" stopColor="#001d4a" />
              </SvgLinearGradient>
            </Defs>
            <Rect width="100" height="100" rx="24" fill="url(#bdoGrad)" />
            {/* Signature Yellow BDO Stripe */}
            <Rect x="14" y="58" width="72" height="10" rx="5" fill="#FFC72C" />
            <SvgText
              x="50"
              y="50"
              fill="#ffffff"
              fontSize="34"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
              letterSpacing="2"
            >
              BDO
            </SvgText>
          </Svg>
        </View>
      );

    case 'bpi':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#A41D24', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="bpiGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#b91c1c" />
                <Stop offset="100%" stopColor="#7f1d1d" />
              </SvgLinearGradient>
            </Defs>
            <Rect width="100" height="100" rx="24" fill="url(#bpiGrad)" />
            {/* BPI Gold Diamond Insignia */}
            <Circle cx="50" cy="30" r="12" fill="#F59E0B" />
            <Circle cx="50" cy="30" r="8" fill="#7f1d1d" />
            <SvgText
              x="50"
              y="74"
              fill="#ffffff"
              fontSize="32"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="System"
              letterSpacing="3"
            >
              BPI
            </SvgText>
          </Svg>
        </View>
      );

    case 'metrobank':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#002D62', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#002D62" />
            {/* Metrobank Blue Shapes */}
            <Path d="M 28 26 L 46 26 L 36 74 L 18 74 Z" fill="#0099FF" />
            <Path d="M 48 26 L 66 26 L 56 74 L 38 74 Z" fill="#ffffff" />
            <SvgText
              x="76"
              y="60"
              fill="#ffffff"
              fontSize="28"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
            >
              M
            </SvgText>
          </Svg>
        </View>
      );

    case 'unionbank':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#F47920', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="ubpGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#f97316" />
                <Stop offset="100%" stopColor="#ea580c" />
              </SvgLinearGradient>
            </Defs>
            <Rect width="100" height="100" rx="24" fill="url(#ubpGrad)" />
            {/* Stylized UnionBank 'U' */}
            <Path
              d="M 30 25 L 30 52 C 30 66 40 76 50 76 C 60 76 70 66 70 52 L 70 25 L 56 25 L 56 50 C 56 56 53 60 50 60 C 47 60 44 56 44 50 L 44 25 Z"
              fill="#ffffff"
            />
          </Svg>
        </View>
      );

    case 'landbank':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#006600', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#006600" />
            <Circle cx="50" cy="34" r="16" fill="#F59E0B" />
            <Path d="M 50 20 C 56 28 56 40 50 48 C 44 40 44 28 50 20 Z" fill="#006600" />
            <SvgText
              x="50"
              y="78"
              fill="#ffffff"
              fontSize="20"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
              letterSpacing="1"
            >
              LANDBANK
            </SvgText>
          </Svg>
        </View>
      );

    case 'securitybank':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#008037', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#008037" />
            {/* Interlocking Rings */}
            <Circle cx="40" cy="38" r="18" fill="none" stroke="#00A850" strokeWidth="8" />
            <Circle cx="60" cy="38" r="18" fill="none" stroke="#0284C7" strokeWidth="8" />
            <SvgText
              x="50"
              y="80"
              fill="#ffffff"
              fontSize="19"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
            >
              SECURITY
            </SvgText>
          </Svg>
        </View>
      );

    case 'seabank':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#FF5722', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#ff6e40" />
                <Stop offset="100%" stopColor="#e64a19" />
              </SvgLinearGradient>
            </Defs>
            <Rect width="100" height="100" rx="24" fill="url(#seaGrad)" />
            {/* SeaBank S Curve */}
            <Path
              d="M 64 34 C 64 26 56 22 48 22 C 38 22 32 28 32 36 C 32 50 68 46 68 62 C 68 72 58 78 48 78 C 36 78 30 70 30 62 L 42 62 C 42 66 45 69 50 69 C 55 69 58 66 58 62 C 58 50 22 52 22 36 C 22 24 32 14 48 14 C 62 14 74 22 74 34 Z"
              fill="#ffffff"
            />
          </Svg>
        </View>
      );

    case 'rcbc':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#003882', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#003882" />
            <Path d="M 20 20 L 40 20 L 50 40 L 40 60 L 20 60 Z" fill="#00A3E0" />
            <Path d="M 50 40 L 60 20 L 80 20 L 70 40 L 80 60 L 60 60 Z" fill="#FFC72C" />
            <SvgText
              x="50"
              y="86"
              fill="#ffffff"
              fontSize="24"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
            >
              RCBC
            </SvgText>
          </Svg>
        </View>
      );

    case 'pnb':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#002060', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#002060" />
            <Circle cx="50" cy="36" r="14" fill="#FFD100" />
            <SvgText
              x="50"
              y="80"
              fill="#ffffff"
              fontSize="30"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="System"
              letterSpacing="2"
            >
              PNB
            </SvgText>
          </Svg>
        </View>
      );

    case 'chinabank':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#A31F34', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#A31F34" />
            <Rect x="25" y="22" width="50" height="26" rx="6" fill="#ffffff" />
            <SvgText
              x="50"
              y="42"
              fill="#A31F34"
              fontSize="18"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
            >
              CBC
            </SvgText>
            <SvgText
              x="50"
              y="78"
              fill="#ffffff"
              fontSize="17"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
            >
              CHINABANK
            </SvgText>
          </Svg>
        </View>
      );

    case 'eastwest':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#5A2582', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#5A2582" />
            <Circle cx="50" cy="36" r="16" fill="#D946EF" />
            <SvgText
              x="50"
              y="80"
              fill="#ffffff"
              fontSize="18"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
            >
              EASTWEST
            </SvgText>
          </Svg>
        </View>
      );

    case 'cimb':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#7B0014', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#7B0014" />
            <Path d="M 22 25 L 50 50 L 22 75 Z" fill="#E11D48" />
            <SvgText
              x="62"
              y="58"
              fill="#ffffff"
              fontSize="24"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="System"
            >
              CIMB
            </SvgText>
          </Svg>
        </View>
      );

    case 'tonik':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#8000FF', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#8000FF" />
            <SvgText
              x="50"
              y="66"
              fill="#00FFA3"
              fontSize="48"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="System"
            >
              t!
            </SvgText>
          </Svg>
        </View>
      );

    case 'unobank':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#1856F3', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#1856F3" />
            <SvgText
              x="50"
              y="60"
              fill="#ffffff"
              fontSize="30"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="System"
              letterSpacing="2"
            >
              UNO
            </SvgText>
          </Svg>
        </View>
      );

    case 'psbank':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#0054A6', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#0054A6" />
            <Rect x="15" y="58" width="70" height="8" fill="#F59E0B" rx="4" />
            <SvgText
              x="50"
              y="50"
              fill="#ffffff"
              fontSize="24"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
            >
              PSBank
            </SvgText>
          </Svg>
        </View>
      );

    case 'dbp':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#0C2340', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#0C2340" />
            <Circle cx="50" cy="50" r="36" fill="none" stroke="#FFC72C" strokeWidth="4" />
            <SvgText
              x="50"
              y="58"
              fill="#ffffff"
              fontSize="28"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="System"
            >
              DBP
            </SvgText>
          </Svg>
        </View>
      );

    case 'grabpay':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#00B14F', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#00B14F" />
            <SvgText
              x="50"
              y="48"
              fill="#ffffff"
              fontSize="26"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
            >
              Grab
            </SvgText>
            <SvgText
              x="50"
              y="74"
              fill="#ffffff"
              fontSize="20"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
            >
              Pay
            </SvgText>
          </Svg>
        </View>
      );

    case 'shopeepay':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#EE4D2D', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#EE4D2D" />
            {/* Shopee Bag / S Shape */}
            <Circle cx="50" cy="30" r="12" fill="none" stroke="#ffffff" strokeWidth="5" />
            <Rect x="26" y="30" width="48" height="48" rx="8" fill="#ffffff" />
            <SvgText
              x="50"
              y="64"
              fill="#EE4D2D"
              fontSize="34"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="System"
            >
              S
            </SvgText>
          </Svg>
        </View>
      );

    case 'coinsph':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#0070F3', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#0070F3" />
            <Circle cx="50" cy="40" r="18" fill="#ffffff" />
            <Circle cx="50" cy="40" r="12" fill="#0070F3" />
            <SvgText
              x="50"
              y="82"
              fill="#ffffff"
              fontSize="20"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
            >
              COINS
            </SvgText>
          </Svg>
        </View>
      );

    case 'palawanpay':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#008037', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#008037" />
            <Circle cx="50" cy="32" r="14" fill="#F59E0B" />
            <SvgText
              x="50"
              y="62"
              fill="#ffffff"
              fontSize="18"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
            >
              Palawan
            </SvgText>
            <SvgText
              x="50"
              y="82"
              fill="#F59E0B"
              fontSize="18"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
            >
              PAY
            </SvgText>
          </Svg>
        </View>
      );

    case 'cebuana':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#BE1622', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#BE1622" />
            <SvgText
              x="50"
              y="48"
              fill="#F59E0B"
              fontSize="18"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="System"
            >
              CEBUANA
            </SvgText>
            <SvgText
              x="50"
              y="74"
              fill="#ffffff"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="System"
            >
              LHUILLIER
            </SvgText>
          </Svg>
        </View>
      );

    case 'diskartech':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#00BCD4', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#00BCD4" />
            <SvgText
              x="50"
              y="60"
              fill="#ffffff"
              fontSize="52"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="System"
            >
              D!
            </SvgText>
          </Svg>
        </View>
      );

    case 'komo':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#00C9A7', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#00C9A7" />
            <SvgText
              x="50"
              y="62"
              fill="#ffffff"
              fontSize="28"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="System"
              letterSpacing="2"
            >
              komo
            </SvgText>
          </Svg>
        </View>
      );

    case 'ownbank':
      return (
        <View style={[styles.badgeBase, { width: size, height: size, backgroundColor: '#E6B800', borderRadius }, style]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Rect width="100" height="100" rx="24" fill="#E6B800" />
            <SvgText
              x="50"
              y="62"
              fill="#0F172A"
              fontSize="26"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="System"
            >
              Own
            </SvgText>
          </Svg>
        </View>
      );

    default:
      // Generic Stylized Badge for Any Bank/Wallet ID
      const brandColor = bankInfo?.brandColor || '#3B82F6';
      const shortText = bankInfo?.shortName || logoKey.substring(0, 3).toUpperCase();
      return (
        <View
          style={[
            styles.badgeBase,
            {
              width: size,
              height: size,
              backgroundColor: brandColor,
              borderRadius,
            },
            style,
          ]}
        >
          <Text
            style={[
              styles.genericBadgeText,
              {
                fontSize: size > 40 ? 16 : size * 0.35,
                color: bankInfo?.textColor || '#ffffff',
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {shortText}
          </Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  badgeBase: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallbackContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  genericBadgeText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
