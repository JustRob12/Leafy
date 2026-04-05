import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  feedback: { visible: boolean; type: 'success' | 'delete'; message: string };
  showFeedback: (type: 'success' | 'delete', message: string) => void;
  confirmState: { visible: boolean; title: string; message: string; isDestructive?: boolean; onConfirm?: () => void };
  showConfirm: (title: string, message: string, onConfirm: () => void, isDestructive?: boolean) => void;
  closeConfirm: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [username, setUserNameState] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [feedback, setFeedback] = useState<{ visible: boolean; type: 'success' | 'delete'; message: string }>({
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

      if (storedName) setUserNameState(storedName);
      if (storedWallets) setWallets(JSON.parse(storedWallets));
      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      if (storedGoals) setGoals(JSON.parse(storedGoals));
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
    const newWallet: WalletType = {
      ...walletData,
      id: Date.now().toString(),
      balance: 0,
    };
    const updated = [...wallets, newWallet];
    setWallets(updated);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updated));
  };

  const addTransaction = async (txData: Omit<TransactionType, 'id' | 'date'>) => {
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
  };

  const addGoal = async (goalData: Omit<GoalType, 'id'>) => {
    const newGoal: GoalType = {
      ...goalData,
      id: Date.now().toString(),
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    await AsyncStorage.setItem('@goals', JSON.stringify(updated));
  };

  const editWallet = async (id: string, updates: Partial<WalletType>) => {
    const updated = wallets.map(w => w.id === id ? { ...w, ...updates } : w);
    setWallets(updated);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updated));
  };

  const editGoal = async (id: string, updates: Partial<GoalType>) => {
    const updated = goals.map(g => g.id === id ? { ...g, ...updates } : g);
    setGoals(updated);
    await AsyncStorage.setItem('@goals', JSON.stringify(updated));
  };

  const deleteWallet = async (id: string) => {
    const updated = wallets.filter(w => w.id !== id);
    setWallets(updated);
    await AsyncStorage.setItem('@wallets', JSON.stringify(updated));
    // Optional: could delete associated transactions and goals here
  };

  const deleteGoal = async (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    await AsyncStorage.setItem('@goals', JSON.stringify(updated));
  };

  const deleteTransaction = async (id: string) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return;

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
  };

  const clearData = async () => {
    await AsyncStorage.clear();
    setUserNameState(null);
    setWallets([]);
    setTransactions([]);
    setGoals([]);
  };

  const showFeedback = (type: 'success' | 'delete', message: string) => {
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
        closeConfirm
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
