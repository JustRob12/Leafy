import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import { Plus, ShoppingCart, Trash2, Calendar, ChevronLeft, ChevronRight, List, Edit3 } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import { useNavigation } from '@react-navigation/native';

export default function GroceryScreen() {
  const { groceryLists, addGroceryList, editGroceryList, deleteGroceryList, showConfirm, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const navigation = useNavigation<any>();

  // Add List Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  // Edit List Modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSelectedDays, setEditSelectedDays] = useState<number[]>([]);

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

  const openEditModal = (list: any) => {
    setEditingListId(list.id);
    setEditTitle(list.title);
    setEditSelectedDays(list.scheduledDays || []);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (editingListId && editTitle.trim()) {
      await editGroceryList(editingListId, editTitle.trim(), editSelectedDays);
      setEditModalVisible(false);
      setEditingListId(null);
      setEditTitle('');
      setEditSelectedDays([]);
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

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={(e) => {
                    openEditModal(list);
                  }}
                >
                  <Edit3 size={16} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(list.id, list.title)}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
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

      {/* New List ActionSheet Modal */}
      <ActionSheet
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setListTitle(''); setSelectedDays([]); }}
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

      {/* Edit List ActionSheet Modal */}
      <ActionSheet
        visible={editModalVisible}
        onClose={() => { setEditModalVisible(false); setEditingListId(null); }}
        title="Edit Grocery List"
      >
        <Text style={styles.inputLabel}>List Title</Text>
        <View style={styles.inputWrapper}>
          <ShoppingCart size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., Saturday Grocery"
            placeholderTextColor={colors.textMuted}
            value={editTitle}
            onChangeText={setEditTitle}
          />
        </View>

        <Text style={styles.inputLabel}>Schedule Days (Weekly)</Text>
        <View style={styles.daysPicker}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day.value}
              style={[
                styles.dayChip,
                editSelectedDays.includes(day.value) && styles.dayChipActive
              ]}
              onPress={() => {
                if (editSelectedDays.includes(day.value)) {
                  setEditSelectedDays(editSelectedDays.filter(d => d !== day.value));
                } else {
                  setEditSelectedDays([...editSelectedDays, day.value]);
                }
              }}
            >
              <Text style={[
                styles.dayChipText,
                editSelectedDays.includes(day.value) && styles.dayChipTextActive
              ]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, !editTitle.trim() && styles.saveBtnDisabled]}
          onPress={handleSaveEdit}
          disabled={!editTitle.trim()}
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 24,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  createBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: '#ffffff',
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    flex: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listName: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginHorizontal: 6,
    opacity: 0.5,
  },
  scheduledDaysText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: colors.primary,
  },
  itemCountTextInline: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  todayBadge: {
    backgroundColor: '#10b98115',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  todayBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    color: '#10b981',
  },
  deleteBtn: {
    padding: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  footerValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  mainAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  mainAddBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: '#ffffff',
  },
  inputLabel: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  daysPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
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
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
  dayChipTextActive: {
    color: '#ffffff',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#ffffff',
  },
});
