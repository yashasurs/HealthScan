import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Hierarchical folder tree component for organizing collections and records
 * @param {Object} props
 * @param {Array} props.collections - Array of collections
 * @param {Array} props.records - Array of records
 * @param {string} props.selectedCollectionId - Currently selected collection ID
 * @param {Function} props.onCollectionSelect - Callback when collection is selected
 * @param {Function} props.onRecordSelect - Callback when record is selected
 * @param {Function} props.onRefresh - Callback when user refreshes the list
 * @param {boolean} props.refreshing - Whether the list is currently refreshing
 */
const FolderTree = ({
  collections = [],
  records = [],
  selectedCollectionId,
  onCollectionSelect,
  onRecordSelect,
  onRefresh,
  refreshing = false
}) => {
  const [expandedCollections, setExpandedCollections] = useState(new Set());

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

  const renderRecord = (record) => (
    <TouchableOpacity
      key={record.id}
      style={styles.recordItem}
      onPress={() => onRecordSelect?.(record)}
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
            {record.file_type?.split('/')[1]} • {Math.round(record.file_size / 1024)}KB
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCollection = (collection) => {
    const isExpanded = expandedCollections.has(collection.id);
    const isSelected = selectedCollectionId === collection.id;
    const collectionRecords = getRecordsForCollection(collection.id);

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
            <View style={styles.collectionLeft}>
              <TouchableOpacity
                onPress={() => toggleCollection(collection.id)}
                style={styles.expandButton}
              >
                <Ionicons
                  name={isExpanded ? "chevron-down" : "chevron-forward"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
              <Ionicons
                name="folder"
                size={20}
                color={isSelected ? "#4A90E2" : "#666"}
                style={styles.folderIcon}
              />
              <View>
                <Text style={[
                  styles.collectionName,
                  isSelected && styles.selectedText
                ]}>
                  {collection.name}
                </Text>
                <Text style={styles.collectionMeta}>
                  {collectionRecords.length} document{collectionRecords.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={16} color="#4A90E2" />
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.recordsList}>
            {collectionRecords.length > 0 ? (
              collectionRecords.map(renderRecord)
            ) : (
              <View style={styles.emptyRecords}>
                <Text style={styles.emptyText}>No documents in this collection</Text>
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
      <FlatList
        data={collections}
        renderItem={({ item }) => renderCollection(item)}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.collectionsList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#4A90E2"
          />
        }
      />

      {unorganizedRecords.length > 0 && (
        <View style={styles.unorganizedSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="folder-open-outline" size={18} color="#999" />
            <Text style={styles.sectionTitle}>Unorganized Documents</Text>
            <Text style={styles.sectionCount}>({unorganizedRecords.length})</Text>
          </View>
          <View style={styles.recordsList}>
            {unorganizedRecords.map(renderRecord)}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  collectionsList: {
    flex: 1,
  },
  collectionContainer: {
    marginBottom: 8,
  },
  collectionHeader: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedCollection: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4A90E2',
  },
  collectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expandButton: {
    marginRight: 8,
    padding: 4,
  },
  folderIcon: {
    marginRight: 12,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  selectedText: {
    color: '#4A90E2',
  },
  collectionMeta: {
    fontSize: 12,
    color: '#666',
  },
  recordsList: {
    marginTop: 8,
    marginLeft: 40,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  recordItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    color: '#333',
    marginBottom: 2,
  },
  recordMeta: {
    fontSize: 11,
    color: '#999',
  },
  emptyRecords: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  unorganizedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  sectionCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
});

export default FolderTree;