import React from 'react';
import { StyleSheet, View, Text, ScrollView, Platform } from 'react-native';

/**
 * A component to display JSON data in a nicely formatted way
 * @param {object|array} data - The JSON data to display
 * @param {object} style - Additional style for the container
 * @param {string} noDataMessage - Message to display when there is no data
 */
const JsonDisplay = ({ data, style, noDataMessage = 'No data available' }) => {
  // Helper function to render JSON data
  const renderJson = () => {
    if (!data) return <Text style={styles.noData}>{noDataMessage}</Text>;
    
    // Make sure data is properly stringified and avoid any non-serializable objects
    let jsonString;
    try {
      jsonString = JSON.stringify(data, (key, value) => {
        // Handle functions, undefined values, or circular references
        if (typeof value === 'function' || typeof value === 'undefined') {
          return String(value);
        }
        return value;
      }, 2);
    } catch (error) {
      jsonString = `Error stringifying data: ${error.message}`;
    }
    
    return <Text style={styles.jsonText}>{jsonString}</Text>;
  };

  return (
    <ScrollView 
      style={[styles.container, style]} 
      showsVerticalScrollIndicator={true}
    >
      {renderJson()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  jsonText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  noData: {
    fontStyle: 'italic',
    color: '#777',
  },
});

export default JsonDisplay;
