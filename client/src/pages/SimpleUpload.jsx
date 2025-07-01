import React from 'react';
import SimpleUpload from '../components/SimpleUpload';

const Upload = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Upload</h1>
          <p className="text-gray-600">Upload and process your documents with OCR technology</p>
        </div>
        
        <SimpleUpload />
      </div>
    </div>
  );
};

export default Upload;
