import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

/**
 * A reusable checkbox component
 * @param {boolean} checked - Whether the checkbox is checked
 * @param {function} onToggle - Function to call when the checkbox is toggled
 * @param {string} label - The label text for the checkbox
 */
const Checkbox = ({ checked, onToggle, label }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onToggle}>
      <View style={[styles.checkbox, checked && styles.checkboxActive]}>
        {checked && <View style={styles.checkboxInner} />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#fff',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
  },
});

export default Checkbox;
