import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, PanResponder, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
  colors: any;
  isDarkMode: boolean;
}

const PRESETS = [
  '#EF4444', '#F97316', '#FACC15', '#4ADE80', '#2DD4BF', '#3B82F6', '#6366F1',
  '#EC4899', '#F43F5E', '#A855F7', '#8B5CF6', '#0EA5E9', '#10B981', '#84CC16'
];

const hexToHsv = (hex: string) => {
  let r = 0, g = 0, b = 0;
  let hInput = hex.startsWith('#') ? hex : '#' + hex;
  if (hInput.length === 4) {
    r = parseInt(hInput[1] + hInput[1], 16);
    g = parseInt(hInput[2] + hInput[2], 16);
    b = parseInt(hInput[3] + hInput[3], 16);
  } else if (hInput.length === 7) {
    r = parseInt(hInput.substring(1, 3), 16);
    g = parseInt(hInput.substring(3, 5), 16);
    b = parseInt(hInput.substring(5, 7), 16);
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToHex = (h: number, s: number, v: number) => {
  h /= 360; s /= 100; v /= 100;
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

export default function AdvancedColorPicker({ color, onColorChange, colors, isDarkMode }: ColorPickerProps) {
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [hexInput, setHexInput] = useState(color);
  
  const containerWidth = Dimensions.get('window').width - 80;
  const areaHeight = 180;

  // Track color updates from parent
  useEffect(() => {
    const normalizedColor = color.toUpperCase();
    const normalizedInput = hexInput.toUpperCase();
    if (normalizedColor !== normalizedInput) {
      setHexInput(color);
      setHsv(hexToHsv(color));
    }
  }, [color]);

  const areaLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const hueLayout = useRef({ x: 0, width: 0 });

  const updateColor = (newHsv: { h: number, s: number, v: number }) => {
    setHsv(newHsv);
    const newHex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setHexInput(newHex);
    onColorChange(newHex);
  };

  const handleAreaTouch = (evt: any) => {
    const { pageX, pageY } = evt.nativeEvent;
    const s = Math.max(0, Math.min(100, ((pageX - areaLayout.current.x) / areaLayout.current.width) * 100));
    const v = Math.max(0, Math.min(100, 100 - ((pageY - areaLayout.current.y) / areaLayout.current.height) * 100));
    updateColor({ h: hsvRef.current.h, s, v });
  };

  const handleHueTouch = (evt: any) => {
    const { pageX } = evt.nativeEvent;
    const h = Math.max(0, Math.min(360, ((pageX - hueLayout.current.x) / hueLayout.current.width) * 360));
    updateColor({ ...hsvRef.current, h });
  };

  const panResponderArea = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: handleAreaTouch,
    onPanResponderMove: handleAreaTouch,
  }), []);

  const panResponderHue = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: handleHueTouch,
    onPanResponderMove: handleHueTouch,
  }), []);

  // Keep hsv in ref to avoid re-creating panResponders or stale closures
  const hsvRef = useRef(hsv);
  useEffect(() => {
    hsvRef.current = hsv;
  }, [hsv]);

  return (
    <View style={styles.container}>
      {/* Area Picker (S/V) */}
      <View 
        {...panResponderArea.panHandlers}
        ref={(ref) => {
          if (ref) {
            ref.measure((x, y, width, height, pageX, pageY) => {
              areaLayout.current = { x: pageX, y: pageY, width, height };
            });
          }
        }}
        style={[styles.areaPicker, { width: containerWidth, height: areaHeight, backgroundColor: hsvToHex(hsv.h, 100, 100) }]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View 
          style={[
            styles.cursor, 
            { 
              left: (hsv.s / 100) * containerWidth - 8, 
              top: (1 - hsv.v / 100) * areaHeight - 8,
              backgroundColor: hexInput
            }
          ]} 
        />
      </View>

      {/* Hue Slider (Rainbow) */}
      <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Hue</Text>
      <View 
        {...panResponderHue.panHandlers}
        ref={(ref) => {
          if (ref) {
            ref.measure((x, y, width, height, pageX, pageY) => {
              hueLayout.current = { x: pageX, width };
            });
          }
        }}
        style={[styles.hueSlider, { width: containerWidth }]}
      >
        <LinearGradient
          colors={['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.hueGradient}
        />
        <View 
          style={[
            styles.hueCursor, 
            { left: (hsv.h / 360) * containerWidth - 10 }
          ]} 
        />
      </View>

      {/* Hex Input */}
      <View style={styles.hexRow}>
        <View style={styles.hexBox}>
          <Text style={[styles.hexLabel, { color: colors.textMuted }]}>HEX</Text>
          <View style={[styles.hexInputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderColor: colors.border }]}>
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>#</Text>
            <TextInput
              style={[styles.hexInput, { color: colors.text }]}
              value={hexInput.replace('#', '')}
              onChangeText={(t) => {
                const h = t.startsWith('#') ? t : '#' + t;
                setHexInput(h);
                if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(h)) {
                  onColorChange(h);
                  setHsv(hexToHsv(h));
                }
              }}
              maxLength={6}
              autoCapitalize="characters"
            />
          </View>
        </View>
        <View style={[styles.colorPreviewSmall, { backgroundColor: hexInput }]} />
      </View>

      {/* Presets */}
      <Text style={[styles.label, { color: colors.text, marginTop: 20, marginBottom: 12 }]}>Saved colors:</Text>
      <View style={styles.presetGrid}>
        {PRESETS.map((p) => (
          <TouchableOpacity 
            key={p} 
            style={[styles.presetCircle, { backgroundColor: p }, hexInput.toUpperCase() === p.toUpperCase() && { borderWidth: 2, borderColor: colors.primary }]} 
            onPress={() => {
              onColorChange(p);
              setHexInput(p);
              setHsv(hexToHsv(p));
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  areaPicker: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cursor: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  label: {
    alignSelf: 'flex-start',
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hueSlider: {
    height: 12,
    borderRadius: 6,
    marginTop: 8,
    position: 'relative',
  },
  hueGradient: {
    flex: 1,
    borderRadius: 6,
  },
  hueCursor: {
    position: 'absolute',
    top: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  hexRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 24,
    gap: 16,
    width: '100%',
  },
  hexBox: {
    flex: 1,
  },
  hexLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    marginBottom: 4,
  },
  hexInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  hexInput: {
    flex: 1,
    marginLeft: 4,
    fontFamily: theme.fonts.bold,
    fontSize: 16,
  },
  colorPreviewSmall: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  presetCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
