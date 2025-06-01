import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  Text,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/common';
import { RecordUploader, RecordList } from '../components/document';
import { useApiService } from '../services/apiService';

const RecordUploadScreen = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const apiService = useApiService();
  
  const handleRecordPicked = (record) => {
    setRecords([...records, record]);
  };
  
  const handleRemoveRecord = (recordToRemove) => {
    setRecords(records.filter(doc => doc.uri !== recordToRemove.uri));
  };

  const handleNavigateToCollections = () => {
    navigation.navigate('CollectionSystem');
  };

  const handleUploadAll = async () => {
    if (records.length === 0) {
      Alert.alert('Error', 'Please select at least one record to upload');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading and processing records...');

    try {
      // Convert picked records to file objects for the API
      const files = records.map(doc => ({
        uri: doc.uri,
        type: doc.type || 'image/jpeg',
        name: doc.name || 'image.jpg'
      }));
      
      const response = await apiService.ocr.processFiles(files);
      
      setUploadStatus('');
      setRecords([]);
      
      Alert.alert(
        "Upload Successful",
        `${response.data.length} record(s) have been processed and uploaded.`,
        [
          { 
            text: "View Collections", 
            onPress: () => navigation.navigate('CollectionSystem', { recordsAdded: true })
          },
          { 
            text: "Upload More", 
            style: "cancel"
          }
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('');
      Alert.alert(
        'Upload Failed',
        error.response?.data?.detail || 'Failed to upload records. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Upload Records" 
        rightAction={{
          icon: 'folder-outline',
          onPress: handleNavigateToCollections
        }}
      />
      
      <ScrollView style={styles.content}>
        {/* Upload Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>Upload Records</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Select medical records to upload and process
          </Text>
          
          <RecordUploader onRecordPicked={handleRecordPicked} />
        </View>
        
        {/* Selected Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>Selected Records</Text>
          </View>
          
          <RecordList 
            records={records}
            onRemoveRecord={handleRemoveRecord}
          />
        </View>

        {/* Upload Button */}
        {records.length > 0 && (
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleUploadAll}
            disabled={uploading}
          >
            <Ionicons name="cloud-upload" size={24} color="#fff" />
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Uploading...' : 'Upload All Records'}
            </Text>
          </TouchableOpacity>
        )}

        {uploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.uploadingText}>{uploadStatus}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  uploadingContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default RecordUploadScreen;
