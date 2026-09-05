import React from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TotalBalanceWidget } from '../widgets/TotalBalanceWidget';
import { TotalExpenseWidget } from '../widgets/TotalExpenseWidget';

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
    gradientFrom: '#34d399',
    gradientTo: '#059669',
    previewColor: '#10b981',
    borderColor: '#6ee7b7',
    accentColor: '#ffffff',
    subTextColor: '#ecfdf5',
    incomeBtnColor: '#047857',
    expenseBtnColor: '#e11d48',
    pillBgColor: '#047857',
  },
  {
    id: 'onyx',
    name: 'Indigo Sky',
    gradientFrom: '#818cf8',
    gradientTo: '#4f46e5',
    previewColor: '#6366f1',
    borderColor: '#a5b4fc',
    accentColor: '#ffffff',
    subTextColor: '#eef2ff',
    incomeBtnColor: '#3730a3',
    expenseBtnColor: '#e11d48',
    pillBgColor: '#3730a3',
  },
  {
    id: 'spruce',
    name: 'Ocean Blue',
    gradientFrom: '#38bdf8',
    gradientTo: '#0284c7',
    previewColor: '#0ea5e9',
    borderColor: '#7dd3fc',
    accentColor: '#ffffff',
    subTextColor: '#f0f9ff',
    incomeBtnColor: '#0369a1',
    expenseBtnColor: '#e11d48',
    pillBgColor: '#0369a1',
  },
  {
    id: 'violet',
    name: 'Royal Amethyst',
    gradientFrom: '#c084fc',
    gradientTo: '#7c3aed',
    previewColor: '#9333ea',
    borderColor: '#d8b4fe',
    accentColor: '#ffffff',
    subTextColor: '#faf5ff',
    incomeBtnColor: '#581c87',
    expenseBtnColor: '#e11d48',
    pillBgColor: '#581c87',
  },
  {
    id: 'cherry',
    name: 'Cherry Crimson',
    gradientFrom: '#fb7185',
    gradientTo: '#e11d48',
    previewColor: '#f43f5e',
    borderColor: '#fda4af',
    accentColor: '#ffffff',
    subTextColor: '#fff1f2',
    incomeBtnColor: '#059669',
    expenseBtnColor: '#9f1239',
    pillBgColor: '#9f1239',
  },
  {
    id: 'gold',
    name: 'Golden Amber',
    gradientFrom: '#fbbf24',
    gradientTo: '#d97706',
    previewColor: '#f59e0b',
    borderColor: '#fde68a',
    accentColor: '#ffffff',
    subTextColor: '#fffbeb',
    incomeBtnColor: '#059669',
    expenseBtnColor: '#dc2626',
    pillBgColor: '#92400e',
  },
  {
    id: 'slate',
    name: 'Aqua Teal',
    gradientFrom: '#2dd4bf',
    gradientTo: '#0d9488',
    previewColor: '#14b8a6',
    borderColor: '#5eead4',
    accentColor: '#ffffff',
    subTextColor: '#f0fdfa',
    incomeBtnColor: '#0f766e',
    expenseBtnColor: '#e11d48',
    pillBgColor: '#0f766e',
  },
];

export interface WidgetConfig {
  themeId: string;
  showWalletCount: boolean;
  showExpense?: boolean;
  showQuote?: boolean;
  showQuickActions?: boolean;
  hideBalance: boolean;
  currencySymbol: string;
  customTitle: string;
}

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  themeId: 'emerald',
  showWalletCount: true,
  showExpense: true,
  showQuote: false,
  showQuickActions: false,
  hideBalance: false,
  currencySymbol: '₱',
  customTitle: 'LEON',
};

const STORAGE_KEY_BALANCE = '@leon_widget_total_balance';
const STORAGE_KEY_WALLET_COUNT = '@leon_widget_wallet_count';
const STORAGE_KEY_EXPENSE = '@leon_widget_total_expense';
const STORAGE_KEY_EXPENSE_COUNT = '@leon_widget_expense_count';
const STORAGE_KEY_LAST_UPDATED = '@leon_widget_last_updated';
const STORAGE_KEY_CONFIG = '@leon_widget_config';

