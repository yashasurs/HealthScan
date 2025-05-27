import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/common';
import { DocumentUploader, DocumentList } from '../components/document';
import { useApiService } from '../services/apiService';

const DocumentUploadScreen = ({ route, navigation }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const apiService = useApiService();

  const handleDocumentPicked = (document) => {
    setDocuments([...documents, document]);
  };
  const handleRemoveDocument = (documentToRemove) => {
    setDocuments(documents.filter(doc => doc.uri !== documentToRemove.uri));
  };

  const handleNavigateToFolderSystem = () => {
    navigation.navigate('FolderSystem');
  };

  const handleUploadAll = async () => {
    if (documents.length === 0) {
      Alert.alert('Error', 'Please select at least one document to upload');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading and processing documents...');

    try {      // Convert picked documents to file objects for the API
      const files = documents.map(doc => ({
        uri: doc.uri,
        type: doc.type || 'image/jpeg',
        name: doc.name || 'image.jpg'
      }));

      const response = await apiService.ocr.processFiles(files);
      
      setUploadStatus('');
      setDocuments([]);
      
      Alert.alert(
        "Upload Successful",
        `${response.data.length} document(s) have been processed and uploaded.`,
        [
          { 
            text: "View Folder System", 
            onPress: () => {
              navigation.navigate('FolderSystem');
            }
          },
          { 
            text: "Upload More", 
            style: "cancel",
            onPress: () => {
              // Stay on current screen
            }
          }
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('');
      Alert.alert(
        'Upload Failed',
        error.response?.data?.detail || 'Failed to upload documents. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Document Upload" 
        rightAction={{
          icon: 'folder-outline',
          onPress: handleNavigateToFolderSystem
        }}
      />
        <ScrollView 
        style={styles.content}
        nestedScrollEnabled={true}
      >
        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cloud-upload-outline" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Upload Documents</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Select documents to process with OCR
          </Text>
          
          <DocumentUploader onDocumentPicked={handleDocumentPicked} />
        </View>

        {/* Document List */}
        <DocumentList 
          documents={documents}
          onRemoveDocument={handleRemoveDocument}
          onUploadAll={handleUploadAll}
        />

        {uploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.uploadingText}>{uploadStatus}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadingContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 20,
  },
  uploadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
});

export default DocumentUploadScreen;
