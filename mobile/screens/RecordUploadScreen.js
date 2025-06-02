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
  const [stats, setStats] = useState({
    totalSize: 0,
    count: 0
  });

  const apiService = useApiService();
    const handleRecordPicked = (record) => {
    const processedRecord = {
      ...record,
      filename: record.filename || record.name || 'unnamed_file',
      file_size: record.size || 0,
      type: record.mimeType || record.type || 'image/jpeg'
    };
    setRecords([...records, processedRecord]);
    // Update stats
    setStats(prev => ({
      count: prev.count + 1,
      totalSize: prev.totalSize + (record.size || 0)
    }));
  };

  const handleRemoveRecord = (recordToRemove) => {
    setRecords(records.filter(doc => doc.uri !== recordToRemove.uri));
    // Update stats
    setStats(prev => ({
      count: prev.count - 1,
      totalSize: prev.totalSize - (recordToRemove.file_size || 0)
    }));
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

    try {      // Convert picked records to file objects for the API
      const files = records.map(doc => ({
        uri: doc.uri,
        type: doc.mimeType || doc.type || 'image/jpeg',
        filename: doc.filename || doc.name || 'unnamed_file',
        file_size: doc.size || 0
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
      <View style={styles.header}>
        <Text style={styles.title}>Upload Records</Text>
        <Text style={styles.subtitle}>Upload and process your medical records</Text>
        
        <TouchableOpacity 
          style={styles.navigateButton} 
          onPress={handleNavigateToCollections}
        >
          <Ionicons name="folder" size={24} color="#fff" />
          <Text style={styles.buttonText}>View Collections</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{records.length}</Text>
            <Text style={styles.statLabel}>Selected</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{(stats.totalSize / (1024 * 1024)).toFixed(1)}</Text>
            <Text style={styles.statLabel}>Total MB</Text>
          </View>
        </View>
      </View>
      
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
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f9',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statSeparator: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
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
