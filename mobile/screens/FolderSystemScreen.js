import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Alert, Text, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Header } from '../components/common';
import { RecordOrganizer } from '../components/folder';
import { RecordItem } from '../components/document';
import { RenameRecordModal, QRModal } from '../components/modals';
import { useApiService } from '../services/apiService';
import { Ionicons } from '@expo/vector-icons';

const FolderSystemScreen = ({ navigation, route }) => {
  const [collections, setCollections] = useState([]);
  const [unorganizedRecords, setUnorganizedRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);  const [showOrganizer, setShowOrganizer] = useState(false);  // Record viewer state has been removed in favor of navigation
  const [showEditCollectionModal, setShowEditCollectionModal] = useState(false);  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [showRecordActionsModal, setShowRecordActionsModal] = useState(false);  const [showRecordPickerModal, setShowRecordPickerModal] = useState(false);
  const [showCollectionViewModal, setShowCollectionViewModal] = useState(false);
  const [viewingCollection, setViewingCollection] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCollection, setQrCollection] = useState(null);
  const [qrRecord, setQrRecord] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editingCollection, setEditingCollection] = useState({
    name: '',
    description: ''
  });  const [newCollection, setNewCollection] = useState({
    name: '',
    description: ''
  });
  const [selectedCollectionForAdding, setSelectedCollectionForAdding] = useState(null);
  const [selectedRecordsForAdding, setSelectedRecordsForAdding] = useState([]);
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

  // Focus listener to reload data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!initialLoad) {
        setRefreshTrigger(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, [navigation, initialLoad]);
  
  // Check if navigated from record upload with new records
  useEffect(() => {
    if (route.params?.recordsAdded) {
      setRefreshTrigger(prev => prev + 1);
      navigation.setParams({ recordsAdded: false });
    }
  }, [route.params?.recordsAdded]);  const loadData = useCallback(async () => {
    try {
      if (initialLoad) {
        setLoading(true);
      }

      const [collectionsResponse, unorganizedResponse, allRecordsResponse] = await Promise.all([
        apiService.collections.getAll(),
        apiService.records.getUnorganized(),
        apiService.records.getAll()
      ]);

      setCollections(collectionsResponse.data);
      setUnorganizedRecords(unorganizedResponse.data);
      setAllRecords(allRecordsResponse.data);
      
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
        records: allRecordsResponse.data.length,
        unorganized: unorganizedResponse.data.length
      });
      
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
      } else {
        Alert.alert('Error', 'Failed to load data. Please try again later.');
      }
    } finally {
      if (initialLoad) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  }, [apiService, initialLoad]);
  const handleRefresh = useCallback(async () => {
    setRefreshTrigger(prev => prev + 1);
  }, []);const handleRecordSelect = (record) => {
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
  // === COLLECTION MANAGEMENT FUNCTIONS ===
  
  const handleViewCollection = (collection) => {
    setViewingCollection(collection);
    setShowCollectionViewModal(true);
  };
  
  const handleEditCollection = (collection) => {
    setSelectedCollection(collection);
    setEditingCollection({
      name: collection.name,
      description: collection.description || ''
    });
    setShowEditCollectionModal(true);
  };
  const handleUpdateCollection = async () => {
    if (!editingCollection.name.trim()) {
      Alert.alert('Error', 'Collection name cannot be empty');
      return;
    }

    try {
      await apiService.collections.update(selectedCollection.id, {
        name: editingCollection.name.trim(),
        description: editingCollection.description.trim()
      });
      
      setShowEditCollectionModal(false);
      setRefreshTrigger(prev => prev + 1);
      Alert.alert('Success', 'Collection updated successfully');
    } catch (error) {
      console.error('Error updating collection:', error);
      Alert.alert('Error', 'Failed to update collection');
    }
  };
  const handleDeleteCollection = (collection) => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.collections.delete(collection.id);
              setRefreshTrigger(prev => prev + 1);
              Alert.alert('Success', 'Collection deleted successfully');
            } catch (error) {
              console.error('Error deleting collection:', error);
              Alert.alert('Error', 'Failed to delete collection');
            }
          }
        }
      ]
    );
  };
  const handleAddRecordToCollection = async (collectionId, recordId) => {
    try {
      await apiService.collections.addRecord(collectionId, recordId);
      setRefreshTrigger(prev => prev + 1);
      Alert.alert('Success', 'Record added to collection');
    } catch (error) {
      console.error('Error adding record to collection:', error);
      Alert.alert('Error', 'Failed to add record to collection');
    }
  };

  const handleRemoveRecordFromCollection = async (collectionId, recordId) => {
    Alert.alert(
      'Remove Record',
      'Are you sure you want to remove this record from the collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: async () => {
            setLoading(true);
            try {
              await apiService.collections.removeRecord(collectionId, recordId);
              setRefreshTrigger(prev => prev + 1);
              Alert.alert('Success', 'Record removed from collection');
            } catch (error) {
              console.error('Error removing record from collection:', error);
              Alert.alert('Error', 'Failed to remove record from collection');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  // === RECORD MANAGEMENT FUNCTIONS ===
  const handleEditRecord = (record) => {
    navigation.navigate('RecordDetail', {
      recordId: record.id,
      record: record,
      editMode: true
    });
  };

  const handleUpdateRecord = async (recordId, content) => {
    setLoading(true);
    try {
      await apiService.records.update(recordId, content);
      setRefreshTrigger(prev => prev + 1);
      Alert.alert('Success', 'Record updated successfully');
    } catch (error) {
      console.error('Error updating record:', error);
      Alert.alert('Error', 'Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = (record) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await apiService.records.delete(record.id);
              setRefreshTrigger(prev => prev + 1);
              Alert.alert('Success', 'Record deleted successfully');
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'Failed to delete record');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  const handleRecordActions = (record) => {
    setSelectedRecord(record);
    setShowRecordActionsModal(true);
  };

  const handleRenameRecord = (record) => {
    setSelectedRecord(record);
    setShowRenameModal(true);
  };

  const handleRecordRenamed = (recordId, newFilename) => {
    // Refresh data to reflect the rename
    setRefreshTrigger(prev => prev + 1);
  };
  const handleCreateCollection = () => {
    setNewCollection({
      name: '',
      description: ''
    });
    setShowCreateCollectionModal(true);
  };  const handleCreateCollectionSubmit = async () => {
    if (!newCollection.name.trim()) {
      Alert.alert('Error', 'Collection name cannot be empty');
      return;
    }

    try {
      await apiService.collections.create({
        name: newCollection.name.trim(),
        description: newCollection.description.trim()
      });
      
      setShowCreateCollectionModal(false);
      setRefreshTrigger(prev => prev + 1);
      Alert.alert('Success', 'Collection created successfully');
      
      // Reset form
      setNewCollection({
        name: '',
        description: ''
      });
    } catch (error) {
      console.error('Error creating collection:', error);
      Alert.alert('Error', 'Failed to create collection');
    }
  };

  // Add records to collection functionality
  const handleAddRecordsToCollection = (collection) => {
    if (unorganizedRecords.length === 0) {
      Alert.alert('No Records', 'No unorganized records available to add');
      return;
    }
    setSelectedCollectionForAdding(collection);
    setSelectedRecordsForAdding([]);
    setShowRecordPickerModal(true);
  };

  const handleRecordSelectionToggle = (record) => {
    setSelectedRecordsForAdding(prev => {
      const isSelected = prev.some(r => r.id === record.id);
      if (isSelected) {
        return prev.filter(r => r.id !== record.id);
      } else {
        return [...prev, record];
      }
    });
  };

  const handleAddSelectedRecords = async () => {
    if (selectedRecordsForAdding.length === 0) {
      Alert.alert('Error', 'Please select at least one record to add');
      return;
    }

    setLoading(true);
    try {
      // Add each selected record to the collection
      for (const record of selectedRecordsForAdding) {
        await apiService.collections.addRecord(selectedCollectionForAdding.id, record.id);
      }
      
      setShowRecordPickerModal(false);
      setRefreshTrigger(prev => prev + 1);
      Alert.alert(
        'Success', 
        `${selectedRecordsForAdding.length} record(s) added to ${selectedCollectionForAdding.name}`
      );
      
      // Reset selections
      setSelectedRecordsForAdding([]);
      setSelectedCollectionForAdding(null);
    } catch (error) {
      console.error('Error adding records to collection:', error);
      Alert.alert('Error', 'Failed to add records to collection');
    } finally {
      setLoading(false);
    }
  };
  const renderCollection = (collection) => {
    const recordCount = collection.records?.length || 0;
    
    return (      <View key={collection.id} style={styles.collectionCard}>
        <View style={styles.collectionHeader}>
          <View style={styles.collectionTitleContainer}>
            <Ionicons name="folder" size={24} color="#000" />
            <TouchableOpacity 
              style={styles.collectionInfo}
              onPress={() => handleViewCollection(collection)}
            >
              <Text style={styles.collectionTitle}>{collection.name}</Text>
              {collection.description && (
                <Text style={styles.collectionDescription} numberOfLines={2}>
                  {collection.description}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.collectionActionsRow}>
          <Text style={styles.recordCount}>
            {recordCount} {recordCount === 1 ? 'record' : 'records'}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { marginLeft: 0, marginRight: 8 }]}
              onPress={() => {
                setQrCollection(collection);
                setQrRecord(null);
                setShowQRModal(true);
              }}
            >
              <Ionicons name="qr-code-outline" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { marginLeft: 0 }]}
              onPress={() => handleEditCollection(collection)}
            >
              <Ionicons name="create-outline" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteCollection(collection)}
            >
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAddRecordsToCollection(collection)}
            >
              <Ionicons name="add-outline" size={20} color="#000" />
            </TouchableOpacity>
          </View></View>
        
        {collection.records && collection.records.length === 0 && (
          <View style={styles.emptyCollectionContainer}>
            <Text style={styles.emptyText}>No records in this collection</Text>            <TouchableOpacity
              style={styles.addRecordButton}
              onPress={() => handleAddRecordsToCollection(collection)}
            >
              <Ionicons name="add-outline" size={16} color="#000" />
              <Text style={styles.addRecordText}>Add Records</Text>
            </TouchableOpacity>
          </View>
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading collections...</Text>
        </View>
      ) : (<ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
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
        </View>        {/* Unorganized Records Section */}
        {unorganizedRecords.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Unorganized Records</Text>
              <Text style={styles.sectionSubtitle}>
                Records not yet added to any collection
              </Text>
            </View>            <View style={styles.unorganizedList}>
              {unorganizedRecords.map((record, index) => (
                <View key={record.id} style={[
                  styles.recordItemContainer,
                  index === unorganizedRecords.length - 1 && styles.lastRecordItem
                ]}>
                  <TouchableOpacity
                    style={styles.recordItemContent}
                    onPress={() => handleRecordSelect(record)}
                    onLongPress={() => handleRecordLongPress(record)}
                  >
                    <RecordItem
                      record={record}
                      onPress={() => handleRecordSelect(record)}
                      onLongPress={() => handleRecordLongPress(record)}
                    />
                  </TouchableOpacity>
                  
                  <View style={styles.recordActionsRow}>
                    <Text style={styles.recordMetaText}>
                      {record.file_type ? record.file_type.split('/')[1]?.toUpperCase() || 'FILE' : 'FILE'} • {new Date(record.created_at).toLocaleDateString()}
                    </Text>
                    <View style={styles.recordActions}>
                      <TouchableOpacity
                        style={styles.recordActionButton}
                        onPress={() => {
                          setQrRecord(record);
                          setQrCollection(null);
                          setShowQRModal(true);
                        }}
                      >
                        <Ionicons name="qr-code-outline" size={16} color="#000" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.recordActionButton}
                        onPress={() => handleRecordActions(record)}
                      >
                        <Ionicons name="ellipsis-horizontal" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : allRecords.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Unorganized Records</Text>
              <Text style={styles.sectionSubtitle}>
                All records are organized in collections
              </Text>
            </View>
            <View style={styles.emptyUnorganizedState}>
              <Ionicons name="checkmark-circle" size={48} color="#28a745" />
              <Text style={styles.emptyUnorganizedText}>All organized!</Text>
              <Text style={styles.emptyUnorganizedSubText}>
                Great job! All your records are organized in collections.
              </Text>
            </View>
          </View>        )}
      </ScrollView>
      )}

      {showOrganizer && (
        <RecordOrganizer
          visible={showOrganizer}
          onClose={() => {
            setShowOrganizer(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
          collections={collections}
          onRecordMoved={handleRecordMoved}        />
      )}

      {/* Rename Record Modal */}
      <RenameRecordModal
        visible={showRenameModal}
        onClose={() => {
          setShowRenameModal(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        onRecordRenamed={handleRecordRenamed}
      />

      {/* Edit Collection Modal */}
      <Modal
        visible={showEditCollectionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditCollectionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowEditCollectionModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Collection</Text>
            <TouchableOpacity
              onPress={handleUpdateCollection}
              style={styles.modalSaveButton}
              disabled={loading}
            >
              <Text style={styles.modalSaveText}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Collection Name</Text>
              <TextInput
                style={styles.textInput}
                value={editingCollection.name}
                onChangeText={(text) => setEditingCollection(prev => ({...prev, name: text}))}
                placeholder="Enter collection name"
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editingCollection.description}
                onChangeText={(text) => setEditingCollection(prev => ({...prev, description: text}))}
                placeholder="Enter description"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>        </View>
      </Modal>

      {/* Create Collection Modal */}
      <Modal
        visible={showCreateCollectionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateCollectionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowCreateCollectionModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Collection</Text>
            <TouchableOpacity
              onPress={handleCreateCollectionSubmit}
              style={[
                styles.modalSaveButton,
                (!newCollection.name.trim() || loading) && styles.modalSaveButtonDisabled
              ]}
              disabled={!newCollection.name.trim() || loading}
            >
              <Text style={[
                styles.modalSaveText,
                (!newCollection.name.trim() || loading) && styles.modalSaveTextDisabled
              ]}>
                {loading ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Collection Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newCollection.name}
                onChangeText={(text) => setNewCollection(prev => ({...prev, name: text}))}
                placeholder="Enter collection name"
                autoFocus
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newCollection.description}
                onChangeText={(text) => setNewCollection(prev => ({...prev, description: text}))}
                placeholder="Enter a brief description of what this collection contains"
                multiline
                numberOfLines={3}
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {newCollection.description.length}/500
              </Text>
            </View>

            <View style={styles.modalHint}>
              <Ionicons name="information-circle-outline" size={16} color="#666" />
              <Text style={styles.hintText}>
                Collections help you organize related medical records together for easy access and sharing.
              </Text>
            </View>
          </View>
        </View>      </Modal>

      {/* Collection View Modal */}
      <Modal
        visible={showCollectionViewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCollectionViewModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowCollectionViewModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {viewingCollection?.name || 'Collection'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalContent}>
            {viewingCollection?.description && (
              <View style={styles.collectionDescriptionContainer}>
                <Text style={styles.collectionDescriptionText}>
                  {viewingCollection.description}
                </Text>
              </View>
            )}

            <Text style={styles.recordsListTitle}>
              Records ({viewingCollection?.records?.length || 0})
            </Text>

            {viewingCollection?.records && viewingCollection.records.length > 0 ? (
              <ScrollView style={styles.recordsModalList} showsVerticalScrollIndicator={false}>
                {viewingCollection.records.map((record, index) => (
                  <TouchableOpacity
                    key={record.id}
                    style={[
                      styles.recordModalItem,
                      index === viewingCollection.records.length - 1 && styles.lastRecordModalItem
                    ]}
                    onPress={() => {
                      setShowCollectionViewModal(false);
                      handleRecordSelect(record);
                    }}
                  >
                    <View style={styles.recordModalContent}>
                      <View style={styles.recordModalInfo}>
                        <Text style={styles.recordModalTitle} numberOfLines={1}>
                          {record.filename || 'Untitled Record'}
                        </Text>
                        <Text style={styles.recordModalSubtitle}>
                          {record.file_type ? record.file_type.split('/')[1] || 'Unknown' : 'Unknown'} • 
                          {new Date(record.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyRecordsModalState}>
                <Ionicons name="document-outline" size={48} color="#ccc" />
                <Text style={styles.emptyRecordsModalText}>No records in this collection</Text>
                <Text style={styles.emptyRecordsModalSubText}>
                  Add records to this collection to view them here
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Record Actions Modal */}
      <Modal
        visible={showRecordActionsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRecordActionsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowRecordActionsModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Record Actions</Text>
            <View style={styles.placeholder} />
          </View>          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setShowRecordActionsModal(false);
                handleEditRecord(selectedRecord);
              }}
            >
              <Ionicons name="create-outline" size={24} color="#000" />
              <Text style={styles.actionMenuText}>Edit Record</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setShowRecordActionsModal(false);
                handleRenameRecord(selectedRecord);
              }}
            >
              <Ionicons name="pencil-outline" size={24} color="#000" />
              <Text style={styles.actionMenuText}>Rename Record</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setShowRecordActionsModal(false);
                handleRecordLongPress(selectedRecord);
              }}
            >
              <Ionicons name="folder-outline" size={24} color="#000" />
              <Text style={styles.actionMenuText}>Move to Collection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionMenuItem, styles.destructiveAction]}
              onPress={() => {
                setShowRecordActionsModal(false);
                handleDeleteRecord(selectedRecord);
              }}
            >
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
              <Text style={[styles.actionMenuText, styles.destructiveText]}>Delete Record</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>      {/* Record Picker Modal */}
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
              onPress={handleAddSelectedRecords}
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
                {loading ? 'Adding...' : `Add ${selectedRecordsForAdding.length} Record(s)`}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {selectedCollectionForAdding && (
              <View style={styles.collectionInfoHeader}>
                <Ionicons name="folder" size={24} color="#000" />
                <View style={styles.collectionInfoText}>
                  <Text style={styles.collectionInfoName}>{selectedCollectionForAdding.name}</Text>
                  <Text style={styles.collectionInfoDesc}>
                    Select records to add to this collection
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.recordsListTitle}>
              Available Records ({unorganizedRecords.length})
            </Text>

            {unorganizedRecords.length === 0 ? (
              <View style={styles.emptyRecordsState}>
                <Ionicons name="document-outline" size={48} color="#ccc" />
                <Text style={styles.emptyRecordsText}>No unorganized records available</Text>
                <Text style={styles.emptyRecordsSubText}>
                  All records are already organized in collections
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.recordsPickerList} showsVerticalScrollIndicator={false}>
                {unorganizedRecords.map((record, index) => {
                  const isSelected = selectedRecordsForAdding.some(r => r.id === record.id);
                  return (
                    <TouchableOpacity
                      key={record.id}
                      style={[
                        styles.recordPickerItem,
                        isSelected && styles.recordPickerItemSelected,
                        index === unorganizedRecords.length - 1 && styles.lastRecordPickerItem
                      ]}
                      onPress={() => handleRecordSelectionToggle(record)}
                    >
                      <View style={styles.recordPickerContent}>
                        <RecordItem
                          record={record}
                          onPress={() => handleRecordSelectionToggle(record)}
                        />
                        <View style={styles.recordPickerCheckbox}>
                          <Ionicons 
                            name={isSelected ? "checkbox" : "square-outline"} 
                            size={24} 
                            color={isSelected ? "#000" : "#ccc"} 
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {selectedRecordsForAdding.length > 0 && (
              <View style={styles.selectionSummary}>
                <Text style={styles.selectionSummaryText}>
                  {selectedRecordsForAdding.length} record(s) selected
                </Text>
              </View>
            )}
          </View>
        </View>      </Modal>

      {/* QR Code Modal */}
      <QRModal
        visible={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setQrCollection(null);
          setQrRecord(null);
        }}
        recordId={qrRecord?.id}
        collectionId={qrCollection?.id}        title={qrRecord ? `QR Code - ${qrRecord.filename}` : qrCollection ? `QR Code - ${qrCollection.name}` : 'QR Code'}
      />
    </View>
  );
};

const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6c757d',
    marginBottom: 24,
    lineHeight: 20,
  },  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 8,
    alignItems: 'center',
    width: '100%',
    minHeight: 80,
  },statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 3,
    textAlign: 'center',
  },  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },  statSeparator: {
    width: 1,
    backgroundColor: '#e0e0e0',
    height: 35,
    marginHorizontal: 8,
  },content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 50,
  },
  section: {
    padding: 20,
  },  sectionHeader: {
    marginBottom: 16,
  },  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },collectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',  },
  collectionHeader: {
    marginBottom: 12,
  },
  collectionActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  collectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  collectionInfo: {
    marginLeft: 12,
    flex: 1,
  },  collectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    lineHeight: 24,
    flexWrap: 'wrap',
  },
  collectionDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
    lineHeight: 18,
  },
  collectionActions: {
    alignItems: 'flex-end',
  },
  recordCount: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 10,
    fontWeight: '500',
  },  actionButtons: {
    flexDirection: 'row',
  },  actionButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginLeft: 8,
  },
  recordsList: {
    marginTop: 8,  },  recordItemContainer: {
    flexDirection: 'column',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  recordItemContent: {
    width: '100%',
    marginBottom: 8,
  },
  recordActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  recordMetaText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },recordActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recordActionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    marginBottom: 4,
  },
  emptyCollectionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  addRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
    marginTop: 8,
  },
  addRecordText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 4,
  },  unorganizedList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
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
  },  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  lastRecordItem: {
    marginBottom: 0,
  },
  emptyUnorganizedState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyUnorganizedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#28a745',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyUnorganizedSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
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
  },  modalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000',
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
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  modalHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionMenuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  destructiveAction: {
    backgroundColor: '#fff5f5',
  },  destructiveText: {
    color: '#ff4444',
  },
  // Record Picker Modal Styles
  collectionInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  collectionInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  collectionInfoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  collectionInfoDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  recordsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emptyRecordsState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyRecordsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyRecordsSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  recordsPickerList: {
    flex: 1,
    maxHeight: 400,
  },
  recordPickerItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  recordPickerItemSelected: {
    borderColor: '#000',
    backgroundColor: '#f0f8ff',
  },
  lastRecordPickerItem: {
    marginBottom: 0,
  },
  recordPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  recordPickerCheckbox: {
    marginLeft: 12,
  },
  selectionSummary: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },  selectionSummaryText: {    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  // Collection View Modal Styles
  collectionDescriptionContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  collectionDescriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recordsModalList: {
    flex: 1,
    maxHeight: 500,
  },
  recordModalItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  lastRecordModalItem: {
    marginBottom: 0,
  },
  recordModalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  recordModalInfo: {
    flex: 1,
    marginRight: 12,
  },
  recordModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recordModalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  emptyRecordsModalState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyRecordsModalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyRecordsModalSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FolderSystemScreen;
