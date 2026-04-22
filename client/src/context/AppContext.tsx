import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightPalette, darkPalette } from '../theme';
import { requestNotificationPermissions, syncAllNotifications } from '../services/NotificationService';

export type WalletType = {
  id: string;
  name: string;
  purpose: string;
  balance: number;
  qrCodeImage?: string;
  iconType?: 'purpose' | 'preset' | 'custom';
  presetLogo?: string;
  customIcon?: string;
  color?: string;
};

export type TransactionType = {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'deposit' | 'withdrawal';
  walletId: string;
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
};

export type WithdrawPresetType = {
  id: string;
  name: string;
  iconName: string;
};

export type RecursionType = {
  id: string;
  companyName: string;
  amount: number;
  walletId: string;
  frequency: 'monthly' | 'weekly' | 'bi-monthly';
  dayOfMonth?: number; // 1-31
  dayOfWeek?: number; // 0-6
  lastProcessedDate?: string; // e.g. "2024-04-22"
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
  addTransaction: (tx: Omit<TransactionType, 'id' | 'date'>) => Promise<void>;
  goals: GoalType[];
  addGoal: (goal: Omit<GoalType, 'id'>) => Promise<void>;
  reorderWallets: (newWallets: WalletType[]) => Promise<void>;
  editGoal: (id: string, updates: Partial<GoalType>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  receivables: ReceivableType[];
  addReceivable: (receivable: Omit<ReceivableType, 'id' | 'date'>) => Promise<void>;
  deleteReceivable: (id: string) => Promise<void>;
  totalReceivables: number;
  debts: DebtType[];
  addDebt: (debt: Omit<DebtType, 'id' | 'date'>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  totalDebts: number;
  totalBalance: number;
  clearData: () => Promise<void>;
  feedback: { visible: boolean; type: 'success' | 'delete' | 'error'; message: string };
  showFeedback: (type: 'success' | 'delete' | 'error', message: string) => void;
  confirmState: { visible: boolean; title: string; message: string; isDestructive?: boolean; onConfirm?: () => void };
  showConfirm: (title: string, message: string, onConfirm: () => void, isDestructive?: boolean) => void;
  closeConfirm: () => void;
  loading: boolean;
  userImage: string | null;
  setUserImage: (image: string | null) => Promise<void>;
  importData: (jsonString: string) => Promise<void>;
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  colors: typeof lightPalette;
  groceryLists: GroceryListType[];
  addGroceryList: (title: string, scheduledDays?: number[]) => Promise<void>;
  deleteGroceryList: (id: string) => Promise<void>;
  addGroceryItem: (listId: string, item: Omit<GroceryItemType, 'id' | 'completed'>) => Promise<void>;
  deleteGroceryItem: (listId: string, itemId: string) => Promise<void>;
  toggleGroceryItem: (listId: string, itemId: string) => Promise<void>;
  travels: TravelType[];
  addTravel: (travel: Omit<TravelType, 'id'>) => Promise<void>;
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
  addWithdrawPreset: (name: string, iconName: string) => Promise<void>;
  deleteWithdrawPreset: (id: string) => Promise<void>;
  recursions: RecursionType[];
  addRecursion: (recursion: Omit<RecursionType, 'id' | 'date'>) => Promise<void>;
  editRecursion: (id: string, updates: Partial<Omit<RecursionType, 'id' | 'date'>>) => Promise<void>;
  deleteRecursion: (id: string) => Promise<void>;
  processRecursion: (id: string) => Promise<void>;
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
  const [withdrawPresets, setWithdrawPresets] = useState<WithdrawPresetType[]>([]);
  const [recursions, setRecursions] = useState<RecursionType[]>([]);
  const [userImage, setUserImageState] = useState<string | null>(null);
  const [appPin, setAppPinState] = useState<string | null>(null);
  const [isSecurityEnabled, setIsSecurityEnabled] = useState(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusCardBg, setStatusCardBgState] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to Light Mode as requested
  const [feedback, setFeedback] = useState<{ visible: boolean; type: 'success' | 'delete' | 'error'; message: string }>({
    visible: false,
    type: 'success',
    message: ''
  });
  const [confirmState, setConfirmState] = useState<{ visible: boolean; title: string; message: string; isDestructive?: boolean; onConfirm?: () => void }>({
    visible: false,
    title: '',
    message: '',
    isDestructive: true
  });
  const [isTutorialActive, setIsTutorialActive] = useState(false);


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedName = await AsyncStorage.getItem('@username');
      const storedWallets = await AsyncStorage.getItem('@wallets');
      const storedTransactions = await AsyncStorage.getItem('@transactions');
      const storedGoals = await AsyncStorage.getItem('@goals');
      const storedReceivables = await AsyncStorage.getItem('@receivables');
      const storedDebts = await AsyncStorage.getItem('@debts');
      const storedImage = await AsyncStorage.getItem('@userImage');

      if (storedName) setUserNameState(storedName);
      if (storedWallets) setWallets(JSON.parse(storedWallets));
      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      if (storedGoals) setGoals(JSON.parse(storedGoals));
      if (storedReceivables) setReceivables(JSON.parse(storedReceivables));
      if (storedDebts) setDebts(JSON.parse(storedDebts));
      const storedRecursions = await AsyncStorage.getItem('@recursions');
      if (storedRecursions) setRecursions(JSON.parse(storedRecursions));
      const storedGrocery = await AsyncStorage.getItem('@groceryLists');
      if (storedGrocery) setGroceryLists(JSON.parse(storedGrocery));
      const storedTravels = await AsyncStorage.getItem('@travels');
      if (storedTravels) setTravels(JSON.parse(storedTravels));
      const storedPresets = await AsyncStorage.getItem('@withdrawPresets');
      if (storedPresets) {
        setWithdrawPresets(JSON.parse(storedPresets));
      } else {
        const defaultPresets: WithdrawPresetType[] = [
          { id: '1', name: 'Food', iconName: 'Utensils' },
          { id: '2', name: 'Fare', iconName: 'Car' },
          { id: '3', name: 'Bills', iconName: 'Receipt' },
          { id: '4', name: 'Health', iconName: 'Heart' },
          { id: '5', name: 'Shopping', iconName: 'ShoppingBag' },
          { id: '6', name: 'Others', iconName: 'MoreHorizontal' },
        ];
        setWithdrawPresets(defaultPresets);
        await AsyncStorage.setItem('@withdrawPresets', JSON.stringify(defaultPresets));
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
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      // Ensure we mark as loaded even if there's an error, 
      // preventing the app from getting stuck on the splash screen
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (recursions.length > 0) {
        checkAndProcessRecursions();
      }
      
      // Initialize notifications
      const setupNotifications = async () => {
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission) {
          syncAllNotifications(debts, groceryLists);
        }
      };
      setupNotifications();
    }
  }, [isLoaded, recursions.length]);

  // Sync notifications whenever debts or grocery lists change
  useEffect(() => {
    if (isLoaded) {
      syncAllNotifications(debts, groceryLists);
    }
  }, [debts, groceryLists]);

  const checkAndProcessRecursions = async () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentDay = today.getDate();
    const currentDayOfWeek = today.getDay();
    const currentMonthYear = `${today.getFullYear()}-${today.getMonth() + 1}`;
    
    let hasChanges = false;
    const newTransactions: TransactionType[] = [];
    
    // Helper to get last day of month
    const getLastDayOfMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
    
    const updatedRecursions = recursions.map((r) => {
      // Skip if already processed today
      if (r.lastProcessedDate === todayStr) return r;

      let shouldProcess = false;

      if (r.frequency === 'weekly') {
        if (currentDayOfWeek === r.dayOfWeek) {
          shouldProcess = true;
        }
      } else if (r.frequency === 'monthly') {
        // If day of month matched, and not processed this month
        const lastMonthProcessed = r.lastProcessedDate ? r.lastProcessedDate.substring(0, 7) : '';
        const currentMonthStr = todayStr.substring(0, 7);
        if (currentDay >= (r.dayOfMonth || 1) && lastMonthProcessed !== currentMonthStr) {
          shouldProcess = true;
        }
      } else if (r.frequency === 'bi-monthly') {
        // 15th and 30th (or last day)
        const lastDay = getLastDayOfMonth(today.getFullYear(), today.getMonth() + 1);
        const targetDate1 = 15;
        const targetDate2 = Math.min(30, lastDay);
        
        // We need to know which "half" we processed last
        // If today is >= 15 and we haven't processed the 15th cycle yet
        const lastProcessedDay = r.lastProcessedDate ? parseInt(r.lastProcessedDate.split('-')[2]) : 0;
        const lastMonthProcessed = r.lastProcessedDate ? r.lastProcessedDate.substring(0, 7) : '';
        const currentMonthStr = todayStr.substring(0, 7);

        if (currentDay >= targetDate1 && currentDay < targetDate2) {
          // First half check: processed in a different month OR processed in this month but before the 15th
          if (lastMonthProcessed !== currentMonthStr || lastProcessedDay < targetDate1) {
            shouldProcess = true;
          }
        } else if (currentDay >= targetDate2) {
          // Second half check: processed in a different month OR processed in this month but before the 30th
          if (lastMonthProcessed !== currentMonthStr || lastProcessedDay < targetDate2) {
            shouldProcess = true;
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
      // 1. Update Recursions
      setRecursions(updatedRecursions);
      await AsyncStorage.setItem('@recursions', JSON.stringify(updatedRecursions));
      
      // 2. Update Transactions
      const allTx = [...newTransactions, ...transactions];
      setTransactions(allTx);
      await AsyncStorage.setItem('@transactions', JSON.stringify(allTx));
      
      // 3. Update Wallets
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

  const setUsername = async (name: string) => {
    await AsyncStorage.setItem('@username', name);
    setUserNameState(name);
  };

  const addWallet = async (walletData: Omit<WalletType, 'id' | 'balance'>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newWallet: WalletType = {
      ...walletData,
      id: Date.now().toString(),
      balance: 0,
    };
    const updated = [...wallets, newWallet];
    setWallets(updated);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updated));
    setLoading(false);
    showFeedback('success', 'Wallet Created');
  };

  const addTransaction = async (txData: Omit<TransactionType, 'id' | 'date'>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newTx: TransactionType = {
      ...txData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    await AsyncStorage.setItem('@transactions', JSON.stringify(updatedTx));

    // Update wallet balance
    const updatedWallets = wallets.map(w => {
      if (w.id === txData.walletId) {
        return {
          ...w,
          balance: w.balance + (txData.type === 'deposit' ? txData.amount : -txData.amount)
        };
      }
      return w;
    });
    setWallets(updatedWallets);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updatedWallets));
    setLoading(false);
    showFeedback('success', txData.type === 'deposit' ? 'Successfully Deposited' : 'Successfully Withdrawn');
  };

  const addGoal = async (goalData: Omit<GoalType, 'id'>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newGoal: GoalType = {
      ...goalData,
      id: Date.now().toString(),
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    await AsyncStorage.setItem('@goals', JSON.stringify(updated));
    setLoading(false);
    showFeedback('success', 'Goal Defined');
  };

  const addReceivable = async (receivableData: Omit<ReceivableType, 'id' | 'date'>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newReceivable: ReceivableType = {
      ...receivableData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const updated = [...receivables, newReceivable];
    setReceivables(updated);
    await AsyncStorage.setItem('@receivables', JSON.stringify(updated));
    setLoading(false);
    showFeedback('success', 'Added to Receivables');
  };

  const addDebt = async (debtData: Omit<DebtType, 'id' | 'date'>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newDebt: DebtType = {
      ...debtData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const updated = [...debts, newDebt];
    setDebts(updated);
    await AsyncStorage.setItem('@debts', JSON.stringify(updated));
    setLoading(false);
    showFeedback('success', 'Debt Recorded');
  };
  
  const addRecursion = async (recursionData: Omit<RecursionType, 'id' | 'date'>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newRecursion: RecursionType = {
      ...recursionData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const updated = [...recursions, newRecursion];
    setRecursions(updated);
    await AsyncStorage.setItem('@recursions', JSON.stringify(updated));
    setLoading(false);
    showFeedback('success', 'Recursion Added');
  };

  const editRecursion = async (id: string, updates: Partial<Omit<RecursionType, 'id' | 'date'>>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const updated = recursions.map(r => r.id === id ? { ...r, ...updates } : r);
    setRecursions(updated);
    await AsyncStorage.setItem('@recursions', JSON.stringify(updated));
    setLoading(false);
    showFeedback('success', 'Recursion Updated');
  };

  const deleteRecursion = async (id: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const updated = recursions.filter(r => r.id !== id);
    setRecursions(updated);
    await AsyncStorage.setItem('@recursions', JSON.stringify(updated));
    setLoading(false);
    showFeedback('delete', 'Recursion Removed');
  };

  const processRecursion = async (id: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const recursion = recursions.find(r => r.id === id);
    if (!recursion) {
      setLoading(false);
      return;
    }

    // Add as a deposit transaction
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

    // Update wallet balance
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
    
    setLoading(false);
    showFeedback('success', 'Processed Successfully');
  };

  const setUserImage = async (image: string | null) => {
    if (image) await AsyncStorage.setItem('@userImage', image);
    else await AsyncStorage.removeItem('@userImage');
    setUserImageState(image);
  };

  const setStatusCardBg = async (image: string | null) => {
    if (image) await AsyncStorage.setItem('@statusCardBg', image);
    else await AsyncStorage.removeItem('@statusCardBg');
    setStatusCardBgState(image);
  };

  const editWallet = async (id: string, updates: Partial<WalletType>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const updated = wallets.map(w => w.id === id ? { ...w, ...updates } : w);
    setWallets(updated);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updated));
    setLoading(false);
    showFeedback('success', 'Wallet Updated');
  };

  const reorderWallets = async (newWallets: WalletType[]) => {
    setWallets(newWallets);
    await AsyncStorage.setItem('@wallets', JSON.stringify(newWallets));
  };

  const editGoal = async (id: string, updates: Partial<GoalType>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const updated = goals.map(g => g.id === id ? { ...g, ...updates } : g);
    setGoals(updated);
    await AsyncStorage.setItem('@goals', JSON.stringify(updated));
    setLoading(false);
    showFeedback('success', 'Goal Updated');
  };

  const deleteWallet = async (id: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const updated = wallets.filter(w => w.id !== id);
    setWallets(updated);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updated));
    setLoading(false);
    showFeedback('delete', 'Wallet Removed');
    // Optional: could delete associated transactions and goals here
  };

  const deleteGoal = async (id: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    await AsyncStorage.setItem('@goals', JSON.stringify(updated));
    setLoading(false);
    showFeedback('delete', 'Goal Removed');
  };

  const deleteReceivable = async (id: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const updated = receivables.filter(r => r.id !== id);
    setReceivables(updated);
    await AsyncStorage.setItem('@receivables', JSON.stringify(updated));
    setLoading(false);
    showFeedback('delete', 'Removed from Receivables');
  };

  const deleteDebt = async (id: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const updated = debts.filter(d => d.id !== id);
    setDebts(updated);
    await AsyncStorage.setItem('@debts', JSON.stringify(updated));
    setLoading(false);
    showFeedback('delete', 'Debt Cleared');
  };

  const deleteTransaction = async (id: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) {
      setLoading(false);
      return;
    }

    const updatedTx = transactions.filter(t => t.id !== id);
    setTransactions(updatedTx);
    await AsyncStorage.setItem('@transactions', JSON.stringify(updatedTx));

    // Reverse balance
    const updatedWallets = wallets.map(w => {
      if (w.id === txToDelete.walletId) {
        return {
          ...w,
          balance: w.balance + (txToDelete.type === 'deposit' ? -txToDelete.amount : txToDelete.amount)
        };
      }
      return w;
    });
    setWallets(updatedWallets);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updatedWallets));
    setLoading(false);
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
    setRecursions([]);
    setAppPinState(null);
    setIsSecurityEnabled(false);
    setIsBiometricsEnabled(false);
    setUserImageState(null);
    setIsDarkMode(true);
    showFeedback('delete', 'All Data Cleared');
  };

  const toggleTheme = async () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    await AsyncStorage.setItem('@isDarkMode', newVal.toString());
  };

  const colors = isDarkMode ? darkPalette : lightPalette;

  const importData = async (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);

      if (typeof data !== 'object') throw new Error('Invalid data format');

      const keysToSave: [string, string | null][] = [
        ['@username', data.username || null],
        ['@wallets', data.wallets ? JSON.stringify(data.wallets) : '[]'],
        ['@transactions', data.transactions ? JSON.stringify(data.transactions) : '[]'],
        ['@goals', data.goals ? JSON.stringify(data.goals) : '[]'],
        ['@receivables', data.receivables ? JSON.stringify(data.receivables) : '[]'],
        ['@debts', data.debts ? JSON.stringify(data.debts) : '[]'],
        ['@groceryLists', data.groceryLists ? JSON.stringify(data.groceryLists) : '[]'],
        ['@travels', data.travels ? JSON.stringify(data.travels) : '[]'],
        ['@withdrawPresets', data.withdrawPresets ? JSON.stringify(data.withdrawPresets) : '[]'],
        ['@recursions', data.recursions ? JSON.stringify(data.recursions) : '[]'],
        ['@appPin', data.appPin || null],
        ['@isSecurityEnabled', data.isSecurityEnabled !== undefined ? String(data.isSecurityEnabled) : null],
        ['@isBiometricsEnabled', data.isBiometricsEnabled !== undefined ? String(data.isBiometricsEnabled) : null],
        ['@isDarkMode', data.isDarkMode !== undefined ? String(data.isDarkMode) : null],
        ['@userImage', data.userImage || null],
        ['@statusCardBg', data.statusCardBg || null],
      ];

      for (const [key, value] of keysToSave) {
        if (value !== null) {
          await AsyncStorage.setItem(key, value);
        } else {
          await AsyncStorage.removeItem(key);
        }
      }

      // Update local state
      setUserNameState(data.username || null);
      setWallets(data.wallets || []);
      setTransactions(data.transactions || []);
      setGoals(data.goals || []);
      setReceivables(data.receivables || []);
      setDebts(data.debts || []);
      setGroceryLists(data.groceryLists || []);
      setTravels(data.travels || []);
      setWithdrawPresets(data.withdrawPresets || []);
      setRecursions(data.recursions || []);
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

      setUserImageState(data.userImage || null);
      if (data.statusCardBg !== undefined) setStatusCardBgState(data.statusCardBg);

      showFeedback('success', 'Data Imported Successfully');
    } catch (e) {
      console.error('Failed to import data', e);
      showFeedback('error', 'Failed to import data');
      throw e;
    }
  };

  const showFeedback = (type: 'success' | 'delete' | 'error', message: string) => {
    setFeedback({ visible: true, type, message });
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, visible: false }));
    }, 1500); // Hide modal after 1.5 seconds
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
    const newTravel: TravelType = {
      ...travelData,
      id: Date.now().toString(),
    };
    const updated = [newTravel, ...travels];
    setTravels(updated);
    await AsyncStorage.setItem('@travels', JSON.stringify(updated));
    showFeedback('success', 'Travel Recorded');
  };

  const deleteTravel = async (id: string) => {
    const updated = travels.filter(t => t.id !== id);
    setTravels(updated);
    await AsyncStorage.setItem('@travels', JSON.stringify(updated));
    showFeedback('delete', 'Travel Removed');
  };

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
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const receivable = receivables.find(r => r.id === id);
    if (!receivable) {
      setLoading(false);
      return;
    }

    // 1. Update Receivables (Partial or Full)
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

    // 2. Add Transaction
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

    // 3. Update Wallet Balance
    const updatedWallets = wallets.map(w => {
      if (w.id === walletId) {
        return { ...w, balance: w.balance + amount };
      }
      return w;
    });
    setWallets(updatedWallets);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updatedWallets));

    setLoading(false);
    showFeedback('success', isFullPayment ? 'Payment Received' : 'Partial Payment Recorded');
  };

  const payDebt = async (id: string, amount: number) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const debt = debts.find(d => d.id === id);
    if (!debt) {
      setLoading(false);
      return;
    }

    // 1. Update Debts (Partial or Full)
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

    // 2. Add Transaction to History (but don't touch wallets)
    const newTx: TransactionType = {
      id: Date.now().toString(),
      title: `Settled debt to ${debt.personName}`,
      amount: amount,
      date: new Date().toISOString(),
      type: 'withdrawal',
      walletId: 'external', // Marks it as not affecting any local wallet balance
    };
    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    await AsyncStorage.setItem('@transactions', JSON.stringify(updatedTx));

    setLoading(false);
    showFeedback('success', isFullPayment ? 'Debt Settled' : 'Partial Payment Recorded');
  };

  const totalReceivables = receivables.reduce((acc, r) => acc + r.amount, 0);
  const totalDebts = debts.reduce((acc, d) => acc + d.amount, 0);
  const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);

  const calculateStreak = () => {
    if (transactions.length === 0) return 0;

    // Get unique dates in YYYY-MM-DD format
    const uniqueDates = new Set(
      transactions.map(tx => new Date(tx.date).toISOString().split('T')[0])
    );

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if streak is broken (neither today nor yesterday has a transaction)
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
  };

  const deleteWithdrawPreset = async (id: string) => {
    const updated = withdrawPresets.filter(p => p.id !== id);
    setWithdrawPresets(updated);
    await AsyncStorage.setItem('@withdrawPresets', JSON.stringify(updated));
    showFeedback('delete', 'Preset Removed');
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
        deleteReceivable,
        totalReceivables,
        debts,
        addDebt,
        deleteDebt,
        totalDebts,
        totalBalance,
        clearData,
        feedback,
        showFeedback,
        confirmState,
        showConfirm,
        closeConfirm,
        loading,
        userImage,
        setUserImage,
        importData,
        isDarkMode,
        toggleTheme,
        colors,
        groceryLists,
        addGroceryList,
        deleteGroceryList,
        addGroceryItem,
        deleteGroceryItem,
        toggleGroceryItem,
        travels,
        addTravel,
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
        recursions,
        addRecursion,
        editRecursion,
        deleteRecursion,
        processRecursion
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
