import React from 'react';
import { StyleSheet, Text, TextInput as RNTextInput, View } from 'react-native';

/**
 * A reusable text input component with label
 * @param {string} label - The input label text
 * @param {string} value - The input value
 * @param {function} onChangeText - Function to call when text changes
 * @param {object} style - Additional style for the input container
 * @param {object} inputStyle - Additional style for the input field
 * @param {object} labelStyle - Additional style for the label
 * @param {boolean} secureTextEntry - Whether the input should hide text (for passwords)
 * @param {object} props - Additional props to pass to the TextInput
 */
const TextInput = ({ 
  label, 
  value, 
  onChangeText, 
  style, 
  inputStyle, 
  labelStyle, 
  secureTextEntry = false,
  error,
  ...props 
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <RNTextInput
        style={[styles.input, error && styles.inputError, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  inputError: {
    borderColor: '#D32F2F',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
  }
});

export default TextInput;
