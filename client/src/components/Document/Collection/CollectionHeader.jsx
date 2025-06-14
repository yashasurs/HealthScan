import React from 'react';
import { useNavigate } from 'react-router-dom';

const CollectionHeader = ({
  collection,
  isEditingName,
  editedName,
  setEditedName,
  isEditingDescription,
  editedDescription,
  setEditedDescription,
  qrLoading,
  onEditName,
  onSaveName,
  onCancelEditName,
  onEditDescription,
  onSaveDescription,
  onCancelEditDescription,
  onDownloadQR
}) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8 shadow-sm">
      {/* Navigation and Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-6 sm:mb-8">        <button
          onClick={() => navigate('/collections')}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200 text-sm sm:text-base self-start rounded-lg border border-transparent hover:border-blue-200"
          title="Back to Collections"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>

        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 bg-white border border-blue-300 rounded-lg px-3 py-2 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveName();
                  if (e.key === 'Escape') onCancelEditName();
                }}
              />              <div className="flex gap-2">                <button
                  onClick={onSaveName}
                  className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded-lg transition-all duration-200"
                  title="Save"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={onCancelEditName}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                  title="Cancel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2 group">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">{collection.name}</h1>              <button
                onClick={onEditName}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-all duration-200"
                title="Edit collection name"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          )}
          
          {isEditingDescription ? (
            <div className="flex items-start gap-2">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="text-gray-600 text-sm sm:text-base bg-white border border-blue-300 rounded px-2 py-1 flex-1 min-w-0 resize-none"
                rows="2"
                placeholder="Add a description..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSaveDescription();
                  }
                  if (e.key === 'Escape') onCancelEditDescription();
                }}
              />
              <div className="flex flex-col gap-1">                <button
                  onClick={onSaveDescription}
                  className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1.5 rounded-md transition-all duration-200"
                  title="Save"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={onCancelEditDescription}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-md transition-all duration-200"
                  title="Cancel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 group">
              {collection.description ? (
                <p className="text-gray-600 mt-2 text-sm sm:text-base">{collection.description}</p>
              ) : (
                <p className="text-gray-400 mt-2 text-sm sm:text-base italic">No description</p>
              )}              <button
                onClick={onEditDescription}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-all duration-200 mt-1"
                title="Edit description"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* QR Code Download Button */}
        <div className="flex-shrink-0">          <button
            onClick={onDownloadQR}
            disabled={qrLoading}            className={`inline-flex items-center gap-2 px-4 py-2.5 font-medium transition-all duration-200 text-xs sm:text-sm border rounded-lg ${
              qrLoading
                ? 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-50'
                : 'text-black hover:text-black border-gray-300 hover:border-gray-400 hover:bg-gray-100'
            }`}
            title={qrLoading ? "Generating QR Code..." : "Download QR Code for Collection"}
          >
            {qrLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">Generating...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span className="hidden sm:inline">Download QR</span>
                <span className="sm:hidden">QR</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionHeader;
