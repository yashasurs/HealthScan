import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/common';
import { useApiService } from '../services/apiService';

const CollectionDetailsScreen = ({ route, navigation }) => {
  const { collectionId, collectionName } = route.params;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [error, setError] = useState('');

  const apiService = useApiService();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setError('');
      const response = await apiService.collections.getRecords(collectionId);
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
      setError('Failed to load records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoveRecord = (record) => {
    Alert.alert(
      'Remove Record',
      `Remove "${record.filename}" from this collection? The record will not be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.collections.removeRecord(collectionId, record.id);
              setRecords(records.filter(r => r.id !== record.id));
              Alert.alert('Success', 'Record removed from collection');
            } catch (error) {
              console.error('Error removing record:', error);
              Alert.alert('Error', 'Failed to remove record');
            }
          }
        }
      ]
    );
  };

  const handleRecordPress = (record) => {
    setSelectedRecord(record);
    setShowRecordModal(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  const renderRecordItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recordItem}
      onPress={() => handleRecordPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.recordContent}>
        <View style={styles.recordIcon}>
          <Ionicons name="document-text" size={24} color="#4A90E2" />
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle} numberOfLines={1}>
            {item.filename}
          </Text>
          <Text style={styles.recordSize}>
            {formatFileSize(item.file_size)} • {item.file_type || 'Unknown type'}
          </Text>
          <Text style={styles.recordDate}>
            Created: {formatDate(item.created_at)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveRecord(item)}
        >
          <Ionicons name="remove-circle-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-outline" size={64} color="#CCC" />
      <Text style={styles.emptyStateTitle}>No Records</Text>
      <Text style={styles.emptyStateText}>
        This collection doesn't have any records yet.
      </Text>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => navigation.navigate('Documents', { preSelectedCollection: collectionId })}
      >
        <Ionicons name="camera" size={16} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.uploadButtonText}>Upload Documents</Text>
      </TouchableOpacity>
    </View>
  );

  const RecordModal = () => (
    <Modal
      visible={showRecordModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowRecordModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.recordModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedRecord?.filename}
            </Text>
            <TouchableOpacity
              onPress={() => setShowRecordModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.recordDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>File Size:</Text>
                <Text style={styles.detailValue}>
                  {formatFileSize(selectedRecord?.file_size)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>File Type:</Text>
                <Text style={styles.detailValue}>
                  {selectedRecord?.file_type || 'Unknown'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedRecord?.created_at)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Updated:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedRecord?.updated_at)}
                </Text>
              </View>
            </View>

            <View style={styles.contentSection}>
              <Text style={styles.contentLabel}>Extracted Content:</Text>
              <View style={styles.contentContainer}>
                <Text style={styles.contentText}>
                  {selectedRecord?.content || 'No content available'}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.removeFromCollectionButton}
              onPress={() => {
                setShowRecordModal(false);
                setTimeout(() => handleRemoveRecord(selectedRecord), 300);
              }}
            >
              <Ionicons name="remove-circle-outline" size={16} color="#fff" />
              <Text style={styles.removeFromCollectionButtonText}>Remove from Collection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header 
          title={collectionName} 
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title={collectionName} 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRecords}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.recordCount}>
            {records.length} record{records.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            style={styles.addRecordButton}
            onPress={() => navigation.navigate('Documents', { preSelectedCollection: collectionId })}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addRecordButtonText}>Add Records</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={renderRecordItem}
          contentContainerStyle={records.length === 0 ? styles.emptyContainer : styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      <RecordModal />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordCount: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  addRecordButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addRecordButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  recordItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  recordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  recordIcon: {
    marginRight: 16,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  recordSize: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  uploadButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 16,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  recordDetails: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '400',
  },
  contentSection: {
    padding: 20,
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  contentContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2c3e50',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  removeFromCollectionButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  removeFromCollectionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CollectionDetailsScreen;
