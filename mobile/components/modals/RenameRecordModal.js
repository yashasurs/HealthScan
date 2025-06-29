import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApiService } from '../../services/apiService';
import { showToast } from '../../utils/toast';

/**
 * Modal component for renaming records
 * @param {Object} props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Object} props.record - Record object to rename
 * @param {Function} props.onRecordRenamed - Callback when record is successfully renamed
 */
const RenameRecordModal = ({ visible, onClose, record, onRecordRenamed }) => {
  const [newFilename, setNewFilename] = useState('');
  const [renaming, setRenaming] = useState(false);
  const apiService = useApiService();

  useEffect(() => {
    if (record && visible) {
      // Initialize with current filename
      setNewFilename(record.filename || record.original_filename || '');
    }
  }, [record, visible]);
  const handleRename = async () => {
    if (!newFilename.trim()) {
      showToast.error('Error', 'Filename cannot be empty');
      return;
    }

    if (newFilename.trim() === (record.filename || record.original_filename)) {
      showToast.info('Info', 'Filename is the same as current name');
      return;
    }

    setRenaming(true);
    try {
      await apiService.records.update(record.id, {
        filename: newFilename.trim()
      });

      showToast.success('Success', 'Record renamed successfully');
      onRecordRenamed?.(record.id, newFilename.trim());
      onClose();
    } catch (error) {
      console.error('Error renaming record:', error);
      showToast.error('Error', 'Failed to rename record. Please try again.');
    } finally {
      setRenaming(false);
    }
  };

  const handleCancel = () => {
    setNewFilename(record?.filename || record?.original_filename || '');
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
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Rename Record</Text>            
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.recordInfo}>
              <View style={styles.recordHeader}>
                <Ionicons name="document-text" size={24} color="#000" />
                <View style={styles.recordDetails}>
                  <Text style={styles.currentFilename} numberOfLines={1}>
                    Current: {record.filename || record.original_filename}
                  </Text>
                  <Text style={styles.recordMeta}>
                    {record.file_type ? record.file_type.split('/')[1] || 'Unknown' : 'Unknown'} • {Math.round((record.file_size || 0) / 1024)}KB
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>New Filename</Text>
              <TextInput
                style={styles.textInput}
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

          <View style={styles.footer}>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
  },
  recordInfo: {
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
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
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },  cancelButton: {
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
});

export default RenameRecordModal;
