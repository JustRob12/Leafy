import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, Plus, CreditCard, Trash2, Calendar, AlertTriangle } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';

const SUBS_ICONS: { [key: string]: any } = {
  'capcut.png': require('../../public/subs/capcut.png'),
  'chatgpt.png': require('../../public/subs/chatgpt.png'),
  'disney.png': require('../../public/subs/disney.png'),
  'gemini.png': require('../../public/subs/gemini.png'),
  'netflix.png': require('../../public/subs/netflix.png'),
  'prime.png': require('../../public/subs/prime.png'),
  'spotify.png': require('../../public/subs/spotify.png'),
};

export default function SubscriptionScreen() {
  const { subscriptions, deleteSubscription, colors, isDarkMode, showConfirm } = useAppContext();
  const navigation = useNavigation<any>();
  const styles = getStyles(colors, isDarkMode);

  const handleDelete = (id: string, title: string) => {
    showConfirm(
      'Delete Subscription',
      `Are you sure you want to remove ${title}?`,
      () => deleteSubscription(id),
      true
    );
  };

  const getDaysRemaining = (dayOfMonth: number) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    let targetDate = new Date(currentYear, currentMonth, dayOfMonth);
    
    if (targetDate < today) {
      // If the day has passed this month, target next month
      targetDate = new Date(currentYear, currentMonth + 1, dayOfMonth);
    }
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddSubscription')} style={styles.addBtn}>
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {subscriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CreditCard size={64} color={colors.textMuted} opacity={0.2} />
            <Text style={styles.emptyText}>No subscriptions tracked yet</Text>
            <TouchableOpacity 
              style={styles.emptyAddBtn}
              onPress={() => navigation.navigate('AddSubscription')}
            >
              <Text style={styles.emptyAddBtnText}>Add Subscription</Text>
            </TouchableOpacity>
          </View>
        ) : (
          subscriptions.map((sub) => {
            const daysRemaining = getDaysRemaining(sub.dayOfMonth);
            const isDueSoon = daysRemaining <= 3;

            return (
              <TouchableOpacity 
                key={sub.id} 
                style={[styles.subscriptionCard, isDueSoon && styles.dueSoonCard]}
                onPress={() => navigation.navigate('AddSubscription', { subscription: sub })}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.iconWrapper, isDueSoon && styles.dueSoonIconWrapper, sub.icon && { backgroundColor: 'transparent', borderWidth: 0 }]}>
                    {sub.icon ? (
                      <Image source={SUBS_ICONS[sub.icon]} style={styles.subIcon} />
                    ) : (
                      <CreditCard size={20} color={isDueSoon ? '#ef4444' : colors.primary} />
                    )}
                  </View>
                  <View>
                    <Text style={[styles.subTitle, isDueSoon && styles.dueSoonText]}>{sub.title}</Text>
                    <View style={styles.row}>
                      <Calendar size={12} color={colors.textMuted} />
                      <Text style={styles.subDetail}>Every {sub.dayOfMonth}th</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.cardRight}>
                  <Text style={[styles.subAmount, isDueSoon && styles.dueSoonText]}>₱{sub.amount.toLocaleString()}</Text>
                  <View style={[styles.daysBadge, isDueSoon ? styles.dueSoonBadge : styles.normalBadge]}>
                    <Text style={[styles.daysText, isDueSoon && styles.dueSoonBadgeText]}>
                      {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDelete(sub.id, sub.title)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={16} color={isDueSoon ? '#ef4444' : colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  addBtn: {
    padding: 8,
    marginRight: -8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyAddBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: '#ffffff',
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dueSoonCard: {
    borderColor: '#fecaca',
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.05)' : '#fef2f2',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueSoonIconWrapper: {
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
  },
  subTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  dueSoonText: {
    color: '#ef4444',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subDetail: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  subAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  daysBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  normalBadge: {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
  },
  dueSoonBadge: {
    backgroundColor: '#ef4444',
  },
  daysText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    color: colors.textMuted,
  },
  dueSoonBadgeText: {
    color: '#ffffff',
  },
  deleteBtn: {
    marginTop: 4,
    padding: 4,
  },
  subIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    resizeMode: 'contain',
  },
});
