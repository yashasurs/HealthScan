import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Header } from '../components/common';
import { DocumentUploader, DocumentList } from '../components/document';

const DocumentUploadScreen = () => {
  const [documents, setDocuments] = useState([]);

  const handleDocumentPicked = (document) => {
    setDocuments([...documents, document]);
  };

  const handleRemoveDocument = (documentToRemove) => {
    setDocuments(documents.filter(doc => doc.uri !== documentToRemove.uri));
  };

  const handleUploadAll = () => {
    // In a real app, this would upload documents to a server
    Alert.alert(
      "Upload Successful",
      `${documents.length} document(s) have been uploaded.`,
      [
        { 
          text: "OK", 
          onPress: () => setDocuments([]) 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Document Upload" />
      
      <ScrollView style={styles.content}>
        <DocumentUploader onDocumentPicked={handleDocumentPicked} />
        
        <DocumentList 
          documents={documents}
          onRemoveDocument={handleRemoveDocument}
          onUploadAll={handleUploadAll}
        />
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
});

export default DocumentUploadScreen;
