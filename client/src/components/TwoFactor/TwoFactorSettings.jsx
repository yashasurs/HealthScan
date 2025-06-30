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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <ShieldIcon className="w-6 h-6 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Current Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Status</p>
            <p className={`text-sm ${user?.totp_enabled ? 'text-green-600' : 'text-gray-500'}`}>
              {user?.totp_enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${user?.totp_enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>
      </div>

      {/* Setup Process */}
      {!user?.totp_enabled && !isSettingUp && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
          <button
            onClick={handleEnable2FA}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Enable Two-Factor Authentication
          </button>
        </div>
      )}

      {/* QR Code Setup */}
      {isSettingUp && (
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-2">
              1. Scan QR Code
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            
            {qrCodeUrl && (
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-2">
              2. Manual Entry (Alternative)
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Or manually enter this secret key in your authenticator app:
            </p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 p-2 bg-gray-100 border border-gray-200 rounded text-xs font-mono break-all">
                {secretKey}
              </code>
              <button
                onClick={() => copyToClipboard(secretKey)}
                className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                title="Copy to clipboard"
              >
                <CopyIcon />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-2">
              3. Verify Setup
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit code from your authenticator app:
            </p>
            
            <div className="space-y-4">
              <TOTPInput
                onComplete={handleVerifyAndActivate}
                disabled={isVerifying}
                error={!!error}
              />
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setIsSettingUp(false);
                    setQrCodeUrl('');
                    setError('');
                  }}
                  disabled={isVerifying}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable 2FA */}
      {user?.totp_enabled && !showDisableForm && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Two-factor authentication is currently enabled for your account.
          </p>
          <button
            onClick={() => setShowDisableForm(true)}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Disable Two-Factor Authentication
          </button>
        </div>
      )}

      {/* Disable Form */}
      {showDisableForm && (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Disabling two-factor authentication will make your account less secure.
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Enter your current 6-digit authentication code to disable 2FA:
            </p>
            
            <TOTPInput
              onComplete={handleDisable2FA}
              disabled={isVerifying}
              error={!!error}
            />
          </div>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => {
                setShowDisableForm(false);
                setError('');
              }}
              disabled={isVerifying}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSettings;
