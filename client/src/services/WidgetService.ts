import React from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TotalBalanceWidget } from '../widgets/TotalBalanceWidget';
import type { ColorProp } from 'react-native-android-widget';

export type HexColorString = `#${string}`;

export interface WidgetThemeOption {
  id: string;
  name: string;
  gradientFrom: HexColorString;
  gradientTo: HexColorString;
  previewColor: HexColorString;
  borderColor: HexColorString;
  accentColor: HexColorString;
  subTextColor: HexColorString;
  incomeBtnColor: HexColorString;
  expenseBtnColor: HexColorString;
  pillBgColor: HexColorString;
}

export const WIDGET_THEMES: WidgetThemeOption[] = [
  {
    id: 'emerald',
    name: 'Emerald Leaf',
    gradientFrom: '#064e3b',
    gradientTo: '#022c22',
    previewColor: '#064e3b',
    borderColor: '#059669',
    accentColor: '#34d399',
    subTextColor: '#a7f3d0',
    incomeBtnColor: '#10b981',
    expenseBtnColor: '#ef4444',
    pillBgColor: '#065f46',
  },
  {
    id: 'onyx',
    name: 'Midnight Onyx',
    gradientFrom: '#18181b',
    gradientTo: '#09090b',
    previewColor: '#09090b',
    borderColor: '#3f3f46',
    accentColor: '#e4e4e7',
    subTextColor: '#a1a1aa',
    incomeBtnColor: '#22c55e',
    expenseBtnColor: '#f43f5e',
    pillBgColor: '#27272a',
  },
  {
    id: 'spruce',
    name: 'Deep Ocean',
    gradientFrom: '#0c4a6e',
    gradientTo: '#082f49',
    previewColor: '#0c4a6e',
    borderColor: '#0284c7',
    accentColor: '#38bdf8',
    subTextColor: '#7dd3fc',
    incomeBtnColor: '#0ea5e9',
    expenseBtnColor: '#f43f5e',
    pillBgColor: '#0369a1',
  },
  {
    id: 'violet',
    name: 'Royal Amethyst',
    gradientFrom: '#581c87',
    gradientTo: '#2e1065',
    previewColor: '#581c87',
    borderColor: '#7c3aed',
    accentColor: '#c084fc',
    subTextColor: '#d8b4fe',
    incomeBtnColor: '#8b5cf6',
    expenseBtnColor: '#f43f5e',
    pillBgColor: '#6b21a8',
  },
  {
    id: 'cherry',
    name: 'Cherry Crimson',
    gradientFrom: '#881337',
    gradientTo: '#4c0519',
    previewColor: '#881337',
    borderColor: '#e11d48',
    accentColor: '#fb7185',
    subTextColor: '#fecdd3',
    incomeBtnColor: '#f43f5e',
    expenseBtnColor: '#be123c',
    pillBgColor: '#9f1239',
  },
  {
    id: 'gold',
    name: 'Golden Amber',
    gradientFrom: '#78350f',
    gradientTo: '#451a03',
    previewColor: '#78350f',
    borderColor: '#d97706',
    accentColor: '#fbbf24',
    subTextColor: '#fde68a',
    incomeBtnColor: '#f59e0b',
    expenseBtnColor: '#ef4444',
    pillBgColor: '#92400e',
  },
  {
    id: 'slate',
    name: 'Titanium Slate',
    gradientFrom: '#334155',
    gradientTo: '#0f172a',
    previewColor: '#1e293b',
    borderColor: '#64748b',
    accentColor: '#94a3b8',
    subTextColor: '#cbd5e1',
    incomeBtnColor: '#10b981',
    expenseBtnColor: '#ef4444',
    pillBgColor: '#475569',
  },
];

export interface WidgetConfig {
  themeId: string;
  showWalletCount: boolean;
  showQuickActions: boolean;
  hideBalance: boolean;
  currencySymbol: string;
  customTitle: string;
}

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  themeId: 'emerald',
  showWalletCount: true,
  showQuickActions: true,
  hideBalance: false,
  currencySymbol: '₱',
  customTitle: 'LEAPON',
};

const STORAGE_KEY_BALANCE = '@leapon_widget_total_balance';
const STORAGE_KEY_WALLET_COUNT = '@leapon_widget_wallet_count';
const STORAGE_KEY_LAST_UPDATED = '@leapon_widget_last_updated';
const STORAGE_KEY_CONFIG = '@leapon_widget_config';

