import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../Contexts/Authcontext';
import { showToast, showConfirmToast } from '../utils/toast';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, markLaunchComplete } = useAuth();

  // Mark launch complete when component mounts (user navigated from landing)
  useEffect(() => {
    if (markLaunchComplete) {
      markLaunchComplete();
    }
  }, [markLaunchComplete]);
  const handleLogin = async () => {
    if (!username.trim()) {
      showToast.error('Validation Error', 'Please enter your username');
      return;
    }

    if (!password.trim()) {
      showToast.error('Validation Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        showToast.success('Login Successful', 'Welcome back!');
        // Navigation will happen automatically due to auth state change
      } else {
        showToast.error('Login Failed', result.error || 'Please check your credentials');
      }
    } catch (error) {
      showToast.error('Login Error', 'An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Please sign in to your account</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToSignup} disabled={isLoading}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff0000',
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#181818',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  loginButton: {
    backgroundColor: '#181818',
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#181818',
  },
  disabledButton: {
    opacity: 0.6,
  },  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#666',
  },
  signupLink: {
    fontSize: 16,
    color: '#181818',
    fontWeight: '600',
  },
});

export default LoginScreen;



