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
  onRecordDeleted,
  onRecordRenamed,
  embedded = false
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
      if (onClose) onClose();
    } catch (error) {
      console.error('Error deleting record:', error);
      Alert.alert('Error', 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  const handleRename = () => {
    onRecordRenamed?.(record);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderContent = () => (
    <View style={styles.container}>
      {/* Header - only show if not embedded */}
      {!embedded && (
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {record.filename}
            </Text>
            <Text style={styles.headerSubtitle}>
              {record.file_type ? record.file_type.split('/')[1] || 'Unknown' : 'Unknown'} • {formatFileSize(record.file_size || 0)}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={handleRename} 
              style={styles.actionButton}
            >
              <Ionicons 
                name="pencil-outline" 
                size={20} 
                color="#4A90E2" 
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
                color={deleting ? "#ccc" : "#dc3545"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.contentHeaderLeft}>
            <Ionicons name="document-text" size={20} color="#4A90E2" />
            <Text style={styles.contentTitle}>OCR Content (Markdown Formatted)</Text>
          </View>
        </View>

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

        {/* Metadata Section */}
        <View style={styles.metadataSection}>
          <Text style={styles.sectionTitle}>Record Information</Text>
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
  );

  if (embedded) {
    return renderContent();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {renderContent()}
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
    borderBottomColor: '#e5e5e5',
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
    color: '#000',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  contentCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metadataCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
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
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metadataValue: {
    fontSize: 14,
    color: '#000',
    flex: 2,
    textAlign: 'right',
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
  loadingText: {
    fontSize: 14,
    color: '#000',
    marginTop: 12,
    fontWeight: '500',
  },
});

// Updated markdown styles for clean black and white
const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
    fontFamily: 'System',
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
    fontFamily: 'monospace',
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

export default RecordViewer;
