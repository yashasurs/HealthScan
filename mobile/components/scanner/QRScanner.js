import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  Vibration,
  Platform
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { showToast } from '../../utils/toast';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const QRScanner = ({ visible, onClose, onQRScanned }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    
    setScanned(true);
    
    // Vibrate on successful scan
    if (Platform.OS !== 'web') {
      Vibration.vibrate(100);
    }

    // Handle any QR code
    if (type === 'qr' || type === 'org.iso.QRCode') {
      onQRScanned(data);
      onClose();    } else {
      // Not a QR code
      showToast.error('Not a QR Code', 'Please scan a QR code.');
      setScanned(false);
    }
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const renderPermissionMessage = () => (
    <View style={styles.permissionContainer}>
      <Ionicons name="camera-outline" size={64} color="#666" />
      <Text style={styles.permissionTitle}>Camera Permission Required</Text>
      <Text style={styles.permissionText}>
        Please grant camera permission to scan QR codes
      </Text>
      <TouchableOpacity 
        style={styles.permissionButton} 
        onPress={async () => {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasPermission(status === 'granted');
        }}
      >
        <Text style={styles.permissionButtonText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );
  const renderScanner = () => (
    <View style={styles.scannerContainer}>
      <CameraView
        style={styles.camera}
        facing="back"
        flash={flashOn ? 'on' : 'off'}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.overlayTop} />
          
          {/* Middle section with scanning frame */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanFrame}>
              {/* Corner indicators */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Scanning animation */}
              {!scanned && (
                <View style={styles.scanLine} />
              )}
            </View>
            <View style={styles.overlaySide} />
          </View>
          
          {/* Bottom overlay */}
          <View style={styles.overlayBottom}>
            <Text style={styles.instructionText}>
              Position the QR code within the frame
            </Text>
          </View>        </View>
      </CameraView>
    </View>
  );

  if (hasPermission === null) {
    return null; // Still loading permissions
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
            <Ionicons 
              name={flashOn ? "flash" : "flash-outline"} 
              size={28} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {hasPermission === false ? renderPermissionMessage() : renderScanner()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  flashButton: {
    padding: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 250,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#000',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#000',
    opacity: 0.8,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default QRScanner;
