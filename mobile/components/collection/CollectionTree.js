import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConfirmationModal, Checkbox } from '../common';
import { useApiService } from '../../services/apiService';

/**
 * Hierarchical collection tree component for organizing collections and records
 * @param {Object} props
 * @param {Array} props.collections - Array of collections
 * @param {Array} props.records - Array of records
 * @param {string} props.selectedCollectionId - Currently selected collection ID
 * @param {Function} props.onCollectionSelect - Callback when collection is selected
 * @param {Function} props.onRecordSelect - Callback when record is selected
 * @param {Function} props.onRefresh - Callback when user refreshes the list
 * @param {boolean} props.refreshing - Whether the list is currently refreshing
 * @param {Function} props.onCollectionDelete - Callback when collection is deleted
 * @param {Function} props.onRecordDelete - Callback when record is deleted
 * @param {Function} props.onCreateCollection - Callback when creating a new collection
 * @param {Function} props.onRecordAddedToCollection - Callback when records are added to collection
 */
const CollectionTree = ({
  collections = [],
  records = [],
  selectedCollectionId,
  onCollectionSelect,
  onRecordSelect,
  onRecordLongPress,
  onRefresh,
  refreshing = false,
  onCollectionDelete,
  onRecordDelete,
  onCreateCollection,
  onRecordAddedToCollection
}) => {
  const [expandedCollections, setExpandedCollections] = useState(new Set());
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showRecordPickerModal, setShowRecordPickerModal] = useState(false);
  const [selectedCollectionForAdding, setSelectedCollectionForAdding] = useState(null);
  const [selectedRecordsForAdding, setSelectedRecordsForAdding] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiService = useApiService();

  const toggleCollection = (collectionId) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  const getRecordsForCollection = (collectionId) => {
    return records.filter(record => record.collection_id === collectionId);
  };

  const getUnorganizedRecords = () => {
    return records.filter(record => !record.collection_id);
  };

  const handleDeletePress = (item, type) => {
    setDeleteItem({ ...item, type });
    setConfirmDeleteVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteItem) {
      if (deleteItem.type === 'collection') {
        onCollectionDelete?.(deleteItem.id);
      } else if (deleteItem.type === 'record') {
        onRecordDelete?.(deleteItem.id);
      }
    }
    setConfirmDeleteVisible(false);
    setDeleteItem(null);
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteVisible(false);
    setDeleteItem(null);
  };

  const handleAddRecordsToCollection = async () => {
    setLoading(true);
    try {
      // Add each selected record to the collection
      for (const recordId of selectedRecordsForAdding) {
        await apiService.collections.addRecord(selectedCollectionForAdding.id, recordId);
      }
      
      setShowRecordPickerModal(false);
      Alert.alert(
        'Success', 
        `${selectedRecordsForAdding.length} record(s) added to ${selectedCollectionForAdding.name}`
      );
      
      // Reset selections and refresh
      setSelectedRecordsForAdding([]);
      setSelectedCollectionForAdding(null);
      onRefresh?.();
    } catch (error) {
      console.error('Error adding records to collection:', error);
      Alert.alert('Error', 'Failed to add records to collection');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRecordPicker = (collection) => {
    const unorganizedRecords = getUnorganizedRecords();
    if (unorganizedRecords.length === 0) {
      Alert.alert('No Records', 'No unorganized records available to add');
      return;
    }
    setSelectedCollectionForAdding(collection);
    setSelectedRecordsForAdding([]);
    setShowRecordPickerModal(true);
  };

  const handleRecordSelectionToggle = (recordId) => {
    setSelectedRecordsForAdding(prev => {
      const isSelected = prev.includes(recordId);
      if (isSelected) {
        return prev.filter(id => id !== recordId);
      } else {
        return [...prev, recordId];
      }
    });
  };

  const renderRecord = (record) => (
    <TouchableOpacity
      key={record.id}
      style={styles.recordItem}
      onPress={() => onRecordSelect?.(record)}
      onLongPress={() => onRecordLongPress?.(record)}
    >
      <View style={styles.recordContent}>
        <Ionicons 
          name="document-text-outline" 
          size={16} 
          color="#666" 
          style={styles.recordIcon}
        />
        <View style={styles.recordInfo}>
          <Text style={styles.recordName} numberOfLines={1}>
            {record.filename || 'Untitled'}
          </Text>
          <Text style={styles.recordMeta}>
            {record.file_type ? record.file_type.split('/')[1] || 'Unknown' : 'Unknown'} • {Math.round((record.file_size || 0) / 1024)}KB
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDeletePress(record, 'record');
          }}
        >
          <Ionicons name="trash-outline" size={16} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  const renderCollection = (collection) => {
    const isExpanded = expandedCollections.has(collection.id);
    const isSelected = selectedCollectionId === collection.id;
    const collectionRecords = getRecordsForCollection(collection.id);
    const collectionName = collection.name || "New collection";
    const displayDate = collection.created_at ? 
      new Date(collection.created_at).toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric', 
        year: 'numeric' 
      }) : 
      new Date().toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric', 
        year: 'numeric' 
      });

    return (
      <View key={collection.id} style={styles.collectionContainer}>
        <TouchableOpacity
          style={[
            styles.collectionHeader,
            isSelected && styles.selectedCollection
          ]}
          onPress={() => {
            onCollectionSelect?.(collection.id);
            toggleCollection(collection.id);
          }}
        >
          <View style={styles.collectionContent}>
            {/* Header Section with Gradient Background */}
            <View style={styles.collectionHeaderSection}>
              <View style={styles.collectionTitleRow}>
                <View style={styles.collectionLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="folder"
                      size={24}
                      color="#4A90E2"
                      style={styles.folderIcon}
                    />
                  </View>
                  <Text style={[
                    styles.collectionName,
                    isSelected && styles.selectedText
                  ]}>
                    {collectionName}
                  </Text>
                </View>
                <View style={styles.collectionActions}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeletePress(collection, 'collection');
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#dc3545" />
                  </TouchableOpacity>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={16} color="#4A90E2" style={styles.checkmark} />
                  )}
                </View>
              </View>
            </View>

            {/* Body Section */}
            <View style={styles.collectionBody}>
              {collection.description && (
                <Text style={styles.description} numberOfLines={3}>
                  {collection.description}
                </Text>
              )}
              
              <View style={styles.metaContainer}>
                <View style={styles.documentCountContainer}>
                  <Ionicons name="document-text-outline" size={14} color="#6c757d" />
                  <Text style={styles.documentCount}>
                    {collectionRecords.length} document{collectionRecords.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Text style={styles.date}>{displayDate}</Text>
              </View>
              
              <View style={styles.viewDocumentsRow}>
                <Text style={styles.viewDocumentsText}>Click to view documents</Text>
                <Ionicons 
                  name="chevron-forward" 
                  size={16} 
                  color="#6c757d" 
                  style={styles.chevronIcon}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>        {/* Expanded Records List */}
        {isExpanded && (
          <View style={styles.recordsList}>
            {collectionRecords.length > 0 ? (
              <>
                {collectionRecords.map(renderRecord)}
                {/* Add Records button for collections with existing records */}
                {getUnorganizedRecords().length > 0 && (
                  <View style={styles.addMoreRecordsContainer}>
                    <TouchableOpacity
                      style={styles.addMoreRecordsButton}
                      onPress={() => handleOpenRecordPicker(collection)}
                    >
                      <Ionicons name="add-outline" size={16} color="#4A90E2" />
                      <Text style={styles.addMoreRecordsText}>Add More Records</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyRecords}>
                <Text style={styles.emptyText}>No records in this collection</Text>
                <TouchableOpacity
                  style={styles.addRecordButton}
                  onPress={() => handleOpenRecordPicker(collection)}
                >
                  <Ionicons name="add-outline" size={16} color="#4A90E2" />
                  <Text style={styles.addRecordText}>Add Records</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const unorganizedRecords = getUnorganizedRecords();

  return (
    <View style={styles.container}>
      {/* Remove the duplicate header and stats sections since they should be in CollectionNavigator */}
      
      {/* Just render the collections list */}
      <FlatList
        data={collections}
        renderItem={({ item }) => renderCollection(item)}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A90E2']}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Show unorganized records if any */}
      {getUnorganizedRecords().length > 0 && (
        <View style={styles.unorganizedSection}>
          <Text style={styles.unorganizedTitle}>Unorganized Records</Text>
          {getUnorganizedRecords().map(renderRecord)}
        </View>
      )}

      <ConfirmationModal
        visible={confirmDeleteVisible}
        title={deleteItem?.type === 'collection' ? 'Delete Collection' : 'Delete Record'}
        message={
          deleteItem?.type === 'collection'
            ? `Are you sure you want to delete the collection "${deleteItem?.name || 'Unknown'}"? This will remove the collection but not the records inside it.`
            : `Are you sure you want to delete the record "${deleteItem?.filename || 'Unknown'}"? This action cannot be undone.`
        }
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        confirmText="Delete"
        confirmColor="#dc3545"
      />      {/* Record Picker Modal */}
      <Modal
        visible={showRecordPickerModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRecordPickerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowRecordPickerModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Records to Collection</Text>
            <TouchableOpacity
              onPress={handleAddRecordsToCollection}
              style={[
                styles.modalSaveButton,
                (selectedRecordsForAdding.length === 0 || loading) && styles.modalSaveButtonDisabled
              ]}
              disabled={selectedRecordsForAdding.length === 0 || loading}
            >
              <Text style={[
                styles.modalSaveText,
                (selectedRecordsForAdding.length === 0 || loading) && styles.modalSaveTextDisabled
              ]}>
                {loading ? 'Adding...' : 'Add Records'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Select records to add to "{selectedCollectionForAdding?.name}"
            </Text>
            
            {/* Record selection list */}
            <FlatList
              data={getUnorganizedRecords()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleRecordSelectionToggle(item.id)}
                  style={[
                    styles.recordSelectItem,
                    selectedRecordsForAdding.includes(item.id) && styles.recordSelectItemSelected
                  ]}
                >
                  <Checkbox
                    value={selectedRecordsForAdding.includes(item.id)}
                    onValueChange={() => handleRecordSelectionToggle(item.id)}
                    color="#4A90E2"
                  />
                  <View style={styles.recordSelectInfo}>
                    <Text style={styles.recordSelectText} numberOfLines={1}>
                      {item.original_filename || item.filename || 'Untitled'}
                    </Text>
                    <Text style={styles.recordSelectMeta}>
                      {item.file_type ? item.file_type.split('/')[1] || 'Unknown' : 'Unknown'} • {Math.round((item.file_size || 0) / 1024)}KB
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.recordSelectList}
              showsVerticalScrollIndicator={false}
            />

            {getUnorganizedRecords().length === 0 && (
              <View style={styles.emptyRecordsMessage}>
                <Ionicons name="documents-outline" size={48} color="#ccc" />
                <Text style={styles.emptyRecordsText}>No unorganized records available</Text>
                <Text style={styles.emptyRecordsSubText}>All records are already organized in collections</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 8,
  },
  collectionContainer: {
    marginBottom: 12,
  },
  collectionHeader: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  selectedCollection: {
    borderColor: '#000',
  },
  collectionContent: {
    flexDirection: 'column',
  },
  collectionHeaderSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  collectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 8,
    marginRight: 12,
  },
  folderIcon: {
    // Icon styling
  },
  contentContainer: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  selectedText: {
    color: '#000',
  },
  collectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  checkmark: {
    marginLeft: 8,
  },
  collectionBody: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  documentCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  documentCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewDocumentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewDocumentsText: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chevronIcon: {
    opacity: 0.6,
  },
  recordsList: {
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  recordItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  recordContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIcon: {
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  recordMeta: {
    fontSize: 12,
    color: '#999',
  },
  unorganizedSection: {
    padding: 16,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  unorganizedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyRecords: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  addRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  addRecordText: {
    fontSize: 14,
    color: '#4A90E2',
    marginLeft: 4,
    fontWeight: '500',
  },
  addMoreRecordsContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  addMoreRecordsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4A90E2',
    minWidth: 150,
  },
  addMoreRecordsText: {
    fontSize: 14,
    color: '#4A90E2',
    marginLeft: 6,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 6,
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveTextDisabled: {
    color: '#999',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  recordSelectList: {
    paddingVertical: 8,
  },
  recordSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  recordSelectItemSelected: {
    backgroundColor: '#e6f7ff',
    borderColor: '#4A90E2',
  },
  recordSelectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recordSelectText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  recordSelectMeta: {
    fontSize: 12,
    color: '#999',
  },
  emptyRecordsMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyRecordsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyRecordsSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default CollectionTree;
