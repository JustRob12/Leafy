import { useWindowDimensions, Dimensions } from 'react-native';

/**
 * Returns a clamped scale factor relative to standard mobile width (375pt).
 * We use the minimum dimension so that landscape orientation does not blow up
 * font sizes or button heights based on the wide screen edge.
 */
export const getResponsiveScale = (width: number, height: number): number => {
  const minDimension = Math.min(width, height);
  const rawScale = minDimension / 375;
  // Clamped between 0.85 (compact devices) and 1.22 (large tablets)
  return Math.min(Math.max(rawScale, 0.85), 1.22);
};

/**
 * Static responsive font scale calculation.
 * Safe to call outside of components or in StyleSheet factories.
 */
export const rf = (size: number): number => {
  const { width, height } = Dimensions.get('window');
  const scale = getResponsiveScale(width, height);
  return Math.round(size * scale);
};

export interface ResponsiveInfo {
  width: number;
  height: number;
  isLandscape: boolean;
  isTablet: boolean;
  sidebarWidth: number;
  contentWidth: number;
  minDimension: number;
  maxDimension: number;
  scale: number;
  rf: (size: number) => number;
  contentMaxWidth: number;
  formMaxWidth: number;
  modalMaxWidth: number;
  getGridColumns: (minItemWidth?: number, gap?: number, maxCols?: number) => number;
}

/**
 * Hook providing dynamic window dimensions and responsive layout flags.
 * Automatically triggers component re-render on orientation changes (portrait <-> landscape)
 * or tablet split-screen resizing.
 */
export const useResponsive = (): ResponsiveInfo => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);
  
  // Tablet check: shortest dimension >= 600 or width >= 768
  const isTablet = minDimension >= 600 || width >= 768;
  const scale = getResponsiveScale(width, height);

  const sidebarWidth = isLandscape ? (isTablet ? 250 : 215) : 0;
  const contentWidth = width - sidebarWidth;

  const rfDynamic = (size: number) => Math.round(size * scale);

  const getGridColumns = (minItemWidth = 160, gap = 12, maxCols = 6): number => {
    const availableWidth = contentWidth - 40; // Screen padding relative to content width
    const cols = Math.floor((availableWidth + gap) / (minItemWidth + gap));
    return Math.max(1, Math.min(cols, maxCols));
  };

  return {
    width,
    height,
    isLandscape,
    isTablet,
    sidebarWidth,
    contentWidth,
    minDimension,
    maxDimension,
    scale,
    rf: rfDynamic,
    contentMaxWidth: isTablet ? 1040 : isLandscape ? 860 : width,
    formMaxWidth: isTablet || isLandscape ? 680 : width,
    modalMaxWidth: isTablet || isLandscape ? 520 : width,
    getGridColumns,
  };
};
