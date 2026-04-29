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
 * Reads an image file and returns it as a base64 string.
 * @param uri The URI of the image file
 * @returns Base64 string with data prefix
 */
export const readImageAsBase64 = async (uri: string | null | undefined): Promise<string | null> => {
  if (!uri) return null;
  
  // If it's already base64 or remote, return as is
  if (uri.startsWith('data:') || uri.startsWith('http')) return uri;

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Determine mime type from extension
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Failed to read image as base64:', error);
    return null;
  }
};

/**
 * Saves a base64 string as a permanent image file.
 * @param base64 The base64 string
 * @returns The permanent URI of the saved image
 */
export const saveBase64Image = async (base64: string | null | undefined): Promise<string | null> => {
  if (!base64) return null;
  if (!base64.startsWith('data:')) return base64; // Already a URI

  try {
    const extension = base64.split(';')[0].split('/')[1] || 'jpg';
    const filename = `imported_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
    const filePath = `${FileSystem.documentDirectory}${filename}`;
    
    // Remove the data prefix
    const base64Data = base64.split(',')[1];
    
    await FileSystem.writeAsStringAsync(filePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return filePath;
  } catch (error) {
    console.error('Failed to save base64 image:', error);
    return null;
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
