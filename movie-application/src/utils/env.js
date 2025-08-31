// Environment utility functions

/**
 * Check if the app is running in production mode
 */
export const isProduction = import.meta.env.MODE === 'production';

/**
 * Check if the app is running in development mode
 */
export const isDevelopment = import.meta.env.MODE === 'development';

/**
 * Get the current environment mode
 */
export const getEnvironment = () => import.meta.env.MODE;

/**
 * Validate HTTPS requirement for production
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is valid for current environment
 */
export const validateHttps = (url) => {
  if (!url) return false;
  
  if (isProduction) {
    return url.startsWith('https://');
  }
  
  // In development, allow both HTTP and HTTPS
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Ensure HTTPS in production, allow HTTP in development
 * @param {string} url - URL to process
 * @param {string} fallback - Fallback HTTPS URL for production
 * @returns {string} - Processed URL
 */
export const enforceHttpsInProduction = (url, fallback) => {
  if (isProduction && url && !url.startsWith('https://')) {
    console.warn(`URL must use HTTPS in production: ${url}. Using fallback: ${fallback}`);
    return fallback;
  }
  return url;
};


