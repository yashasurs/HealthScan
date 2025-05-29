import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';

/**
 * A loading overlay component that covers the parent component
 * @param {boolean} visible - Whether the loading overlay should be visible
 * @param {string} text - Optional text to display under the loading indicator
 * @param {string} message - Alternative prop for text (for backward compatibility)
 */
const LoadingOverlay = ({ visible = true, text, message }) => {
  const displayText = text || message;
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#000" />
      {displayText && <Text style={styles.text}>{displayText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
});

export default LoadingOverlay;
