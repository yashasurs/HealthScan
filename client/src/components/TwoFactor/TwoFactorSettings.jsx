import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/apiService';
import { STORAGE_KEYS } from '../../utils/constants';
import TOTPInput from './TOTPInput';

const TwoFactorSettings = () => {
  const { user, setup2FA, activate2FA, disable2FA } = useAuth();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);

  const handleEnable2FA = async () => {
    try {
      setError('');
      setIsSettingUp(true);
      
      const response = await setup2FA();
      setSecretKey(response.totp_secret);
      
      // Generate QR code using the API service
      try {
        const qrResponse = await authAPI.get2FAQRCode();
        if (qrResponse.data) {
          setQrCodeUrl(URL.createObjectURL(qrResponse.data));
        }
      } catch (qrError) {
        console.warn('Could not load QR code:', qrError);
        // Continue without QR code - user can still use manual entry
      }
    } catch (err) {
      setError('Failed to setup 2FA. Please try again.');
      setIsSettingUp(false);
    }
  };

  const handleVerifyAndActivate = async (code) => {
    if (code.length !== 6) return;
    
    try {
      setIsVerifying(true);
      setError('');
      
      await activate2FA(code);
      setSuccess('Two-factor authentication has been enabled successfully!');
      setIsSettingUp(false);
      setQrCodeUrl('');
      setTotpCode('');
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async (code) => {
    if (code.length !== 6) return;
    
    try {
      setIsVerifying(true);
      setError('');
      
      await disable2FA(code);
      setSuccess('Two-factor authentication has been disabled.');
      setShowDisableForm(false);
      setTotpCode('');
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Secret key copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setSuccess('Secret key copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const ShieldIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );

  const QRIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  );

  const CopyIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Status Messages */}
      {(error || success) && (
        <div className="p-4 border-b border-gray-100">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {success}
            </div>
          )}
        </div>
      )}

      {/* Current Status */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldIcon className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className={`text-xs ${user?.totp_enabled ? 'text-green-600' : 'text-gray-500'}`}>
                {user?.totp_enabled ? 'Security enhanced' : 'Not enabled'}
              </p>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${user?.totp_enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4">
        {/* Information about 2FA */}
        {!user?.totp_enabled && !isSettingUp && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-3">
              Add an extra layer of security with 2FA. You'll need an authenticator app like Google Authenticator, 
              Authy, or Microsoft Authenticator to generate time-based codes for login.
            </p>
          </div>
        )}

        {/* Enable 2FA */}
        {!user?.totp_enabled && !isSettingUp && (
          <button
            onClick={handleEnable2FA}
            className="w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Enable 2FA
          </button>
        )}

        {/* QR Code Setup - Side by side layout */}
        {isSettingUp && (
          <div className="space-y-6">
            {/* Setup Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-1">
                <strong>Setup Instructions:</strong>
              </p>
              <p className="text-xs text-blue-600">
                Choose one method below to add your account to an authenticator app.
              </p>
            </div>
            
            {/* Visual Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500 font-medium">SETUP METHODS</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code Column */}
              {qrCodeUrl && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <QRIcon className="w-4 h-4 mr-2" />
                    Scan QR Code
                  </h4>
                  <div className="text-center">
                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-32 h-32 mx-auto border rounded-lg mb-2 shadow-sm" />
                    <p className="text-xs text-gray-600">
                      Open your authenticator app and scan this QR code
                    </p>
                  </div>
                </div>
              )}
              
              {/* Manual Entry Column */}
              <div className={`bg-gray-50 p-4 rounded-lg border border-gray-200 ${qrCodeUrl ? '' : 'md:col-span-2'}`}>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <CopyIcon className="w-4 h-4 mr-2" />
                  Manual Entry
                </h4>
                <p className="text-xs text-gray-600 mb-2">
                  Or manually enter this secret key in your app:
                </p>
                <div className="flex items-center space-x-2 mb-2">
                  <code className="flex-1 p-2 bg-white rounded text-xs font-mono break-all border">
                    {secretKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(secretKey)}
                    className="p-2 text-gray-500 hover:text-gray-700 bg-white rounded border"
                    title="Copy secret key"
                  >
                    <CopyIcon className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Account: {user?.email || user?.username}
                </p>
              </div>
            </div>
            
            {/* Visual Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500 font-medium">VERIFICATION</span>
              </div>
            </div>
            
            {/* Verification Section */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium mb-2">
                Verify Setup
              </p>
              <p className="text-xs text-green-600 mb-3">
                After adding the account, enter the 6-digit code from your app:
              </p>
              <TOTPInput
                onComplete={handleVerifyAndActivate}
                disabled={isVerifying}
                error={!!error}
              />
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsSettingUp(false);
                  setQrCodeUrl('');
                  setError('');
                }}
                disabled={isVerifying}
                className="w-full py-2 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Cancel Setup
              </button>
            </div>
          </div>
        )}

        {/* Disable 2FA */}
        {user?.totp_enabled && !showDisableForm && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium mb-1">
                2FA Protection Active
              </p>
              <p className="text-xs text-green-600">
                2FA is currently protecting your account. You'll need a current authentication code to disable it.
              </p>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowDisableForm(true)}
                className="w-full py-2 text-red-600 border border-red-300 text-sm rounded hover:bg-red-50"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        )}

        {/* Disable Form - With more context */}
        {showDisableForm && (
          <div className="space-y-4">
            {/* Warning Section */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium mb-1">
                <strong>⚠️ Security Warning</strong>
              </p>
              <p className="text-xs text-yellow-700">
                Disabling 2FA will reduce your account security and make it easier for unauthorized users to access your account.
              </p>
            </div>
            
            {/* Visual Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500 font-medium">CONFIRMATION REQUIRED</span>
              </div>
            </div>
            
            {/* Verification Section */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 font-medium mb-2">
                Verify Current Code
              </p>
              <p className="text-xs text-red-600 mb-3">
                Enter your current 6-digit authentication code to confirm:
              </p>
              
              <TOTPInput
                onComplete={handleDisable2FA}
                disabled={isVerifying}
                error={!!error}
              />
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => {
                  setShowDisableForm(false);
                  setError('');
                }}
                disabled={isVerifying}
                className="w-full py-2 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSettings;
