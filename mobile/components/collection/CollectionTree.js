import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConfirmationModal } from '../common';
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
  onCreateCollection // Add this prop
}) => {
  const [expandedCollections, setExpandedCollections] = useState(new Set());
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

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
            {record.filename}
          </Text>
          <Text style={styles.recordMeta}>
            {record.file_type?.split('/')[1] || 'Unknown'} • {Math.round((record.file_size || 0) / 1024)}KB
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
        </TouchableOpacity>

        {/* Expanded Records List */}
        {isExpanded && (
          <View style={styles.recordsList}>
            {collectionRecords.length > 0 ? (
              collectionRecords.map(renderRecord)
            ) : (
              <View style={styles.emptyRecords}>
                <Text style={styles.emptyText}>No records in this collection</Text>
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
      />
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
});

export default CollectionTree;
