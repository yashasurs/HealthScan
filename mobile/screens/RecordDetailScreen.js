import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useApiService } from '../services/apiService';
import { RenameRecordModal, QRModal } from '../components/modals';
import { showToast, showConfirmToast } from '../utils/toast';

/**
 * RecordDetailScreen - Full screen view for displaying record details
 */
const RecordDetailScreen = ({ navigation, route }) => {
  const { recordId, record: initialRecord } = route.params;  const [record, setRecord] = useState(initialRecord);
  const [loading, setLoading] = useState(!initialRecord);
  const [deleting, setDeleting] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  
  const apiService = useApiService();

  useEffect(() => {
    if (!record && recordId) {
      fetchRecord();
    }
  }, [recordId]);

  const fetchRecord = async () => {    try {
      setLoading(true);
      const response = await apiService.records.get(recordId);
      setRecord(response.data);
    } catch (error) {
      console.error('Error fetching record:', error);
      showToast.error('Error', 'Failed to load record details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showConfirmToast(
      'Delete Record',
      `Are you sure you want to delete "${record.filename}"? This action cannot be undone.`,
      confirmDelete,
      () => {}
    );
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await apiService.records.delete(record.id);
      showToast.success('Success', 'Record deleted successfully');
      // Navigate back and refresh the previous screen
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting record:', error);
      showToast.error('Error', 'Failed to delete record');
    } finally {
      setDeleting(false);
    }};
  const handleRename = () => {
    setShowRenameModal(true);
  };

  const handleShowQR = () => {
    setShowQRModal(true);
  };

  const handleRecordRenamed = (recordId, newFilename) => {
    // Update the local record state
    setRecord(prev => ({ ...prev, filename: newFilename }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading record...</Text>
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#999" />
        <Text style={styles.errorText}>Record not found</Text>        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {record.filename || 'Untitled Record'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {record.file_type ? record.file_type.split('/')[1] || 'Unknown' : 'Unknown'} • {formatFileSize(record.file_size || 0)}
          </Text>        </View>        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleShowQR} 
            style={styles.actionButton}
          >            <Ionicons 
              name="qr-code-outline" 
              size={20} 
              color="#000" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleRename} 
            style={styles.actionButton}
          >            <Ionicons 
              name="pencil-outline" 
              size={20} 
              color="#000" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleDelete} 
            style={styles.actionButton}
            disabled={deleting}
          >
            <Ionicons 
              name="trash-outline" 
              size={20} 
              color={deleting ? "#ccc" : "#000"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* OCR Content Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content</Text>
          <View style={styles.contentCard}>
            {record.content ? (
              <Markdown style={markdownStyles}>
                {record.content}
              </Markdown>
            ) : (
              <View style={styles.emptyContent}>
                <Ionicons name="document-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No content available</Text>
                <Text style={styles.emptySubtext}>
                  This record may not have been processed through OCR
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Metadata Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Record Information</Text>
          <View style={styles.metadataCard}>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Filename</Text>
              <Text style={styles.metadataValue}>{record.filename}</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>File Type</Text>
              <Text style={styles.metadataValue}>
                {record.file_type || 'Unknown'}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>File Size</Text>
              <Text style={styles.metadataValue}>
                {formatFileSize(record.file_size || 0)}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Created</Text>
              <Text style={styles.metadataValue}>
                {new Date(record.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Updated</Text>
              <Text style={styles.metadataValue}>
                {new Date(record.updated_at).toLocaleDateString()}
              </Text>
            </View>
            {record.collection_id && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Collection ID</Text>
                <Text style={styles.metadataValue}>
                  {record.collection_id}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {deleting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Deleting record...</Text>
          </View>        </View>
      )}      {/* Rename Record Modal */}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },  backButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  actionButton: {
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 10,
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  metadataCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  metadataValue: {
    fontSize: 14,
    color: '#000',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#000',
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    fontWeight: '500',
  },  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 40,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
});

// Clean black and white markdown styles
const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  heading2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    marginBottom: 12,
  },
  list_item: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000',
    marginBottom: 4,
  },
  code_inline: {
    backgroundColor: '#f5f5f5',
    color: '#000',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
  },
  code_block: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#e5e5e5',
    paddingLeft: 12,
    marginVertical: 8,
    fontStyle: 'italic',
    color: '#666',
  },
  strong: {
    fontWeight: 'bold',
    color: '#000',
  },
  em: {
    fontStyle: 'italic',
  },
};

export default RecordDetailScreen;