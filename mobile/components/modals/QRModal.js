import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApiService } from '../../services/apiService';

const { width: screenWidth } = Dimensions.get('window');

const QRModal = ({ visible, onClose, recordId, collectionId, title }) => {
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const apiService = useApiService();

  useEffect(() => {
    if (visible && (recordId || collectionId)) {
      generateQR();
    }
  }, [visible, recordId, collectionId]);
  const generateQR = async () => {
    try {
      setLoading(true);
      setError(null);
      setQrImage(null);

      let response;
      if (recordId) {
        response = await apiService.qr.getRecordQR(recordId);
      } else if (collectionId) {
        response = await apiService.qr.getCollectionQR(collectionId);
      } else {
        throw new Error('No record or collection ID provided');
      }

      if (response?.data) {
        // For React Native, we need to handle the blob differently
        if (typeof response.data === 'string') {
          // If it's already a data URL
          setQrImage(response.data);
        } else {
          // Convert blob to base64 for React Native Image component
          const reader = new FileReader();
          reader.onload = () => {
            setQrImage(reader.result);
          };
          reader.onerror = () => {
            throw new Error('Failed to convert QR code image');
          };
          reader.readAsDataURL(response.data);
        }
      } else {
        throw new Error('No QR code data received');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code');
      Alert.alert('Error', 'Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQrImage(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title || 'QR Code'}</Text>            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>Generating QR code...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={generateQR} style={styles.retryButton}>
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {qrImage && !loading && !error && (
              <View style={styles.qrContainer}>
                <Image source={{ uri: qrImage }} style={styles.qrImage} />
                <Text style={styles.instructionText}>
                  Scan this QR code to share or access this {recordId ? 'record' : 'collection'}
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          {qrImage && !loading && !error && (
            <View style={styles.footer}>
              <TouchableOpacity onPress={handleClose} style={styles.doneButton}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },  doneButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRModal;
