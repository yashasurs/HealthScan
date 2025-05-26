import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Header, TextInput, Button, LoadingOverlay } from '../components/common';
import { useApiService } from '../services/apiService';

/**
 * Collection Creation Screen - Allows users to create new collections
 * with name, description, and optional initial document organization
 */
const CollectionCreateScreen = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});

  const apiService = useApiService();
  const preSelectedRecords = route?.params?.records || [];

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Collection name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Collection name must be at least 2 characters';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Collection name must be less than 100 characters';
    }

    if (description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setCreating(true);
    try {
      const collectionData = {
        name: name.trim(),
        description: description.trim() || undefined
      };

      const response = await apiService.collections.create(collectionData);
      const newCollection = response.data;

      // If there are pre-selected records, add them to the collection
      if (preSelectedRecords.length > 0) {
        for (const record of preSelectedRecords) {
          try {
            await apiService.collections.addRecord(newCollection.id, record.id);
          } catch (error) {
            console.warn(`Failed to add record ${record.id} to collection:`, error);
          }
        }
      }

      Alert.alert(
        'Success',
        `Collection "${name}" created successfully${preSelectedRecords.length > 0 ? ` with ${preSelectedRecords.length} document(s)` : ''}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back and pass the created collection
              navigation.goBack();
              if (route?.params?.onCollectionCreated) {
                route.params.onCollectionCreated(newCollection);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating collection:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to create collection. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    if (name.trim() || description.trim()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header 
        title="Create Collection"
        leftAction={{
          icon: 'arrow-back',
          onPress: handleCancel
        }}
      />
      
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collection Details</Text>
          <Text style={styles.sectionSubtitle}>
            Create a new collection to organize your documents
          </Text>
        </View>

        {preSelectedRecords.length > 0 && (
          <View style={styles.preSelectedSection}>
            <View style={styles.preSelectedHeader}>
              <Text style={styles.preSelectedTitle}>
                Documents to Add ({preSelectedRecords.length})
              </Text>
            </View>
            <View style={styles.preSelectedList}>
              {preSelectedRecords.slice(0, 3).map((record, index) => (
                <View key={record.id} style={styles.preSelectedItem}>
                  <Text style={styles.preSelectedName} numberOfLines={1}>
                    {record.filename}
                  </Text>
                </View>
              ))}
              {preSelectedRecords.length > 3 && (
                <Text style={styles.preSelectedMore}>
                  +{preSelectedRecords.length - 3} more documents
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.formSection}>
          <TextInput
            label="Collection Name *"
            value={name}
            onChangeText={setName}
            placeholder="Enter a descriptive name"
            error={errors.name}
            maxLength={100}
            autoFocus
          />

          <TextInput
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description to help identify this collection"
            multiline
            numberOfLines={4}
            error={errors.description}
            maxLength={500}
            style={styles.descriptionInput}
          />

          <View style={styles.characterCount}>
            <Text style={styles.characterCountText}>
              {description.length}/500 characters
            </Text>
          </View>
        </View>

        <View style={styles.tipSection}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipTitle}>Tips for Good Collection Names</Text>
          </View>
          <Text style={styles.tipText}>
            • Use descriptive names like "Medical Records 2024" or "Tax Documents"
          </Text>
          <Text style={styles.tipText}>
            • Keep names concise but meaningful
          </Text>
          <Text style={styles.tipText}>
            • Use descriptions to add context and search keywords
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <Button
            title={creating ? 'Creating...' : 'Create Collection'}
            onPress={handleCreate}
            disabled={creating || !name.trim()}
            style={[styles.createButton, (!name.trim() || creating) && styles.disabledButton]}
          />
        </View>
      </View>

      {creating && (
        <LoadingOverlay message="Creating collection..." />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  preSelectedSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  preSelectedHeader: {
    marginBottom: 12,
  },
  preSelectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  preSelectedList: {
    gap: 8,
  },
  preSelectedItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  preSelectedName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  preSelectedMore: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingTop: 8,
  },
  formSection: {
    marginBottom: 24,
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  characterCountText: {
    fontSize: 12,
    color: '#999',
  },
  tipSection: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
  },
  tipText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  createButton: {
    flex: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CollectionCreateScreen;
