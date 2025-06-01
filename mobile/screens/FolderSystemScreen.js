import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Header } from '../components/common';
import { FolderNavigator, RecordOrganizer } from '../components/folder';
import { RecordViewer, RecordItem } from '../components/document';
import { useApiService } from '../services/apiService';
import { Ionicons } from '@expo/vector-icons';

const FolderSystemScreen = ({ navigation, route }) => {
  const [collections, setCollections] = useState([]);
  const [unorganizedRecords, setUnorganizedRecords] = useState([]);
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

  // Load data on initial render and when refreshTrigger changes
  useEffect(() => {
    loadData();
  }, [refreshTrigger]);
  
  // Check if navigated from record upload with new records
  useEffect(() => {
    if (route.params?.recordsAdded) {
      setRefreshTrigger(prev => prev + 1);
      navigation.setParams({ recordsAdded: false });
    }
  }, [route.params?.recordsAdded]);

  const loadData = async () => {
    try {
      const [collectionsResponse, unorganizedResponse] = await Promise.all([
        apiService.collections.getAll(),
        apiService.records.getUnorganized()
      ]);

      setCollections(collectionsResponse.data);
      setUnorganizedRecords(unorganizedResponse.data);
      
      // Calculate stats
      const collectionsCount = collectionsResponse.data.length;
      let recordsCount = 0;
      
      collectionsResponse.data.forEach(collection => {
        if (collection.records) {
          recordsCount += collection.records.length;
        }
      });

      setStats({
        collections: collectionsCount,
        records: recordsCount,
        unorganized: unorganizedResponse.data.length
      });
      
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
      } else {
        Alert.alert('Error', 'Failed to load data. Please try again later.');
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRecordSelect = (record) => {
    navigation.navigate('RecordDetail', {
      recordId: record.id,
      record: record
    });
  };

  const handleRecordLongPress = (record) => {
    setSelectedRecord(record);
    setShowOrganizer(true);
  };

  const handleRecordMoved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateCollection = () => {
    Alert.prompt(
      "Create Collection",
      "Enter a name for your new collection",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: async (name) => {
            if (!name?.trim()) return;
            try {
              await apiService.collections.create({
                name: name.trim(),
                description: ""
              });
              setRefreshTrigger(prev => prev + 1);
              Alert.alert("Success", "Collection created successfully");
            } catch (error) {
              console.error('Error creating collection:', error);
              Alert.alert("Error", "Failed to create collection");
            }
          }
        }
      ],
      "plain-text"
    );
  };

  const renderCollection = (collection) => {
    const recordCount = collection.records?.length || 0;
    
    return (
      <View key={collection.id} style={styles.collectionCard}>
        <View style={styles.collectionHeader}>
          <View style={styles.collectionTitleContainer}>
            <Ionicons name="folder" size={24} color="#4A90E2" />
            <Text style={styles.collectionTitle}>{collection.name}</Text>
          </View>
          <Text style={styles.recordCount}>
            {recordCount} {recordCount === 1 ? 'record' : 'records'}
          </Text>
        </View>
        
        {collection.records && collection.records.length > 0 ? (
          <View style={styles.recordsList}>
            {collection.records.map(record => (
              <RecordItem
                key={record.id}
                record={record}
                onPress={() => handleRecordSelect(record)}
                onLongPress={() => handleRecordLongPress(record)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No records in this collection</Text>
        )}
      </View>
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

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#333']}
          />
        }
      >
        {/* Collections Section */}
        <View style={styles.section}>
          {collections.map(renderCollection)}
          
          {collections.length === 0 && !refreshing && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No collections yet</Text>
              <Text style={styles.emptyStateSubText}>Create a collection to get started</Text>
            </View>
          )}
        </View>

        {/* Unorganized Records Section */}
        {unorganizedRecords.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Unorganized Records</Text>
              <Text style={styles.sectionSubtitle}>
                Records not yet added to any collection
              </Text>
            </View>
            <View style={styles.unorganizedList}>
              {unorganizedRecords.map(record => (
                <RecordItem
                  key={record.id}
                  record={record}
                  onPress={() => handleRecordSelect(record)}
                  onLongPress={() => handleRecordLongPress(record)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

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
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    backgroundColor: '#4A90E2',
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
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  collectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  collectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  recordCount: {
    fontSize: 14,
    color: '#666',
  },
  recordsList: {
    marginTop: 8,
  },
  unorganizedList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
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
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default FolderSystemScreen;