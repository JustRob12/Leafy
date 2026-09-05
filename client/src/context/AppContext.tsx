import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palettes, TreeType } from '../theme';
import { requestNotificationPermissions, syncAllNotifications, notifyGoalCompletion, updateBadgeCount } from '../services/NotificationService';
import { saveImagePermanently, saveBase64Image } from '../services/FileService';
import { syncWidgetBalance, saveWidgetConfig, DEFAULT_WIDGET_CONFIG } from '../services/WidgetService';

export type WalletCategory = 'E-Wallet' | 'Banks' | 'Personal';

export type WalletType = {
  id: string;
  name: string;
  purpose: string;
  balance: number; // PHP balance
  usdBalance?: number; // USD balance
  qrCodeImage?: string;
  iconType?: 'purpose' | 'preset' | 'custom';
  presetLogo?: string;
  customIcon?: string;
  color?: string;
  category: WalletCategory;
  interestRate?: number; // Annual interest rate in %
  lastInterestDate?: string; // ISO date of last interest credit
};

export type TransactionType = {
  id: string;
  title: string;
  amount: number;
  currency?: 'PHP' | 'USD';
  exchangeRate?: number;
  date: string;
  type: 'deposit' | 'withdrawal';
  walletId: string;
  icon?: string; // Optional icon name for withdrawals
  category?: 'transfer' | 'expense' | 'income' | 'interest';
};

export const getTransactionAmountInPhp = (tx: TransactionType, usdRate: number): number => {
  if (tx.currency === 'USD') {
    return tx.amount * usdRate;
  }
  return tx.amount;
};

export const getWalletTotalBalanceInPhp = (wallet: WalletType, usdRate: number): number => {
  const phpBal = wallet.balance || 0;
  const usdBal = (wallet.usdBalance || 0) * usdRate;
  return phpBal + usdBal;
};

export type GoalType = {
  id: string;
  title: string;
  targetAmount: number;
  walletId: string;
  imageUrl?: string;
  description?: string;
};

export type ReceivableType = {
  id: string;
  personName: string;
  taskName: string;
  amount: number;
  date: string;
};

export type DebtType = {
  id: string;
  personName: string;
  taskName: string;
  amount: number;
  date: string;
  dueDate?: string;
};

export type GroceryItemType = {
  id: string;
  name: string;
  quantity: string;
  price?: number;
  completed: boolean;
};

export type GroceryListType = {
  id: string;
  title: string;
  items: GroceryItemType[];
  date: string;
  scheduledDays?: number[]; // [0-6] where 0 is Sunday
};

export type TravelType = {
  id: string;
  name: string;
  location: string;
  expenses: number;
  startDate: string;
  endDate: string;
  isSingleDay?: boolean;
  images?: string[];
};

export type WithdrawPresetType = {
  id: string;
  name: string;
  iconName: string;
};

export const DEFAULT_WITHDRAW_PRESETS: WithdrawPresetType[] = [
  { id: '1', name: 'Food', iconName: 'Utensils' },
  { id: '2', name: 'Fare', iconName: 'Car' },
  { id: '3', name: 'Bills', iconName: 'Receipt' },
  { id: '4', name: 'Health', iconName: 'Heart' },
  { id: '5', name: 'Shopping', iconName: 'ShoppingBag' },
  { id: '6', name: 'Coffee', iconName: 'Coffee' },
  { id: '7', name: 'Gift', iconName: 'Gift' },
  { id: '8', name: 'Gaming', iconName: 'Gamepad' },
  { id: '9', name: 'Travel', iconName: 'Map' },
  { id: '10', name: 'Music', iconName: 'Music' },
  { id: '11', name: 'Phone', iconName: 'Smartphone' },
  { id: '12', name: 'Others', iconName: 'MoreHorizontal' },
];

export type IncomePresetType = {
  id: string;
  name: string;
  iconName: string;
};

export const DEFAULT_INCOME_PRESETS: IncomePresetType[] = [
  { id: '1', name: 'Salary', iconName: 'Briefcase' },
  { id: '2', name: 'Freelance', iconName: 'Laptop' },
  { id: '3', name: 'Business', iconName: 'Store' },
  { id: '4', name: 'Allowance', iconName: 'Coins' },
  { id: '5', name: 'Bonus', iconName: 'Award' },
  { id: '6', name: 'Investment', iconName: 'TrendingUp' },
  { id: '7', name: 'Gift', iconName: 'Gift' },
  { id: '8', name: 'Rental', iconName: 'Home' },
  { id: '9', name: 'Refund', iconName: 'Receipt' },
  { id: '10', name: 'Side Hustle', iconName: 'Sparkles' },
  { id: '11', name: 'Selling', iconName: 'ShoppingBag' },
  { id: '12', name: 'Others', iconName: 'MoreHorizontal' },
];

export type RecursionType = {
  id: string;
  companyName: string;
  amount: number;
  walletId: string;
  frequency: 'monthly' | 'weekly' | 'bi-monthly';
  dayOfMonth?: number; // 1-31
  dayOfWeek?: number; // 0-6
  startDate?: string; // e.g. "2024-04-22"
  lastProcessedDate?: string; // e.g. "2024-04-22"
  date: string;
};

export type SubscriptionType = {
  id: string;
  title: string;
  amount: number;
  dayOfMonth: number;
  date: string;
  icon?: string;
};

export const calculateNextDueDate = (startDateStr: string, paidMonths: number): string => {
  if (!startDateStr) return new Date().toISOString().split('T')[0];
  const parts = startDateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return startDateStr;
  
  const targetDate = new Date(y, (m - 1) + (paidMonths + 1), d);
  const outY = targetDate.getFullYear();
  const outM = targetDate.getMonth() + 1;
  const outD = targetDate.getDate();
  
  const mm = outM < 10 ? `0${outM}` : `${outM}`;
  const dd = outD < 10 ? `0${outD}` : `${outD}`;
  return `${outY}-${mm}-${dd}`;
};

export type InstallmentType = {
  id: string;
  productName: string;
  totalAmount: number;
  monthlyAmount: number;
  monthsToPay: number;
  paidMonths: number;
  startDate: string; // ISO date string e.g. "2026-05-01"
  dueDate: string; // ISO date string calculated from startDate + (paidMonths + 1)
  walletId?: string; // Optional linked wallet for auto-deduction
  currency?: 'PHP' | 'USD';
  date: string;
  notes?: string;
};

export type RentType = {
  id: string;
  propertyName: string; // e.g. "Boarding House", "Apartment Unit 4B"
  location: string; // e.g. "Sampaloc, Manila", "Makati City"
  monthlyAmount: number;
  currency?: 'PHP' | 'USD';
  startDate: string; // ISO date string e.g. "2026-05-01"
  dueDate: string; // Next payment due date calculated monthly
  paidCycles: number; // Number of months paid
  walletId?: string; // Optional auto-deduct wallet
  notes?: string;
  date: string;
};

