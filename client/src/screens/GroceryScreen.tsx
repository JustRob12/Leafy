import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import { Plus, ShoppingCart, Trash2, Calendar, ChevronLeft, ChevronRight, List } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import { useNavigation } from '@react-navigation/native';

export default function GroceryScreen() {
  const { groceryLists, addGroceryList, deleteGroceryList, showConfirm, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const navigation = useNavigation<any>();

  const [modalVisible, setModalVisible] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const daysOfWeek = [
    { label: 'M', value: 1 },
    { label: 'T', value: 2 },
    { label: 'W', value: 3 },
    { label: 'Th', value: 4 },
    { label: 'F', value: 5 },
    { label: 'S', value: 6 },
    { label: 'Su', value: 0 },
  ];

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddList = async () => {
    if (listTitle.trim()) {
      await addGroceryList(listTitle.trim(), selectedDays);
      setModalVisible(false);
      setListTitle('');
      setSelectedDays([]);
    }
  };

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      "Delete List?",
      `Are you sure you want to remove "${name}"? This will delete all items inside it.`,
      () => deleteGroceryList(id)
    );
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const grandTotal = groceryLists.reduce((acc, list) => 
    acc + list.items.reduce((sum, item) => sum + (item.price || 0), 0), 
    0
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>

          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grocery Lists</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {groceryLists.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <ShoppingCart size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No lists yet</Text>
            <Text style={styles.emptySubtitle}>Start your shopping journey by creating your first grocery list!</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => setModalVisible(true)}
            >
              <Plus size={18} color="#ffffff" />
              <Text style={styles.createBtnText}>Create My First List</Text>
            </TouchableOpacity>
          </View>
        ) : (
          groceryLists.map((list) => (
            <TouchableOpacity
              key={list.id}
              style={styles.listCard}
              onPress={() => navigation.navigate('GroceryDetail', { listId: list.id })}
            >
              <View style={styles.accentLine} />
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <View>
                    <View style={styles.titleRow}>
                      <Text style={styles.listName} numberOfLines={1}>{list.title}</Text>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.dateText}>{formatDate(list.date)}</Text>
                      {list.scheduledDays && list.scheduledDays.length > 0 && (
                        <>
                          <View style={styles.dotSeparator} />
                          <Text style={styles.scheduledDaysText}>
                            {list.scheduledDays.map(d => daysOfWeek.find(dow => dow.value === d)?.label).join(', ')}
                          </Text>
                        </>
                      )}
                      <View style={styles.dotSeparator} />
                      <Text style={styles.itemCountTextInline}>{list.items.length} items</Text>
                    </View>
                    {list.scheduledDays && list.scheduledDays.includes(new Date().getDay()) && (
                      <View style={[styles.todayBadge, { marginTop: 8, alignSelf: 'flex-start' }]}>
                        <Text style={styles.todayBadgeText}>TODAY TO BUY</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(list.id, list.title)}
              >
                <Trash2 size={16} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>


      {/* TOTAL FOOTER (Persistent) */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Grand Total</Text>
          <Text style={styles.footerValue}>₱{grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
        </View>
        <TouchableOpacity style={styles.mainAddBtn} onPress={() => setModalVisible(true)}>
          <Plus size={24} color="#ffffff" />
          <Text style={styles.mainAddBtnText}>Create List</Text>
        </TouchableOpacity>
      </View>

      <ActionSheet
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setListTitle(''); }}
        title="New Grocery List"
      >
        <Text style={styles.inputLabel}>List Title</Text>
        <View style={styles.inputWrapper}>
          <ShoppingCart size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., Saturday Grocery"
            placeholderTextColor={colors.textMuted}
            value={listTitle}
            onChangeText={setListTitle}
            autoFocus
          />
        </View>

        <Text style={styles.inputLabel}>Schedule Days (Weekly)</Text>
        <View style={styles.daysPicker}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day.value}
              style={[
                styles.dayChip,
                selectedDays.includes(day.value) && styles.dayChipActive
              ]}
              onPress={() => toggleDay(day.value)}
            >
              <Text style={[
                styles.dayChipText,
                selectedDays.includes(day.value) && styles.dayChipTextActive
              ]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, !listTitle.trim() && styles.saveBtnDisabled]}
          onPress={handleAddList}
          disabled={!listTitle.trim()}
        >
          <Text style={styles.saveBtnText}>Create List</Text>
        </TouchableOpacity>
      </ActionSheet>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  addBtnHeader: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 140,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
    gap: 8,
  },
  createBtnText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: '#ffffff',
  },
  listCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? colors.border : colors.primary + '22',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.2 : 0.04,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: colors.primary,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingLeft: 26,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
  },
  listName: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
    flexShrink: 1, // Allow truncation
    flex: 1, // Fill available width for better truncation
  },
  dateText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
    marginHorizontal: 8,
    opacity: 0.5,
  },
  itemCountTextInline: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.primary,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 2,
  },
  inputLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  daysPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  dayChipTextActive: {
    color: '#ffffff',
    fontFamily: theme.fonts.bold,
  },
  scheduledDaysText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: colors.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
    display: 'none', // Hidden in favor of footer button
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  todayBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  todayBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    color: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  footerValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: colors.primary,
  },
  mainAddBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  mainAddBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: '#ffffff',
  },
});
