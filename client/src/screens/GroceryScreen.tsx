import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
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

  const handleAddList = async () => {
    if (listTitle.trim()) {
      await addGroceryList(listTitle.trim());
      setModalVisible(false);
      setListTitle('');
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grocery Lists</Text>
        <TouchableOpacity style={styles.addBtnHeader} onPress={() => setModalVisible(true)}>
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
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
                  <View style={styles.iconWrapper}>
                    <List size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.listName}>{list.title}</Text>
                    <View style={styles.detailsRow}>
                      <Text style={styles.dateText}>{formatDate(list.date)}</Text>
                      <View style={styles.dotSeparator} />
                      <Text style={styles.itemCountTextInline}>{list.items.length} items</Text>
                    </View>
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
            placeholder="e.g., Saturday Grocery, Party Needs..."
            placeholderTextColor={colors.textMuted}
            value={listTitle}
            onChangeText={setListTitle}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, !listTitle.trim() && styles.saveBtnDisabled]}
          onPress={handleAddList}
          disabled={!listTitle.trim()}
        >
          <Text style={styles.saveBtnText}>Create List</Text>
        </TouchableOpacity>
      </ActionSheet>
    </View>
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
    paddingBottom: 100,
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
    marginBottom: 2,
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
});
