import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

/**
 * Document uploader component with file picker
 * @param {Object} props
 * @param {Function} props.onDocumentPicked - Callback when document is selected
 */
const DocumentUploader = ({ onDocumentPicked }) => {  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });
    
    if (result.canceled === false) {
      onDocumentPicked(result.assets[0]);
    }
  };

  return (
    <View style={styles.uploadSection}>
      <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
        <Text style={styles.uploadButtonText}>Select Document</Text>
      </TouchableOpacity>
      <Text style={styles.uploadInfo}>
        Supported formats: PDF, DOC, DOCX, JPG, PNG
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  uploadSection: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  uploadInfo: {
    color: '#777',
    textAlign: 'center',
  },
});

export default DocumentUploader;
