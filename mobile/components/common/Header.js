import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * A reusable header component with a black background and white text
 * @param {string} title - The header title text
 * @param {object} style - Additional style for the header container
 * @param {object} textStyle - Additional style for the header text
 */
const Header = ({ title, style, textStyle }) => {
  return (
    <View style={[styles.header, style]}>
      <Text style={[styles.headerText, textStyle]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Header;
