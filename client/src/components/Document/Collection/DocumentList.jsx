import React from 'react';
import DocumentCard from './DocumentCard';

const DocumentList = ({
  records,
  isSelectionMode,
  selectedRecordIds,
  expandedRecords,
  onToggleSelection,
  onToggleExpansion,
  onRecordClick,
  onMoveRecord,
  onRemoveRecord
}) => {  return (
    <div className="space-y-4 sm:space-y-6">
      {records.map((record) => {
        const isExpanded = expandedRecords.has(record.id);
        const isSelected = selectedRecordIds.includes(record.id);
        
        return (
          <DocumentCard
            key={record.id}
            record={record}
            isSelectionMode={isSelectionMode}
            isSelected={isSelected}
            isExpanded={isExpanded}
            onToggleSelection={onToggleSelection}
            onToggleExpansion={onToggleExpansion}
            onRecordClick={onRecordClick}
            onMoveRecord={onMoveRecord}
            onRemoveRecord={onRemoveRecord}
          />
        );
      })}
    </div>
  );
};

export default DocumentList;
