import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Platform,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Record, Collection } from '@/types';
import { useApiService } from '@/services/apiService';
import { showToast, showConfirmToast } from '@/utils/toast';
import * as DocumentPicker from 'expo-document-picker';

interface RecordUpload {
  uri: string;
  filename: string;
  file_size: number;
  type: string;
  mimeType?: string;
  name?: string;
  size?: number;
}

interface Stats {
  totalSize: number;
  count: number;
}

export default function UploadScreen() {
  const [records, setRecords] = useState<RecordUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [stats, setStats] = useState<Stats>({
    totalSize: 0,
    count: 0
  });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);

  const apiService = useApiService();
  const router = useRouter();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoadingCollections(true);
      const response = await apiService.collections.getAll();
      setCollections(response.data);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoadingCollections(false);
    }
  };

  const handleRecordPicked = (record: any) => {
    const processedRecord: RecordUpload = {
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

  const pickRecord = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled === false && result.assets && result.assets[0]) {
        handleRecordPicked(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      showToast.error('Error', 'Failed to pick document');
    }
  };

  const handleRemoveRecord = (recordToRemove: RecordUpload) => {
    setRecords(records.filter(doc => doc.uri !== recordToRemove.uri));
    // Update stats
    setStats(prev => ({
      count: prev.count - 1,
      totalSize: prev.totalSize - (recordToRemove.file_size || 0)
    }));
  };

  const handleNavigateToCollections = () => {
    router.push('/(tabs)/collections');
  };

  const handleUploadAll = async () => {
    if (records.length === 0) {
      showToast.error('Error', 'Please select at least one record to upload');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading and processing records...');

    try {      
      // Convert picked records to file objects for the API
      const files = records.map(doc => ({
        uri: doc.uri,
        type: doc.mimeType || doc.type || 'image/jpeg',
        filename: doc.filename || doc.name || 'unnamed_file',
        file_size: doc.size || 0
      }));
      
      // Pass collection_id if a collection is selected
      const response = selectedCollection 
        ? await apiService.ocr.processFilesToCollection(files, selectedCollection.id)
        : await apiService.ocr.processFiles(files);
      
      setUploadStatus('');
      setRecords([]);
      setStats({ totalSize: 0, count: 0 });
      
      const targetLocation = selectedCollection 
        ? `"${selectedCollection.name}" collection`
        : 'unorganized records';
      
      showConfirmToast(
        "Upload Successful",
        `${response.data.length} record(s) have been processed and saved to ${targetLocation}.`,
        () => router.push({ pathname: '/(tabs)/collections', params: { recordsAdded: 'true' } }),
        () => {} // For "Upload More" option
      );
      
      // Also show a success toast
      showToast.success('Upload Complete', `${response.data.length} record(s) processed successfully`);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('');
      showToast.error(
        'Upload Failed',
        error.response?.data?.detail || 'Failed to upload records. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderRecordItem = ({ item, index }: { item: RecordUpload; index: number }) => (
    <View key={index} style={styles.recordItem}>
      <View style={styles.recordInfo}>
        <Text style={styles.recordName}>
          {item.filename || item.name || 'Unnamed File'}
        </Text>
        <Text style={styles.recordSize}>
          {formatFileSize(item.file_size || item.size || 0)}
        </Text>
      </View>
      <TouchableOpacity 
        onPress={() => handleRemoveRecord(item)}
        style={styles.removeButton}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Records</Text>
        <Text style={styles.subtitle}>Upload and process your medical records</Text>
        
        {/* Collection Selection */}
        <TouchableOpacity 
          style={styles.collectionSelector}
          onPress={() => setShowCollectionModal(true)}
        >
          <View style={styles.collectionSelectorContent}>
            <Ionicons name="folder-outline" size={20} color="#666" />
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionLabel}>Upload to:</Text>
              <Text style={styles.collectionName}>
                {selectedCollection ? selectedCollection.name : 'Unorganized Records'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navigateButton} 
          onPress={handleNavigateToCollections}
        >
          <Ionicons name="folder" size={20} color="#fff" />
          <Text style={styles.navigateButtonText}>View Collections</Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.count}</Text>
            <Text style={styles.statLabel}>Selected</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(stats.totalSize / (1024 * 1024)).toFixed(1)}</Text>
            <Text style={styles.statLabel}>Total MB</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cloud-upload-outline" size={24} color="#000" />
            <Text style={styles.sectionTitle}>Upload Records</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Select medical records to upload and process
          </Text>
          
          {/* Document Picker */}
          <View style={styles.uploadSection}>
            <TouchableOpacity style={styles.pickRecordButton} onPress={pickRecord}>
              <Ionicons name="document-outline" size={24} color="#fff" />
              <Text style={styles.pickRecordButtonText}>Select Record</Text>
            </TouchableOpacity>
            <Text style={styles.uploadInfo}>
              Supported formats: PDF, DOC, DOCX, JPG, PNG
            </Text>
          </View>
        </View>

        {/* Selected Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color="#000" />
            <Text style={styles.sectionTitle}>Selected Records ({records.length})</Text>
          </View>
          
          {records.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No records uploaded yet</Text>
            </View>
          ) : (
            <FlatList
              data={records}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderRecordItem}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          )}
        </View>

        {/* Upload All Button */}
        {records.length > 0 && (
          <TouchableOpacity 
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={handleUploadAll}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={24} color="#fff" />
                <Text style={styles.uploadButtonText}>
                  Upload {records.length} Record{records.length !== 1 ? 's' : ''}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {uploading && uploadStatus !== '' && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.statusText}>{uploadStatus}</Text>
          </View>
        )}
      </ScrollView>

      {/* Collection Selection Modal */}
      <Modal
        visible={showCollectionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCollectionModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Collection</Text>
            <TouchableOpacity onPress={() => setShowCollectionModal(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TouchableOpacity 
              style={[
                styles.collectionOption,
                !selectedCollection && styles.collectionOptionSelected
              ]}
              onPress={() => {
                setSelectedCollection(null);
                setShowCollectionModal(false);
              }}
            >
              <Ionicons name="folder-outline" size={24} color="#666" />
              <View style={styles.collectionOptionInfo}>
                <Text style={styles.collectionOptionName}>Unorganized Records</Text>
                <Text style={styles.collectionOptionDesc}>Records will be saved without a collection</Text>
              </View>
              {!selectedCollection && (
                <Ionicons name="checkmark" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
            
            {loadingCollections ? (
              <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
              collections.map((collection) => (
                <TouchableOpacity 
                  key={collection.id}
                  style={[
                    styles.collectionOption,
                    selectedCollection?.id === collection.id && styles.collectionOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedCollection(collection);
                    setShowCollectionModal(false);
                  }}
                >
                  <Ionicons name="folder" size={24} color="#007AFF" />
                  <View style={styles.collectionOptionInfo}>
                    <Text style={styles.collectionOptionName}>{collection.name}</Text>
                    {collection.description && (
                      <Text style={styles.collectionOptionDesc}>{collection.description}</Text>
                    )}
                  </View>
                  {selectedCollection?.id === collection.id && (
                    <Ionicons name="checkmark" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  collectionSelector: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  collectionSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionInfo: {
    flex: 1,
    marginLeft: 10,
  },
  collectionLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#181818',
  },
  navigateButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 5,
  },
  content: {
    flex: 1,
    padding: 20,
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
  statSeparator: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 100,
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
  uploadSection: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  pickRecordButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickRecordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  uploadInfo: {
    color: '#777',
    textAlign: 'center',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  emptyStateText: {
    color: '#777',
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  pickerButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  pickerButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 8,
  },
  recordsContainer: {
    marginBottom: 20,
  },
  recordItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  recordSize: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 5,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  statusText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  collectionOption: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionOptionSelected: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  collectionOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  collectionOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  collectionOptionDesc: {
    fontSize: 14,
    color: '#666',
  },
});