type AppContextType = {
  isLoaded: boolean;
  username: string | null;
  setUsername: (name: string) => Promise<void>;
  wallets: WalletType[];
  addWallet: (walletData: Omit<WalletType, 'id' | 'balance'>) => Promise<void>;
  editWallet: (id: string, walletData: Partial<Omit<WalletType, 'id' | 'balance'>>) => Promise<void>;
  transactions: TransactionType[];
  addTransaction: (tx: Omit<TransactionType, 'id' | 'date'>, options?: { skipFeedback?: boolean }) => Promise<void>;
  goals: GoalType[];
  addGoal: (goal: Omit<GoalType, 'id'>) => Promise<void>;
  reorderWallets: (newWallets: WalletType[]) => Promise<void>;
  editGoal: (id: string, updates: Partial<GoalType>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  receivables: ReceivableType[];
  addReceivable: (receivable: Omit<ReceivableType, 'id' | 'date'>) => Promise<void>;
  editReceivable: (id: string, updates: Partial<ReceivableType>) => Promise<void>;
  deleteReceivable: (id: string) => Promise<void>;
  totalReceivables: number;
  debts: DebtType[];
  addDebt: (debt: Omit<DebtType, 'id' | 'date'>) => Promise<void>;
  editDebt: (id: string, updates: Partial<DebtType>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  totalDebts: number;
  totalBalance: number;
  clearData: () => Promise<void>;
  feedback: { visible: boolean; type: 'success' | 'delete' | 'error'; message: string };
  showFeedback: (type: 'success' | 'delete' | 'error', message: string) => void;
  closeFeedback: () => void;
  confirmState: { visible: boolean; title: string; message: string; isDestructive?: boolean; onConfirm?: () => void };
  showConfirm: (title: string, message: string, onConfirm: () => void, isDestructive?: boolean) => void;
  closeConfirm: () => void;
  loading: boolean;
  userImage: string | null;
  setUserImage: (image: string | null) => Promise<void>;
  importData: (jsonString: string) => Promise<void>;
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  treeType: TreeType;
  setTreeType: (type: TreeType) => Promise<void>;
  colors: any;
  groceryLists: GroceryListType[];
  addGroceryList: (title: string, scheduledDays?: number[]) => Promise<void>;
  editGroceryList: (id: string, newTitle: string, scheduledDays?: number[]) => Promise<void>;
  deleteGroceryList: (id: string) => Promise<void>;
  addGroceryItem: (listId: string, item: Omit<GroceryItemType, 'id' | 'completed'>) => Promise<void>;
  deleteGroceryItem: (listId: string, itemId: string) => Promise<void>;
  toggleGroceryItem: (listId: string, itemId: string) => Promise<void>;
  travels: TravelType[];
  addTravel: (travel: Omit<TravelType, 'id'>) => Promise<void>;
  editTravel: (id: string, updates: Partial<TravelType>) => Promise<void>;
  deleteTravel: (id: string) => Promise<void>;
  appPin: string | null;
  isSecurityEnabled: boolean;
  isUnlocked: boolean;
  setAppPin: (pin: string | null) => Promise<void>;
  toggleSecurity: (enabled: boolean) => Promise<void>;
  isBiometricsEnabled: boolean;
  toggleBiometrics: (enabled: boolean) => Promise<void>;
  unlockApp: () => void;
  payReceivable: (id: string, amount: number, walletId: string) => Promise<void>;
  payDebt: (id: string, amount: number) => Promise<void>;
  streakCount: number;
  transactionDates: string[];
  statusCardBg: string | null;
  setStatusCardBg: (image: string | null) => Promise<void>;
  isTutorialActive: boolean;
  startTutorial: () => void;
  stopTutorial: () => void;
  withdrawPresets: WithdrawPresetType[];
  addWithdrawPreset: (name: string, iconName: string) => Promise<WithdrawPresetType>;
  deleteWithdrawPreset: (id: string) => Promise<void>;
  incomePresets: IncomePresetType[];
  addIncomePreset: (name: string, iconName: string) => Promise<IncomePresetType>;
  deleteIncomePreset: (id: string) => Promise<void>;
  recursions: RecursionType[];
  addRecursion: (recursion: Omit<RecursionType, 'id' | 'date'>) => Promise<void>;
  editRecursion: (id: string, updates: Partial<Omit<RecursionType, 'id' | 'date'>>) => Promise<void>;
  deleteRecursion: (id: string) => Promise<void>;
  processRecursion: (id: string) => Promise<void>;
  isNotificationsEnabled: boolean;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  subscriptions: SubscriptionType[];
  addSubscription: (subscription: Omit<SubscriptionType, 'id' | 'date'>) => Promise<void>;
  editSubscription: (id: string, updates: Partial<Omit<SubscriptionType, 'id' | 'date'>>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  transferMoney: (fromWalletId: string, toWalletId: string, amount: number, tax?: number, currency?: 'PHP' | 'USD') => Promise<void>;
  usdToPhpRate: number;
  usdToPhpRateDate: string | null;
  refreshUsdToPhpRate: () => Promise<void>;
  installments: InstallmentType[];
  addInstallment: (installment: Omit<InstallmentType, 'id' | 'dueDate' | 'date'> & { startDate: string; paidMonths?: number }) => Promise<void>;
  editInstallment: (id: string, updates: Partial<InstallmentType>) => Promise<void>;
  deleteInstallment: (id: string) => Promise<void>;
  payInstallmentMonth: (id: string, walletId?: string) => Promise<void>;
  rents: RentType[];
  addRent: (rent: Omit<RentType, 'id' | 'dueDate' | 'paidCycles' | 'date'> & { startDate: string; paidCycles?: number }) => Promise<void>;
  editRent: (id: string, updates: Partial<RentType>) => Promise<void>;
  deleteRent: (id: string) => Promise<void>;
  payRentMonth: (id: string, walletId?: string) => Promise<void>;
};


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [username, setUserNameState] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [receivables, setReceivables] = useState<ReceivableType[]>([]);
  const [debts, setDebts] = useState<DebtType[]>([]);
  const [groceryLists, setGroceryLists] = useState<GroceryListType[]>([]);
  const [travels, setTravels] = useState<TravelType[]>([]);
  const [withdrawPresets, setWithdrawPresets] = useState<WithdrawPresetType[]>(DEFAULT_WITHDRAW_PRESETS);
  const [incomePresets, setIncomePresets] = useState<IncomePresetType[]>(DEFAULT_INCOME_PRESETS);
  const [recursions, setRecursions] = useState<RecursionType[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([]);
  const [installments, setInstallments] = useState<InstallmentType[]>([]);
  const [rents, setRents] = useState<RentType[]>([]);
  const [userImage, setUserImageState] = useState<string | null>(null);
  const [appPin, setAppPinState] = useState<string | null>(null);
  const [isSecurityEnabled, setIsSecurityEnabled] = useState(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusCardBg, setStatusCardBgState] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [treeType, setTreeTypeState] = useState<TreeType>('emerald');
  const [feedback, setFeedback] = useState<{ visible: boolean; type: 'success' | 'delete' | 'error'; message: string }>({
    visible: false,
    type: 'success',
    message: ''
  });
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [confirmState, setConfirmState] = useState<{ visible: boolean; title: string; message: string; isDestructive?: boolean; onConfirm?: () => void }>({
    visible: false,
    title: '',
    message: '',
    isDestructive: true
  });
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [usdToPhpRate, setUsdToPhpRate] = useState<number>(58.50);
  const [usdToPhpRateDate, setUsdToPhpRateDate] = useState<string | null>(null);

  const fetchWithTimeout = async (url: string, ms = 3000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  };

  const fetchUsdToPhpRate = async (): Promise<number> => {
    try {
      const response = await fetchWithTimeout('https://api.frankfurter.app/latest?from=USD&to=PHP', 3000);
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates && data.rates.PHP) {
          const rate = Number(data.rates.PHP);
          setUsdToPhpRate(rate);
          setUsdToPhpRateDate(data.date || new Date().toISOString());
          await AsyncStorage.setItem('@usdToPhpRate', String(rate));
          await AsyncStorage.setItem('@usdToPhpRateDate', data.date || new Date().toISOString());
          return rate;
        }
      }
    } catch (e) {
      // Fast fallback if offline or API unavailable
    }

    try {
      const response = await fetchWithTimeout('https://open.er-api.com/v6/latest/USD', 3000);
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates && data.rates.PHP) {
          const rate = Number(data.rates.PHP);
          setUsdToPhpRate(rate);
          setUsdToPhpRateDate(new Date().toISOString());
          await AsyncStorage.setItem('@usdToPhpRate', String(rate));
          await AsyncStorage.setItem('@usdToPhpRateDate', new Date().toISOString());
          return rate;
        }
      }
    } catch (e) {
      // Fast fallback if offline or API unavailable
    }

    const storedRate = await AsyncStorage.getItem('@usdToPhpRate');
    if (storedRate) {
      const parsed = parseFloat(storedRate);
      if (!isNaN(parsed) && parsed > 0) {
        setUsdToPhpRate(parsed);
        return parsed;
      }
    }

    return 58.50;
  };

  const refreshUsdToPhpRate = async () => {
    await fetchUsdToPhpRate();
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedName = await AsyncStorage.getItem('@username');
      const storedTransactions = await AsyncStorage.getItem('@transactions');
      const storedGoals = await AsyncStorage.getItem('@goals');
      const storedReceivables = await AsyncStorage.getItem('@receivables');
      const storedDebts = await AsyncStorage.getItem('@debts');
      const storedImage = await AsyncStorage.getItem('@userImage');

      const parsedTransactions: TransactionType[] = storedTransactions ? JSON.parse(storedTransactions) : [];
      if (storedName) setUserNameState(storedName);
      if (storedGoals) setGoals(JSON.parse(storedGoals));
      if (storedReceivables) setReceivables(JSON.parse(storedReceivables));
      if (storedDebts) setDebts(JSON.parse(storedDebts));
      const storedRecursions = await AsyncStorage.getItem('@recursions');
      if (storedRecursions) setRecursions(JSON.parse(storedRecursions));
      const storedSubscriptions = await AsyncStorage.getItem('@subscriptions');
      if (storedSubscriptions) setSubscriptions(JSON.parse(storedSubscriptions));
      const storedInstallments = await AsyncStorage.getItem('@installments');
      if (storedInstallments) setInstallments(JSON.parse(storedInstallments));

      const storedRents = await AsyncStorage.getItem('@rents');
      if (storedRents) setRents(JSON.parse(storedRents));
      const storedGrocery = await AsyncStorage.getItem('@groceryLists');
      if (storedGrocery) setGroceryLists(JSON.parse(storedGrocery));
      const storedWallets = await AsyncStorage.getItem('@wallets');
      if (storedWallets) {
        const parsedWallets: WalletType[] = JSON.parse(storedWallets);
        const { updatedWallets, newTransactions } = processDailyInterest(parsedWallets);
        
        setWallets(updatedWallets);
        if (newTransactions.length > 0) {
          const allTransactions = [...newTransactions, ...parsedTransactions];
          setTransactions(allTransactions);
          await AsyncStorage.setItem('@transactions', JSON.stringify(allTransactions));
        } else {
          setTransactions(parsedTransactions);
        }

        if (JSON.stringify(updatedWallets) !== JSON.stringify(parsedWallets)) {
           await AsyncStorage.setItem('@wallets', JSON.stringify(updatedWallets));
        }
      } else {
        setTransactions(parsedTransactions);
      }
      const storedPresets = await AsyncStorage.getItem('@withdrawPresets');
      if (storedPresets && JSON.parse(storedPresets).length > 0) {
        setWithdrawPresets(JSON.parse(storedPresets));
      } else {
        setWithdrawPresets(DEFAULT_WITHDRAW_PRESETS);
        await AsyncStorage.setItem('@withdrawPresets', JSON.stringify(DEFAULT_WITHDRAW_PRESETS));
      }
      const storedIncomePresets = await AsyncStorage.getItem('@incomePresets');
      if (storedIncomePresets && JSON.parse(storedIncomePresets).length > 0) {
        setIncomePresets(JSON.parse(storedIncomePresets));
      } else {
        setIncomePresets(DEFAULT_INCOME_PRESETS);
        await AsyncStorage.setItem('@incomePresets', JSON.stringify(DEFAULT_INCOME_PRESETS));
      }
      if (storedImage) setUserImageState(storedImage);
      const storedStatusBg = await AsyncStorage.getItem('@statusCardBg');
      if (storedStatusBg) setStatusCardBgState(storedStatusBg);

      const storedPin = await AsyncStorage.getItem('@appPin');
      const storedSecurity = await AsyncStorage.getItem('@isSecurityEnabled');
      const storedBiometrics = await AsyncStorage.getItem('@isBiometricsEnabled');

      if (storedPin) setAppPinState(storedPin);
      if (storedBiometrics) setIsBiometricsEnabled(storedBiometrics === 'true');

      if (storedSecurity) {
        const enabled = storedSecurity === 'true';
        setIsSecurityEnabled(enabled);
        if (!enabled) setIsUnlocked(true);
      } else {
        setIsUnlocked(true);
      }

      const storedTheme = await AsyncStorage.getItem('@isDarkMode');
      if (storedTheme !== null) {
        setIsDarkMode(storedTheme === 'true');
      }

      const storedNotifs = await AsyncStorage.getItem('@isNotificationsEnabled');
      if (storedNotifs !== null) {
        setIsNotificationsEnabled(storedNotifs === 'true');
      }

      const storedTreeType = await AsyncStorage.getItem('@treeType');
      if (storedTreeType !== null) {
        setTreeTypeState(storedTreeType as TreeType);
      }

      const storedUsdRate = await AsyncStorage.getItem('@usdToPhpRate');
      const storedUsdRateDate = await AsyncStorage.getItem('@usdToPhpRateDate');
      if (storedUsdRate) setUsdToPhpRate(parseFloat(storedUsdRate));
      if (storedUsdRateDate) setUsdToPhpRateDate(storedUsdRateDate);
      fetchUsdToPhpRate();
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (recursions.length > 0) {
        checkAndProcessRecursions();
      }
      
      const setupNotifications = async () => {
        if (isNotificationsEnabled) {
          const hasPermission = await requestNotificationPermissions();
          if (hasPermission) {
            syncAllNotifications(debts, groceryLists, installments, subscriptions, rents, recursions, goals, true);
          }
        } else {
          syncAllNotifications(debts, groceryLists, installments, subscriptions, rents, recursions, goals, false);
        }
      };
      setupNotifications();
    }
  }, [isLoaded, recursions.length, debts, groceryLists, installments, subscriptions, rents, goals, isNotificationsEnabled]);

  useEffect(() => {
    if (isLoaded) {
      syncAllNotifications(debts, groceryLists, installments, subscriptions, rents, recursions, goals, isNotificationsEnabled);
    }
  }, [debts, groceryLists, installments, subscriptions, rents, recursions, goals, isNotificationsEnabled]);

  useEffect(() => {
    if (isLoaded) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isDueTodayOrOverdue = (dateStr?: string) => {
        if (!dateStr) return false;
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          d.setHours(0, 0, 0, 0);
          return d.getTime() <= today.getTime();
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        d.setHours(0, 0, 0, 0);
        return d.getTime() <= today.getTime();
      };

      const todayIndex = today.getDay();
      const todayDateNumber = today.getDate();

      const todayDebts = debts.filter(d => isDueTodayOrOverdue(d.dueDate)).length;
      const todayGroceries = groceryLists.filter(list => 
        list.scheduledDays && list.scheduledDays.includes(todayIndex)
      ).length;
      const todaySubs = subscriptions.filter(s => s.dayOfMonth === todayDateNumber).length;
      const todayInstalls = installments.filter(i => i.paidMonths < i.monthsToPay && isDueTodayOrOverdue(i.dueDate)).length;
      const todayRents = rents.filter(r => isDueTodayOrOverdue(r.dueDate)).length;

      updateBadgeCount(todayDebts + todayGroceries + todaySubs + todayInstalls + todayRents);
    }
  }, [isLoaded, debts, groceryLists, subscriptions, installments, rents]);

  // Auto-process daily interest whenever app resumes from background or wakes up offline
  useEffect(() => {
    const handleAppStateChange = (nextState: string) => {
      if (nextState === 'active' && isLoaded) {
        setWallets(prevWallets => {
          const { updatedWallets, newTransactions } = processDailyInterest(prevWallets);
          if (newTransactions.length > 0) {
            setTransactions(prevTxs => {
              const merged = [...newTransactions, ...prevTxs];
              AsyncStorage.setItem('@transactions', JSON.stringify(merged));
              return merged;
            });
            AsyncStorage.setItem('@wallets', JSON.stringify(updatedWallets));
            
            const totalEarned = newTransactions.reduce((sum, t) => sum + t.amount, 0);
            showFeedback('success', `+₱${totalEarned.toFixed(2)} Daily Interest Credited!`);
            return updatedWallets;
          }
          return prevWallets;
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isLoaded]);

  const checkAndProcessRecursions = async () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentDay = today.getDate();
    const currentDayOfWeek = today.getDay();
    
    let hasChanges = false;
    const newTransactions: TransactionType[] = [];
    
    const getLastDayOfMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
    
    const updatedRecursions = recursions.map((r) => {
      if (r.lastProcessedDate === todayStr) return r;

      let shouldProcess = false;

      if (r.frequency === 'weekly') {
        if (currentDayOfWeek === r.dayOfWeek) {
          shouldProcess = true;
        }
      } else if (r.frequency === 'monthly') {
        const lastMonthProcessed = r.lastProcessedDate ? r.lastProcessedDate.substring(0, 7) : '';
        const currentMonthStr = todayStr.substring(0, 7);
        if (currentDay >= (r.dayOfMonth || 1) && lastMonthProcessed !== currentMonthStr) {
          shouldProcess = true;
        }
      } else if (r.frequency === 'bi-monthly') {
        if (r.startDate) {
          const start = new Date(r.startDate);
          start.setHours(0, 0, 0, 0);
          const now = new Date(today);
          now.setHours(0, 0, 0, 0);

          if (now >= start) {
            const diffTime = Math.abs(now.getTime() - start.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays % 15 === 0) {
              shouldProcess = true;
            }
          }
        } else {
          const lastDay = getLastDayOfMonth(today.getFullYear(), today.getMonth() + 1);
          const targetDate1 = 15;
          const targetDate2 = Math.min(30, lastDay);
          
          const lastProcessedDay = r.lastProcessedDate ? parseInt(r.lastProcessedDate.split('-')[2]) : 0;
          const lastMonthProcessed = r.lastProcessedDate ? r.lastProcessedDate.substring(0, 7) : '';
          const currentMonthStr = todayStr.substring(0, 7);

          if (currentDay >= targetDate1 && currentDay < targetDate2) {
            if (lastMonthProcessed !== currentMonthStr || lastProcessedDay < targetDate1) {
              shouldProcess = true;
            }
          } else if (currentDay >= targetDate2) {
            if (lastMonthProcessed !== currentMonthStr || lastProcessedDay < targetDate2) {
              shouldProcess = true;
            }
          }
        }
      }

      if (shouldProcess) {
        hasChanges = true;
        
        const newTx: TransactionType = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          title: `${r.companyName} (${r.frequency === 'bi-monthly' ? '15-Day' : r.frequency.charAt(0).toUpperCase() + r.frequency.slice(1)} Auto-Recurring)`,
          amount: r.amount,
          date: today.toISOString(),
          type: 'deposit',
          walletId: r.walletId,
        };
        
        newTransactions.push(newTx);
        return { ...r, lastProcessedDate: todayStr };
      }
      return r;
    });

    if (hasChanges) {
      setRecursions(updatedRecursions);
      await AsyncStorage.setItem('@recursions', JSON.stringify(updatedRecursions));
      
      const allTx = [...newTransactions, ...transactions];
      setTransactions(allTx);
      await AsyncStorage.setItem('@transactions', JSON.stringify(allTx));
      
      const updatedWallets = wallets.map(w => {
        const matchingTxs = newTransactions.filter(tx => tx.walletId === w.id);
        const addedAmount = matchingTxs.reduce((sum, tx) => sum + tx.amount, 0);
        return { ...w, balance: w.balance + addedAmount };
      });
      setWallets(updatedWallets);
      await AsyncStorage.setItem('@wallets', JSON.stringify(updatedWallets));
      
      showFeedback('success', `Auto-processed ${newTransactions.length} recurring incomes`);
    }
  };

  const processDailyInterest = (currentWallets: WalletType[]): { updatedWallets: WalletType[]; newTransactions: TransactionType[] } => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const newTransactions: TransactionType[] = [];
    
    const updatedWallets = currentWallets.map(wallet => {
      const rate = typeof wallet.interestRate === 'number' ? wallet.interestRate : parseFloat(String(wallet.interestRate || '0'));
      if (!rate || rate <= 0 || !wallet.balance || wallet.balance <= 0) {
        return wallet;
      }

      // If lastInterestDate is not set, set it to yesterday midnight so interest starts today
      let lastDate: Date;
      if (wallet.lastInterestDate) {
        const d = new Date(wallet.lastInterestDate);
        lastDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      } else {
        lastDate = new Date(todayMidnight.getTime() - 24 * 60 * 60 * 1000);
      }
      
      const diffMs = todayMidnight.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays >= 1) {
        let runningBalance = wallet.balance;
        const dailyRate = (rate / 100) / 365;

        // Process each elapsed day individually for accurate compounding & offline catch-up
        for (let dayOffset = 1; dayOffset <= diffDays; dayOffset++) {
          const creditedDay = new Date(lastDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
          creditedDay.setHours(6, 0, 0, 0); // 6:00 AM standard bank credit time

          const dayInterest = runningBalance * dailyRate;
          const roundedDayInterest = Number(dayInterest.toFixed(2));

          if (roundedDayInterest >= 0.01) {
            const txId = `int-${creditedDay.getTime()}-${wallet.id}-${dayOffset}`;
            newTransactions.push({
              id: txId,
              title: `Daily Interest - ${wallet.name} (${rate}% p.a.)`,
              amount: roundedDayInterest,
              date: creditedDay.toISOString(),
              type: 'deposit',
              walletId: wallet.id,
              category: 'interest',
            });

            runningBalance += roundedDayInterest;
          }
        }

        return {
          ...wallet,
          balance: Number(runningBalance.toFixed(2)),
          lastInterestDate: todayMidnight.toISOString(),
        };
      }
      return wallet;
    });

    return { updatedWallets, newTransactions };
  };

  const setUsername = async (name: string) => {
    await AsyncStorage.setItem('@username', name);
    setUserNameState(name);
  };

  const addWallet = async (walletData: Omit<WalletType, 'id' | 'balance'>) => {
    const permanentQr = await saveImagePermanently(walletData.qrCodeImage);
    const permanentIcon = await saveImagePermanently(walletData.customIcon);

    const newWallet: WalletType = {
      ...walletData,
      id: Date.now().toString(),
      balance: 0,
      qrCodeImage: permanentQr || undefined,
      customIcon: permanentIcon || undefined,
      lastInterestDate: (walletData.interestRate && walletData.interestRate > 0) ? (walletData.lastInterestDate || new Date().toISOString()) : undefined,
    };
    const updated = [...wallets, newWallet];
    setWallets(updated);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updated));
    showFeedback('success', 'Wallet Created');
  };

  const addTransaction = async (txData: Omit<TransactionType, 'id' | 'date'>, options?: { skipFeedback?: boolean }) => {
    const txCurrency = txData.currency || 'PHP';
    const newTx: TransactionType = {
      ...txData,
      currency: txCurrency,
      exchangeRate: txCurrency === 'USD' ? usdToPhpRate : 1,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    await AsyncStorage.setItem('@transactions', JSON.stringify(updatedTx));

    let completedGoalTitle: string | null = null;

    const updatedWallets = wallets.map(w => {
      if (w.id === txData.walletId) {
        const oldPhpTotal = getWalletTotalBalanceInPhp(w, usdToPhpRate);
        let updatedWallet = { ...w };

        if (txCurrency === 'USD') {
          const currentUsd = w.usdBalance || 0;
          const delta = txData.type === 'deposit' ? txData.amount : -txData.amount;
          updatedWallet.usdBalance = Math.max(0, currentUsd + delta);
        } else {
          const currentPhp = w.balance || 0;
          const delta = txData.type === 'deposit' ? txData.amount : -txData.amount;
          updatedWallet.balance = currentPhp + delta;
        }

        const newPhpTotal = getWalletTotalBalanceInPhp(updatedWallet, usdToPhpRate);
        
        if (txData.type === 'deposit') {
          const associatedGoals = goals.filter(g => g.walletId === w.id);
          for (const goal of associatedGoals) {
            if (oldPhpTotal < goal.targetAmount && newPhpTotal >= goal.targetAmount) {
              completedGoalTitle = goal.title;
              break; 
            }
          }
        }

        return updatedWallet;
      }
      return w;
    });

    if (completedGoalTitle && isNotificationsEnabled) {
      notifyGoalCompletion(completedGoalTitle);
    }

    setWallets(updatedWallets);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updatedWallets));
    if (!options?.skipFeedback) {
      showFeedback('success', txData.type === 'deposit' ? 'Successfully Deposited' : 'Successfully Withdrawn');
    }
  };

  const addGoal = async (goalData: Omit<GoalType, 'id'>) => {
    const permanentImage = await saveImagePermanently(goalData.imageUrl);

    const newGoal: GoalType = {
      ...goalData,
      id: Date.now().toString(),
      imageUrl: permanentImage || undefined,
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    await AsyncStorage.setItem('@goals', JSON.stringify(updated));
    showFeedback('success', 'Goal Defined');
  };

  const addReceivable = async (receivableData: Omit<ReceivableType, 'id' | 'date'>) => {
    const newReceivable: ReceivableType = {
      ...receivableData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const updated = [...receivables, newReceivable];
    setReceivables(updated);
    await AsyncStorage.setItem('@receivables', JSON.stringify(updated));
    showFeedback('success', 'Added to Receivables');
  };

  const editReceivable = async (id: string, updates: Partial<ReceivableType>) => {
    const updated = receivables.map(r => (r.id === id ? { ...r, ...updates } : r));
    setReceivables(updated);
    await AsyncStorage.setItem('@receivables', JSON.stringify(updated));
    showFeedback('success', 'Pending Payment Updated');
  };

  const addDebt = async (debtData: Omit<DebtType, 'id' | 'date'>) => {
    const newDebt: DebtType = {
      ...debtData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const updated = [...debts, newDebt];
    setDebts(updated);
    await AsyncStorage.setItem('@debts', JSON.stringify(updated));
    showFeedback('success', 'Debt Recorded');
  };

  const editDebt = async (id: string, updates: Partial<DebtType>) => {
    const updated = debts.map(d => (d.id === id ? { ...d, ...updates } : d));
    setDebts(updated);
    await AsyncStorage.setItem('@debts', JSON.stringify(updated));
    showFeedback('success', 'Debt Updated');
  };
  
  const addRecursion = async (recursionData: Omit<RecursionType, 'id' | 'date'>) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentDay = today.getDate();
    const currentDayOfWeek = today.getDay();
    
    let lastProcessedDate: string | undefined = undefined;
    
    if (recursionData.frequency === 'monthly') {
      if (currentDay >= (recursionData.dayOfMonth || 1)) {
        lastProcessedDate = todayStr;
      }
    } else if (recursionData.frequency === 'weekly') {
      if (currentDayOfWeek > (recursionData.dayOfWeek ?? 0)) {
        lastProcessedDate = todayStr;
      }
    } else if (recursionData.frequency === 'bi-monthly') {
      const day1 = 15;
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const day2 = Math.min(30, lastDay);
      if (currentDay >= day2 || (currentDay >= day1 && currentDay < day2)) {
        lastProcessedDate = todayStr;
      }
    }

    const newRecursion: RecursionType = {
      ...recursionData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      lastProcessedDate: lastProcessedDate
    };
    const updated = [...recursions, newRecursion];
    setRecursions(updated);
    await AsyncStorage.setItem('@recursions', JSON.stringify(updated));
    showFeedback('success', 'Recursion Added');
  };

  const editRecursion = async (id: string, updates: Partial<Omit<RecursionType, 'id' | 'date'>>) => {
    const updated = recursions.map(r => r.id === id ? { ...r, ...updates } : r);
    setRecursions(updated);
    await AsyncStorage.setItem('@recursions', JSON.stringify(updated));
    showFeedback('success', 'Recursion Updated');
  };

  const deleteRecursion = async (id: string) => {
    const updated = recursions.filter(r => r.id !== id);
    setRecursions(updated);
    await AsyncStorage.setItem('@recursions', JSON.stringify(updated));
    showFeedback('delete', 'Recursion Removed');
  };

  const processRecursion = async (id: string) => {
    const recursion = recursions.find(r => r.id === id);
    if (!recursion) {
      return;
    }

    const newTx: TransactionType = {
      id: Date.now().toString(),
      title: `${recursion.companyName} (Recurring)`,
      amount: recursion.amount,
      date: new Date().toISOString(),
      type: 'deposit',
      walletId: recursion.walletId,
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    await AsyncStorage.setItem('@transactions', JSON.stringify(updatedTx));

    const updatedWallets = wallets.map(w => {
      if (w.id === recursion.walletId) {
        return {
          ...w,
          balance: w.balance + recursion.amount
        };
      }
      return w;
    });
    setWallets(updatedWallets);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updatedWallets));
    
    showFeedback('success', 'Processed Successfully');
  };

  const setUserImage = async (image: string | null) => {
    const permanentImage = await saveImagePermanently(image);
    if (permanentImage) await AsyncStorage.setItem('@userImage', permanentImage);
    else await AsyncStorage.removeItem('@userImage');
    setUserImageState(permanentImage);
  };

  const setStatusCardBg = async (image: string | null) => {
    const permanentImage = await saveImagePermanently(image);
    if (permanentImage) await AsyncStorage.setItem('@statusCardBg', permanentImage);
    else await AsyncStorage.removeItem('@statusCardBg');
    setStatusCardBgState(permanentImage);
  };

  const addSubscription = async (subscriptionData: Omit<SubscriptionType, 'id' | 'date'>) => {
    const newSubscription: SubscriptionType = {
      ...subscriptionData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const updated = [...subscriptions, newSubscription];
    setSubscriptions(updated);
    await AsyncStorage.setItem('@subscriptions', JSON.stringify(updated));
    showFeedback('success', 'Subscription Added');
  };

  const editSubscription = async (id: string, updates: Partial<Omit<SubscriptionType, 'id' | 'date'>>) => {
    const updated = subscriptions.map(s => s.id === id ? { ...s, ...updates } : s);
    setSubscriptions(updated);
    await AsyncStorage.setItem('@subscriptions', JSON.stringify(updated));
    showFeedback('success', 'Subscription Updated');
  };

  const deleteSubscription = async (id: string) => {
    const updated = subscriptions.filter(s => s.id !== id);
    setSubscriptions(updated);
    await AsyncStorage.setItem('@subscriptions', JSON.stringify(updated));
    showFeedback('delete', 'Subscription Removed');
  };

  const transferMoney = async (fromWalletId: string, toWalletId: string, amount: number, tax: number = 0, currency: 'PHP' | 'USD' = 'PHP') => {
    const fromWallet = wallets.find(w => w.id === fromWalletId);
    const toWallet = wallets.find(w => w.id === toWalletId);

    if (!fromWallet || !toWallet) {
      showFeedback('error', 'Wallet not found');
      return;
    }

    if (amount <= tax && tax > 0) {
      showFeedback('error', 'Amount must be greater than the fee');
      return;
    }

    const txId1 = Date.now().toString();
    const txId2 = (Date.now() + 1).toString();
    const date = new Date().toISOString();

    const isUsd = currency === 'USD';
    const symbol = isUsd ? '$' : '₱';
    const currentRate = isUsd ? usdToPhpRate : 1;

    const withdrawalTx: TransactionType = {
      id: txId1,
      title: `Transfer to ${toWallet.name}${tax > 0 ? ` (${symbol}${tax} fee deducted)` : ''}`,
      amount: amount,
      currency: currency,
      exchangeRate: currentRate,
      date: date,
      type: 'withdrawal',
      walletId: fromWalletId,
      category: 'transfer',
    };

    const depositAmount = amount - tax;
    const depositTx: TransactionType = {
      id: txId2,
      title: `Transfer from ${fromWallet.name}`,
      amount: depositAmount,
      currency: currency,
      exchangeRate: currentRate,
      date: date,
      type: 'deposit',
      walletId: toWalletId,
      category: 'transfer',
    };

    const updatedTx = [withdrawalTx, depositTx, ...transactions];
    setTransactions(updatedTx);
    await AsyncStorage.setItem('@transactions', JSON.stringify(updatedTx));

    const updatedWallets = wallets.map(w => {
      if (w.id === fromWalletId) {
        if (isUsd) {
          const currentUsd = w.usdBalance || 0;
          if (currentUsd >= amount) {
            return { ...w, usdBalance: currentUsd - amount };
          } else {
            const remainderUsd = amount - currentUsd;
            const phpDeduct = remainderUsd * (usdToPhpRate || 58.5);
            return {
              ...w,
              usdBalance: 0,
              balance: Math.max(0, (w.balance || 0) - phpDeduct),
            };
          }
        } else {
          // PHP transfer
          const currentPhp = w.balance || 0;
          if (currentPhp >= amount) {
            return { ...w, balance: currentPhp - amount };
          } else {
            const remainderPhp = amount - Math.max(0, currentPhp);
            const usdDeduct = remainderPhp / (usdToPhpRate || 58.5);
            return {
              ...w,
              balance: 0,
              usdBalance: Math.max(0, (w.usdBalance || 0) - usdDeduct),
            };
          }
        }
      }
      if (w.id === toWalletId) {
        if (isUsd) {
          const currentUsd = w.usdBalance || 0;
          return { ...w, usdBalance: currentUsd + depositAmount };
        } else {
          return { ...w, balance: (w.balance || 0) + depositAmount };
        }
      }
      return w;
    });

    setWallets(updatedWallets);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updatedWallets));

    showFeedback('success', 'Transfer Successful');
  };

  const editWallet = async (id: string, updates: Partial<WalletType>) => {
    const finalUpdates = { ...updates };
    if (updates.qrCodeImage !== undefined) {
      finalUpdates.qrCodeImage = await saveImagePermanently(updates.qrCodeImage) || undefined;
    }
    if (updates.customIcon !== undefined) {
      finalUpdates.customIcon = await saveImagePermanently(updates.customIcon) || undefined;
    }
    if (updates.interestRate !== undefined && updates.interestRate > 0) {
      const existing = wallets.find(w => w.id === id);
      if (!existing?.lastInterestDate) {
        finalUpdates.lastInterestDate = new Date().toISOString();
      }
    }

    const updated = wallets.map(w => w.id === id ? { ...w, ...finalUpdates } : w);
    setWallets(updated);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updated));
    showFeedback('success', 'Wallet Updated');
  };

  const reorderWallets = async (newWallets: WalletType[]) => {
    setWallets(newWallets);
    await AsyncStorage.setItem('@wallets', JSON.stringify(newWallets));
  };

  const editGoal = async (id: string, updates: Partial<GoalType>) => {
    const finalUpdates = { ...updates };
    if (updates.imageUrl !== undefined) {
      finalUpdates.imageUrl = await saveImagePermanently(updates.imageUrl) || undefined;
    }

    const updated = goals.map(g => g.id === id ? { ...g, ...finalUpdates } : g);
    setGoals(updated);
    await AsyncStorage.setItem('@goals', JSON.stringify(updated));
    showFeedback('success', 'Goal Updated');
  };

  const deleteWallet = async (id: string) => {
    const updated = wallets.filter(w => w.id !== id);
    setWallets(updated);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updated));
    showFeedback('delete', 'Wallet Removed');
  };

  const deleteGoal = async (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    await AsyncStorage.setItem('@goals', JSON.stringify(updated));
    showFeedback('delete', 'Goal Removed');
  };

  const deleteReceivable = async (id: string) => {
    const updated = receivables.filter(r => r.id !== id);
    setReceivables(updated);
    await AsyncStorage.setItem('@receivables', JSON.stringify(updated));
    showFeedback('delete', 'Removed from Receivables');
  };

  const deleteDebt = async (id: string) => {
    const updated = debts.filter(d => d.id !== id);
    setDebts(updated);
    await AsyncStorage.setItem('@debts', JSON.stringify(updated));
    showFeedback('delete', 'Debt Cleared');
  };

  const deleteTransaction = async (id: string) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) {
      return;
    }

    const updatedTx = transactions.filter(t => t.id !== id);
    setTransactions(updatedTx);
    await AsyncStorage.setItem('@transactions', JSON.stringify(updatedTx));

    const updatedWallets = wallets.map(w => {
      if (w.id === txToDelete.walletId) {
        if (txToDelete.currency === 'USD') {
          const currentUsd = w.usdBalance || 0;
          const delta = txToDelete.type === 'deposit' ? -txToDelete.amount : txToDelete.amount;
          return {
            ...w,
            usdBalance: Math.max(0, currentUsd + delta)
          };
        } else {
          const currentPhp = w.balance || 0;
          const delta = txToDelete.type === 'deposit' ? -txToDelete.amount : txToDelete.amount;
          return {
            ...w,
            balance: currentPhp + delta
          };
        }
      }
      return w;
    });
    setWallets(updatedWallets);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updatedWallets));
  };

  const clearData = async () => {
    await AsyncStorage.clear();
    setUserNameState(null);
    setWallets([]);
    setTransactions([]);
    setGoals([]);
    setReceivables([]);
    setDebts([]);
    setGroceryLists([]);
    setTravels([]);
    setWithdrawPresets([]);
    setIncomePresets([]);
    setRecursions([]);
    setSubscriptions([]);
    setInstallments([]);
    setRents([]);
    setAppPinState(null);
    setIsSecurityEnabled(false);
    setIsBiometricsEnabled(false);
    setUserImageState(null);
    setIsDarkMode(false);
    setIsNotificationsEnabled(true);
    setTreeTypeState('emerald');
    setStatusCardBgState(null);
    await saveWidgetConfig(DEFAULT_WIDGET_CONFIG);
    await syncWidgetBalance(0, 0, DEFAULT_WIDGET_CONFIG);
    await syncAllNotifications([], [], [], [], [], [], [], false);
    showFeedback('delete', 'All Data Cleared');
  };

  const toggleTheme = async () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    await AsyncStorage.setItem('@isDarkMode', newVal.toString());
  };

  const toggleNotifications = async (enabled: boolean) => {
    setIsNotificationsEnabled(enabled);
    await AsyncStorage.setItem('@isNotificationsEnabled', enabled.toString());
    if (enabled) {
      await requestNotificationPermissions();
    }
  };



  const importData = async (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);

      if (typeof data !== 'object') throw new Error('Invalid data format');

      const importedUserImage = await saveBase64Image(data.userImage);
      const importedStatusCardBg = await saveBase64Image(data.statusCardBg);

      const importedWallets = data.wallets ? await Promise.all(data.wallets.map(async (w: WalletType) => ({
        ...w,
        qrCodeImage: await saveBase64Image(w.qrCodeImage) || undefined,
        customIcon: await saveBase64Image(w.customIcon) || undefined,
      }))) : [];

      const importedGoals = data.goals ? await Promise.all(data.goals.map(async (g: GoalType) => ({
        ...g,
        imageUrl: await saveBase64Image(g.imageUrl) || undefined,
      }))) : [];

      const importedTravels = data.travels ? await Promise.all(data.travels.map(async (t: TravelType) => ({
        ...t,
        images: t.images ? await Promise.all(t.images.map(img => saveBase64Image(img)))
          .then(res => res.filter((img): img is string => img !== null)) : [],
      }))) : [];

      const importedInstallments = Array.isArray(data.installments) ? data.installments : [];
      const importedRents = Array.isArray(data.rents) ? data.rents : [];

      const keysToSave: [string, string | null][] = [
        ['@username', data.username || null],
        ['@wallets', importedWallets ? JSON.stringify(importedWallets) : '[]'],
        ['@transactions', data.transactions ? JSON.stringify(data.transactions) : '[]'],
        ['@goals', importedGoals ? JSON.stringify(importedGoals) : '[]'],
        ['@receivables', data.receivables ? JSON.stringify(data.receivables) : '[]'],
        ['@debts', data.debts ? JSON.stringify(data.debts) : '[]'],
        ['@groceryLists', data.groceryLists ? JSON.stringify(data.groceryLists) : '[]'],
        ['@travels', importedTravels ? JSON.stringify(importedTravels) : '[]'],
        ['@withdrawPresets', data.withdrawPresets ? JSON.stringify(data.withdrawPresets) : '[]'],
        ['@incomePresets', data.incomePresets ? JSON.stringify(data.incomePresets) : '[]'],
        ['@recursions', data.recursions ? JSON.stringify(data.recursions) : '[]'],
        ['@subscriptions', data.subscriptions ? JSON.stringify(data.subscriptions) : '[]'],
        ['@installments', JSON.stringify(importedInstallments)],
        ['@rents', JSON.stringify(importedRents)],
        ['@appPin', data.appPin || null],
        ['@isSecurityEnabled', data.isSecurityEnabled !== undefined ? String(data.isSecurityEnabled) : null],
        ['@isBiometricsEnabled', data.isBiometricsEnabled !== undefined ? String(data.isBiometricsEnabled) : null],
        ['@isDarkMode', data.isDarkMode !== undefined ? String(data.isDarkMode) : null],
        ['@userImage', importedUserImage || null],
        ['@statusCardBg', importedStatusCardBg || null],
        ['@treeType', data.treeType || null],
        ['@isNotificationsEnabled', data.isNotificationsEnabled !== undefined ? String(data.isNotificationsEnabled) : null],
      ];

      for (const [key, value] of keysToSave) {
        if (value !== null) {
          await AsyncStorage.setItem(key, value);
        } else {
          await AsyncStorage.removeItem(key);
        }
      }

      setUserNameState(data.username || null);
      setWallets(importedWallets);
      setTransactions(data.transactions || []);
      setGoals(importedGoals);
      setReceivables(data.receivables || []);
      setDebts(data.debts || []);
      setGroceryLists(data.groceryLists || []);
      setTravels(importedTravels);
      setWithdrawPresets(data.withdrawPresets || []);
      setIncomePresets(data.incomePresets || []);
      setRecursions(data.recursions || []);
      setInstallments(importedInstallments);
      setRents(importedRents);
      setAppPinState(data.appPin || null);

      if (data.isSecurityEnabled !== undefined) {
        setIsSecurityEnabled(!!data.isSecurityEnabled);
        if (!data.isSecurityEnabled) setIsUnlocked(true);
        else setIsUnlocked(false);
      }

      if (data.isBiometricsEnabled !== undefined) {
        setIsBiometricsEnabled(!!data.isBiometricsEnabled);
      }

      if (data.isDarkMode !== undefined) {
        setIsDarkMode(!!data.isDarkMode);
      }

      setUserImageState(importedUserImage);
      if (data.statusCardBg !== undefined) setStatusCardBgState(importedStatusCardBg);
      if (data.treeType) setTreeTypeState(data.treeType);
      if (data.isNotificationsEnabled !== undefined) setIsNotificationsEnabled(!!data.isNotificationsEnabled);
      if (data.subscriptions) setSubscriptions(data.subscriptions);

      if (data.widgetConfig) {
        await saveWidgetConfig(data.widgetConfig);
      }

      const newTotalPhp = importedWallets.reduce((acc, w) => acc + (w.balance || 0) + ((w.usdBalance || 0) * (usdToPhpRate || 58.5)), 0);
      await syncWidgetBalance(newTotalPhp, importedWallets.length, data.widgetConfig);

      await syncAllNotifications(
        data.debts || [],
        data.groceryLists || [],
        importedInstallments,
        data.subscriptions || [],
        importedRents,
        data.recursions || [],
        importedGoals,
        data.isNotificationsEnabled !== undefined ? !!data.isNotificationsEnabled : true
      );

      showFeedback('success', 'Data Imported Successfully');
    } catch (e) {
      console.error('Failed to import data', e);
      showFeedback('error', 'Failed to import data');
      throw e;
    }
  };

  const closeFeedback = () => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    setFeedback(prev => ({ ...prev, visible: false }));
  };

  const showFeedback = (type: 'success' | 'delete' | 'error', message: string, duration = 800) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setFeedback({ visible: true, type, message });
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(prev => ({ ...prev, visible: false }));
      feedbackTimeoutRef.current = null;
    }, duration); 
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, isDestructive = true) => {
    setConfirmState({ visible: true, title, message, onConfirm, isDestructive });
  };

  const closeConfirm = () => {
    setConfirmState(prev => ({ ...prev, visible: false }));
  };

  const addGroceryList = async (title: string, scheduledDays?: number[]) => {
    const newList: GroceryListType = {
      id: Date.now().toString(),
      title,
      items: [],
      date: new Date().toISOString(),
      scheduledDays,
    };
    const updated = [...groceryLists, newList];
    setGroceryLists(updated);
    await AsyncStorage.setItem('@groceryLists', JSON.stringify(updated));
    showFeedback('success', 'List Created');
  };

  const editGroceryList = async (id: string, newTitle: string, scheduledDays?: number[]) => {
    const updated = groceryLists.map(l => l.id === id ? { ...l, title: newTitle, scheduledDays } : l);
    setGroceryLists(updated);
    await AsyncStorage.setItem('@groceryLists', JSON.stringify(updated));
    showFeedback('success', 'List Updated');
  };

  const deleteGroceryList = async (id: string) => {
    const updated = groceryLists.filter(l => l.id !== id);
    setGroceryLists(updated);
    await AsyncStorage.setItem('@groceryLists', JSON.stringify(updated));
    showFeedback('delete', 'List Removed');
  };

  const addGroceryItem = async (listId: string, itemData: Omit<GroceryItemType, 'id' | 'completed'>) => {
    const updated = groceryLists.map(list => {
      if (list.id === listId) {
        const newItem: GroceryItemType = {
          ...itemData,
          id: Date.now().toString(),
          completed: false,
        };
        return { ...list, items: [...list.items, newItem] };
      }
      return list;
    });
    setGroceryLists(updated);
    await AsyncStorage.setItem('@groceryLists', JSON.stringify(updated));
  };

  const deleteGroceryItem = async (listId: string, itemId: string) => {
    const updated = groceryLists.map(list => {
      if (list.id === listId) {
        return { ...list, items: list.items.filter(i => i.id !== itemId) };
      }
      return list;
    });
    setGroceryLists(updated);
    await AsyncStorage.setItem('@groceryLists', JSON.stringify(updated));
  };

  const toggleGroceryItem = async (listId: string, itemId: string) => {
    const updated = groceryLists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return list;
    });
    setGroceryLists(updated);
    await AsyncStorage.setItem('@groceryLists', JSON.stringify(updated));
  };

  const addTravel = async (travelData: Omit<TravelType, 'id'>) => {
    const permanentImages = travelData.images 
      ? await Promise.all(travelData.images.map(img => saveImagePermanently(img)))
      : [];

    const newTravel: TravelType = {
      ...travelData,
      id: Date.now().toString(),
      images: permanentImages.filter((img): img is string => img !== null),
    };
    const updated = [newTravel, ...travels];
    setTravels(updated);
    await AsyncStorage.setItem('@travels', JSON.stringify(updated));
    showFeedback('success', 'Travel Recorded');
  };

  const editTravel = async (id: string, updates: Partial<TravelType>) => {
    let finalImages = updates.images;
    if (updates.images) {
      finalImages = await Promise.all(updates.images.map(img => saveImagePermanently(img)))
        .then(res => res.filter((img): img is string => img !== null));
    }

    const updated = travels.map(t => t.id === id ? { ...t, ...updates, images: finalImages || t.images } : t);
    setTravels(updated);
    await AsyncStorage.setItem('@travels', JSON.stringify(updated));
    showFeedback('success', 'Trip Updated');
  };

  const deleteTravel = async (id: string) => {
    const updated = travels.filter(t => t.id !== id);
    setTravels(updated);
    await AsyncStorage.setItem('@travels', JSON.stringify(updated));
    showFeedback('delete', 'Travel Removed');
  };

  const setTreeType = async (type: TreeType) => {
    setTreeTypeState(type);
    await AsyncStorage.setItem('@treeType', type);
  };

  const colors = palettes[treeType][isDarkMode ? 'dark' : 'light'];

  const setAppPin = async (pin: string | null) => {
    if (pin) await AsyncStorage.setItem('@appPin', pin);
    else await AsyncStorage.removeItem('@appPin');
    setAppPinState(pin);
  };

  const toggleSecurity = async (enabled: boolean) => {
    await AsyncStorage.setItem('@isSecurityEnabled', enabled.toString());
    setIsSecurityEnabled(enabled);
    if (!enabled) setIsUnlocked(true);
  };

  const toggleBiometrics = async (enabled: boolean) => {
    await AsyncStorage.setItem('@isBiometricsEnabled', enabled.toString());
    setIsBiometricsEnabled(enabled);
  };

  const unlockApp = () => {
    setIsUnlocked(true);
  };

  const payReceivable = async (id: string, amount: number, walletId: string) => {
    const receivable = receivables.find(r => r.id === id);
    if (!receivable) {
      return;
    }

    let updatedReceivables;
    let isFullPayment = amount >= receivable.amount;

    if (isFullPayment) {
      updatedReceivables = receivables.filter(r => r.id !== id);
    } else {
      updatedReceivables = receivables.map(r =>
        r.id === id ? { ...r, amount: r.amount - amount } : r
      );
    }
    setReceivables(updatedReceivables);
    await AsyncStorage.setItem('@receivables', JSON.stringify(updatedReceivables));

    const newTx: TransactionType = {
      id: Date.now().toString(),
      title: `Payment from ${receivable.personName}`,
      amount: amount,
      date: new Date().toISOString(),
      type: 'deposit',
      walletId: walletId,
    };
    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    await AsyncStorage.setItem('@transactions', JSON.stringify(updatedTx));

    const updatedWallets = wallets.map(w => {
      if (w.id === walletId) {
        return { ...w, balance: w.balance + amount };
      }
      return w;
    });
    setWallets(updatedWallets);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updatedWallets));

    showFeedback('success', isFullPayment ? 'Payment Received' : 'Partial Payment Recorded');
  };

  const payDebt = async (id: string, amount: number) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) {
      return;
    }

    let updatedDebts;
    let isFullPayment = amount >= debt.amount;

    if (isFullPayment) {
      updatedDebts = debts.filter(d => d.id !== id);
    } else {
      updatedDebts = debts.map(d =>
        d.id === id ? { ...d, amount: d.amount - amount } : d
      );
    }
    setDebts(updatedDebts);
    await AsyncStorage.setItem('@debts', JSON.stringify(updatedDebts));

    const newTx: TransactionType = {
      id: Date.now().toString(),
      title: `Settled debt to ${debt.personName}`,
      amount: amount,
      date: new Date().toISOString(),
      type: 'withdrawal',
      walletId: 'external', 
    };
    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    await AsyncStorage.setItem('@transactions', JSON.stringify(updatedTx));

    showFeedback('success', isFullPayment ? 'Debt Settled' : 'Partial Payment Recorded');
  };

  const totalReceivables = receivables.reduce((acc, r) => acc + r.amount, 0);
  const totalDebts = debts.reduce((acc, d) => acc + d.amount, 0);
  const totalBalance = wallets.reduce((acc, wallet) => acc + getWalletTotalBalanceInPhp(wallet, usdToPhpRate), 0);
  
  const expenseTransactions = transactions.filter(t => t.type === 'withdrawal');
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + (t.currency === 'USD' ? t.amount * usdToPhpRate : t.amount), 0);
  const expenseCount = expenseTransactions.length;

  // Sync Total Balance & Total Expense widgets for phone home screen
  useEffect(() => {
    if (isLoaded) {
      syncWidgetBalance(totalBalance, wallets.length, undefined, totalExpense, expenseCount);
    }
  }, [isLoaded, totalBalance, wallets.length, totalExpense, expenseCount]);

  const calculateStreak = () => {
    if (transactions.length === 0) return 0;

    const uniqueDates = new Set(
      transactions.map(tx => new Date(tx.date).toISOString().split('T')[0])
    );

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!uniqueDates.has(todayStr) && !uniqueDates.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let checkDate = uniqueDates.has(todayStr) ? new Date() : yesterday;
    
    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.has(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const streakCount = calculateStreak();
  const transactionDates = Array.from(new Set(transactions.map(tx => new Date(tx.date).toISOString().split('T')[0])));

  const startTutorial = () => {
    setIsTutorialActive(true);
  };

  const stopTutorial = () => {
    setIsTutorialActive(false);
  };

  const addWithdrawPreset = async (name: string, iconName: string) => {
    const newPreset: WithdrawPresetType = {
      id: Date.now().toString(),
      name,
      iconName,
    };
    const updated = [...withdrawPresets, newPreset];
    setWithdrawPresets(updated);
    await AsyncStorage.setItem('@withdrawPresets', JSON.stringify(updated));
    showFeedback('success', 'Preset Added');
    return newPreset;
  };

  const deleteWithdrawPreset = async (id: string) => {
    const updated = withdrawPresets.filter(p => p.id !== id);
    setWithdrawPresets(updated);
    await AsyncStorage.setItem('@withdrawPresets', JSON.stringify(updated));
    showFeedback('delete', 'Preset Removed');
  };

  const addIncomePreset = async (name: string, iconName: string) => {
    const newPreset: IncomePresetType = {
      id: Date.now().toString(),
      name,
      iconName,
    };
    const updated = [...incomePresets, newPreset];
    setIncomePresets(updated);
    await AsyncStorage.setItem('@incomePresets', JSON.stringify(updated));
    showFeedback('success', 'Preset Added');
    return newPreset;
  };

  const deleteIncomePreset = async (id: string) => {
    const updated = incomePresets.filter(p => p.id !== id);
    setIncomePresets(updated);
    await AsyncStorage.setItem('@incomePresets', JSON.stringify(updated));
    showFeedback('delete', 'Preset Removed');
  };

  const addInstallment = async (data: Omit<InstallmentType, 'id' | 'dueDate' | 'date'> & { startDate: string; paidMonths?: number }) => {
    const initialPaidMonths = data.paidMonths || 0;
    const initialDueDate = calculateNextDueDate(data.startDate, initialPaidMonths);
    const newInstallment: InstallmentType = {
      ...data,
      id: Date.now().toString(),
      paidMonths: initialPaidMonths,
      dueDate: initialDueDate,
      date: new Date().toISOString(),
    };
    const updated = [newInstallment, ...installments];
    setInstallments(updated);
    await AsyncStorage.setItem('@installments', JSON.stringify(updated));
    showFeedback('success', 'Installment Recorded');
  };

  const editInstallment = async (id: string, updates: Partial<InstallmentType>) => {
    const updated = installments.map(i => {
      if (i.id === id) {
        const nextUpdates = { ...i, ...updates };
        if (updates.startDate || updates.paidMonths !== undefined) {
          nextUpdates.dueDate = calculateNextDueDate(nextUpdates.startDate, nextUpdates.paidMonths);
        }
        return nextUpdates;
      }
      return i;
    });
    setInstallments(updated);
    await AsyncStorage.setItem('@installments', JSON.stringify(updated));
    showFeedback('success', 'Installment Updated');
  };

  const deleteInstallment = async (id: string) => {
    const updated = installments.filter(i => i.id !== id);
    setInstallments(updated);
    await AsyncStorage.setItem('@installments', JSON.stringify(updated));
    showFeedback('delete', 'Installment Removed');
  };

  const payInstallmentMonth = async (id: string, customWalletId?: string) => {
    const item = installments.find(i => i.id === id);
    if (!item) return;

    if (item.paidMonths >= item.monthsToPay) {
      showFeedback('error', 'Installment already completed!');
      return;
    }

    const targetWalletId = customWalletId || item.walletId;

    if (targetWalletId) {
      const wallet = wallets.find(w => w.id === targetWalletId);
      if (wallet) {
        const walletBal = item.currency === 'USD' ? (wallet.usdBalance || 0) : wallet.balance;
        if (walletBal < item.monthlyAmount) {
          showFeedback('error', 'Insufficient Wallet Balance');
          return;
        }

        await addTransaction({
          title: `Installment: ${item.productName} (${item.paidMonths + 1}/${item.monthsToPay})`,
          amount: item.monthlyAmount,
          currency: item.currency || 'PHP',
          type: 'withdrawal',
          walletId: targetWalletId,
          icon: 'CreditCard'
        });
      }
    }

    const nextPaidMonths = item.paidMonths + 1;
    const nextDue = calculateNextDueDate(item.startDate, nextPaidMonths);

    const updated = installments.map(inst => {
      if (inst.id === id) {
        return {
          ...inst,
          paidMonths: nextPaidMonths,
          dueDate: nextDue,
        };
      }
      return inst;
    });

    setInstallments(updated);
    await AsyncStorage.setItem('@installments', JSON.stringify(updated));
    showFeedback('success', `Paid Month ${nextPaidMonths} of ${item.monthsToPay}`);
  };

  const addRent = async (data: Omit<RentType, 'id' | 'dueDate' | 'paidCycles' | 'date'> & { startDate: string; paidCycles?: number }) => {
    const initialPaid = data.paidCycles || 0;
    const initialDueDate = calculateNextDueDate(data.startDate, initialPaid);
    const newRent: RentType = {
      ...data,
      id: Date.now().toString(),
      paidCycles: initialPaid,
      dueDate: initialDueDate,
      date: new Date().toISOString(),
    };
    const updated = [newRent, ...rents];
    setRents(updated);
    await AsyncStorage.setItem('@rents', JSON.stringify(updated));
    showFeedback('success', 'Rent Property Recorded');
  };

  const editRent = async (id: string, updates: Partial<RentType>) => {
    const updated = rents.map(r => {
      if (r.id === id) {
        const nextUpdates = { ...r, ...updates };
        if (updates.startDate || updates.paidCycles !== undefined) {
          nextUpdates.dueDate = calculateNextDueDate(nextUpdates.startDate, nextUpdates.paidCycles || 0);
        }
        return nextUpdates;
      }
      return r;
    });
    setRents(updated);
    await AsyncStorage.setItem('@rents', JSON.stringify(updated));
    showFeedback('success', 'Rent Details Updated');
  };

  const deleteRent = async (id: string) => {
    const updated = rents.filter(r => r.id !== id);
    setRents(updated);
    await AsyncStorage.setItem('@rents', JSON.stringify(updated));
    showFeedback('delete', 'Rent Property Removed');
  };

  const payRentMonth = async (id: string, customWalletId?: string) => {
    const item = rents.find(r => r.id === id);
    if (!item) return;

    const targetWalletId = customWalletId || item.walletId;

    if (targetWalletId) {
      const wallet = wallets.find(w => w.id === targetWalletId);
      if (wallet) {
        const walletBal = item.currency === 'USD' ? (wallet.usdBalance || 0) : wallet.balance;
        if (walletBal < item.monthlyAmount) {
          showFeedback('error', 'Insufficient Wallet Balance');
          return;
        }

        await addTransaction({
          title: `Rent: ${item.propertyName} (${item.location})`,
          amount: item.monthlyAmount,
          currency: item.currency || 'PHP',
          type: 'withdrawal',
          walletId: targetWalletId,
          icon: 'Home'
        });
      }
    }

    const nextPaidCycles = item.paidCycles + 1;
    const nextDue = calculateNextDueDate(item.startDate, nextPaidCycles);

    const updated = rents.map(r => {
      if (r.id === id) {
        return {
          ...r,
          paidCycles: nextPaidCycles,
          dueDate: nextDue,
        };
      }
      return r;
    });

    setRents(updated);
    await AsyncStorage.setItem('@rents', JSON.stringify(updated));
    showFeedback('success', `Rent Paid for ${item.propertyName}`);
  };

  return (
    <AppContext.Provider
      value={{
        isLoaded,
        username,
        setUsername,
        wallets,
        addWallet,
        transactions,
        addTransaction,
        goals,
        addGoal,
        reorderWallets,
        editWallet,
        editGoal,
        deleteWallet,
        deleteTransaction,
        deleteGoal,
        receivables,
        addReceivable,
        editReceivable,
        deleteReceivable,
        totalReceivables,
        debts,
        addDebt,
        editDebt,
        deleteDebt,
        totalDebts,
        totalBalance,
        clearData,
        feedback,
        showFeedback,
        closeFeedback,
        confirmState,
        showConfirm,
        closeConfirm,
        loading,
        userImage,
        setUserImage,
        importData,
        isDarkMode,
        toggleTheme,
        treeType,
        setTreeType,
        colors,
        groceryLists,
        addGroceryList,
        editGroceryList,
        deleteGroceryList,
        addGroceryItem,
        deleteGroceryItem,
        toggleGroceryItem,
        travels,
        addTravel,
        editTravel,
        deleteTravel,
        appPin,
        isSecurityEnabled,
        isUnlocked,
        setAppPin,
        toggleSecurity,
        isBiometricsEnabled,
        toggleBiometrics,
        unlockApp,
        payReceivable,
        payDebt,
        streakCount,
        transactionDates,
        statusCardBg,
        setStatusCardBg,
        isTutorialActive,
        startTutorial,
        stopTutorial,
        withdrawPresets,
        addWithdrawPreset,
        deleteWithdrawPreset,
        incomePresets,
        addIncomePreset,
        deleteIncomePreset,
        recursions,
        addRecursion,
        editRecursion,
        deleteRecursion,
        processRecursion,
        isNotificationsEnabled,
        toggleNotifications,
        subscriptions,
        addSubscription,
        editSubscription,
        deleteSubscription,
        transferMoney,
        usdToPhpRate,
        usdToPhpRateDate,
        refreshUsdToPhpRate,
        installments,
        addInstallment,
        editInstallment,
        deleteInstallment,
        payInstallmentMonth,
        rents,
        addRent,
        editRent,
        deleteRent,
        payRentMonth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};


export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
