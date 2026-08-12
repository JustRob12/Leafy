import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import { Plus, Trash2, ChevronLeft, CheckCircle2, Circle, Package, ShoppingBag, Edit3, ShoppingCart } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function GroceryDetailScreen() {
  const { groceryLists, addGroceryItem, deleteGroceryItem, toggleGroceryItem, editGroceryList, showConfirm, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { listId } = route.params;

  const currentList = groceryLists.find(l => l.id === listId);

  // Add Item Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');

  // Edit List Modal State
  const [editListModalVisible, setEditListModalVisible] = useState(false);
  const [editListTitle, setEditListTitle] = useState(currentList?.title || '');
  const [editListDays, setEditListDays] = useState<number[]>(currentList?.scheduledDays || []);

  const daysOfWeek = [
    { label: 'M', value: 1 },
    { label: 'T', value: 2 },
    { label: 'W', value: 3 },
    { label: 'Th', value: 4 },
    { label: 'F', value: 5 },
    { label: 'S', value: 6 },
    { label: 'Su', value: 0 },
  ];

  if (!currentList) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyTitle}>List not found</Text>
      </View>
    );
  }

  const handleAddItem = async () => {
    if (itemName.trim() && quantity.trim()) {
      await addGroceryItem(listId, {
        name: itemName.trim(),
        quantity: quantity.trim(),
        price: price ? parseFloat(price) : undefined,
      });
      setModalVisible(false);
      resetForm();
    }
  };

  const handleSaveEditList = async () => {
    if (editListTitle.trim()) {
      await editGroceryList(currentList.id, editListTitle.trim(), editListDays);
      setEditListModalVisible(false);
    }
  };

  const resetForm = () => {
    setItemName('');
    setQuantity('1');
    setPrice('');
  };

  const handleDelete = (itemId: string, name: string) => {
    showConfirm(
      "Remove Item?",
      `Are you sure you want to remove "${name}" from the list?`,
      () => deleteGroceryItem(listId, itemId)
    );
  };

  const totalCost = currentList.items.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const completedCount = currentList.items.filter(i => i.completed).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{currentList.title}</Text>
          <Text style={styles.headerSubtitle}>{completedCount} of {currentList.items.length} items collected</Text>
        </View>

        <TouchableOpacity 
          onPress={() => {
            setEditListTitle(currentList.title);
            setEditListDays(currentList.scheduledDays || []);
            setEditListModalVisible(true);
          }} 
          style={styles.editHeaderBtn}
        >
          <Edit3 size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentList.items.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <ShoppingBag size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Your list is empty</Text>
            <Text style={styles.emptySubtitle}>Start adding items you need to buy!</Text>
          </View>
        ) : (
          currentList.items.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.itemCard, item.completed && styles.itemCardCompleted]}
              onPress={() => toggleGroceryItem(listId, item.id)}
            >
              <View style={styles.checkboxWrapper}>
                {item.completed ? (
                  <CheckCircle2 size={22} color={colors.primary} />
                ) : (
                  <Circle size={22} color={colors.textMuted} />
                )}
              </View>

              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, item.completed && styles.itemNameCompleted]}>{item.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>

              {item.price !== undefined && (
                <Text style={[styles.itemPrice, item.completed && styles.itemPriceCompleted]}>
                  ₱{item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </Text>
              )}

              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.name)}
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
          <Text style={styles.footerLabel}>Total Estimated Cost</Text>
          <Text style={styles.footerValue}>₱{totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
        </View>
        <TouchableOpacity style={styles.mainAddBtn} onPress={() => setModalVisible(true)}>
          <Plus size={24} color="#ffffff" />
          <Text style={styles.mainAddBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Add Item ActionSheet Modal */}
      <ActionSheet
        visible={modalVisible}
        onClose={() => { setModalVisible(false); resetForm(); }}
        title="Add Grocery Item"
      >
        <Text style={styles.inputLabel}>Item Name</Text>
        <View style={styles.inputWrapper}>
          <Package size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., Milk, Eggs, Bread"
            placeholderTextColor={colors.textMuted}
            value={itemName}
            onChangeText={setItemName}
            autoFocus
          />
        </View>

        <View style={styles.rowInputs}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="e.g., 1, 2 kg"
                placeholderTextColor={colors.textMuted}
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Est. Price (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>₱</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, (!itemName.trim() || !quantity.trim()) && styles.saveBtnDisabled]}
          onPress={handleAddItem}
          disabled={!itemName.trim() || !quantity.trim()}
        >
          <Text style={styles.saveBtnText}>Add to List</Text>
        </TouchableOpacity>
      </ActionSheet>

      {/* Edit List ActionSheet Modal */}
      <ActionSheet
        visible={editListModalVisible}
        onClose={() => setEditListModalVisible(false)}
        title="Edit Grocery List"
      >
        <Text style={styles.inputLabel}>List Title</Text>
        <View style={styles.inputWrapper}>
          <ShoppingCart size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., Saturday Grocery"
            placeholderTextColor={colors.textMuted}
            value={editListTitle}
            onChangeText={setEditListTitle}
          />
        </View>

        <Text style={styles.inputLabel}>Schedule Days (Weekly)</Text>
        <View style={styles.daysPicker}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day.value}
              style={[
                styles.dayChip,
                editListDays.includes(day.value) && styles.dayChipActive
              ]}
              onPress={() => {
                if (editListDays.includes(day.value)) {
                  setEditListDays(editListDays.filter(d => d !== day.value));
                } else {
                  setEditListDays([...editListDays, day.value]);
                }
              }}
            >
              <Text style={[
                styles.dayChipText,
                editListDays.includes(day.value) && styles.dayChipTextActive
              ]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, !editListTitle.trim() && styles.saveBtnDisabled]}
          onPress={handleSaveEditList}
          disabled={!editListTitle.trim()}
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
  editHeaderBtn: {
    padding: 8,
    marginRight: -4,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  headerSubtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
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
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemCardCompleted: {
    opacity: 0.6,
  },
  checkboxWrapper: {
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  itemQty: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: colors.text,
    marginRight: 12,
  },
  itemPriceCompleted: {
    color: colors.textMuted,
  },
  deleteBtn: {
    padding: 6,
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
  currencySymbol: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
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
});
