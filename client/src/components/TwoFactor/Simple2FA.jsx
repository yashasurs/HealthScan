import React, { useState } from 'react';
import TOTPInput from './TOTPInput';

const Simple2FA = ({ onVerify, onCancel, isLoading = false, error = '' }) => {
  const [totpCode, setTotpCode] = useState('');

  const handleTOTPComplete = (code) => {
    setTotpCode(code);
    onVerify(code);
  };

  const ShieldIcon = ({ className = "w-8 h-8" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <ShieldIcon className="text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Two-Factor Authentication
        </h2>
        <p className="text-sm text-gray-600">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* TOTP Input */}
      <div className="mb-6">
        <TOTPInput
          onComplete={handleTOTPComplete}
          disabled={isLoading}
          error={!!error}
        />
      </div>

      {/* Instructions */}
      <div className="text-center mb-6">
        <p className="text-xs text-gray-500">
          Open your authenticator app and enter the 6-digit code to continue
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Verifying...</span>
          </div>
        )}
        
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="w-full py-2 px-4 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back to Login
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          Having trouble? Contact support if you've lost access to your authenticator app.
        </p>
      </div>
    </div>
  );
};

export default Simple2FA;
