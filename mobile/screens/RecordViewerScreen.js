import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecordViewer } from '../components/document';
import { RenameRecordModal } from '../components/modals';
import { useApiService } from '../services/apiService';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const RecordViewerScreen = ({ route, navigation }) => {
  const { record: initialRecord } = route.params;
  const [record, setRecord] = useState(initialRecord);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const apiService = useApiService();

  const handleDelete = () => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete "${record.filename}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await apiService.records.delete(record.id);
              Alert.alert('Success', 'Record deleted successfully');
              navigation.goBack();
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

  const handleRename = () => {
    setShowRenameModal(true);
  };

  const handleRecordRenamed = async (recordId, newFilename) => {
    try {
      await apiService.records.update(recordId, { filename: newFilename });
      setRecord(prev => ({ ...prev, filename: newFilename }));
      Alert.alert('Success', 'Record renamed successfully');
    } catch (error) {
      console.error('Error renaming record:', error);
      Alert.alert('Error', 'Failed to rename record');
    }
    setShowRenameModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>          <View style={styles.headerCenter} />
        <View style={styles.headerActions}>          <TouchableOpacity            onPress={() => {
              const details = [
                `Filename: ${record.filename || 'Untitled'}`,
                `File Type: ${record.file_type || 'Unknown'}`,
                `File Size: ${formatFileSize(record.file_size || 0)}`,
                record.collection_id ? `Collection: ${record.collection_id}` : null,
                `Created: ${record.created_at ? new Date(record.created_at).toLocaleDateString() : 'Unknown'}`,
                `Last Modified: ${record.updated_at ? new Date(record.updated_at).toLocaleDateString() : 'Unknown'}`
              ].filter(Boolean).join('\n\n');

              Alert.alert(
                'Record Details',
                details,
                [{ text: 'Close', style: 'default' }]
              );
            }}
            style={styles.actionButton}
          >
            <Ionicons name="information-circle" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleRename} 
            style={styles.actionButton}
          >
            <Ionicons name="pencil" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleDelete} 
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <RecordViewer
          record={record}
          embedded={true}
        />
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      {/* Modals */}
      <RenameRecordModal
        visible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        record={record}
        onRecordRenamed={handleRecordRenamed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionButton: {
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 10,
  },
  content: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RecordViewerScreen;
