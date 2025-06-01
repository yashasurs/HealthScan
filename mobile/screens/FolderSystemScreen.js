import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Header } from '../components/common';
import { FolderNavigator, RecordOrganizer } from '../components/folder';
import { RecordViewer } from '../components/document';
import { useApiService } from '../services/apiService';
import { Ionicons } from '@expo/vector-icons';
// Import components from collection to support CollectionSystemScreen functionality
import { CollectionNavigator } from '../components/collection';

/**
 * Folder System Screen - Main interface for organizing records in collections/folders
 * Provides a hierarchical folder view with drag-and-drop organization capabilities
 */
const FolderSystemScreen = ({ navigation, route }) => {
  const [collections, setCollections] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showOrganizer, setShowOrganizer] = useState(false);
  const [showRecordViewer, setShowRecordViewer] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    collections: 0,
    records: 0,
    unorganized: 0
  });

  const apiService = useApiService();

  // Load collections on initial render
  useEffect(() => {
    loadCollections();
  }, []);
  
  // Check if navigated from record upload with new records
  useEffect(() => {
    if (route.params?.recordsAdded) {
      // Trigger a refresh when records are added
      setRefreshTrigger(prev => prev + 1);
      // Reset the parameter to prevent multiple refreshes
      navigation.setParams({ recordsAdded: false });
    }
  }, [route.params?.recordsAdded]);  const loadCollections = async () => {
    try {
      const response = await apiService.collections.getAll();
      setCollections(response.data);
      
      // Calculate stats from the data
      const collectionsCount = response.data.length;
      let recordsCount = 0;
      let unorganizedCount = 0;
      
      // Count records in collections and unorganized records
      response.data.forEach(collection => {
        if (collection.records) {
          recordsCount += collection.records.length;
        }
      });
      
      // You may need to adapt this depending on your API structure
      try {
        const unorganizedResponse = await apiService.records.getUnorganized();
        unorganizedCount = unorganizedResponse.data.length;
      } catch (err) {
        console.error('Error fetching unorganized records:', err);
      }
      
      setStats({
        collections: collectionsCount,
        records: recordsCount,
        unorganized: unorganizedCount
      });
      
    } catch (error) {
      console.error('Error loading collections:', error);
      // Handle unauthorized errors
      if (error.response && error.response.status === 401) {
        Alert.alert(
          'Authentication Error', 
          'Your session has expired. Please log in again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error', 
          'Failed to load collections. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCollections();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };  const handleRecordSelect = (record) => {
    // Navigate to RecordDetailScreen instead of showing modal (from CollectionSystemScreen)
    navigation.navigate('RecordDetail', {
      recordId: record.id,
      record: record // Pass the record data to avoid extra API call
    });
  };

  const handleRecordLongPress = (record) => {
    setSelectedRecord(record);
    setShowOrganizer(true);
  };

  const handleCollectionSelect = (collectionId) => {
    // Could navigate to collection details or perform other actions
    console.log('Selected collection:', collectionId);
  };  const handleRecordMoved = () => {
    // Increment refresh trigger to force automatic refresh
    setRefreshTrigger(prev => prev + 1);
    // Also refresh collections
    loadCollections();
  };

  const handleRecordDeleted = (recordId) => {
    // Trigger a refresh when a record is deleted
    setRefreshTrigger(prev => prev + 1);
    // Also refresh collections
    loadCollections();
  };  const handleNavigateToUpload = () => {
    navigation.navigate('Records');
  };
    const handleCreateCollection = () => {
    // Implement collection creation functionality
    // This could open a modal with a form to create a new collection
    Alert.alert(
      "Create Collection", 
      "Collection creation feature will be implemented here.",
      [{ text: "OK" }]
    );
  };
  
  const renderCollectionItem = (collection) => {
    // Check if collection was created in the last 24 hours
    const isNew = collection.created_at && 
      (new Date() - new Date(collection.created_at)) < (24 * 60 * 60 * 1000);
      
    return (
      <TouchableOpacity 
        key={collection.id} 
        style={styles.collectionItem}
        onPress={() => handleCollectionSelect(collection.id)}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="folder-outline" size={24} style={styles.folderIcon} />
        </View>
        <View style={styles.collectionDetails}>
          <Text style={styles.collectionName}>{collection.name}</Text>
          <View style={styles.collectionMeta}>
            <Text style={styles.documentCount}>
              {collection.records?.length || 0} document{collection.records?.length !== 1 ? 's' : ''}
            </Text>
            {isNew && <Text style={styles.newLabel}>New collection</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
    return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collections</Text>
        <Text style={styles.subtitle}>Organize your documents into collections</Text>
        
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={handleCreateCollection}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.buttonText}>Create Collection</Text>
        </TouchableOpacity>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.collections}</Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.records}</Text>
            <Text style={styles.statLabel}>Records</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.unorganized}</Text>
            <Text style={styles.statLabel}>Unorganized</Text>
          </View>
        </View>
      </View>
        <View style={styles.content}>
        <ScrollView 
          style={styles.collectionsList}
          contentContainerStyle={styles.collectionsListContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#333']}
            />
          }
        >
          {collections.map(collection => renderCollectionItem(collection))}
          {collections.length === 0 && !refreshing && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No collections yet</Text>
              <Text style={styles.emptyStateSubText}>Create a collection to get started</Text>
            </View>
          )}
        </ScrollView>
      </View>{showOrganizer && (
        <RecordOrganizer
          visible={showOrganizer}
          onClose={() => {
            setShowOrganizer(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
          collections={collections}
          onRecordMoved={handleRecordMoved}
        />
      )}

      {showRecordViewer && (
        <RecordViewer
          visible={showRecordViewer}
          onClose={() => {
            setShowRecordViewer(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
          onRecordDeleted={handleRecordDeleted}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f9',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 16,
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
  content: {
    flex: 1,
  },  collectionsList: {
    flex: 1,
  },
  collectionsListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#666',
  },
  collectionItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
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

export default FolderSystemScreen;