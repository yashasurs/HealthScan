import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { TextInput, Button, Checkbox } from '../common';

/**
 * Login form component for the login screen
 * @param {object} props - Component props
 * @param {function} props.onLogin - Function called when login button is pressed
 * @param {function} props.onSignupPress - Function to navigate to signup screen
 * @param {function} props.onForgotPasswordPress - Function to handle forgot password
 * @param {boolean} props.isLoading - Whether the login is in progress
 */
const LoginForm = ({ 
  onLogin, 
  onSignupPress, 
  onForgotPasswordPress, 
  isLoading 
}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validate()) {
      onLogin(email, '', password, rememberMe);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue to Sunga Medical</Text>
      
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
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        error={errors.password}
      />
      
      <View style={styles.checkboxContainer}>
        <Checkbox
          checked={rememberMe}
          onToggle={() => setRememberMe(!rememberMe)}
          label="Remember me"
        />
        
        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={onForgotPasswordPress}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      
      <Button
        title="Login"
        onPress={handleLogin}
        isLoading={isLoading}
        style={styles.loginButton}
      />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={onSignupPress}>
          <Text style={styles.signupText}>Sign Up</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  forgotPassword: {
    marginLeft: 'auto',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#000',
    textDecorationLine: 'underline',
  },
  loginButton: {
    marginBottom: 20,
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
  signupText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default LoginForm;
