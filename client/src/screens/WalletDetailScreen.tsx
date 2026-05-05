import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, SafeAreaView, Modal } from 'react-native';
import { theme } from '../theme';
import { ChevronLeft, Edit2, QrCode, CreditCard, PieChart, TrendingUp, Tag, X } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const rf = (size: number) => Math.round(size * scale);

export default function WalletDetailScreen() {
  const { wallets, colors, isDarkMode } = useAppContext();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialWallet = route.params?.wallet;
  
  // Always get the freshest data from the global state
  const wallet = wallets.find(w => w.id === initialWallet?.id) || initialWallet;

  if (!wallet) return null;

  const handleEdit = () => {
    navigation.navigate('AddWallet', { wallet });
  };

  const [isQrEnlarged, setIsQrEnlarged] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Wallet Details</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editHeaderBtn}>
          <Edit2 size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Wallet Name Card (Visual identity) */}
        <View style={[styles.identityCard, { backgroundColor: wallet.color || colors.primary }]}>
            <View style={styles.identityGlow} />
            <Text style={styles.identityLabel}>NAME</Text>
            <Text style={styles.identityName}>{wallet.name}</Text>
            
            <View style={styles.identityFooter}>
                <View style={styles.identityPill}>
                    <Text style={styles.identityPillText}>{wallet.category || 'Personal'}</Text>
                </View>
                <Text style={styles.identityBalance}>
                    ₱{wallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </Text>
            </View>
        </View>

        {/* QR Code Section */}
        {wallet.qrCodeImage && (
          <View style={[styles.section, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc' }]}>
            <View style={styles.sectionHeader}>
              <QrCode size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>QR Code</Text>
            </View>
            <TouchableOpacity 
              style={styles.qrContainer} 
              onPress={() => setIsQrEnlarged(true)}
              activeOpacity={0.9}
            >
              <Image 
                source={{ uri: wallet.qrCodeImage }} 
                style={styles.qrImage as any} 
                resizeMode="contain" 
              />
              <Text style={[styles.qrSubtitle, { color: colors.textMuted }]}>Tap to enlarge QR Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <DetailItem 
            icon={<CreditCard size={18} color={colors.primary} />}
            label="Current Balance"
            value={`₱${wallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
            colors={colors}
          />
          <DetailItem 
            icon={<PieChart size={18} color={colors.primary} />}
            label="Category"
            value={wallet.category || 'Personal'}
            colors={colors}
          />
          <DetailItem 
            icon={<TrendingUp size={18} color={colors.primary} />}
            label="Interest Rate"
            value={wallet.interestRate > 0 ? `${wallet.interestRate}% p.a.` : 'None'}
            colors={colors}
          />
          <DetailItem 
            icon={<Tag size={18} color={colors.primary} />}
            label="Purpose"
            value={wallet.purpose}
            colors={colors}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
            <TouchableOpacity style={[styles.mainEditBtn, { backgroundColor: colors.primary }]} onPress={handleEdit}>
                <Edit2 size={20} color="#ffffff" />
                <Text style={styles.mainEditBtnText}>Edit Wallet Settings</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Enlarged QR Modal */}
      <Modal
        visible={isQrEnlarged}
        transparent
        animationType="fade"
        onRequestClose={() => setIsQrEnlarged(false)}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setIsQrEnlarged(false)}
        >
            <View style={styles.modalContent}>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsQrEnlarged(false)}>
                    <X size={24} color="#ffffff" />
                </TouchableOpacity>
                <Image 
                    source={{ uri: wallet.qrCodeImage }} 
                    style={styles.enlargedQr as any} 
                    resizeMode="contain" 
                />
                <Text style={styles.modalHint}>Tap anywhere to close</Text>
            </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function DetailItem({ icon, label, value, colors }: any) {
    return (
        <View style={[styles.infoItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoItemHeader}>
                {icon}
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
        </View>
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
  editHeaderBtn: {
    padding: 8,
    marginRight: -8,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  identityCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  identityGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: -40,
    right: -40,
  },
  identityLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(10),
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  identityName: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(26),
    color: '#ffffff',
    marginBottom: 20,
  },
  identityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  identityPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  identityPillText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: rf(12),
    color: '#ffffff',
  },
  identityBalance: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(20),
    color: '#ffffff',
  },
  section: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(14),
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  qrSubtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(12),
    textAlign: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  infoItem: {
    width: (Dimensions.get('window').width - 48 - 12) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  infoItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(11),
  },
  infoValue: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(15),
  },
  actions: {
    gap: 12,
  },
  mainEditBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  mainEditBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: rf(16),
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    alignItems: 'center',
  },
  enlargedQr: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: -60,
    right: 0,
    padding: 10,
  },
  modalHint: {
    fontFamily: theme.fonts.medium,
    fontSize: rf(14),
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 24,
  },
});
