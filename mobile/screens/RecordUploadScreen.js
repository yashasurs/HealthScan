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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/common';
import { RecordUploader, RecordList } from '../components/document';
import { useApiService } from '../services/apiService';
import { showToast, showConfirmToast } from '../utils/toast';

const RecordUploadScreen = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [stats, setStats] = useState({
    totalSize: 0,
    count: 0
  });
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);

  const apiService = useApiService();

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
  };  const handleUploadAll = async () => {
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
        () => navigation.navigate('CollectionSystem', { recordsAdded: true }),
        () => {} // For "Upload More" option
      );
      
      // Also show a success toast
      showToast.success('Upload Complete', `${response.data.length} record(s) processed successfully`);
    } catch (error) {
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
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>        <Text style={styles.title}>Upload Records</Text>
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
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
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
          
          <RecordUploader onRecordPicked={handleRecordPicked} />
        </View>
        
        {/* Selected Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color="#000" />
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
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.uploadingText}>{uploadStatus}</Text>
          </View>        )}
      </ScrollView>

      {/* Collection Selection Modal */}
      <Modal
        visible={showCollectionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCollectionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowCollectionModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Upload Destination</Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedCollection(null);
                setShowCollectionModal(false);
              }}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Unorganized option */}
            <TouchableOpacity
              style={[
                styles.collectionOption,
                !selectedCollection && styles.selectedOption
              ]}
              onPress={() => {
                setSelectedCollection(null);
                setShowCollectionModal(false);
              }}
            >
              <View style={styles.collectionOptionContent}>
                <Ionicons name="folder-outline" size={24} color="#666" />
                <View style={styles.collectionOptionInfo}>
                  <Text style={styles.collectionOptionName}>Unorganized Records</Text>
                  <Text style={styles.collectionOptionDesc}>
                    Upload files without assigning to a collection
                  </Text>
                </View>                {!selectedCollection && (
                  <Ionicons name="checkmark-circle" size={24} color="#000" />
                )}
              </View>
            </TouchableOpacity>

            {/* Collections list */}
            {loadingCollections ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>Loading collections...</Text>
              </View>
            ) : (
              collections.map((collection) => (
                <TouchableOpacity
                  key={collection.id}
                  style={[
                    styles.collectionOption,
                    selectedCollection?.id === collection.id && styles.selectedOption
                  ]}
                  onPress={() => {
                    setSelectedCollection(collection);
                    setShowCollectionModal(false);
                  }}
                >
                  <View style={styles.collectionOptionContent}>
                    <Ionicons name="folder" size={24} color="#000" />
                    <View style={styles.collectionOptionInfo}>
                      <Text style={styles.collectionOptionName}>{collection.name}</Text>
                      <Text style={styles.collectionOptionDesc}>
                        {collection.description || 'No description'}
                      </Text>
                    </View>                    {selectedCollection?.id === collection.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#000" />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 24,
  },
  collectionSelector: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  collectionSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  collectionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },  content: {
    flex: 1,
    padding: 20,
  },  scrollContent: {
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
    backgroundColor: '#000',
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
  },  uploadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },  clearButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  collectionOption: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },  selectedOption: {
    borderColor: '#000',
    backgroundColor: '#f5f5f5',
  },
  collectionOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  collectionOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  collectionOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  collectionOptionDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default RecordUploadScreen;
