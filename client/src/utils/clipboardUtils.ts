import * as Clipboard from 'expo-clipboard';

/**
 * Extracts and parses a valid positive number string from the clipboard.
 * Strips currency symbols (₱, $, €, £, ¥), labels (PHP, USD, EUR, GBP),
 * commas, and surrounding text.
 * 
 * Examples:
 * - "₱1,250.50" -> "1250.50"
 * - "$ 500" -> "500"
 * - "Payment of 3,450.75 received" -> "3450.75"
 * - "12.3456" -> "12.34"
 * 
 * Returns string representation suitable for keypad input, or null if no valid number found.
 */
export const getNumberFromClipboard = async (): Promise<string | null> => {
  try {
    const rawText = await Clipboard.getStringAsync();
    if (!rawText || typeof rawText !== 'string') return null;

    // Check if string contains any digits
    if (!/\d/.test(rawText)) return null;

    // Remove commas, currency symbols, and common currency currency text
    let cleaned = rawText
      .replace(/,/g, '')
      .replace(/[₱$€£¥₹]/g, '')
      .replace(/\b(PHP|USD|EUR|GBP|JPY|AUD|CAD)\b/gi, '')
      .trim();

    // Match first sequence of digits with optional single decimal point
    const match = cleaned.match(/(\d+(?:\.\d+)?)/);
    if (!match) return null;

    const matchedStr = match[0];
    const num = parseFloat(matchedStr);

    if (isNaN(num) || num <= 0 || !isFinite(num)) return null;

    // Limit to 2 decimal places if it contains a decimal point
    if (matchedStr.includes('.')) {
      const [intPart, decPart] = matchedStr.split('.');
      const truncatedDec = decPart.slice(0, 2);
      return truncatedDec.length > 0 ? `${intPart}.${truncatedDec}` : intPart;
    }

    return matchedStr;
  } catch (error) {
    console.warn('Failed to read from clipboard:', error);
    return null;
  }
};
