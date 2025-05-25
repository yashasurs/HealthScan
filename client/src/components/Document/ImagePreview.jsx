import React, { useState } from 'react';

const ImagePreview = ({ file, onRemove }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [loadError, setLoadError] = useState(false);
  
  React.useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.onerror = () => {
      setLoadError(true);
    };
    fileReader.readAsDataURL(file);
    
    // Clean up
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [file]);
  
  if (loadError) {
    return (
      <div className="relative w-32 h-32 m-1 border rounded flex items-center justify-center bg-red-100">
        <span className="text-red-500 text-xs text-center">Error loading preview</span>
        {onRemove && (
          <button 
            onClick={() => onRemove(file)}
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        )}
      </div>
    );
  }
  
  if (!previewUrl) {
    return (
      <div className="relative w-32 h-32 m-1 border rounded flex items-center justify-center bg-gray-100">
        <span className="text-gray-400 text-xs">Loading...</span>
      </div>
    );
  }
  
  return (
    <div className="relative w-32 h-32 m-1 border rounded overflow-hidden group">
      <img 
        src={previewUrl} 
        alt={file.name} 
        className="w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-transparent bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
      {onRemove && (
        <button 
          onClick={() => onRemove(file)}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
        >
          ×
        </button>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
        {file.name}
      </div>
    </div>
  );
};

export default ImagePreview;
