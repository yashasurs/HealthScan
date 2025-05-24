import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { JsonDisplay, Button, Section, LoadingOverlay, TextInput } from '../common';

/**
 * Component for testing network functionality
 */
const NetworkTestPanel = ({ 
  networkInfo, 
  pingResult, 
  apiTestResult, 
  isLoading,
  pingUrl,
  setPingUrl,
  apiUrl,
  setApiUrl,
  onCheckNetworkInfo,
  onTestPing,
  onTestApiAccess,
  onGoBack
}) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading && <LoadingOverlay visible={isLoading} />}
      
      <Section title="Network Information">
        <Button 
          title="Refresh Network Info" 
          onPress={onCheckNetworkInfo} 
          disabled={isLoading}
        />
        <View style={styles.resultContainer}>
          <JsonDisplay data={networkInfo} />
        </View>
      </Section>
      
      <Section title="Ping Test">
        <TextInput
          label="URL to ping"
          value={pingUrl}
          onChangeText={setPingUrl}
          placeholder="https://google.com"
          autoCapitalize="none"
        />
        <Button 
          title="Run Ping Test" 
          onPress={onTestPing} 
          disabled={isLoading}
        />
        <View style={styles.resultContainer}>
          <JsonDisplay data={pingResult} />
        </View>
      </Section>
      
      <Section title="API Access Test">
        <TextInput
          label="API URL"
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://localhost:8000/users/me"
          autoCapitalize="none"
        />
        <Button 
          title="Test API Access" 
          onPress={onTestApiAccess} 
          disabled={isLoading}
        />
        <View style={styles.resultContainer}>
          <JsonDisplay data={apiTestResult} />
        </View>
      </Section>
      
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
  resultContainer: {
    marginTop: 12,
  },
  returnButton: {
    marginTop: 16,
  },
});

export default NetworkTestPanel;
