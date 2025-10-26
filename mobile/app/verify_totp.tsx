import React, { useState, useEffect, useRef } from 'react';
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
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/utils/toast';

export default function VerifyTotpScreen() {
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const isMountedRef = useRef(true);
  const { verifyTotp, isAuthenticated, pendingUserId } = useAuth();
  const router = useRouter();

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Navigate to tabs if user becomes authenticated - stable approach
  useEffect(() => {
    if (isAuthenticated && !hasNavigated && isMountedRef.current) {
      console.log('User is authenticated after TOTP, navigating to tabs');
      setHasNavigated(true);
      
      // Use a small delay and requestAnimationFrame for maximum stability
      setTimeout(() => {
        if (isMountedRef.current) {
          requestAnimationFrame(() => {
            if (isMountedRef.current) {
              router.replace('/(tabs)' as any);
            }
          });
        }
      }, 50);
    }
  }, [isAuthenticated, hasNavigated, router]);

  const handleVerifyTotp = async () => {
    if (!totpCode.trim()) {
      showToast.error('Validation Error', 'Please enter your 6-digit authentication code');
      return;
    }

    if (totpCode.length !== 6) {
      showToast.error('Validation Error', 'Authentication code must be 6 digits');
      return;
    }

    if (!pendingUserId) {
      showToast.error('Error', 'Missing user ID. Please try logging in again.');
      router.replace('/login');
      return;
    }

    if (isLoading) return; // Prevent double submission

    setIsLoading(true);

    try {
      const result = await verifyTotp(pendingUserId, totpCode);
      if (result.success) {
        // Don't show toast during navigation to prevent conflicts
        console.log('TOTP verification successful');
        // Navigation will happen automatically via useEffect when isAuthenticated changes
      } else {
        showToast.error('Verification Failed', result.error || 'Invalid authentication code');
        if (isMountedRef.current) setIsLoading(false);
      }
    } catch (error: any) {
      showToast.error('Verification Failed', error.message || 'Invalid authentication code');
      console.error('TOTP verification error:', error);
      if (isMountedRef.current) setIsLoading(false);
    }
    // Don't set loading to false on success - let the navigation effect handle it
  };

  const handleBackToLogin = () => {
    if (isMountedRef.current && !hasNavigated) {
      setHasNavigated(true);
      setIsLoading(false);
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          router.replace('/login' as any);
        }
      });
    }
  };

  // If user is already authenticated, don't render the form
  if (isAuthenticated) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={{ marginTop: 16, color: '#7F8C8D' }}>Redirecting...</Text>
      </View>
    );
  }

  // If no pending user ID, redirect to login
  if (!pendingUserId) {
    if (!hasNavigated) {
      setHasNavigated(true);
      setTimeout(() => {
        if (isMountedRef.current) {
          router.replace('/login' as any);
        }
      }, 100);
    }
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={{ marginTop: 16, color: '#7F8C8D' }}>Redirecting to login...</Text>
      </View>
    );
  }

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
            <Text style={styles.title}>Two-Factor Authentication</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code from your authenticator app
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Authentication Code</Text>
              <TextInput
                style={styles.input}
                value={totpCode}
                onChangeText={setTotpCode}
                placeholder="Enter 6-digit code"
                keyboardType="numeric"
                maxLength={6}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleVerifyTotp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton} 
              onPress={handleBackToLogin}
              disabled={isLoading}
            >
              <Text style={styles.linkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#3498DB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#3498DB',
    fontSize: 16,
    fontWeight: '500',
  },
});
