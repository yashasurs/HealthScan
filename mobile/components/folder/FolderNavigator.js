import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApiService } from '../../services/apiService';
import { LoadingOverlay } from '../common';
import FolderTree from './FolderTree';

/**
 * Folder navigator component that provides folder-based navigation
 * for collections and records with organization capabilities
 */
const FolderNavigator = ({ 
  onRecordSelect, 
  onRecordLongPress,
  onCollectionSelect, 
  onRefresh, 
  refreshing,
  refreshTrigger = 0 
}) => {const [collections, setCollections] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const apiService = useApiService();  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadData();
    }
  }, [refreshTrigger]);

  // Also refresh data when refreshing prop changes to true
  useEffect(() => {
    if (refreshing) {
      loadData();
    }
  }, [refreshing]);
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCollections(),
        loadAllRecords()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load collections and records');
    } finally {
      // Short timeout to ensure UI update is visible
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const loadCollections = async () => {
    try {
      const response = await apiService.collections.getAll();
      setCollections(response.data);
    } catch (error) {
      console.error('Error loading collections:', error);
      throw error;
    }
  };
  const loadAllRecords = async () => {
    try {
      const response = await apiService.records.getAll();
      setRecords(response.data);
    } catch (error) {
      console.error('Error loading records:', error);
      throw error;
    }
  };

  const handleCollectionSelect = (collectionId) => {
    setSelectedCollectionId(collectionId);
    onCollectionSelect?.(collectionId);
  };

  const handleRecordSelect = (record) => {
    onRecordSelect?.(record);
  };
  const createNewCollection = () => {
    setShowCreateModal(true);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    setCreating(true);
    try {
      await apiService.collections.create({
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim() || 'New collection'
      });
      
      // Reset form
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowCreateModal(false);
      
      // Refresh data
      await loadData();
      
      Alert.alert('Success', 'Collection created successfully');
    } catch (error) {
      console.error('Error creating collection:', error);
      Alert.alert('Error', 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setNewCollectionName('');
    setNewCollectionDescription('');
    setShowCreateModal(false);
  };
  const moveRecordToCollection = async (recordId, targetCollectionId) => {
    try {
      if (targetCollectionId) {
        await apiService.collections.addRecord(targetCollectionId, recordId);
      } else {
        // Remove from current collection
        const record = records.find(r => r.id === recordId);
        if (record?.collection_id) {
          await apiService.collections.removeRecord(record.collection_id, recordId);
        }
      }
      
      // Refresh data
      await loadAllRecords();
      
      Alert.alert('Success', 'Document moved successfully');
    } catch (error) {
      console.error('Error moving record:', error);
      Alert.alert('Error', 'Failed to move document');
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      await apiService.collections.delete(collectionId);
      Alert.alert('Success', 'Collection deleted successfully');
      await loadData(); // Refresh all data
    } catch (error) {
      console.error('Error deleting collection:', error);
      Alert.alert('Error', 'Failed to delete collection');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      await apiService.records.delete(recordId);
      Alert.alert('Success', 'Document deleted successfully');
      await loadData(); // Refresh all data
    } catch (error) {
      console.error('Error deleting record:', error);
      Alert.alert('Error', 'Failed to delete document');
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading folder structure..." />;
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Ionicons name="folder-outline" size={24} color="#4A90E2" />
          <Text style={styles.title}>Folder System</Text>
        </View>
        {/* Auto-refresh indicator replaces manual refresh button */}
        {refreshing && (
          <View style={styles.refreshIndicator}>
            <Ionicons 
              name="sync" 
              size={18} 
              color="#4A90E2" 
              style={styles.spinning}
            />
          </View>
        )}
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{collections.length}</Text>
          <Text style={styles.statLabel}>Collections</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{records.length}</Text>
          <Text style={styles.statLabel}>Documents</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {records.filter(r => !r.collection_id).length}
          </Text>
          <Text style={styles.statLabel}>Unorganized</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={createNewCollection}
        >
          <Ionicons name="add-circle-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>New Collection</Text>
        </TouchableOpacity>
      </View>      <View style={styles.treeContainer}>        <FolderTree
          collections={collections}
          records={records}
          selectedCollectionId={selectedCollectionId}
          onCollectionSelect={handleCollectionSelect}
          onRecordSelect={handleRecordSelect}
          onRecordLongPress={onRecordLongPress}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onCollectionDelete={handleDeleteCollection}
          onRecordDelete={handleDeleteRecord}
        />
      </View>

      {/* Create Collection Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelCreate}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancelCreate} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Collection</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Collection Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter collection name"
                value={newCollectionName}
                onChangeText={setNewCollectionName}
                autoFocus
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter description"
                value={newCollectionDescription}
                onChangeText={setNewCollectionDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelCreate}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, !newCollectionName.trim() && styles.disabledButton]}
              onPress={handleCreateCollection}
              disabled={!newCollectionName.trim() || creating}
            >
              <Text style={[styles.createButtonText, !newCollectionName.trim() && styles.disabledButtonText]}>
                {creating ? 'Creating...' : 'Create Collection'}
              </Text>
            </TouchableOpacity>
          </View>

          {creating && (
            <LoadingOverlay message="Creating collection..." />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  refreshIndicator: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  spinning: {
    // Add animation here if needed
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#dee2e6',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 8,
  },  treeContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default FolderNavigator;