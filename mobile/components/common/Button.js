import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';

/**
 * A reusable button component with consistent styling
 * @param {string} title - The button text
 * @param {function} onPress - Function to call when the button is pressed
 * @param {object} style - Additional style for the button
 * @param {object} textStyle - Additional style for the button text
 * @param {boolean} isLoading - Show loading indicator instead of text
 * @param {boolean} disabled - Disable the button
 * @param {string} variant - Button variant (primary, secondary, danger)
 */
const Button = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  isLoading = false, 
  disabled = false,
  variant = 'primary'
}) => {
  // Determine the style based on the variant
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'danger':
        return styles.dangerButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButtonText;
      default:
        return styles.buttonText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        disabled && styles.disabledButton,
        style
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === 'secondary' ? '#000' : '#fff'} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#000',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  dangerButton: {
    backgroundColor: '#D32F2F',
  },
  disabledButton: {
    backgroundColor: '#aaa',
    borderColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Button;
