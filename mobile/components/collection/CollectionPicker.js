import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApiService } from '../../services/apiService';

const CollectionPicker = ({ 
  selectedCollectionId, 
  onCollectionSelect,
  preSelectedCollection = null
}) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const apiService = useApiService();

  useEffect(() => {
    if (preSelectedCollection) {
      onCollectionSelect(preSelectedCollection);
    }
  }, [preSelectedCollection]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const response = await apiService.collections.getAll();
      setCollections(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Failed to load collections');
      Alert.alert('Error', 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPicker = () => {
    setShowModal(true);
    fetchCollections();
  };

  const handleSelectCollection = (collection) => {
    onCollectionSelect(collection.id);
    setShowModal(false);
  };

  const handleClearSelection = () => {
    onCollectionSelect(null);
  };

  const getSelectedCollectionName = () => {
    const collection = collections.find(c => c.id === selectedCollectionId);
    return collection ? collection.name : 'Select Collection';
  };

  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.collectionItem,
        selectedCollectionId === item.id && styles.selectedCollectionItem
      ]}
      onPress={() => handleSelectCollection(item)}
    >
      <View style={styles.collectionContent}>
        <View style={styles.collectionIcon}>
          <Ionicons 
            name="folder" 
            size={20} 
            color={selectedCollectionId === item.id ? '#4A90E2' : '#7f8c8d'} 
          />
        </View>
        <View style={styles.collectionInfo}>
          <Text style={[
            styles.collectionName,
            selectedCollectionId === item.id && styles.selectedCollectionName
          ]}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={styles.collectionDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
        {selectedCollectionId === item.id && (
          <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-outline" size={48} color="#CCC" />
      <Text style={styles.emptyStateText}>No collections found</Text>
      <Text style={styles.emptyStateSubtext}>
        Create a collection first to organize your documents
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Collection (Optional)</Text>
      
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={[
            styles.pickerButton,
            selectedCollectionId && styles.pickerButtonSelected
          ]}
          onPress={handleOpenPicker}
        >
          <View style={styles.pickerContent}>
            <Ionicons 
              name="folder-outline" 
              size={20} 
              color={selectedCollectionId ? '#4A90E2' : '#7f8c8d'} 
            />
            <Text style={[
              styles.pickerText,
              selectedCollectionId && styles.pickerTextSelected
            ]}>
              {getSelectedCollectionName()}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={16} 
              color={selectedCollectionId ? '#4A90E2' : '#7f8c8d'} 
            />
          </View>
        </TouchableOpacity>
        
        {selectedCollectionId && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearSelection}
          >
            <Ionicons name="close-circle" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.helperText}>
        {selectedCollectionId 
          ? 'Documents will be added to this collection' 
          : 'Select a collection to organize your documents'
        }
      </Text>

      {/* Collection Selection Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Collection</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.loadingText}>Loading collections...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={fetchCollections}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.modalBody}>
                <TouchableOpacity
                  style={[
                    styles.collectionItem,
                    !selectedCollectionId && styles.selectedCollectionItem
                  ]}
                  onPress={() => {
                    onCollectionSelect(null);
                    setShowModal(false);
                  }}
                >
                  <View style={styles.collectionContent}>
                    <View style={styles.collectionIcon}>
                      <Ionicons 
                        name="document-outline" 
                        size={20} 
                        color={!selectedCollectionId ? '#4A90E2' : '#7f8c8d'} 
                      />
                    </View>
                    <View style={styles.collectionInfo}>
                      <Text style={[
                        styles.collectionName,
                        !selectedCollectionId && styles.selectedCollectionName
                      ]}>
                        No Collection
                      </Text>
                      <Text style={styles.collectionDescription}>
                        Upload without organizing into a collection
                      </Text>
                    </View>
                    {!selectedCollectionId && (
                      <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />
                    )}
                  </View>
                </TouchableOpacity>

                <FlatList
                  data={collections}
                  keyExtractor={(item) => item.id}
                  renderItem={renderCollectionItem}
                  ListEmptyComponent={renderEmptyState}
                  showsVerticalScrollIndicator={false}
                  style={styles.collectionsList}
                />
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  pickerButtonSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#f0f7ff',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: '#7f8c8d',
    marginLeft: 12,
  },
  pickerTextSelected: {
    color: '#4A90E2',
    fontWeight: '500',
  },
  clearButton: {
    marginLeft: 8,
    padding: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  collectionsList: {
    maxHeight: 300,
  },
  collectionItem: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  selectedCollectionItem: {
    backgroundColor: '#f0f7ff',
  },
  collectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  collectionIcon: {
    marginRight: 12,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2,
  },
  selectedCollectionName: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  collectionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CollectionPicker;
