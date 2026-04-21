import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import { Plus, Trash2, ChevronLeft, CheckCircle2, Circle, DollarSign, Package, ShoppingBag } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function GroceryDetailScreen() {
  const { groceryLists, addGroceryItem, deleteGroceryItem, toggleGroceryItem, showConfirm, colors, isDarkMode } = useAppContext();
  const styles = getStyles(colors, isDarkMode);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { listId } = route.params;

  const currentList = groceryLists.find(l => l.id === listId);

  const [modalVisible, setModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');

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
        <View style={{ width: 36 }} />
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
              <View style={styles.itemMain}>
                <View style={styles.itemLeft}>
                  {item.completed ? (
                    <CheckCircle2 size={24} color={colors.primary} />
                  ) : (
                    <Circle size={24} color={colors.textMuted} />
                  )}
                  <View style={styles.itemTextContent}>
                    <Text style={[styles.itemName, item.completed && styles.textStrikethrough]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  </View>
                </View>
                
                <View style={styles.itemRight}>
                  {item.price !== undefined && (
                    <Text style={[styles.itemPrice, item.completed && styles.textStrikethrough]}>
                      ₱{item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); handleDelete(item.id, item.name); }}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* TOTAL FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Estimated Total</Text>
          <Text style={styles.footerValue}>₱{totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
        </View>
        <TouchableOpacity style={styles.mainAddBtn} onPress={() => setModalVisible(true)}>
          <Plus size={24} color="#ffffff" />
          <Text style={styles.mainAddBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <ActionSheet
        visible={modalVisible}
        onClose={() => { setModalVisible(false); resetForm(); }}
        title="Add Grocery Item"
      >
        <Text style={styles.inputLabel}>Item Name</Text>
        <View style={styles.inputWrapper}>
          <ShoppingBag size={18} color={colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., Milk, Eggs, Rice..."
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
              <Package size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g., 2, 500g..."
                placeholderTextColor={colors.textMuted}
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Price (Optional)</Text>
            <View style={styles.inputWrapper}>
              <DollarSign size={18} color={colors.textMuted} style={styles.inputIcon} />
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
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  headerSubtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 160,
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
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.2 : 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemCardCompleted: {
    opacity: 0.6,
    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : '#f8fafc',
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  itemTextContent: {
    flex: 1,
  },
  itemName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  itemQuantity: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  itemPrice: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: colors.primary,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  deleteBtn: {
    padding: 4,
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
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
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
});
