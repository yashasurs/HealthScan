import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
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
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                'Record Details',
                `Name: ${record.filename}\nType: ${record.file_type ? record.file_type.split('/')[1] || 'Unknown' : 'Unknown'}\nSize: ${formatFileSize(record.size || 0)}`
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
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 16,
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
