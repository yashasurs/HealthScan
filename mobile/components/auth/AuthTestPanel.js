import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { JsonDisplay, Button, Section, LoadingOverlay, TextInput } from '../common';

/**
 * Component for testing authentication functionality
 */
const AuthTestPanel = ({ 
  authStatus, 
  refreshResult, 
  apiResult, 
  isLoading,
  testEndpoint,
  setTestEndpoint,
  testEmail,
  setTestEmail,
  testUsername,
  setTestUsername,
  testPassword,
  setTestPassword,
  onCheckAuthStatus,
  onTestTokenRefresh,
  onTestApiAccess,
  onClearAuthData,
  onTestLogin,
  onTestLogout,
  onGoBack
}) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading && <LoadingOverlay visible={isLoading} />}
      
      <Section title="Authentication Status">
        <Button 
          title="Check Auth Status" 
          onPress={onCheckAuthStatus} 
          disabled={isLoading}
          style={styles.fullWidthButton}
        />
        <View style={styles.resultContainer}>
          <JsonDisplay data={authStatus} />
        </View>
      </Section>
      
      <Section title="Test Credentials">
        <TextInput
          label="Test Email"
          value={testEmail}
          onChangeText={setTestEmail}
          placeholder="test@example.com"
        />
        <TextInput
          label="Test Username"
          value={testUsername}
          onChangeText={setTestUsername}
          placeholder="testuser"
        />
        <TextInput
          label="Test Password"
          value={testPassword}
          onChangeText={setTestPassword}
          placeholder="testpassword"
          secureTextEntry
        />
        
        <View style={styles.buttonGroup}>
          <Button 
            title="Test Login" 
            onPress={onTestLogin} 
            disabled={isLoading}
            style={styles.button}
          />
          <Button 
            title="Test Logout" 
            onPress={onTestLogout} 
            disabled={isLoading}
            style={styles.button}
          />
        </View>
      </Section>
      
      <Section title="Token Refresh Test">
        <Button 
          title="Test Token Refresh" 
          onPress={onTestTokenRefresh} 
          disabled={isLoading}
          style={styles.fullWidthButton}
        />
        <View style={styles.resultContainer}>
          <JsonDisplay data={refreshResult} />
        </View>
      </Section>
      
      <Section title="API Access Test">
        <TextInput
          label="Test Endpoint"
          value={testEndpoint}
          onChangeText={setTestEndpoint}
          placeholder="/users/me"
        />
        <Button 
          title="Test API Access" 
          onPress={onTestApiAccess} 
          disabled={isLoading}
          style={styles.fullWidthButton}
        />
        <View style={styles.resultContainer}>
          <JsonDisplay data={apiResult} />
        </View>
      </Section>
      
      <Button 
        title="Clear All Auth Data" 
        onPress={onClearAuthData} 
        disabled={isLoading}
        variant="danger"
        style={styles.fullWidthButton}
      />
      
      <Button 
        title="Return to App" 
        onPress={onGoBack} 
        variant="secondary"
        style={styles.returnButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 0.48,
  },
  fullWidthButton: {
    marginBottom: 8,
  },
  returnButton: {
    marginTop: 16,
  },
  resultContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
});

export default AuthTestPanel;
