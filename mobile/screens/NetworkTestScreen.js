import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import NetworkMonitor from '../utils/NetworkMonitor';
import { NetworkTestPanel } from '../components/network';
import { Header } from '../components/common';

const NetworkTestScreen = ({ navigation }) => {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [pingResult, setPingResult] = useState(null);
  const [apiTestResult, setApiTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pingUrl, setPingUrl] = useState('https://google.com');
  const [apiUrl, setApiUrl] = useState('http://localhost:8000/users/me');
  
  // Get current network info
  const checkNetworkInfo = async () => {
    setIsLoading(true);
    try {
      const info = await NetworkMonitor.getNetworkInfo();
      setNetworkInfo(info);
    } catch (error) {
      Alert.alert('Error', 'Failed to check network info: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test ping to a URL
  const testPing = async () => {
    setIsLoading(true);
    try {
      const startTime = Date.now();
      
      try {
        // Fetch with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(pingUrl, {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const endTime = Date.now();
        const pingTime = endTime - startTime;
        
        setPingResult({
          success: response.ok,
          pingTime: pingTime,
          status: response.status,
          statusText: response.statusText,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        setPingResult({
          success: false,
          error: error.name === 'AbortError' ? 'Request timed out' : error.message,
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Test API access
  const testApiAccess = async () => {
    setIsLoading(true);
    try {
      const startTime = Date.now();
      
      try {
        // Fetch with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          responseData = { error: 'Could not parse JSON response' };
        }
        
        setApiTestResult({
          success: response.ok,
          responseTime,
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        setApiTestResult({
          success: false,
          error: error.name === 'AbortError' ? 'Request timed out' : error.message,
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check network info on mount
  useEffect(() => {
    checkNetworkInfo();
  }, []);

  return (
    <>
      <Header title="Network Test" />
      <NetworkTestPanel
        networkInfo={networkInfo}
        pingResult={pingResult}
        apiTestResult={apiTestResult}
        isLoading={isLoading}
        pingUrl={pingUrl}
        setPingUrl={setPingUrl}
        apiUrl={apiUrl}
        setApiUrl={setApiUrl}
        onCheckNetworkInfo={checkNetworkInfo}
        onTestPing={testPing}
        onTestApiAccess={testApiAccess}
        onGoBack={() => navigation.goBack()}
      />
    </>  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    padding: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  returnButton: {
    backgroundColor: '#424242',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  jsonText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  noData: {
    fontStyle: 'italic',
    color: '#777',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
});

export default NetworkTestScreen;
