import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  TextInput, 
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  FlatList,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Record, Collection } from '@/types';
import { useApiService } from '@/services/apiService';
import { showToast, showConfirmToast } from '@/utils/toast';

const { width: screenWidth } = Dimensions.get('window');

// Inline RecordItem Component
interface RecordItemProps {
  record: Record;
  onRemove?: (record: Record) => void;
  onPress?: (record: Record) => void;
  onLongPress?: (record: Record) => void;
}

const RecordItemComponent: React.FC<RecordItemProps> = ({ record, onRemove, onPress, onLongPress }) => {
  if (!record) return null;
  
  const fileExtension = record.filename ? record.filename.split('.').pop()?.toUpperCase() || 'FILE' : 'FILE';
  const fileSizeKB = ((record.file_size || 0) / 1024).toFixed(2);

  return (
    <TouchableOpacity 
      style={styles.recordItemInternal}
      onPress={() => onPress?.(record)}
      onLongPress={() => onLongPress?.(record)}
    >
      <View style={styles.recordIcon}>
        <Text style={styles.recordIconText}>
          {fileExtension}
        </Text>
      </View>
      <View style={styles.recordInfoInternal}>
        <Text style={styles.recordName} numberOfLines={1}>
          {record.filename || 'Unnamed Record'}
        </Text>
        <Text style={styles.recordSize}>
          {record.file_type ? `${record.file_type.split('/')[1] || 'Unknown'} • ` : ''}{fileSizeKB} KB
        </Text>
      </View>
      {typeof onRemove === 'function' && (
        <TouchableOpacity 
          style={styles.recordRemove}
          onPress={() => onRemove(record)}
          accessibilityLabel="Remove record"
        >
          <Text style={styles.recordRemoveText}>✕</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// Inline RenameRecordModal Component
interface RenameRecordModalProps {
  visible: boolean;
  onClose: () => void;
  record: Record | null;
  onRecordRenamed: (recordId: string, newFilename: string) => void;
}

const RenameRecordModal: React.FC<RenameRecordModalProps> = ({ visible, onClose, record, onRecordRenamed }) => {
  const [newFilename, setNewFilename] = useState('');
  const [renaming, setRenaming] = useState(false);
  const apiService = useApiService();

  useEffect(() => {
    if (record && visible) {
      setNewFilename(record.filename || '');
    }
  }, [record, visible]);

  const handleRename = async () => {
    if (!newFilename.trim()) {
      showToast.error('Error', 'Filename cannot be empty');
      return;
    }

    if (newFilename.trim() === record?.filename) {
      showToast.info('Info', 'Filename is the same as current name');
      return;
    }

    setRenaming(true);
    try {
      await apiService.records.update(record!.id, {
        filename: newFilename.trim()
      });

      showToast.success('Success', 'Record renamed successfully');
      onRecordRenamed?.(record!.id, newFilename.trim());
      onClose();
    } catch (error) {
      console.error('Error renaming record:', error);
      showToast.error('Error', 'Failed to rename record. Please try again.');
    } finally {
      setRenaming(false);
    }
  };

  const handleCancel = () => {
    setNewFilename(record?.filename || '');
    onClose();
  };

  if (!record) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.renameModalContainer}>
          <View style={styles.renameModalHeader}>
            <Text style={styles.renameModalTitle}>Rename Record</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.renameModalContent}>
            <View style={styles.recordInfoSection}>
              <View style={styles.recordHeader}>
                <Ionicons name="document-text" size={24} color="#000" />
                <View style={styles.recordDetails}>
                  <Text style={styles.currentFilename} numberOfLines={1}>
                    Current: {record.filename}
                  </Text>
                  <Text style={styles.recordMeta}>
                    {record.file_type ? record.file_type.split('/')[1] || 'Unknown' : 'Unknown'} • {Math.round((record.file_size || 0) / 1024)}KB
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>New Filename</Text>
              <TextInput
                style={styles.renameTextInput}
                value={newFilename}
                onChangeText={setNewFilename}
                placeholder="Enter new filename"
                autoFocus
                maxLength={100}
                editable={!renaming}
              />
              <Text style={styles.hint}>
                Enter a descriptive name for your record
              </Text>
            </View>
          </View>

          <View style={styles.renameModalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={renaming}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.renameButton,
                (renaming || !newFilename.trim()) && styles.disabledButton
              ]}
              onPress={handleRename}
              disabled={renaming || !newFilename.trim()}
            >
              {renaming ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.renameButtonText}>Rename</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Inline LoadingOverlay Component
interface LoadingOverlayProps {
  visible?: boolean;
  text?: string;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible = true, text, message }) => {
  const displayText = text || message;
  
  return (
    <View style={styles.loadingOverlayContainer}>
      <ActivityIndicator size="large" color="#000" />
      {displayText && <Text style={styles.loadingOverlayText}>{displayText}</Text>}
    </View>
  );
};

// Inline QRModal Component
interface QRModalProps {
  visible: boolean;
  onClose: () => void;
  recordId?: string;
  collectionId?: string;
  title?: string;
}

const QRModal: React.FC<QRModalProps> = ({ visible, onClose, recordId, collectionId, title }) => {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiService = useApiService();

  useEffect(() => {
    if (visible && (recordId || collectionId)) {
      generateQR();
    }
  }, [visible, recordId, collectionId]);

  const generateQR = async () => {
    try {
      setLoading(true);
      setError(null);
      setQrImage(null);

      let response;
      if (recordId) {
        response = await apiService.qr.getRecordQR(recordId);
      } else if (collectionId) {
        response = await apiService.qr.getCollectionQR(collectionId);
      } else {
        throw new Error('No record or collection ID provided');
      }

      if (response?.data) {
        // For React Native, we need to handle the blob differently
        if (typeof response.data === 'string') {
          // If it's already a data URL
          setQrImage(response.data);
        } else {
          // Convert blob to base64 for React Native Image component
          const reader = new FileReader();
          reader.onload = () => {
            setQrImage(reader.result as string);
          };
          reader.onerror = () => {
            throw new Error('Failed to convert QR code image');
          };
          reader.readAsDataURL(response.data);
        }
      } else {
        throw new Error('No QR code data received');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code');
      showToast.error('Error', 'Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQrImage(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.qrModalOverlay}>
        <View style={styles.qrModalContainer}>
          {/* Header */}
          <View style={styles.qrModalHeader}>
            <Text style={styles.qrModalTitle}>{title || 'QR Code'}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.qrCloseButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.qrModalContent}>
            {loading && (
              <View style={styles.qrLoadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.qrLoadingText}>Generating QR code...</Text>
              </View>
            )}

            {error && (
              <View style={styles.qrErrorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
                <Text style={styles.qrErrorText}>{error}</Text>
                <TouchableOpacity onPress={generateQR} style={styles.qrRetryButton}>
                  <Text style={styles.qrRetryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {qrImage && !loading && !error && (
              <View style={styles.qrImageContainer}>
                <Image source={{ uri: qrImage }} style={styles.qrImage} />
                <Text style={styles.qrInstructionText}>
                  Scan this QR code to share or access this {recordId ? 'record' : 'collection'}
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          {qrImage && !loading && !error && (
            <View style={styles.qrModalFooter}>
              <TouchableOpacity onPress={handleClose} style={styles.qrDoneButton}>
                <Text style={styles.qrDoneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Inline RecordOrganizer Component
interface RecordOrganizerProps {
  visible: boolean;
  onClose: () => void;
  record: Record | null;
  collections?: Collection[];
  onRecordMoved?: () => void;
}

const RecordOrganizer: React.FC<RecordOrganizerProps> = ({ 
  visible, 
  onClose, 
  record, 
  collections = [],
  onRecordMoved 
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [moving, setMoving] = useState(false);

  const apiService = useApiService();

  useEffect(() => {
    if (record) {
      setSelectedCollectionId(record.collection_id || null);
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
        showToast.info('Info', 'Record is already in the selected collection');
      }
    } catch (error) {
      console.error('Error moving record:', error);
      showToast.error('Error', 'Failed to move record');
    } finally {
      setMoving(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      showToast.error('Error', 'Please enter a collection name');
      return;
    }

    setCreating(true);
    try {
      const response = await apiService.collections.create({
        name: newCollectionName.trim(),
        description: `Collection for organizing records`
      });

      // Immediately move the record to the new collection
      if (record) {
        await apiService.collections.addRecord(response.data.id, record.id);
      }
      
      // Notify parent component for automatic refresh
      setNewCollectionName('');
      setShowCreateForm(false);
      onRecordMoved?.();
      onClose();
    } catch (error) {
      console.error('Error creating collection:', error);
      showToast.error('Error', 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const renderCollectionItem = ({ item }: { item: Collection }) => {
    const isSelected = selectedCollectionId === item.id;
    const isCurrent = record?.collection_id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.organizerCollectionItem,
          isSelected && styles.organizerSelectedItem,
          isCurrent && styles.organizerCurrentItem
        ]}
        onPress={() => setSelectedCollectionId(item.id)}
      >
        <View style={styles.organizerCollectionContent}>
          <Ionicons 
            name="folder" 
            size={20} 
            color={isSelected ? '#000' : '#666'} 
          />
          <View style={styles.organizerCollectionInfo}>
            <Text style={[
              styles.organizerCollectionName,
              isSelected && styles.organizerSelectedText
            ]}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={styles.organizerCollectionDescription} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
          {isCurrent && (
            <View style={styles.organizerCurrentBadge}>
              <Text style={styles.organizerCurrentBadgeText}>Current</Text>
            </View>
          )}
          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color="#000" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!record) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.organizerContainer}>
        <View style={styles.organizerHeader}>
          <TouchableOpacity onPress={onClose} style={styles.organizerCloseButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.organizerTitle}>Organize Record</Text>
          <View style={styles.organizerPlaceholder} />
        </View>

        <View style={styles.organizerRecordInfo}>
          <View style={styles.organizerRecordHeader}>
            <Ionicons name="document-text" size={24} color="#000" />
            <View style={styles.organizerRecordDetails}>
              <Text style={styles.organizerRecordName} numberOfLines={1}>
                {record.filename || 'Unnamed Record'}
              </Text>
              <Text style={styles.organizerRecordMeta}>
                {record.file_type ? record.file_type.split('/')[1] || 'Unknown' : 'Unknown'} • {Math.round((record.file_size || 0) / 1024)}KB
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.organizerContent}>
          <View style={styles.organizerSectionHeader}>
            <Text style={styles.organizerSectionTitle}>Choose Collection</Text>
            <TouchableOpacity
              style={styles.organizerCreateButton}
              onPress={() => setShowCreateForm(!showCreateForm)}
            >
              <Ionicons name="add-circle-outline" size={16} color="#000" />
              <Text style={styles.organizerCreateButtonText}>New Collection</Text>
            </TouchableOpacity>
          </View>

          {showCreateForm && (
            <View style={styles.organizerCreateForm}>
              <TextInput
                style={styles.organizerTextInput}
                placeholder="Enter collection name"
                value={newCollectionName}
                onChangeText={setNewCollectionName}
                autoFocus
              />
              <View style={styles.organizerCreateActions}>
                <TouchableOpacity
                  style={styles.organizerCancelButton}
                  onPress={() => {
                    setShowCreateForm(false);
                    setNewCollectionName('');
                  }}
                >
                  <Text style={styles.organizerCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.organizerCreateConfirmButton}
                  onPress={handleCreateCollection}
                  disabled={creating}
                >
                  <Text style={styles.organizerCreateConfirmButtonText}>
                    {creating ? 'Creating...' : 'Create & Move'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.organizerCollectionItem,
              !selectedCollectionId && styles.organizerSelectedItem
            ]}
            onPress={() => setSelectedCollectionId(null)}
          >
            <View style={styles.organizerCollectionContent}>
              <Ionicons 
                name="folder-open-outline" 
                size={20} 
                color={!selectedCollectionId ? '#000' : '#666'} 
              />
              <View style={styles.organizerCollectionInfo}>
                <Text style={[
                  styles.organizerCollectionName,
                  !selectedCollectionId && styles.organizerSelectedText
                ]}>
                  Unorganized
                </Text>
                <Text style={styles.organizerCollectionDescription}>
                  Remove from any collection
                </Text>
              </View>
              {!selectedCollectionId && (
                <Ionicons name="checkmark-circle" size={20} color="#000" />
              )}
            </View>
          </TouchableOpacity>

          <FlatList
            data={collections}
            renderItem={renderCollectionItem}
            keyExtractor={(item) => item.id}
            style={styles.organizerCollectionsList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.organizerFooter}>
          <TouchableOpacity
            style={[
              styles.organizerMoveButton,
              (moving || selectedCollectionId === record.collection_id) && styles.organizerDisabledButton
            ]}
            onPress={handleMove}
            disabled={moving || selectedCollectionId === record.collection_id}
          >
            <Text style={[
              styles.organizerMoveButtonText,
              (moving || selectedCollectionId === record.collection_id) && styles.organizerDisabledButtonText
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

interface Stats {
  collections: number;
  records: number;
  unorganized: number;
}

interface EditingCollection {
  name: string;
  description: string;
}

export default function CollectionsScreen() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [unorganizedRecords, setUnorganizedRecords] = useState<Record[]>([]);
  const [allRecords, setAllRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showOrganizer, setShowOrganizer] = useState(false);
  const [showEditCollectionModal, setShowEditCollectionModal] = useState(false);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [showRecordActionsModal, setShowRecordActionsModal] = useState(false);
  const [showRecordPickerModal, setShowRecordPickerModal] = useState(false);
  const [showCollectionViewModal, setShowCollectionViewModal] = useState(false);
  const [viewingCollection, setViewingCollection] = useState<Collection | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCollection, setQrCollection] = useState<Collection | null>(null);
  const [qrRecord, setQrRecord] = useState<Record | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editingCollection, setEditingCollection] = useState<EditingCollection>({
    name: '',
    description: ''
  });
  const [newCollection, setNewCollection] = useState<EditingCollection>({
    name: '',
    description: ''
  });
  const [selectedCollectionForAdding, setSelectedCollectionForAdding] = useState<Collection | null>(null);
  const [selectedRecordsForAdding, setSelectedRecordsForAdding] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({
    collections: 0,
    records: 0,
    unorganized: 0
  });

  const apiService = useApiService();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Load data on initial render and when refreshTrigger changes
  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // Focus listener to reload data when screen comes into focus
  useEffect(() => {
    if (params.recordsAdded) {
      setRefreshTrigger(prev => prev + 1);
    }
  }, [params.recordsAdded]);

  const loadData = async () => {
    if (!initialLoad) {
      setRefreshing(true);
    }
    
    try {
      const [collectionsResponse, recordsResponse] = await Promise.all([
        apiService.collections.getAll(),
        apiService.records.getAll()
      ]);

      const collectionsData = collectionsResponse.data;
      const recordsData = recordsResponse.data;

      setCollections(collectionsData);
      setAllRecords(recordsData);

      // Filter unorganized records (those not in any collection)
      const organizedRecordIds = new Set();
      collectionsData.forEach((collection: Collection) => {
        collection.records?.forEach((record: Record) => {
          organizedRecordIds.add(record.id);
        });
      });

      const unorganized = recordsData.filter((record: Record) => 
        !organizedRecordIds.has(record.id)
      );
      setUnorganizedRecords(unorganized);

      // Update stats
      setStats({
        collections: collectionsData.length,
        records: recordsData.length,
        unorganized: unorganized.length
      });

    } catch (error: any) {
      console.error('Error loading data:', error);
      
      // Check if it's a 401 error (authentication failure)
      if (error.response?.status === 401) {
        console.log('Authentication failed in collections, will be handled by auth error listener');
        // The DeviceEventEmitter in the apiService will handle the redirect
        return;
      }
      
      showToast.error('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoad(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) {
      showToast.error('Error', 'Collection name is required');
      return;
    }

    try {
      await apiService.collections.create({
        name: newCollection.name.trim(),
        description: newCollection.description.trim()
      });
      
      setNewCollection({ name: '', description: '' });
      setShowCreateCollectionModal(false);
      setRefreshTrigger(prev => prev + 1);
      showToast.success('Success', 'Collection created successfully');
    } catch (error: any) {
      console.error('Error creating collection:', error);
      showToast.error('Error', error.response?.data?.detail || 'Failed to create collection');
    }
  };

  const handleUpdateCollection = async () => {
    if (!editingCollection.name.trim()) {
      showToast.error('Error', 'Collection name is required');
      return;
    }

    if (!selectedCollection) return;

    try {
      await apiService.collections.update(selectedCollection.id, {
        name: editingCollection.name.trim(),
        description: editingCollection.description.trim()
      });
      
      setShowEditCollectionModal(false);
      setRefreshTrigger(prev => prev + 1);
      showToast.success('Success', 'Collection updated successfully');
    } catch (error) {
      console.error('Error updating collection:', error);
      showToast.error('Error', 'Failed to update collection');
    }
  };

  const handleDeleteCollection = (collection: Collection) => {
    showConfirmToast(
      'Delete Collection',
      `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`,
      async () => {
        try {
          await apiService.collections.delete(collection.id);
          setRefreshTrigger(prev => prev + 1);
          showToast.success('Success', 'Collection deleted successfully');
        } catch (error) {
          console.error('Error deleting collection:', error);
          showToast.error('Error', 'Failed to delete collection');
        }
      },
      () => {}
    );
  };

  const handleAddRecordToCollection = async (collectionId: string, recordId: string) => {
    try {
      await apiService.collections.addRecord(collectionId, recordId);
      setRefreshTrigger(prev => prev + 1);
      showToast.success('Success', 'Record added to collection');
    } catch (error) {
      console.error('Error adding record to collection:', error);
      showToast.error('Error', 'Failed to add record to collection');
    }
  };

  const handleRemoveRecordFromCollection = async (collectionId: string, recordId: string) => {
    showConfirmToast(
      'Remove Record',
      'Are you sure you want to remove this record from the collection?',
      async () => {
        setLoading(true);
        try {
          await apiService.collections.removeRecord(collectionId, recordId);
          setRefreshTrigger(prev => prev + 1);
          showToast.success('Success', 'Record removed from collection');
        } catch (error) {
          console.error('Error removing record from collection:', error);
          showToast.error('Error', 'Failed to remove record from collection');
        } finally {
          setLoading(false);
        }
      },
      () => {}
    );
  };

  const handleRecordPress = (record: Record) => {
    router.push({
      pathname: '/record-detail',
      params: { recordId: record.id }
    });
  };

  const handleCollectionPress = (collection: Collection) => {
    setViewingCollection(collection);
    setShowCollectionViewModal(true);
  };

  const handleRecordLongPress = (record: Record) => {
    setSelectedRecord(record);
    setShowOrganizer(true);
  };

  const handleRecordMoved = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowOrganizer(false);
  };

  const handleShowQRForRecord = (record: Record) => {
    setQrRecord(record);
    setQrCollection(null);
    setShowQRModal(true);
  };

  const handleShowQRForCollection = (collection: Collection) => {
    setQrCollection(collection);
    setQrRecord(null);
    setShowQRModal(true);
  };

  const onRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  if (loading && initialLoad) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading collections...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collections</Text>
        <Text style={styles.subtitle}>Organize your medical records</Text>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.collections}</Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.records}</Text>
            <Text style={styles.statLabel}>Total Records</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.unorganized}</Text>
            <Text style={styles.statLabel}>Unorganized</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateCollectionModal(true)}
        >
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.createButtonText}>New Collection</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Unorganized Records Section */}
        {unorganizedRecords.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="folder-outline" size={24} color="#666" />
              <Text style={styles.sectionTitle}>Unorganized Records ({unorganizedRecords.length})</Text>
            </View>
            {unorganizedRecords.map((record) => (
              <TouchableOpacity 
                key={record.id}
                style={styles.recordItem}
                onPress={() => handleRecordPress(record)}
                onLongPress={() => handleRecordLongPress(record)}
              >
                <View style={styles.recordInfo}>
                  <Text style={styles.recordTitle}>{record.filename}</Text>
                  <Text style={styles.recordDate}>
                    {new Date(record.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleShowQRForRecord(record)}
                  style={{ marginRight: 10 }}
                >
                  <Ionicons name="qr-code-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Collections Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collections</Text>
          {collections.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-outline" size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>No collections yet</Text>
              <Text style={styles.emptyStateSubtext}>Create your first collection to organize records</Text>
            </View>
          ) : (
            collections.map((collection) => (
              <TouchableOpacity 
                key={collection.id}
                style={styles.collectionItem}
                onPress={() => handleCollectionPress(collection)}
              >
                <View style={styles.collectionIcon}>
                  <Ionicons name="folder" size={24} color="#007AFF" />
                </View>
                <View style={styles.collectionInfo}>
                  <Text style={styles.collectionName}>{collection.name}</Text>
                  {collection.description && (
                    <Text style={styles.collectionDescription}>{collection.description}</Text>
                  )}
                  <Text style={styles.collectionStats}>
                    {collection.records?.length || 0} record{(collection.records?.length || 0) !== 1 ? 's' : ''}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.collectionMenu}
                  onPress={() => {
                    // For now just show the edit modal, but could be expanded to a context menu
                    setSelectedCollection(collection);
                    setEditingCollection({
                      name: collection.name,
                      description: collection.description || ''
                    });
                    setShowEditCollectionModal(true);
                  }}
                  onLongPress={() => handleShowQRForCollection(collection)}
                >
                  <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Collection Modal */}
      <Modal
        visible={showCreateCollectionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateCollectionModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateCollectionModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Collection</Text>
            <TouchableOpacity onPress={handleCreateCollection}>
              <Text style={styles.modalSave}>Create</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={newCollection.name}
                onChangeText={(text) => setNewCollection(prev => ({ ...prev, name: text }))}
                placeholder="Enter collection name"
                autoFocus
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newCollection.description}
                onChangeText={(text) => setNewCollection(prev => ({ ...prev, description: text }))}
                placeholder="Enter description"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edit Collection Modal */}
      <Modal
        visible={showEditCollectionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditCollectionModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditCollectionModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Collection</Text>
            <TouchableOpacity onPress={handleUpdateCollection}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={editingCollection.name}
                onChangeText={(text) => setEditingCollection(prev => ({ ...prev, name: text }))}
                placeholder="Enter collection name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editingCollection.description}
                onChangeText={(text) => setEditingCollection(prev => ({ ...prev, description: text }))}
                placeholder="Enter description"
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => {
                setShowEditCollectionModal(false);
                if (selectedCollection) {
                  handleDeleteCollection(selectedCollection);
                }
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.deleteButtonText}>Delete Collection</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Collection View Modal */}
      <Modal
        visible={showCollectionViewModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCollectionViewModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCollectionViewModal(false)}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{viewingCollection?.name}</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {viewingCollection?.description && (
              <Text style={styles.collectionDescription}>{viewingCollection.description}</Text>
            )}
            
            {viewingCollection?.records && viewingCollection.records.length > 0 ? (
              viewingCollection.records.map((record) => (
                <TouchableOpacity 
                  key={record.id}
                  style={styles.recordItem}
                  onPress={() => {
                    setShowCollectionViewModal(false);
                    handleRecordPress(record);
                  }}
                  onLongPress={() => {
                    setShowCollectionViewModal(false);
                    handleRecordLongPress(record);
                  }}
                >
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{record.filename}</Text>
                    <Text style={styles.recordDate}>
                      {new Date(record.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleShowQRForRecord(record)}
                    style={{ marginRight: 10 }}
                  >
                    <Ionicons name="qr-code-outline" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemoveRecordFromCollection(viewingCollection.id, record.id)}
                  >
                    <Ionicons name="remove-circle-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color="#CCC" />
                <Text style={styles.emptyStateText}>No records in this collection</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Rename Record Modal */}
      <RenameRecordModal
        visible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        record={selectedRecord}
        onRecordRenamed={(recordId, newFilename) => {
          setRefreshTrigger(prev => prev + 1);
          setShowRenameModal(false);
        }}
      />

      {/* QR Code Modal */}
      <QRModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        recordId={qrRecord?.id}
        collectionId={qrCollection?.id}
        title={qrRecord ? `QR Code for ${qrRecord.filename}` : qrCollection ? `QR Code for ${qrCollection.name}` : 'QR Code'}
      />

      {/* Record Organizer Modal */}
      <RecordOrganizer
        visible={showOrganizer}
        onClose={() => setShowOrganizer(false)}
        record={selectedRecord}
        collections={collections}
        onRecordMoved={handleRecordMoved}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 12,
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  collectionItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  collectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  collectionStats: {
    fontSize: 12,
    color: '#999',
  },
  collectionMenu: {
    padding: 5,
  },
  recordItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
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
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: '500',
    marginLeft: 8,
  },
  // Inline component styles
  recordItemInternal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  recordInfoInternal: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  recordSize: {
    fontSize: 12,
    color: '#777',
  },
  recordRemove: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordRemoveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Rename modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  renameModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  renameModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  renameModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  renameModalContent: {
    padding: 20,
  },
  recordInfoSection: {
    marginBottom: 20,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  recordDetails: {
    flex: 1,
    marginLeft: 12,
  },
  currentFilename: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  recordMeta: {
    fontSize: 12,
    color: '#666',
  },
  inputSection: {
    marginBottom: 20,
  },
  renameTextInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  renameModalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  renameButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  // LoadingOverlay styles
  loadingOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingOverlayText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
  // QRModal styles
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  qrModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  qrCloseButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  qrModalContent: {
    padding: 20,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  qrLoadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  qrErrorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  qrErrorText: {
    fontSize: 16,
    color: '#ff4444',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  qrRetryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  qrRetryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qrImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  qrInstructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  qrModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  qrDoneButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // RecordOrganizer styles
  organizerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  organizerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  organizerCloseButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  organizerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  organizerPlaceholder: {
    width: 40,
  },
  organizerRecordInfo: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
  },
  organizerRecordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerRecordDetails: {
    marginLeft: 12,
    flex: 1,
  },
  organizerRecordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  organizerRecordMeta: {
    fontSize: 12,
    color: '#666',
  },
  organizerContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  organizerSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  organizerSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  organizerCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  organizerCreateButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  organizerCreateForm: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  organizerTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  organizerCreateActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  organizerCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  organizerCancelButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  organizerCreateConfirmButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  organizerCreateConfirmButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  organizerCollectionsList: {
    flex: 1,
  },
  organizerCollectionItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    marginBottom: 8,
  },
  organizerSelectedItem: {
    borderColor: '#000',
    backgroundColor: '#f5f5f5',
  },
  organizerCurrentItem: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
  },
  organizerCollectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerCollectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  organizerCollectionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  organizerSelectedText: {
    color: '#000',
  },
  organizerCollectionDescription: {
    fontSize: 12,
    color: '#666',
  },
  organizerCurrentBadge: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  organizerCurrentBadgeText: {
    fontSize: 10,
    color: '#000',
    fontWeight: '600',
  },
  organizerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  organizerMoveButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  organizerDisabledButton: {
    backgroundColor: '#ccc',
  },
  organizerMoveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  organizerDisabledButtonText: {
    color: '#999',
  },
});
