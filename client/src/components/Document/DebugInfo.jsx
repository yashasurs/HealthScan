import React from 'react';

const DebugInfo = ({ isAuthenticated, selectedCollection, records, files }) => {
  return (
    <div className="mt-8">
      <details className="bg-gray-50 rounded-md p-2">
        <summary className="text-sm text-gray-500 cursor-pointer">Debug Information</summary>
        <div className="p-3 text-xs font-mono overflow-auto max-h-40 mt-2">
          <p>User authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>Selected collection: {selectedCollection || 'None'}</p>          <p>Records count: {records.length}</p>
          <p>Files selected for upload: {files.length}</p>
          <p>API base URL: https://healthscan-e868bea9b278.herokuapp.com</p>
          <p>Authentication token present: {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
          <hr className="my-2" />
          <p>If uploads are not showing in records:</p>
          <ol className="list-decimal list-inside">
            <li>Ensure server is running</li>
            <li>Check that you're logged in properly</li>
            <li>Verify collection selection</li>
            <li>Try refreshing collections and records</li>
            <li>Check browser console for errors</li>
          </ol>
        </div>
      </details>
    </div>
  );
};

export default DebugInfo;
