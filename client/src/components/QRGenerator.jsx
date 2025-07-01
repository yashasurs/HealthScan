import React, { useState } from 'react';
import { qrAPI } from '../utils/apiService';

const QRGenerator = ({ type, id, label }) => {
  const [qrImage, setQrImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateQR = async () => {
    if (!id) {
      setError('Invalid ID provided');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      let response;
      
      if (type === 'collection') {
        response = await qrAPI.generateCollectionQR(id);
      } else if (type === 'record') {
        response = await qrAPI.generateRecordQR(id);
      } else {
        throw new Error('Invalid QR type');
      }

      const imageBlob = response.data;
      const imageUrl = URL.createObjectURL(imageBlob);
      setQrImage(imageUrl);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (qrImage) {
      const link = document.createElement('a');
      link.href = qrImage;
      link.download = `${type}_${id}_qr.png`;
      link.click();
    }
  };

  const QRIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Share {label}
        </h3>
        <QRIcon />
      </div>

      {error && (
        <div className="bg-red-50 border-l-2 border-red-400 p-3 rounded mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!qrImage ? (
        <button
          onClick={generateQR}
          disabled={isGenerating}
          className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isGenerating ? 'Generating QR...' : 'Generate QR Code'}
        </button>
      ) : (
        <div className="text-center space-y-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <img
              src={qrImage}
              alt="QR Code"
              className="mx-auto max-w-full h-auto"
              style={{ maxWidth: '200px' }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadQR}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Download
            </button>
            <button
              onClick={() => {
                setQrImage(null);
                URL.revokeObjectURL(qrImage);
              }}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Generate New
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3 text-center">
        Generate a QR code to easily share this {type} with others
      </p>
    </div>
  );
};

export default QRGenerator;
