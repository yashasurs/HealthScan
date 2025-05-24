import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

/**
 * Network Monitor Utility
 * Monitors network connectivity and provides utilities for network-related functions
 */
class NetworkMonitor {
  constructor() {
    this.isConnected = true;
    this.connectionType = null;
    this.connectionQuality = null;
    this.listeners = [];
    this.unsubscribe = null;
    this.isInitialized = false;
  }
  
  /**
   * Initialize the network monitoring
   */  initialize() {
    if (this.isInitialized) return;
    
    try {
      // Subscribe to network info updates
      this.unsubscribe = NetInfo.addEventListener(state => {
        const prevConnected = this.isConnected;
        this.isConnected = state.isConnected;
        this.connectionType = state.type;
        this.connectionQuality = this.getConnectionQuality(state);
        
        // Notify listeners if connection state changed
        if (prevConnected !== this.isConnected) {
          this.notifyListeners();
        }
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize network monitoring:', error);
    }
  }
  
  /**
   * Get current connection quality based on connection type
   * @param {Object} netInfoState - The NetInfo state object
   * @returns {string} - Connection quality (excellent, good, fair, poor, unknown)
   */
  getConnectionQuality(netInfoState) {
    if (!netInfoState.isConnected) return 'none';
    
    const { type, isConnectionExpensive, details } = netInfoState;
    
    switch (type) {
      case 'wifi':
        return 'excellent';
      case 'cellular':
        if (Platform.OS === 'ios') {
          if (details.cellularGeneration === '4g') return 'good';
          if (details.cellularGeneration === '3g') return 'fair';
          if (details.cellularGeneration === '2g') return 'poor';
        } else if (Platform.OS === 'android') {
          if (details.cellularGeneration === 'lte' || details.cellularGeneration === '4g') return 'good';
          if (details.cellularGeneration === 'hsdpa' || 
              details.cellularGeneration === 'hspa' ||
              details.cellularGeneration === 'evdo' ||
              details.cellularGeneration === '3g') return 'fair';
          if (details.cellularGeneration === 'edge' || 
              details.cellularGeneration === 'gprs' ||
              details.cellularGeneration === 'cdma' ||
              details.cellularGeneration === '2g') return 'poor';
        }
        return 'fair';
      case 'ethernet':
        return 'excellent';
      case 'unknown':
        return 'unknown';
      default:
        return 'unknown';
    }
  }
  
  /**
   * Add a listener for network state changes
   * @param {Function} listener - Callback function when network state changes
   * @returns {Function} - Function to remove the listener
   */  addListener(listener) {
    if (typeof listener !== 'function') return () => {};
    
    // Initialize monitoring if not already initialized
    if (!this.isInitialized) {
      this.initialize();
    }
    
    this.listeners.push(listener);
    
    // Return a function to remove this listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all listeners of network state change
   */
  notifyListeners() {
    const state = {
      isConnected: this.isConnected,
      connectionType: this.connectionType,
      connectionQuality: this.connectionQuality
    };
    
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in network state listener:', error);
      }
    });
  }
  
  /**
   * Check if device is currently connected to the internet
   * @returns {Promise<boolean>} - True if connected
   */
  async isNetworkAvailable() {
    try {
      const state = await NetInfo.fetch();
      return !!state.isConnected;
    } catch (error) {
      console.error('Error checking network availability:', error);
      return false;
    }
  }
  
  /**
   * Get detailed network state information
   * @returns {Promise<Object>} - Network state info
   */
  async getNetworkInfo() {
    try {
      const state = await NetInfo.fetch();
      
      return {
        isConnected: state.isConnected,
        connectionType: state.type,
        connectionQuality: this.getConnectionQuality(state),
        details: state.details,
        isInternetReachable: state.isInternetReachable,
        isConnectionExpensive: state.isConnectionExpensive,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return {
        isConnected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Clean up resources when component unmounts
   */
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.listeners = [];
  }
}

// Create and export a singleton instance
const networkMonitor = new NetworkMonitor();
export default networkMonitor;
