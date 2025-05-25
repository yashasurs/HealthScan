import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { TextInput, Button, Checkbox } from '../common';

/**
 * Signup form component for the signup screen
 * @param {object} props - Component props
 * @param {function} props.onSignup - Function called when signup button is pressed
 * @param {function} props.onLoginPress - Function to navigate to login screen
 * @param {boolean} props.isLoading - Whether the signup is in progress
 */
const SignupForm = ({ 
  onSignup,
  onLoginPress,
  isLoading 
}) => {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [agreeToTerms, setAgreeToTerms] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!fullName) newErrors.fullName = 'Full name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = () => {
    if (validate()) {
      onSignup({
        fullName,
        email,
        username,
        password
      });
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to get started with Sunga Medical</Text>
      
      <TextInput
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Enter your full name"
        error={errors.fullName}
      />
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="Choose a username"
        autoCapitalize="none"
        error={errors.username}
      />
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Choose a password"
        secureTextEntry
        error={errors.password}
      />
      
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm your password"
        secureTextEntry
        error={errors.confirmPassword}
      />
      
      <View style={styles.checkboxContainer}>
        <Checkbox
          checked={agreeToTerms}
          onToggle={() => setAgreeToTerms(!agreeToTerms)}
          label={
            <Text>
              I agree to the <Text style={styles.termsText}>Terms & Conditions</Text>
            </Text>
          }
        />
        {errors.agreeToTerms && (
          <Text style={styles.checkboxError}>{errors.agreeToTerms}</Text>
        )}
      </View>
      
      <Button
        title="Sign Up"
        onPress={handleSignup}
        isLoading={isLoading}
        disabled={!agreeToTerms}
        style={[styles.signupButton, !agreeToTerms && styles.disabledButton]}
      />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={onLoginPress}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginTop: 8,
    marginBottom: 30,
  },
  checkboxContainer: {
    marginBottom: 30,
    marginTop: 10,
  },
  checkboxError: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 28,
  },
  termsText: {
    textDecorationLine: 'underline',
  },
  signupButton: {
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#777',
  },
  loginText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default SignupForm;
