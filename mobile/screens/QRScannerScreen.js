import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRScanner from '../components/scanner/QRScanner';
import { useApiService } from '../services/apiService';

const QRScannerScreen = ({ navigation }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const apiService = useApiService();

  const handleQRScanned = async (data) => {
    try {
      setLoading(true);
      
      // Extract token from URL
      let token = null;
      let type = null;
      
      if (data.includes('/records/share?token=')) {
        token = data.split('token=')[1];
        type = 'record';
      } else if (data.includes('/collections/share?token=')) {
        token = data.split('token=')[1];
        type = 'collection';
      }
      
      if (!token || !type) {
        Alert.alert('Error', 'Invalid QR code format');        return;
      }

      // Navigate to SharedContentViewerScreen to display the content
      navigation.navigate('SharedContentViewer', {
        shareToken: token,
        shareType: type
      });

    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Error', 'Failed to process QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openScanner = () => {
    setShowScanner(true);
  };

  const closeScanner = () => {
    setShowScanner(false);
  };  return (
    <SafeAreaView style={styles.container}>      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>QR Scanner</Text>
        <Text style={styles.subtitle}>Scan QR codes to access shared medical records</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content */}
        <View style={styles.mainContent}><View style={styles.iconContainer}>
            <Ionicons name="qr-code-outline" size={120} color="#000" />
          </View>
          
          <Text style={styles.heading}>Scan QR Codes</Text>
          <Text style={styles.description}>
            Scan QR codes to access shared medical records and collections from other ProjectSunga users.
          </Text>

          <TouchableOpacity 
            style={styles.scanButton}
            onPress={openScanner}
            disabled={loading}
          >
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.scanButtonText}>
              {loading ? 'Processing...' : 'Start Scanning'}
            </Text>
          </TouchableOpacity>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to use:</Text>            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#000" />
              <Text style={styles.instructionText}>
                Tap "Start Scanning" to open the camera
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#000" />
              <Text style={styles.instructionText}>
                Point your camera at a ProjectSunga QR code
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#000" />
              <Text style={styles.instructionText}>
                Review and save the shared content to your account
              </Text>
            </View>          </View>
        </View>
      </ScrollView>

      {/* QR Scanner Modal */}
      <QRScanner
        visible={showScanner}
        onClose={closeScanner}
        onQRScanned={handleQRScanned}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
  },  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 4,
    marginBottom: 50,
    borderWidth: 2,
    borderColor: '#000',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  instructionsContainer: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default QRScannerScreen;