export interface WidgetData {
  balance: number;
  walletCount: number;
  lastUpdated: string;
  config: WidgetConfig;
}

/**
 * Retrieves the saved widget configuration.
 */
export async function getWidgetConfig(): Promise<WidgetConfig> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return { ...DEFAULT_WIDGET_CONFIG };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_WIDGET_CONFIG, ...parsed };
  } catch (e) {
    console.warn('[WidgetService] Failed to load widget config:', e);
    return { ...DEFAULT_WIDGET_CONFIG };
  }
}

/**
 * Saves the widget configuration to persistent storage and triggers an update.
 */
export async function saveWidgetConfig(config: WidgetConfig): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    const cachedData = await getCachedWidgetData();
    await syncWidgetBalance(cachedData.balance, cachedData.walletCount, config);
    return true;
  } catch (e) {
    console.warn('[WidgetService] Failed to save widget config:', e);
    return false;
  }
}

/**
 * Retrieves the cached widget data from storage including config.
 */
export async function getCachedWidgetData(): Promise<WidgetData> {
  try {
    const [balanceStr, countStr, updatedStr, config] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_BALANCE),
      AsyncStorage.getItem(STORAGE_KEY_WALLET_COUNT),
      AsyncStorage.getItem(STORAGE_KEY_LAST_UPDATED),
      getWidgetConfig(),
    ]);

    const balance = balanceStr ? parseFloat(balanceStr) : 0;
    const walletCount = countStr ? parseInt(countStr, 10) : 1;
    const lastUpdated = updatedStr || new Date().toISOString();

    return {
      balance: isNaN(balance) ? 0 : balance,
      walletCount: isNaN(walletCount) ? 1 : walletCount,
      lastUpdated,
      config,
    };
  } catch (error) {
    console.warn('[WidgetService] Failed to load cached widget data:', error);
    return {
      balance: 0,
      walletCount: 1,
      lastUpdated: new Date().toISOString(),
      config: { ...DEFAULT_WIDGET_CONFIG },
    };
  }
}

/**
 * Synchronizes the total balance, wallet count and config to persistent storage
 * and requests an immediate update to all active home screen widgets on Android.
 */
export async function syncWidgetBalance(
  balance?: number,
  walletCount?: number,
  customConfig?: WidgetConfig
): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const config = customConfig || (await getWidgetConfig());

    // If balance or walletCount not passed, read from storage
    let currentBalance = balance;
    let currentWalletCount = walletCount;

    if (currentBalance === undefined || currentWalletCount === undefined) {
      const cached = await getCachedWidgetData();
      if (currentBalance === undefined) currentBalance = cached.balance;
      if (currentWalletCount === undefined) currentWalletCount = cached.walletCount;
    }

    // 1. Cache to AsyncStorage
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_BALANCE, currentBalance.toString()),
      AsyncStorage.setItem(STORAGE_KEY_WALLET_COUNT, currentWalletCount.toString()),
      AsyncStorage.setItem(STORAGE_KEY_LAST_UPDATED, now),
    ]);

    // 2. Request Android Native Widget Update if on Android
    if (Platform.OS === 'android') {
      try {
        const { requestWidgetUpdate } = require('react-native-android-widget');
        await requestWidgetUpdate({
          widgetName: 'TotalBalanceWidget',
          renderWidget: () =>
            React.createElement(TotalBalanceWidget, {
              balance: currentBalance,
              walletCount: currentWalletCount,
              currency: config.currencySymbol || '₱',
              config,
            }),
        });
        return true;
      } catch (nativeError) {
        console.warn('[WidgetService] requestWidgetUpdate not available or failed:', nativeError);
      }
    }
    return true;
  } catch (error) {
    console.warn('[WidgetService] Error syncing widget balance:', error);
    return false;
  }
}

/**
 * Requests the Android launcher to prompt the user to pin the Total Balance widget
 * directly to their phone's home screen.
 */
export async function requestPinTotalBalanceWidget(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const { requestPinWidget } = require('react-native-android-widget');
    const result = await requestPinWidget({
      widgetName: 'TotalBalanceWidget',
    });
    return !!result;
  } catch (error) {
    console.warn('[WidgetService] requestPinWidget failed or not supported by launcher:', error);
    return false;
  }
}
