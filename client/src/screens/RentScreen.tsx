import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { 
  ChevronLeft, 
  Plus, 
  Home, 
  MapPin, 
  Calendar, 
  Trash2, 
  Zap,
  CreditCard,
  Building,
  CheckCircle2
} from 'lucide-react-native';
import { useAppContext, RentType } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const rf = (size: number) => Math.round(size * scale);

export default function RentScreen() {
  const { 
    rents, 
    deleteRent, 
    payRentMonth, 
    showConfirm, 
    colors, 
    isDarkMode,
    usdToPhpRate,
    wallets
  } = useAppContext();
  
  const navigation = useNavigation<any>();

  const getDaysRemaining = (dueDateStr: string) => {
    if (!dueDateStr) return 999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalMonthlyRentPhp = rents.reduce((acc, item) => {
    const val = item.currency === 'USD' ? item.monthlyAmount * usdToPhpRate : item.monthlyAmount;
    return acc + val;
  }, 0);

  const handleDelete = (item: RentType) => {
    showConfirm(
      "Delete Rent Property",
      `Are you sure you want to remove "${item.propertyName}" (${item.location})?`,
      () => deleteRent(item.id),
      true
    );
  };

  const handlePayRent = (item: RentType) => {
    showConfirm(
      "Pay Rent",
      `Pay monthly rent of ${item.currency === 'USD' ? '$' : '₱'}${item.monthlyAmount.toLocaleString()} for "${item.propertyName}"?`,
      () => payRentMonth(item.id)
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Rent Tracker</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddRent')} 
          style={[styles.addHeaderBtn, { backgroundColor: colors.primary }]}
        >
          <Plus size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <LinearGradient
          colors={isDarkMode ? ['#065f46', '#047857'] : ['#10b981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Total Monthly Rent</Text>
              <Text style={styles.summaryAmount}>
                ₱{totalMonthlyRentPhp.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.summaryBadge}>
              <Home size={22} color="#ffffff" />
              <Text style={styles.summaryBadgeText}>{rents.length} Properties</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Rent List */}
        {rents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Building size={48} color={colors.textMuted + '66'} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Rent Properties Added</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Record your rented boarding houses, apartments, or rooms in different locations without deadlines.
            </Text>
            <TouchableOpacity 
              style={[styles.emptyAddBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AddRent')}
            >
              <Plus size={18} color="#ffffff" />
              <Text style={styles.emptyAddBtnText}>Add First Rent Property</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {rents.map((item) => {
              const daysRemaining = getDaysRemaining(item.dueDate);
              const isUrgent = daysRemaining <= 3;
              const linkedWallet = wallets.find(w => w.id === item.walletId);

              if (isUrgent) {
                return (
                  <LinearGradient
                    key={item.id}
                    colors={['#ef4444', '#dc2626', '#991b1b']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardUrgentGradient}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.cardTitleBox}>
                        <Text style={styles.urgentBadgeText}>
                          🚨 RENT DUE IN {daysRemaining <= 0 ? 'TODAY' : `${daysRemaining} DAYS`}
                        </Text>
                        <Text style={styles.cardProductNameWhite}>{item.propertyName}</Text>
                        <View style={styles.locationBadgeWhite}>
                          <MapPin size={12} color="#ffffff" />
                          <Text style={styles.locationTextWhite} numberOfLines={1}>{item.location}</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtnUrgent}>
                        <Trash2 size={18} color="rgba(255, 255, 255, 0.9)" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardBodyRow}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.cardSubLabelWhite}>Monthly Rent</Text>
                        <Text 
                          style={styles.cardAmountWhite}
                          numberOfLines={1}
                          adjustsFontSizeToFit={true}
                          minimumFontScale={0.5}
                        >
                          {item.currency === 'USD' ? '$' : '₱'}{item.monthlyAmount.toLocaleString()} / mo
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end', flex: 1 }}>
                        <Text style={styles.cardSubLabelWhite}>Date Started</Text>
                        <Text style={styles.cardTotalWhite}>{item.startDate}</Text>
                      </View>
                    </View>

                    {/* Footer Status */}
                    <View style={styles.cardFooterRow}>
                      <View style={styles.dueDateBadgeUrgent}>
                        <Calendar size={14} color="#ffffff" />
                        <Text style={styles.dueDateTextUrgent}>Next Due: {item.dueDate}</Text>
                      </View>

                      {item.walletId ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                          <Zap size={13} color="#ffffff" />
                          <Text style={{ fontFamily: theme.fonts.bold, fontSize: rf(11), color: '#ffffff' }}>Auto-Deducting</Text>
                        </View>
                      ) : (
                        <TouchableOpacity 
                          onPress={() => handlePayRent(item)}
                          activeOpacity={0.8}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        >
                          <Text style={{ fontFamily: theme.fonts.bold, fontSize: rf(12), color: '#ffffff', textDecorationLine: 'underline' }}>
                            Mark Paid ›
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </LinearGradient>
                );
              }

              return (
                <View 
                  key={item.id}
                  style={[
                    styles.cardStandard, 
                    { 
                      backgroundColor: colors.card, 
                      borderColor: colors.border
                    }
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardTitleBox}>
                      <View style={styles.titleIconRow}>
                        <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                          <Home size={18} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.cardProductName, { color: colors.text }]} numberOfLines={1}>{item.propertyName}</Text>
                          <View style={styles.locationBadgeRow}>
                            <MapPin size={12} color="#ef4444" />
                            <Text style={[styles.locationText, { color: colors.textMuted }]} numberOfLines={1}>{item.location}</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                      <Trash2 size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardBodyRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.cardSubLabel, { color: colors.textMuted }]}>Monthly Rent</Text>
                      <Text 
                        style={[styles.cardAmount, { color: colors.primary }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.5}
                      >
                        {item.currency === 'USD' ? '$' : '₱'}{item.monthlyAmount.toLocaleString()} / mo
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end', flex: 1 }}>
                      <Text style={[styles.cardSubLabel, { color: colors.textMuted }]}>Next Payment Due</Text>
                      <Text style={[styles.cardTotal, { color: colors.text }]}>{item.dueDate}</Text>
                    </View>
                  </View>

                  {/* Footer Status */}
                  <View style={styles.cardFooterRowStandard}>
                    <View style={{ flex: 1 }}>
                      {item.walletId ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Zap size={14} color={colors.primary} />
                          <Text style={[styles.remainingText, { color: colors.primary, fontFamily: theme.fonts.bold }]}>
                            Auto-Deduct ({linkedWallet?.name || 'Wallet'})
                          </Text>
                        </View>
                      ) : (
                        <Text style={[styles.remainingText, { color: colors.textMuted }]}>
                          Started {item.startDate} ({item.paidCycles} months paid)
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity 
                      onPress={() => handlePayRent(item)}
                      style={{ paddingVertical: 4, paddingHorizontal: 6 }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontFamily: theme.fonts.semiBold, fontSize: rf(12), color: colors.primary }}>
                        Mark Paid ›
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
  },
  addHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
    color: 'rgba(255, 255, 255, 0.85)',
  },
  summaryAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(22),
    color: '#ffffff',
    marginTop: 4,
  },
  summaryBadge: {
    alignItems: 'flex-end',
    gap: 4,
  },
  summaryBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(12),
    color: '#ffffff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(13),
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  emptyAddBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
    color: '#ffffff',
  },
  listContainer: {
    gap: 16,
  },
  cardUrgentGradient: {
    borderRadius: 24,
    padding: 20,
    elevation: 6,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  urgentBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(10),
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardProductNameWhite: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
    color: '#ffffff',
  },
  locationBadgeWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationTextWhite: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
    color: 'rgba(255, 255, 255, 0.9)',
  },
  deleteBtnUrgent: {
    padding: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardTitleBox: {
    flex: 1,
  },
  cardSubLabelWhite: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardAmountWhite: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(20),
    color: '#ffffff',
  },
  cardTotalWhite: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
    color: '#ffffff',
    marginTop: 2,
  },
  cardBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  dueDateBadgeUrgent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueDateTextUrgent: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
    color: '#ffffff',
  },
  cardStandard: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
  },
  titleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardProductName: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(16),
  },
  locationBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
  },
  deleteBtn: {
    padding: 6,
  },
  cardSubLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
  },
  cardAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(18),
  },
  cardTotal: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
  },
  cardFooterRowStandard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    marginTop: 12,
  },
  remainingText: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
  },
});
