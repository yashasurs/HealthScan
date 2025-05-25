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
      <div className="relative w-32 h-32 m-2 border-2 border-dashed border-red-200 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <svg className="w-6 h-6 text-red-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-500 text-xs">Error loading</span>
        </div>
        {onRemove && (
          <button 
            onClick={() => onRemove(file)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-lg transition-all duration-200 hover:scale-110"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
  
  if (!previewUrl) {
    return (
      <div className="relative w-32 h-32 m-2 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="text-center">
          <svg className="animate-spin w-5 h-5 text-purple-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-400 text-xs">Loading...</span>
        </div>
      </div>
    );
  }
    return (
    <div className="relative w-32 h-32 m-2 border-2 border-gray-200 rounded-xl overflow-hidden group hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-lg">
      <img 
        src={previewUrl} 
        alt={file.name} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      {onRemove && (
        <button 
          onClick={() => onRemove(file)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-lg transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
        <p className="truncate font-medium">{file.name}</p>
        <p className="text-gray-300 text-[10px]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>
    </div>
  );
};

export default ImagePreview;
