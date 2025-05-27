import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Header } from '../components/common';
import { FolderNavigator, RecordOrganizer } from '../components/folder';
import { useApiService } from '../services/apiService';

/**
 * Folder System Screen - Main interface for organizing documents in collections
 * Provides a hierarchical folder view with drag-and-drop organization capabilities
 */
const FolderSystemScreen = ({ navigation }) => {
  const [collections, setCollections] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showOrganizer, setShowOrganizer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const apiService = useApiService();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const response = await apiService.collections.getAll();
      setCollections(response.data);
    } catch (error) {
      console.error('Error loading collections:', error);
      Alert.alert('Error', 'Failed to load collections');
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
    setShowOrganizer(true);
  };

  const handleCollectionSelect = (collectionId) => {
    // Could navigate to collection details or perform other actions
    console.log('Selected collection:', collectionId);
  };

  const handleRecordMoved = () => {
    // Refresh data after record is moved
    loadCollections();
  };
  const handleNavigateToUpload = () => {
    navigation.navigate('Documents');
  };
  
  return (
    <View style={styles.container}>
      <Header 
        title="Folder System"
        subtitle="Organize your documents"
        rightAction={{
          icon: 'add-circle-outline',
          onPress: handleNavigateToUpload
        }}
      />
      
      <View style={styles.content}>
        <FolderNavigator
          onRecordSelect={handleRecordSelect}
          onCollectionSelect={handleCollectionSelect}
          onRefresh={handleRefresh}
          refreshing={refreshing}
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

export default FolderSystemScreen;