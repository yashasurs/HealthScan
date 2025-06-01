import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Collection Item component that displays a collection with a folder icon
 * Used in the FolderNavigator component to display collections
 */
const CollectionItem = ({ 
  collection, 
  onPress,
  isNew = false
}) => {
  const documentCount = collection.records?.length || 0;
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
    <TouchableOpacity 
      style={styles.collectionItem} 
      onPress={() => onPress(collection)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="folder" size={32} style={styles.folderIcon} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.collectionName}>{collectionName}</Text>
        <Text style={styles.description}>
          {collection.description || "Click to view documents"}
        </Text>
        <View style={styles.metaContainer}>
          <View style={styles.documentCountContainer}>
            <Ionicons name="document-text-outline" size={14} color="#666" />
            <Text style={styles.documentCount}> {documentCount} document{documentCount !== 1 ? 's' : ''}</Text>
          </View>
          <Text style={styles.date}>{displayDate}</Text>
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <Ionicons name="chevron-forward" size={24} color="#888" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  collectionItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 5,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  folderIcon: {
    color: '#555',
  },
  collectionDetails: {
    flex: 1,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  collectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentCount: {
    fontSize: 14,
    color: '#666',
  },
  newLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  }
});

export default CollectionItem;
