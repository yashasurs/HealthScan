import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useApiService } from '../../services/apiService';

/**
 * RecordViewer component for displaying OCR-processed record content
 * Shows the formatted text content from OCR processing
 */
const RecordViewer = ({ 
  visible, 
  onClose, 
  record,
  onRecordDeleted
}) => {
  const [deleting, setDeleting] = useState(false);
  const apiService = useApiService();

  if (!record) return null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete "${record.filename}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await apiService.records.delete(record.id);
      Alert.alert('Success', 'Record deleted successfully');
      onRecordDeleted?.(record.id);
      onClose();
    } catch (error) {
      console.error('Error deleting record:', error);
      Alert.alert('Error', 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {record.filename}
            </Text>
            <Text style={styles.headerSubtitle}>
              {record.file_type?.split('/')[1] || 'Unknown'} • {formatFileSize(record.file_size || 0)}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleDelete} 
            style={styles.deleteButton}
            disabled={deleting}
          >
            <Ionicons 
              name="trash-outline" 
              size={24} 
              color={deleting ? "#ccc" : "#dc3545"} 
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>          <View style={styles.contentHeader}>
            <View style={styles.contentHeaderLeft}>
              <Ionicons name="document-text" size={20} color="#4A90E2" />
              <Text style={styles.contentTitle}>OCR Content (Markdown Formatted)</Text>
            </View>
          </View><View style={styles.contentCard}>
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

          {/* Metadata Section */}
          <View style={styles.metadataSection}>
            <Text style={styles.sectionTitle}>Document Information</Text>
            <View style={styles.metadataCard}>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Filename:</Text>
                <Text style={styles.metadataValue}>{record.filename}</Text>
              </View>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>File Type:</Text>
                <Text style={styles.metadataValue}>
                  {record.file_type || 'Unknown'}
                </Text>
              </View>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>File Size:</Text>
                <Text style={styles.metadataValue}>
                  {formatFileSize(record.file_size || 0)}
                </Text>
              </View>
              {record.collection_id && (
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Collection:</Text>
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
              <Ionicons name="trash" size={24} color="#dc3545" />
              <Text style={styles.loadingText}>Deleting record...</Text>
            </View>
          </View>
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
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  contentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  contentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
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
  metadataSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  metadataCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
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
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#dc3545',
    marginTop: 12,
    fontWeight: '500',
  },
});

// Markdown styles for better content formatting
const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    fontFamily: 'System',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    paddingBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
  },
  list_item: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 4,
  },
  bullet_list: {
    marginBottom: 12,
  },
  ordered_list: {
    marginBottom: 12,
  },
  code_inline: {
    backgroundColor: '#f0f0f0',
    color: '#e11d48',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
    paddingLeft: 12,
    marginVertical: 8,
    fontStyle: 'italic',
    color: '#666',
  },
  strong: {
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  em: {
    fontStyle: 'italic',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginVertical: 8,
  },
  th: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  td: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  hr: {
    backgroundColor: '#ddd',
    height: 1,
    marginVertical: 16,
  }
};

export default RecordViewer;
