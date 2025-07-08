import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Share,
  Linking,
  Modal,
  TextInput,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Record } from '@/types';
import { useApiService } from '@/services/apiService';
import { showToast, showConfirmToast } from '@/utils/toast';

const { width: screenWidth } = Dimensions.get('window');

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
      <View style={inlineStyles.renameModalOverlay}>
        <View style={inlineStyles.renameModalContainer}>
          <View style={inlineStyles.renameModalHeader}>
            <Text style={inlineStyles.renameModalTitle}>Rename Record</Text>
            <TouchableOpacity onPress={handleCancel} style={inlineStyles.renameCloseButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={inlineStyles.renameModalContent}>
            <View style={inlineStyles.renameRecordInfo}>
              <View style={inlineStyles.renameRecordHeader}>
                <Ionicons name="document-text" size={24} color="#000" />
                <View style={inlineStyles.renameRecordDetails}>
                  <Text style={inlineStyles.renameCurrentFilename} numberOfLines={1}>
                    Current: {record.filename}
                  </Text>
                  <Text style={inlineStyles.renameRecordMeta}>
                    {record.file_type ? record.file_type.split('/')[1] || 'Unknown' : 'Unknown'} • {Math.round((record.file_size || 0) / 1024)}KB
                  </Text>
                </View>
              </View>
            </View>

            <View style={inlineStyles.renameInputSection}>
              <Text style={inlineStyles.renameLabel}>New Filename</Text>
              <TextInput
                style={inlineStyles.renameTextInput}
                value={newFilename}
                onChangeText={setNewFilename}
                placeholder="Enter new filename"
                autoFocus
                maxLength={100}
                editable={!renaming}
              />
              <Text style={inlineStyles.renameHint}>
                Enter a descriptive name for your record
              </Text>
            </View>
          </View>

          <View style={inlineStyles.renameModalFooter}>
            <TouchableOpacity
              style={inlineStyles.renameCancelButton}
              onPress={handleCancel}
              disabled={renaming}
            >
              <Text style={inlineStyles.renameCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                inlineStyles.renameConfirmButton,
                (renaming || !newFilename.trim()) && inlineStyles.renameDisabledButton
              ]}
              onPress={handleRename}
              disabled={renaming || !newFilename.trim()}
            >
              {renaming ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={inlineStyles.renameConfirmButtonText}>Rename</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Inline QRModal Component
interface QRModalProps {
  visible: boolean;
  onClose: () => void;
  recordId?: string;
  title?: string;
}

const QRModal: React.FC<QRModalProps> = ({ visible, onClose, recordId, title }) => {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiService = useApiService();

  useEffect(() => {
    if (visible && recordId) {
      generateQR();
    }
  }, [visible, recordId]);

  const generateQR = async () => {
    try {
      setLoading(true);
      setError(null);
      setQrImage(null);

      const response = await apiService.qr.getRecordQR(recordId!);

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
      <View style={inlineStyles.qrModalOverlay}>
        <View style={inlineStyles.qrModalContainer}>
          {/* Header */}
          <View style={inlineStyles.qrModalHeader}>
            <Text style={inlineStyles.qrModalTitle}>{title || 'QR Code'}</Text>
            <TouchableOpacity onPress={handleClose} style={inlineStyles.qrCloseButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={inlineStyles.qrModalContent}>
            {loading && (
              <View style={inlineStyles.qrLoadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={inlineStyles.qrLoadingText}>Generating QR code...</Text>
              </View>
            )}

            {error && (
              <View style={inlineStyles.qrErrorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
                <Text style={inlineStyles.qrErrorText}>{error}</Text>
                <TouchableOpacity onPress={generateQR} style={inlineStyles.qrRetryButton}>
                  <Text style={inlineStyles.qrRetryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {qrImage && !loading && !error && (
              <View style={inlineStyles.qrImageContainer}>
                <Image source={{ uri: qrImage }} style={inlineStyles.qrImage} />
                <Text style={inlineStyles.qrInstructionText}>
                  Scan this QR code to share or access this record
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          {qrImage && !loading && !error && (
            <View style={inlineStyles.qrModalFooter}>
              <TouchableOpacity onPress={handleClose} style={inlineStyles.qrDoneButton}>
                <Text style={inlineStyles.qrDoneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default function RecordDetailScreen() {
  const { recordId } = useLocalSearchParams<{ recordId: string }>();
  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  
  const apiService = useApiService();
  const router = useRouter();

  useEffect(() => {
    if (recordId) {
      fetchRecord();
    }
  }, [recordId]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const response = await apiService.records.get(recordId!);
      setRecord(response.data);
    } catch (error) {
      console.error('Error fetching record:', error);
      showToast.error('Error', 'Failed to load record details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!record) return;
    
    showConfirmToast(
      'Delete Record',
      `Are you sure you want to delete "${record.filename}"? This action cannot be undone.`,
      confirmDelete,
      () => {}
    );
  };

  const confirmDelete = async () => {
    if (!record) return;
    
    setDeleting(true);
    try {
      await apiService.records.delete(record.id);
      showToast.success('Success', 'Record deleted successfully');
      // Navigate back and refresh the previous screen
      router.back();
    } catch (error) {
      console.error('Error deleting record:', error);
      showToast.error('Error', 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    if (!record) return;
    
    try {
      await Share.share({
        message: `Medical Record: ${record.filename}`,
        title: record.filename,
        url: record.file_url
      });
    } catch (error) {
      console.error('Error sharing record:', error);
      showToast.error('Error', 'Failed to share record');
    }
  };

  const handleRename = () => {
    setShowRenameModal(true);
  };

  const handleShowQR = () => {
    setShowQRModal(true);
  };

  const handleRecordRenamed = (recordId: string, newFilename: string) => {
    // Update the local record state
    setRecord(prev => prev ? { ...prev, filename: newFilename } : null);
  };

  const handleDownload = async () => {
    if (!record) return;
    
    try {
      const supported = await Linking.canOpenURL(record.file_url);
      if (supported) {
        await Linking.openURL(record.file_url);
      } else {
        showToast.error('Error', 'Cannot open file URL');
      }
    } catch (error) {
      console.error('Error opening file:', error);
      showToast.error('Error', 'Failed to open file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'image-outline';
    if (fileType.includes('pdf')) return 'document-text-outline';
    if (fileType.includes('word')) return 'document-outline';
    return 'document-outline';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading record...</Text>
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>Record not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backAction}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {record.filename}
          </Text>
          <Text style={styles.headerSubtitle}>
            {new Date(record.created_at).toLocaleDateString()}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.shareAction}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* File Preview Card */}
        <View style={styles.previewCard}>
          <View style={styles.fileIcon}>
            <Ionicons 
              name={getFileTypeIcon(record.file_type)} 
              size={48} 
              color="#007AFF" 
            />
          </View>
          
          <Text style={styles.fileName}>{record.filename}</Text>
          <Text style={styles.fileInfo}>
            {record.file_type} • {formatFileSize(record.file_size)}
          </Text>
          
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={handleDownload}
          >
            <Ionicons name="eye-outline" size={20} color="#FFF" />
            <Text style={styles.viewButtonText}>View File</Text>
          </TouchableOpacity>
        </View>

        {/* File Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>File Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Filename</Text>
            <Text style={styles.detailValue}>{record.filename}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>File Type</Text>
            <Text style={styles.detailValue}>{record.file_type}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>File Size</Text>
            <Text style={styles.detailValue}>{formatFileSize(record.file_size)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {new Date(record.created_at).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Modified</Text>
            <Text style={styles.detailValue}>
              {new Date(record.updated_at).toLocaleString()}
            </Text>
          </View>
          
          {record.collection_id && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Collection</Text>
              <Text style={styles.detailValue}>In Collection</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={handleDownload}
          >
            <Ionicons name="download-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Download</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Share</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={handleRename}
          >
            <Ionicons name="create-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Rename</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={handleShowQR}
          >
            <Ionicons name="qr-code-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Generate QR Code</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => {
              showToast.info('Info', 'Move to collection feature coming soon');
            }}
          >
            <Ionicons name="folder-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Move to Collection</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionItem, styles.deleteAction]}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Ionicons 
              name="trash-outline" 
              size={24} 
              color="#FF3B30" 
            />
            <Text style={styles.deleteText}>
              {deleting ? 'Deleting...' : 'Delete Record'}
            </Text>
            {deleting ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#666" />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Rename Record Modal */}
      <RenameRecordModal
        visible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        record={record}
        onRecordRenamed={handleRecordRenamed}
      />

      {/* QR Code Modal */}
      <QRModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        recordId={record?.id}
        title={`QR Code - ${record?.filename || 'Record'}`}
      />
    </SafeAreaView>
  );
}

// Inline component styles
const inlineStyles = StyleSheet.create({
  // RenameRecordModal styles
  renameModalOverlay: {
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
  renameCloseButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  renameModalContent: {
    padding: 20,
  },
  renameRecordInfo: {
    marginBottom: 20,
  },
  renameRecordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  renameRecordDetails: {
    flex: 1,
    marginLeft: 12,
  },
  renameCurrentFilename: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  renameRecordMeta: {
    fontSize: 12,
    color: '#666',
  },
  renameInputSection: {
    marginBottom: 20,
  },
  renameLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
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
  renameHint: {
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
  renameCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
  },
  renameCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  renameConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  renameDisabledButton: {
    backgroundColor: '#ccc',
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
});

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backAction: {
    padding: 5,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  shareAction: {
    padding: 5,
    marginLeft: 15,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  previewCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  fileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  fileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 5,
  },
  fileInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#FFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    flex: 2,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  actionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 15,
  },
  deleteAction: {
    borderBottomWidth: 0,
  },
  deleteText: {
    flex: 1,
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 15,
  },
});
