import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, Upload, Info, ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
// @ts-ignore: Standard Expo legacy import path
import { cacheDirectory, writeAsStringAsync, readAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export default function DataTransferScreen() {
  const { username, wallets, transactions, goals, userImage, importData, clearData, showConfirm } = useAppContext();
  const navigation = useNavigation<any>();

  const handleExport = async () => {
    try {
      const backupData = {
        username,
        wallets,
        transactions,
        goals,
        userImage,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      const jsonString = JSON.stringify(backupData);
      const fileUri = cacheDirectory + 'leafy_backup.json';

      await writeAsStringAsync(fileUri, jsonString, { encoding: 'utf8' });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Leafy Data',
          UTI: 'public.json'
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
      }
    } catch (e) {
      console.error('Export failed', e);
      Alert.alert('Export Failed', 'There was an error creating your backup file.');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const fileContent = await readAsStringAsync(fileUri);

      // Verify it's a valid JSON first
      try {
        JSON.parse(fileContent);
      } catch {
        Alert.alert('Invalid File', 'The selected file is not a valid JSON backup.');
        return;
      }

      showConfirm(
        'Restore Data',
        'Warning: This will overwrite ALL current data in the app. Are you sure you want to proceed?',
        async () => {
          await importData(fileContent);
          navigation.goBack();
        },
        true
      );
    } catch (e) {
      console.error('Import failed', e);
      Alert.alert('Import Failed', 'There was an error reading the backup file.');
    }
  };

  const handleReset = () => {
    showConfirm(
      'Reset Application',
      'Warning: This will permanently delete all your data, including wallets, goals, and transactions. This action cannot be undone.',
      async () => {
        await clearData();
        navigation.goBack();
      },
      true
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Backup & Restore</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <ShieldCheck size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.infoText}>
            Transfer your data to another phone easily. Your data stays private and is only stored locally on your device.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup Data</Text>
          <Text style={styles.sectionDesc}>
            Save your wallets, goals, and transactions to a file. You can share this file to your new phone via Email, Drive, or Messaging.
          </Text>
          <TouchableOpacity style={styles.actionCard} onPress={handleExport}>
            <View style={[styles.iconWrapper, { backgroundColor: '#ecfdf5' }]}>
              <Download size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Export Data File</Text>
              <Text style={styles.cardSubtitle}>Generate leafy_backup.json</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restore Data</Text>
          <Text style={styles.sectionDesc}>
            Import a previously saved backup file. This will replace all current data in your app.
          </Text>
          <TouchableOpacity style={styles.actionCard} onPress={handleImport}>
            <View style={[styles.iconWrapper, { backgroundColor: '#eff6ff' }]}>
              <Upload size={24} color="#3b82f6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Import Data File</Text>
              <Text style={styles.cardSubtitle}>Select a JSON backup file</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Danger Zone</Text>
          <Text style={styles.sectionDesc}>
            Completely wipe all data from this device. Use this if you want to start fresh or have successfully transferred your data.
          </Text>
          <TouchableOpacity style={[styles.actionCard, { borderColor: '#fecaca', backgroundColor: '#fff5f5' }]} onPress={handleReset}>
            <View style={[styles.iconWrapper, { backgroundColor: '#fee2e2' }]}>
              <ShieldCheck size={24} color="#ef4444" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: '#b91c1c' }]}>Reset All Data</Text>
              <Text style={styles.cardSubtitle}>Delete everything permanently</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.warningBox}>
          <Info size={18} color={theme.colors.textMuted} />
          <Text style={styles.warningText}>
            Note: For security reasons, sensitive image files (like receipts) might need to be re-added if they were stored in external paths.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: theme.colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  infoIconWrapper: {
    marginRight: 16,
  },
  infoText: {
    flex: 1,
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: '#065f46',
    lineHeight: 18,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 6,
  },
  sectionDesc: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  warningBox: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  warningText: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 16,
  }
});
