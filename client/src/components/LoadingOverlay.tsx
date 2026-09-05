import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Modal } from 'react-native';
import { theme } from '../theme';
import { Leaf } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';

export default function LoadingOverlay() {
  return null;
}


const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderBox: {
    backgroundColor: colors.card,
    padding: theme.spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: isDarkMode ? 0.3 : 0.2,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 160,
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: colors.border,
  },
  loadingText: {
    marginTop: 16,
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
});
