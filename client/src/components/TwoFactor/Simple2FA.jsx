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
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 px-8 py-8 border-b border-gray-200">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-md">
              <ShieldIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Two-Factor Authentication
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Secure your account with an additional layer of protection
          </p>
        </div>
      </div>

      <div className="p-8 space-y-10">
        {/* Step 1: Instructions Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full text-sm font-bold mr-4 shadow-md">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Open Your Authenticator App</h3>
          </div>
          <p className="text-sm text-gray-600 ml-14 leading-relaxed">
            Launch your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.) and locate the 6-digit verification code for this account.
          </p>
        </div>

        {/* Visual Separator */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-6 py-2 bg-white text-gray-500 font-bold tracking-wider border border-gray-300 rounded-full shadow-sm">
              THEN
            </span>
          </div>
        </div>

        {/* Step 2: Code Entry Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full text-sm font-bold mr-4 shadow-md">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Enter the 6-Digit Code</h3>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 ml-14 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg shadow-sm">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* TOTP Input */}
          <div className="ml-14">
            <TOTPInput
              onComplete={handleTOTPComplete}
              disabled={isLoading}
              error={!!error}
            />
          </div>
        </div>

        {/* Loading State Section */}
        {isLoading && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-8 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mr-4"></div>
              <span className="text-lg font-semibold text-blue-800">Verifying your code...</span>
            </div>
          </div>
        )}

        {/* Action Buttons Section */}
        <div className="pt-6 border-t-2 border-gray-200">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full py-4 px-6 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-base shadow-md hover:shadow-lg"
          >
            ← Back to Login
          </button>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mr-3 shadow-sm">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-base font-semibold text-gray-700">Need Help?</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
              Having trouble accessing your authenticator app?<br />
              <span className="font-semibold text-gray-700">Contact support</span> for assistance with account recovery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simple2FA;
