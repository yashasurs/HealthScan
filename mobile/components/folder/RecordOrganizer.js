import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Modal,
  FlatList,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApiService } from '../../services/apiService';
import { LoadingOverlay } from '../common';

/**
 * Record organizer component for moving records between collections
 * and managing record organization
 */
const RecordOrganizer = ({ 
  visible, 
  onClose, 
  record, 
  collections = [],
  onRecordMoved 
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [moving, setMoving] = useState(false);

  const apiService = useApiService();

  useEffect(() => {
    if (record) {
      setSelectedCollectionId(record.collection_id);
    }
  }, [record]);

  const handleMove = async () => {
    if (!record) return;

    setMoving(true);
    try {
      // If moving to a different collection
      if (selectedCollectionId !== record.collection_id) {
        // Remove from current collection if it has one
        if (record.collection_id) {
          await apiService.collections.removeRecord(record.collection_id, record.id);
        }
          // Add to new collection if one is selected
        if (selectedCollectionId) {
          await apiService.collections.addRecord(selectedCollectionId, record.id);
        }
        
        // Notify parent component for automatic refresh
        onRecordMoved?.();
        onClose();
      } else {
        Alert.alert('Info', 'Record is already in the selected collection');
      }
    } catch (error) {
      console.error('Error moving record:', error);
      Alert.alert('Error', 'Failed to move record');
    } finally {
      setMoving(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    setCreating(true);
    try {
      const response = await apiService.collections.create({
        name: newCollectionName.trim(),
        description: `Collection for organizing records`
      });      // Immediately move the record to the new collection
      await apiService.collections.addRecord(response.data.id, record.id);
      
      // Notify parent component for automatic refresh instead of showing alert
      setNewCollectionName('');
      setShowCreateForm(false);
      onRecordMoved?.();
      onClose();
    } catch (error) {
      console.error('Error creating collection:', error);
      Alert.alert('Error', 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const renderCollectionItem = ({ item }) => {
    const isSelected = selectedCollectionId === item.id;
    const isCurrent = record?.collection_id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.collectionItem,
          isSelected && styles.selectedItem,
          isCurrent && styles.currentItem
        ]}
        onPress={() => setSelectedCollectionId(item.id)}
      >
        <View style={styles.collectionContent}>          <Ionicons 
            name="folder" 
            size={20} 
            color={isSelected ? '#000' : '#666'} 
          />
          <View style={styles.collectionInfo}>
            <Text style={[
              styles.collectionName,
              isSelected && styles.selectedText
            ]}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={styles.collectionDescription} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color="#000" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!record) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Organize Record</Text>
          <View style={styles.placeholder} />
        </View>        <View style={styles.recordInfo}>
          <View style={styles.recordHeader}>
            <Ionicons name="document-text" size={24} color="#000" />
            <View style={styles.recordDetails}>
              <Text style={styles.recordName} numberOfLines={1}>
                {record.filename}
              </Text>              <Text style={styles.recordMeta}>
                {record.file_type ? record.file_type.split('/')[1] || 'Unknown' : 'Unknown'} • {Math.round((record.file_size || 0) / 1024)}KB
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Collection</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateForm(!showCreateForm)}
            >
              <Ionicons name="add-circle-outline" size={16} color="#000" />
              <Text style={styles.createButtonText}>New Collection</Text>
            </TouchableOpacity>
          </View>

          {showCreateForm && (
            <View style={styles.createForm}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter collection name"
                value={newCollectionName}
                onChangeText={setNewCollectionName}
                autoFocus
              />
              <View style={styles.createActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowCreateForm(false);
                    setNewCollectionName('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createConfirmButton}
                  onPress={handleCreateCollection}
                  disabled={creating}
                >
                  <Text style={styles.createConfirmButtonText}>
                    {creating ? 'Creating...' : 'Create & Move'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.collectionItem,
              !selectedCollectionId && styles.selectedItem
            ]}
            onPress={() => setSelectedCollectionId(null)}
          >
            <View style={styles.collectionContent}>
              <Ionicons 
                name="folder-open-outline" 
                size={20} 
                color={!selectedCollectionId ? '#000' : '#666'} 
              />
              <View style={styles.collectionInfo}>
                <Text style={[
                  styles.collectionName,
                  !selectedCollectionId && styles.selectedText
                ]}>
                  Unorganized
                </Text>
                <Text style={styles.collectionDescription}>
                  Remove from any collection
                </Text>
              </View>              {!selectedCollectionId && (
                <Ionicons name="checkmark-circle" size={20} color="#000" />
              )}
            </View>
          </TouchableOpacity>

          <FlatList
            data={collections}
            renderItem={renderCollectionItem}
            keyExtractor={(item) => item.id}
            style={styles.collectionsList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.moveButton,
              (moving || selectedCollectionId === record.collection_id) && styles.disabledButton
            ]}
            onPress={handleMove}
            disabled={moving || selectedCollectionId === record.collection_id}
          >
            <Text style={[
              styles.moveButtonText,
              (moving || selectedCollectionId === record.collection_id) && styles.disabledButtonText
            ]}>
              {moving ? 'Moving...' : 'Move Record'}
            </Text>
          </TouchableOpacity>
        </View>

        {(moving || creating) && (
          <LoadingOverlay message={moving ? "Moving record..." : "Creating collection..."} />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },  closeButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },  recordInfo: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordDetails: {
    marginLeft: 12,
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recordMeta: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  createForm: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },  cancelButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  createConfirmButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createConfirmButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  collectionsList: {
    flex: 1,
  },
  collectionItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    marginBottom: 8,
  },  selectedItem: {
    borderColor: '#000',
    backgroundColor: '#f5f5f5',
  },
  currentItem: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
  },
  collectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  collectionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },  selectedText: {
    color: '#000',
  },
  collectionDescription: {
    fontSize: 12,
    color: '#666',
  },
  currentBadge: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    color: '#000',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },  moveButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  moveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default RecordOrganizer;