export interface WidgetData {
  balance: number;
  walletCount: number;
  expense: number;
  expenseCount: number;
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
    await syncWidgetBalance(cachedData.balance, cachedData.walletCount, config, cachedData.expense, cachedData.expenseCount);
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
    const [balanceStr, countStr, expenseStr, expCountStr, updatedStr, config] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_BALANCE),
      AsyncStorage.getItem(STORAGE_KEY_WALLET_COUNT),
      AsyncStorage.getItem(STORAGE_KEY_EXPENSE),
      AsyncStorage.getItem(STORAGE_KEY_EXPENSE_COUNT),
      AsyncStorage.getItem(STORAGE_KEY_LAST_UPDATED),
      getWidgetConfig(),
    ]);

    const balance = balanceStr ? parseFloat(balanceStr) : 0;
    const walletCount = countStr ? parseInt(countStr, 10) : 1;
    const expense = expenseStr ? parseFloat(expenseStr) : 0;
    const expenseCount = expCountStr ? parseInt(expCountStr, 10) : 0;
    const lastUpdated = updatedStr || new Date().toISOString();

    return {
      balance: isNaN(balance) ? 0 : balance,
      walletCount: isNaN(walletCount) ? 1 : walletCount,
      expense: isNaN(expense) ? 0 : expense,
      expenseCount: isNaN(expenseCount) ? 0 : expenseCount,
      lastUpdated,
      config,
    };
  } catch (error) {
    console.warn('[WidgetService] Failed to load cached widget data:', error);
    return {
      balance: 0,
      walletCount: 1,
      expense: 0,
      expenseCount: 0,
      lastUpdated: new Date().toISOString(),
      config: { ...DEFAULT_WIDGET_CONFIG },
    };
  }
}

/**
 * Synchronizes the total balance, total expense, wallet count and config to persistent storage
 * and requests an immediate update to all active home screen widgets on Android.
 */
export async function syncWidgetBalance(
  balance?: number,
  walletCount?: number,
  customConfig?: WidgetConfig,
  expense?: number,
  expenseCount?: number
): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const config = customConfig || (await getWidgetConfig());

    // If balance, expense or walletCount not passed, read from storage
    let currentBalance = balance;
    let currentWalletCount = walletCount;
    let currentExpense = expense;
    let currentExpenseCount = expenseCount;

    if (currentBalance === undefined || currentWalletCount === undefined || currentExpense === undefined || currentExpenseCount === undefined) {
      const cached = await getCachedWidgetData();
      if (currentBalance === undefined) currentBalance = cached.balance;
      if (currentWalletCount === undefined) currentWalletCount = cached.walletCount;
      if (currentExpense === undefined) currentExpense = cached.expense;
      if (currentExpenseCount === undefined) currentExpenseCount = cached.expenseCount;
    }

    // 1. Cache to AsyncStorage
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_BALANCE, currentBalance.toString()),
      AsyncStorage.setItem(STORAGE_KEY_WALLET_COUNT, currentWalletCount.toString()),
      AsyncStorage.setItem(STORAGE_KEY_EXPENSE, currentExpense.toString()),
      AsyncStorage.setItem(STORAGE_KEY_EXPENSE_COUNT, currentExpenseCount.toString()),
      AsyncStorage.setItem(STORAGE_KEY_LAST_UPDATED, now),
    ]);

    // 2. Request Android Native Widget Update if on Android
    if (Platform.OS === 'android') {
      try {
        const { requestWidgetUpdate } = require('react-native-android-widget');
        await Promise.all([
          requestWidgetUpdate({
            widgetName: 'TotalBalanceWidget',
            renderWidget: () =>
              React.createElement(TotalBalanceWidget, {
                balance: currentBalance,
                walletCount: currentWalletCount,
                expense: currentExpense,
                expenseCount: currentExpenseCount,
                currency: config.currencySymbol || '₱',
                config,
              }),
          }),
          requestWidgetUpdate({
            widgetName: 'TotalExpenseWidget',
            renderWidget: () =>
              React.createElement(TotalExpenseWidget, {
                expense: currentExpense,
                expenseCount: currentExpenseCount,
                currency: config.currencySymbol || '₱',
                config,
              }),
          }),
        ]);
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

/**
 * Requests the Android launcher to prompt the user to pin the Total Expense widget
 * directly to their phone's home screen.
 */
export async function requestPinTotalExpenseWidget(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const { requestPinWidget } = require('react-native-android-widget');
    const result = await requestPinWidget({
      widgetName: 'TotalExpenseWidget',
    });
    return !!result;
  } catch (error) {
    console.warn('[WidgetService] requestPinWidget failed or not supported by launcher:', error);
    return false;
  }
}
