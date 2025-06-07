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

      {/* Content */}      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.fileHeader}>
          <Ionicons name="document-text" size={24} color="#4A90E2" />
          <Text style={styles.fileName} numberOfLines={1}>{record.filename}</Text>
          <Text style={styles.fileType}>
            {record.file_type ? record.file_type.split('/')[1] || 'Unknown' : 'Unknown'}
          </Text>
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
  },  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: '#fff',
  },
  fileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a202c',
    marginLeft: 12,
    flex: 1,
  },
  fileType: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#2c3e50',
    letterSpacing: 0.3,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: 'rgba(248, 249, 250, 0.5)',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    maxWidth: '80%',
  },  metadataSection: {
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metadataCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
  },
  metadataLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metadataValue: {
    fontSize: 15,
    color: '#2c3e50',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
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
    lineHeight: 26,
    color: '#2c3e50',
    fontFamily: 'System',
    letterSpacing: 0.3,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginTop: 28,
    marginBottom: 12,
    letterSpacing: 0.4,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginTop: 24,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: 0.2,
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
