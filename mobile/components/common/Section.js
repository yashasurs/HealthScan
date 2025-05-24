import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

/**
 * A section container component with a title
 * @param {string} title - The section title
 * @param {node} children - The content to render inside the section
 * @param {object} style - Additional style for the section container
 */
const Section = ({ title, children, style }) => {
  return (
    <View style={[styles.section, style]}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default Section;
