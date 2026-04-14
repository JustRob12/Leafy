import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightPalette, darkPalette } from '../theme';

export type WalletType = {
  id: string;
  name: string;
  purpose: string;
  balance: number;
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
};

type AppContextType = {
  isLoaded: boolean;
  username: string | null;
  setUsername: (name: string) => Promise<void>;
  wallets: WalletType[];
  addWallet: (wallet: Omit<WalletType, 'id' | 'balance'>) => Promise<void>;
  transactions: TransactionType[];
  addTransaction: (tx: Omit<TransactionType, 'id' | 'date'>) => Promise<void>;
  goals: GoalType[];
  addGoal: (goal: Omit<GoalType, 'id'>) => Promise<void>;
  editWallet: (id: string, updates: Partial<WalletType>) => Promise<void>;
  editGoal: (id: string, updates: Partial<GoalType>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
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
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [username, setUserNameState] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [userImage, setUserImageState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode as requested
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedName = await AsyncStorage.getItem('@username');
      const storedWallets = await AsyncStorage.getItem('@wallets');
      const storedTransactions = await AsyncStorage.getItem('@transactions');
      const storedGoals = await AsyncStorage.getItem('@goals');
      const storedImage = await AsyncStorage.getItem('@userImage');

      if (storedName) setUserNameState(storedName);
      if (storedWallets) setWallets(JSON.parse(storedWallets));
      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      if (storedGoals) setGoals(JSON.parse(storedGoals));
      if (storedImage) setUserImageState(storedImage);
      
      const storedTheme = await AsyncStorage.getItem('@isDarkMode');
      if (storedTheme !== null) {
        setIsDarkMode(storedTheme === 'true');
      }
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setIsLoaded(true);
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
  
  const setUserImage = async (image: string | null) => {
    if (image) {
      await AsyncStorage.setItem('@userImage', image);
    } else {
      await AsyncStorage.removeItem('@userImage');
    }
    setUserImageState(image);
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
        ['@userImage', data.userImage || null],
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
      setUserImageState(data.userImage || null);
      
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

  const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);

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
        editWallet,
        editGoal,
        deleteWallet,
        deleteTransaction,
        deleteGoal,
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
        colors
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
