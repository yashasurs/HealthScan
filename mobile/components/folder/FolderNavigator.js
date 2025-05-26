import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApiService } from '../../services/apiService';
import { LoadingOverlay } from '../common';
import FolderTree from './FolderTree';

/**
 * Folder navigator component that provides folder-based navigation
 * for collections and records with organization capabilities
 */
const FolderNavigator = ({ onRecordSelect, onCollectionSelect }) => {
  const [collections, setCollections] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const apiService = useApiService();

  useEffect(() => {
    loadData();
  }, []);

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
      setLoading(false);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
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
    // This would typically navigate to a collection creation screen
    // For now, let's just show an alert
    Alert.alert(
      'Create Collection',
      'Would you like to create a new collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create', 
          onPress: () => {
            // Navigate to collection creation or show modal
            console.log('Navigate to collection creation');
          }
        }
      ]
    );
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
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Ionicons 
            name="refresh" 
            size={20} 
            color="#4A90E2" 
            style={refreshing && styles.spinning}
          />
        </TouchableOpacity>
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
      </View>

      <View style={styles.treeContainer}>
        <FolderTree
          collections={collections}
          records={records}
          selectedCollectionId={selectedCollectionId}
          onCollectionSelect={handleCollectionSelect}
          onRecordSelect={handleRecordSelect}
        />
      </View>
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
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
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
  },
  treeContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

export default FolderNavigator;