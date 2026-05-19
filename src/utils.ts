/**
 * Safely encode data to a Base64 string that can be used in a URL.
 */
export function encodeData(data: any): string {
  try {
    return window.btoa(encodeURIComponent(JSON.stringify(data)));
  } catch (error) {
    console.error("Failed to encode data", error);
    return "";
  }
}

/**
 * Safely decode data from a Base64 string from a URL.
 */
export function decodeData(encoded: string): any | null {
  try {
    return JSON.parse(decodeURIComponent(window.atob(encoded)));
  } catch (error) {
    console.error("Failed to decode data", error);
    return null;
  }
}

/**
 * Helper to generate a short ID for list items
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Automatically converts Google Drive share links to raw image URLs.
 */
export function formatImageUrl(url: string): string {
  if (!url) return url;
  
  // Convert standard Google Drive link to a thumbnail link (more reliable for displaying)
  const gdriveRegex = /drive\.google\.com\/file\/d\/([^/]+)/;
  const match = url.match(gdriveRegex);
  if (match && match[1]) {
    // The thumbnail endpoint works well if the file is shared as "Anyone with the link"
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }
  
  return url;
}
