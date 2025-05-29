import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Header } from '../components/common';
import { CollectionNavigator, RecordOrganizer } from '../components/collection';
import { RecordViewer } from '../components/document';
import { useApiService } from '../services/apiService';

/**
 * Collection System Screen - Main interface for organizing records in collections
 * Provides a hierarchical collection view with drag-and-drop organization capabilities
 */
const CollectionSystemScreen = ({ navigation, route }) => {
  const [collections, setCollections] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showOrganizer, setShowOrganizer] = useState(false);
  const [showRecordViewer, setShowRecordViewer] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

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
  }, [route.params?.recordsAdded]);

  const loadCollections = async () => {
    try {
      const response = await apiService.collections.getAll();
      setCollections(response.data);
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
  };

  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
    setShowRecordViewer(true);
  };

  const handleRecordLongPress = (record) => {
    setSelectedRecord(record);
    setShowOrganizer(true);
  };

  const handleCollectionSelect = (collectionId) => {
    // Could navigate to collection details or perform other actions
    console.log('Selected collection:', collectionId);
  };

  const handleRecordMoved = () => {
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
  };

  const handleNavigateToUpload = () => {
    navigation.navigate('Records');
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Collection System"
        subtitle="Organize your records"
        rightAction={{
          icon: 'add-circle-outline',
          onPress: handleNavigateToUpload
        }}
      />
        <View style={styles.content}>
        <CollectionNavigator
          onRecordSelect={handleRecordSelect}
          onRecordLongPress={handleRecordLongPress}
          onCollectionSelect={handleCollectionSelect}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          refreshTrigger={refreshTrigger}
        />
      </View>

      {showOrganizer && (
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
  content: {
    flex: 1,
  },
});

export default CollectionSystemScreen;
