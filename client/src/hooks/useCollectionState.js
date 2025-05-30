import { useState, useCallback } from 'react';

/**
 * Custom hook for managing collection editing state
 * Simplifies the state management for inline editing of collection properties
 */
export const useCollectionEditing = (collection) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');

  const startEditingName = useCallback(() => {
    setIsEditingName(true);
    setEditedName(collection?.name || '');
  }, [collection?.name]);

  const stopEditingName = useCallback(() => {
    setIsEditingName(false);
    setEditedName('');
  }, []);

  const cancelEditingName = useCallback(() => {
    setIsEditingName(false);
    setEditedName('');
  }, []);

  const startEditingDescription = useCallback(() => {
    setIsEditingDescription(true);
    setEditedDescription(collection?.description || '');
  }, [collection?.description]);

  const stopEditingDescription = useCallback(() => {
    setIsEditingDescription(false);
    setEditedDescription('');
  }, []);

  const cancelEditingDescription = useCallback(() => {
    setIsEditingDescription(false);
    setEditedDescription('');
  }, []);

  return {
    // Name editing state
    isEditingName,
    editedName,
    setEditedName,
    startEditingName,
    stopEditingName,
    cancelEditingName,
    
    // Description editing state
    isEditingDescription,
    editedDescription,
    setEditedDescription,
    startEditingDescription,
    stopEditingDescription,
    cancelEditingDescription,
  };
};

/**
 * Custom hook for managing document selection state
 * Handles multi-select functionality for batch operations
 */
export const useDocumentSelection = (records) => {
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    setSelectedRecordIds([]);
  }, []);

  const toggleRecordSelection = useCallback((recordId) => {
    setSelectedRecordIds(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  }, []);
  const selectAllRecords = useCallback((records) => {
    setSelectedRecordIds(records.map(record => record.id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRecordIds([]);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedRecordIds([]);
  }, []);

  return {
    selectedRecordIds,
    isSelectionMode,
    toggleSelectionMode,
    toggleRecordSelection,
    selectAllRecords,
    clearSelection,
    exitSelectionMode,
  };
};

/**
 * Custom hook for managing document expansion state
 * Handles which documents have their content expanded
 */
export const useDocumentExpansion = () => {
  const [expandedRecords, setExpandedRecords] = useState(new Set());

  const toggleRecordExpansion = useCallback((recordId) => {
    setExpandedRecords(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(recordId)) {
        newExpanded.delete(recordId);
      } else {
        newExpanded.add(recordId);
      }
      return newExpanded;
    });
  }, []);

  const expandRecord = useCallback((recordId) => {
    setExpandedRecords(prev => new Set([...prev, recordId]));
  }, []);

  const collapseRecord = useCallback((recordId) => {
    setExpandedRecords(prev => {
      const newExpanded = new Set(prev);
      newExpanded.delete(recordId);
      return newExpanded;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedRecords(new Set());
  }, []);

  return {
    expandedRecords,
    toggleRecordExpansion,
    expandRecord,
    collapseRecord,
    collapseAll,
  };
};
