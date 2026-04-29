import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import { Plus, Trash2, ChevronLeft, Calendar, Plane, MapPin, Wallet } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import LeafyDatePicker from '../components/LeafyDatePicker';
import { useNavigation } from '@react-navigation/native';
import { X, Image as ImageIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 48) / 3 - 0.2;

export default function TravelScreen() {
  const travels = useAppContext().travels;
  const deleteTravel = useAppContext().deleteTravel;
  const showConfirm = useAppContext().showConfirm;
  const colors = useAppContext().colors;
  const isDarkMode = useAppContext().isDarkMode;
  
  const styles = getStyles(colors, isDarkMode);
  const navigation = useNavigation<any>();
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      "Delete Trip?",
      `Are you sure you want to remove "${name}" from your records? This will delete the expense history for this trip.`,
      () => deleteTravel(id)
    );
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleTripClick = (trip: any) => {
    setSelectedTrip(trip);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>

          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Adventures</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {travels.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Plane size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Where to next?</Text>
            <Text style={styles.emptySubtitle}>You haven't recorded any trips yet. Start logging your adventures and expenses!</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate('AddTravel')}
            >
              <Plus size={18} color="#ffffff" />
              <Text style={styles.createBtnText}>Record First Trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          travels.map((trip) => (
            <TouchableOpacity 
              key={trip.id} 
              style={styles.travelCard}
              onPress={() => handleTripClick(trip)}
              activeOpacity={0.9}
            >
              
              <View style={styles.cardHeader}>
                <View style={styles.titleSection}>
                   <View style={styles.iconBox}>
                     <Plane size={18} color={colors.primary} />
                   </View>
                   <View>
                     <Text style={styles.tripName}>{trip.name}</Text>
                     <View style={styles.locationRow}>
                       <MapPin size={12} color={colors.textMuted} />
                       <Text style={styles.locationText}>{trip.location}</Text>
                     </View>
                   </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(trip.id, trip.name)}>
                   <Trash2 size={16} color="#ef4444" style={{ opacity: 0.8 }} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardFooter}>
                <View style={styles.dateInfo}>
                   <Calendar size={14} color={colors.textMuted} />
                   <View>
                     <Text style={styles.dateText}>{trip.startDate}</Text>
                     <Text style={styles.dateText}>{trip.endDate}</Text>
                   </View>
                </View>
                <View style={styles.expenseInfo}>
                   <Text style={styles.expenseLabel}>Expenses</Text>
                   <Text style={styles.expenseValue}>₱{trip.expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                </View>
              </View>
              
              {trip.images && trip.images.length > 0 && (
                <View style={styles.cardImagesPreview}>
                  {trip.images.slice(0, 3).map((img: string, i: number) => (
                    <Image key={i} source={{ uri: img }} style={styles.miniPreviewImage} />
                  ))}
                  {trip.images.length > 3 && (
                    <View style={styles.moreImagesIndicator}>
                      <Text style={styles.moreImagesText}>+{trip.images.length - 3}</Text>
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity 
                style={styles.recordBtn} 
                onPress={() => navigation.navigate('RecordMemories', { trip })}
              >
                <ImageIcon size={16} color="#ffffff" />
                <Text style={styles.recordBtnText}>Record Memories</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTravel')}
        activeOpacity={0.8}
      >
        <Plus size={30} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTripName}>{selectedTrip?.name}</Text>
                <View style={styles.modalLocationRow}>
                  <MapPin size={14} color={colors.textMuted} />
                  <Text style={styles.modalLocationText}>{selectedTrip?.location}</Text>
                </View>
                <Text style={styles.modalDateText}>{selectedTrip?.startDate} - {selectedTrip?.endDate}</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalImageGrid}>
                {selectedTrip?.images && selectedTrip.images.length > 0 ? (
                  <>
                    {selectedTrip.images.slice(0, 9).map((img: string, i: number) => (
                      <Image key={i} source={{ uri: img }} style={styles.modalGridImage} />
                    ))}
                    {selectedTrip.images.length < 9 && Array(9 - selectedTrip.images.length).fill(0).map((_, i) => (
                      <View key={`fill-${i}`} style={styles.emptyGridSlot} />
                    ))}
                  </>
                ) : (
                  <View style={styles.noImagesBox}>
                    <ImageIcon size={48} color={colors.border} />
                    <Text style={styles.noImagesText}>No memories recorded yet</Text>
                  </View>
                )}
              </View>

              <View style={styles.modalExpenseSection}>
                 <Text style={styles.modalExpenseLabel}>Total Trip Expenses</Text>
                 <Text style={styles.modalExpenseValue}>₱{selectedTrip?.expenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
              </View>

              <TouchableOpacity 
                style={[styles.recordBtn, { marginTop: 24 }]} 
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('RecordMemories', { trip: selectedTrip });
                }}
              >
                <ImageIcon size={18} color="#ffffff" />
                <Text style={styles.recordBtnText}>Add More Memories</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  travelCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? colors.border : colors.primary + '22',
    padding: 20,
    paddingHorizontal: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.2 : 0.04,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
  },
  tripName: {
    fontFamily: theme.fonts.bold,
    fontSize: 17,
    color: colors.text,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
    opacity: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  expenseInfo: {
    alignItems: 'flex-end',
  },
  expenseLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  expenseValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: colors.primary,
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
  dateInputPlaceholder: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    paddingVertical: 14,
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
  },
  cardImagesPreview: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  miniPreviewImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  moreImagesIndicator: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  modalTripName: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: colors.text,
    marginBottom: 4,
  },
  modalLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  modalLocationText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: colors.textMuted,
  },
  modalDateText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  closeBtn: {
    padding: 4,
  },
  modalImageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGridImage: {
    width: GRID_SIZE,
    height: GRID_SIZE,
  },
  emptyGridSlot: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  noImagesBox: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  noImagesText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  modalExpenseSection: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalExpenseLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalExpenseValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 32,
    color: colors.primary,
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  recordBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: '#ffffff',
  },
});
