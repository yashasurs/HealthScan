import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApiService } from '../services/apiService';

const SharedContentViewerScreen = ({ route, navigation }) => {
  const { shareToken, shareType } = route.params;
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const apiService = useApiService();

  useEffect(() => {
    loadSharedContent();
  }, []);

  const loadSharedContent = async () => {
    try {
      setLoading(true);
      let response;
      
      if (shareType === 'record') {
        response = await apiService.records.getShared(shareToken);
      } else {
        response = await apiService.collections.getShared(shareToken);
      }
      
      setContent(response.data);
    } catch (error) {
      console.error('Error loading shared content:', error);
      Alert.alert(
        'Error',
        'Failed to load shared content. The link may be invalid or expired.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async () => {
    try {
      setSaving(true);
      
      if (shareType === 'record') {
        await apiService.records.saveShared(shareToken);
        Alert.alert(
          'Success',
          'Record saved to your account!',
          [{ text: 'OK', onPress: () => navigation.navigate('Collections') }]
        );
      } else {
        await apiService.collections.saveShared(shareToken);
        Alert.alert(
          'Success',
          'Collection saved to your account!',
          [{ text: 'OK', onPress: () => navigation.navigate('Collections') }]
        );
      }
    } catch (error) {
      console.error('Error saving shared content:', error);
      Alert.alert(
        'Error',
        'Failed to save content. It may already exist in your account or the link may be invalid.'
      );
    } finally {
      setSaving(false);
    }
  };

  const renderRecordContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.headerInfo}>
        <Ionicons name="document-text" size={24} color="#000" />
        <Text style={styles.contentTitle}>{content.filename}</Text>
      </View>
      
      <View style={styles.metadataContainer}>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>Type:</Text>
          <Text style={styles.metadataValue}>{content.file_type || 'Document'}</Text>
        </View>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>Size:</Text>
          <Text style={styles.metadataValue}>
            {content.file_size ? `${(content.file_size / 1024).toFixed(1)} KB` : 'Unknown'}
          </Text>
        </View>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>Created:</Text>
          <Text style={styles.metadataValue}>
            {new Date(content.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text style={styles.contentLabel}>Content:</Text>
      <ScrollView style={styles.contentScrollView}>
        <Text style={styles.contentText}>{content.content}</Text>
      </ScrollView>
    </View>
  );

  const renderCollectionContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.headerInfo}>
        <Ionicons name="folder" size={24} color="#000" />
        <Text style={styles.contentTitle}>{content.collection.name}</Text>
      </View>
      
      {content.collection.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Description:</Text>
          <Text style={styles.descriptionText}>{content.collection.description}</Text>
        </View>
      )}

      <View style={styles.metadataContainer}>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>Records:</Text>
          <Text style={styles.metadataValue}>{content.records.length}</Text>
        </View>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>Created:</Text>
          <Text style={styles.metadataValue}>
            {new Date(content.collection.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text style={styles.contentLabel}>Records in Collection:</Text>
      <ScrollView style={styles.recordsList}>
        {content.records.map((record, index) => (
          <View key={record.id} style={styles.recordItem}>
            <View style={styles.recordHeader}>
              <Ionicons name="document-text-outline" size={20} color="#666" />
              <Text style={styles.recordTitle}>{record.filename}</Text>
            </View>
            <Text style={styles.recordPreview} numberOfLines={3}>
              {record.content}
            </Text>
            <Text style={styles.recordDate}>
              {new Date(record.created_at).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading shared content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>
          Shared {shareType === 'record' ? 'Record' : 'Collection'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {content && (
        <>
          {shareType === 'record' ? renderRecordContent() : renderCollectionContent()}
          
          {/* Save Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveContent}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="save" size={20} color="#fff" />
              )}
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : `Save ${shareType === 'record' ? 'Record' : 'Collection'}`}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  metadataContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metadataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },  metadataLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  metadataValue: {
    fontSize: 16,
    color: '#666',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  contentLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  contentScrollView: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentText: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 24,
  },
  recordsList: {
    flex: 1,
    marginBottom: 20,
  },  recordItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  recordPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 12,
    color: '#999',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SharedContentViewerScreen;
