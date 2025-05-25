import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';

/**
 * A network status banner that shows when the device is offline
 * @param {boolean} isConnected - Whether the device is connected to the internet
 */
const NetworkStatusBanner = ({ isConnected }) => {
  if (isConnected) return null;
  
  return (
    <SafeAreaView style={styles.networkAlert}>
      <Text style={styles.networkAlertText}>
        No internet connection
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  networkAlert: {
    backgroundColor: '#D32F2F',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkAlertText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NetworkStatusBanner;
