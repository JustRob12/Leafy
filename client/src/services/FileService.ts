import * as FileSystem from 'expo-file-system';

/**
 * Ensures that an image URI is saved permanently in the app's document directory.
 * If the image is already in the permanent directory, it returns the same URI.
 * If it's a temporary URI (e.g. from ImagePicker), it copies it to the permanent directory.
 * @param uri The source URI of the image
 * @returns The permanent URI of the image
 */
export const saveImagePermanently = async (uri: string | null | undefined): Promise<string | null> => {
  if (!uri) return null;

  // If it's a base64 or remote URL, or already in document directory, don't copy
  if (
    uri.startsWith('data:') || 
    uri.startsWith('http') || 
    uri.startsWith(FileSystem.documentDirectory!)
  ) {
    return uri;
  }

  try {
    const filename = uri.split('/').pop();
    const newPath = `${FileSystem.documentDirectory}${Date.now()}_${filename}`;
    
    await FileSystem.copyAsync({
      from: uri,
      to: newPath,
    });
    
    return newPath;
  } catch (error) {
    console.error('Failed to save image permanently:', error);
    return uri; // Fallback to original URI if copy fails
  }
};

/**
 * Deletes a file from the document directory if it exists.
 * @param uri The URI of the file to delete
 */
export const deleteFile = async (uri: string | null | undefined) => {
  if (!uri || !uri.startsWith(FileSystem.documentDirectory!)) return;

  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
};
