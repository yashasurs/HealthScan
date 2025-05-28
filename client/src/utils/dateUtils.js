// Date utility functions for handling UTC timestamps from the server

/**
 * Format a UTC timestamp string to local date and time
 * @param {string} utcDateString - UTC timestamp from server
 * @param {object} options - Formatting options
 * @returns {string} Formatted local date and time
 */
export const formatDateTime = (utcDateString, options = {}) => {
  if (!utcDateString) return 'Unknown';
  
  try {
    // Create date object - if the string doesn't end with 'Z', append it to ensure UTC parsing
    const dateString = utcDateString.endsWith('Z') ? utcDateString : `${utcDateString}Z`;
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    return date.toLocaleString(undefined, defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a UTC timestamp string to local date only
 * @param {string} utcDateString - UTC timestamp from server
 * @returns {string} Formatted local date
 */
export const formatDate = (utcDateString) => {
  if (!utcDateString) return 'Unknown';
  
  try {
    const dateString = utcDateString.endsWith('Z') ? utcDateString : `${utcDateString}Z`;
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a UTC timestamp string to local time only
 * @param {string} utcDateString - UTC timestamp from server
 * @returns {string} Formatted local time
 */
export const formatTime = (utcDateString) => {
  if (!utcDateString) return 'Unknown';
  
  try {
    const dateString = utcDateString.endsWith('Z') ? utcDateString : `${utcDateString}Z`;
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Time';
    }
    
    return date.toLocaleTimeString();
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string} utcDateString - UTC timestamp from server
 * @returns {string} Relative time string
 */
export const getRelativeTime = (utcDateString) => {
  if (!utcDateString) return 'Unknown';
  
  try {
    const dateString = utcDateString.endsWith('Z') ? utcDateString : `${utcDateString}Z`;
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(utcDateString);
    }
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Invalid Date';
  }
};

/**
 * Check if a date is today
 * @param {string} utcDateString - UTC timestamp from server
 * @returns {boolean} True if the date is today
 */
export const isToday = (utcDateString) => {
  if (!utcDateString) return false;
  
  try {
    const dateString = utcDateString.endsWith('Z') ? utcDateString : `${utcDateString}Z`;
    const date = new Date(dateString);
    const today = new Date();
    
    return date.toDateString() === today.toDateString();
  } catch (error) {
    return false;
  }
};

/**
 * Format date for display in different contexts
 * @param {string} utcDateString - UTC timestamp from server
 * @param {string} format - Format type: 'full', 'short', 'date', 'time', 'relative'
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (utcDateString, format = 'full') => {
  switch (format) {
    case 'full':
      return formatDateTime(utcDateString);
    case 'short':
      return formatDateTime(utcDateString, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    case 'date':
      return formatDate(utcDateString);
    case 'time':
      return formatTime(utcDateString);
    case 'relative':
      return getRelativeTime(utcDateString);
    default:
      return formatDateTime(utcDateString);
  }
};
