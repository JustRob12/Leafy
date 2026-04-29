import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronLeft, Image as ImageIcon, X, Save, Camera } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 40) / 3 - 0.2;

export default function RecordMemoriesScreen({ route }: any) {
  const { editTravel, colors, isDarkMode, showFeedback } = useAppContext();
  const trip = route.params?.trip;
  const navigation = useNavigation<any>();

  const [images, setImages] = useState<string[]>(trip?.images || []);
  const [saving, setSaving] = useState(false);

  if (!trip) {
    navigation.goBack();
    return null;
  }

  const pickImage = async () => {
    if (images.length >= 9) return;
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showFeedback('error', 'Camera roll permissions required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await editTravel(trip.id, { images });
      navigation.goBack();
    } catch (error) {
      showFeedback('error', 'Failed to save memories');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Record Memories</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>{trip.name} ({images.length}/9)</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <ImageIcon size={24} color={colors.primary} />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Travel Gallery</Text>
            <Text style={[styles.infoDesc, { color: colors.textMuted }]}>
              Select up to 6 of your best photos from this trip. We'll automatically crop them into perfect squares for your story.
            </Text>
          </View>
        </View>

        <View style={styles.imageGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.removeImageBtn}
                onPress={() => removeImage(index)}
              >
                <X size={14} color="#ffffff" />
              </TouchableOpacity>
              <View style={styles.indexBadge}>
                <Text style={styles.indexText}>{index + 1}</Text>
              </View>
            </View>
          ))}
          
          {images.length < 9 && (
            <TouchableOpacity 
              style={[styles.addImageBtn, { borderColor: colors.border, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc' }]} 
              onPress={pickImage}
            >
              <Camera size={32} color={colors.primary} />
              <Text style={[styles.addImageText, { color: colors.textMuted }]}>Add Photo</Text>
              <Text style={[styles.slotText, { color: colors.primary + '88' }]}>{9 - images.length} slots left</Text>
            </TouchableOpacity>
          )}

          {/* Empty placeholders to maintain grid shape */}
          {images.length < 8 && Array(Math.max(0, 8 - images.length)).fill(0).map((_, i) => (
            <View key={`placeholder-${i}`} style={[styles.placeholderSlot, { borderColor: colors.border + '44' }]} />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: colors.primary }]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Save size={20} color="#ffffff" />
              <Text style={styles.saveBtnText}>Save Memories</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
  },
  headerSubtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    marginTop: -2,
  },
  scrollContent: {
    padding: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    gap: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    marginBottom: 4,
  },
  infoDesc: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    overflow: 'hidden',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    color: '#000',
  },
  addImageBtn: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    marginTop: 8,
  },
  slotText: {
    fontFamily: theme.fonts.medium,
    fontSize: 9,
    marginTop: 2,
  },
  placeholderSlot: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#ffffff',
  },
});
