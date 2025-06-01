import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApiService } from '../../services/apiService';
import { LoadingOverlay } from '../common';
import FolderTree from './FolderTree';
import CollectionItem from './CollectionItem';

/**
 * Collection navigator component that provides collection-based navigation
 * for collections and records with organization capabilities
 */
const FolderNavigator = ({ 
  onRecordSelect, 
  onRecordLongPress,
  onCollectionSelect, 
  onRefresh, 
  refreshing,
  refreshTrigger = 0 
}) => {  const [collections, setCollections] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const apiService = useApiService();
  
  useEffect(() => {
    loadData();
  }, []);
  // Refresh data when refreshTrigger changes or when refreshing prop changes to true
  useEffect(() => {
    if (refreshTrigger > 0 || refreshing) {
      loadData();
    }
  }, [refreshTrigger, refreshing]);
  
  /**
   * Loads all data for collections and records
   */
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
      }, 300);    }
  };

  /**
   * Loads collection data from the API
   */
  const loadCollections = async () => {
    try {
      const response = await apiService.collections.getAll();
      setCollections(response.data);
    } catch (error) {
      console.error('Error loading collections:', error);
      throw error;
    }
  };
  
  /**
   * Loads all records from the API
   */
  const loadAllRecords = async () => {
    try {
      const response = await apiService.records.getAll();
      setRecords(response.data);
    } catch (error) {
      console.error('Error loading records:', error);
      throw error;
    }
  };

  /**
   * Handles collection selection
   * @param {string} collectionId - ID of the selected collection
   */
  const handleCollectionSelect = (collectionId) => {
    setSelectedCollectionId(collectionId);
    onCollectionSelect?.(collectionId);  };

  /**
   * Handles record selection
   * @param {Object} record - The selected record object
   */
  const handleRecordSelect = (record) => {
    onRecordSelect?.(record);
  };
  
  /**
   * Creates a new collection by showing the creation modal
   */
  const createNewCollection = () => {
    setShowCreateModal(true);
  };

  /**
   * Handles the creation of a new collection
   */
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
      setCreating(false);    }
  };

  /**
   * Handles cancellation of collection creation
   */
  const handleCancelCreate = () => {
    setNewCollectionName('');
    setNewCollectionDescription('');
    setShowCreateModal(false);  };

  /**
   * Handles collection deletion
   * @param {string} collectionId - ID of the collection to delete
   */
  const handleDeleteCollection = async (collectionId) => {
    try {
      await apiService.collections.delete(collectionId);
      Alert.alert('Success', 'Collection deleted successfully');
      await loadData(); // Refresh all data
    } catch (error) {
      console.error('Error deleting collection:', error);
      Alert.alert('Error', 'Failed to delete collection');
    }  };

  /**
   * Handles record deletion
   * @param {string} recordId - ID of the record to delete
   */
  const handleDeleteRecord = async (recordId) => {
    try {
      await apiService.records.delete(recordId);
      Alert.alert('Success', 'Record deleted successfully');
      await loadData(); // Refresh all data
    } catch (error) {
      console.error('Error deleting record:', error);
      Alert.alert('Error', 'Failed to delete record');
    }
  };
  
  if (loading) {
    return <LoadingOverlay message="Loading collections..." />;
  }
  /**
   * Renders a collection item in the list
   * @param {Object} param0 - The item containing collection data
   * @returns {JSX.Element} The rendered collection item
   */
  const renderCollectionItem = ({ item }) => {
    // Determine if this is a new collection (added in the last 24 hours)
    const isNew = item.created_at && 
      (new Date() - new Date(item.created_at)) < (24 * 60 * 60 * 1000);
    
    return (
      <CollectionItem
        collection={item}
        onPress={() => handleCollectionSelect(item.id)}
        isNew={isNew}
      />
    );  };
    return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Collections</Text>
        <Text style={styles.headerSubtitle}>Organize your documents into collections</Text>
      </View>

      {refreshing && (
        <View style={styles.refreshIndicator}>          <Ionicons 
            name="sync" 
            size={18} 
            color="#4A90E2"
          />
        </View>
      )}
        <FlatList
        data={collections}
        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
        renderItem={renderCollectionItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{records.length}</Text>
          <Text style={styles.statLabel}>Records</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {records.filter(r => !r.collection_id).length}
          </Text>
          <Text style={styles.statLabel}>Unorganized</Text>
        </View>
      </View>      <View style={styles.actionsSection}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={createNewCollection}
        >
          <Ionicons name="add-circle-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>New Collection</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.treeContainer}>
        <FolderTree
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
    paddingTop: 20,
  },
  listContainer: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  refreshIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 999,
    padding: 8,
    borderRadius: 20,    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  },
  treeContainer: {
    flex: 1,
    paddingHorizontal: 20,  },
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