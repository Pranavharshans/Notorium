import validator from 'validator';

// We don't need to declare types for validator as they are included in @types/validator

export function isValidAudioUrl(url: string): boolean {
  try {
    // Check if it's a valid URL
    if (!validator.isURL(url)) {
      return false;
    }

    // Parse the URL to handle query parameters
    const parsedUrl = new URL(url);
    
    // Get the file path without query parameters
    const filePath = parsedUrl.pathname;

    // Get the extension from the file path
    const extension = filePath.split('.').pop()?.toLowerCase();

    // List of allowed audio file extensions
    const allowedExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'webm'];

    // Check if the extension is in the allowed list
    if (!extension || !allowedExtensions.includes(extension)) {
      return false;
    }

    // Only allow HTTPS URLs in production
    if (process.env.NODE_ENV === 'production' && !parsedUrl.protocol.startsWith('https')) {
      return false;
    }

    // Allow Firebase Storage URLs
    if (parsedUrl.hostname.includes('firebasestorage.googleapis.com')) {
      return true;
    }

    return true;
  } catch (error) {
    // If URL parsing fails, return false
    console.error('URL validation error:', error);
    return false;
  }
}