import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

/**
 * QR Code Generator component
 * @param {Object} props
 * @param {string} [props.initialValue] - Initial value for QR code
 * @param {number} [props.initialSize] - Initial size for QR code
 * @param {Function} [props.onSave] - Callback when save button is pressed
 */
const QRCodeGenerator = ({ initialValue = 'https://example.com', initialSize = 200, onSave }) => {
  const [qrValue, setQrValue] = useState(initialValue);
  const [qrSize, setQrSize] = useState(initialSize);

  return (
    <View style={styles.container}>
      <View style={styles.qrContainer}>
        {qrValue ? (
          <QRCode
            value={qrValue}
            size={qrSize}
            color="#000"
            backgroundColor="#fff"
          />
        ) : (
          <View style={[styles.qrPlaceholder, { width: qrSize, height: qrSize }]}>
            <Text style={styles.placeholderText}>Enter text to generate QR</Text>
          </View>
        )}      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Enter content for QR code:</Text>
        <TextInput
          style={styles.input}
          value={qrValue}
          onChangeText={setQrValue}
          placeholder="Enter URL or text"
          placeholderTextColor="#777"
        />
        
        <View style={styles.sizeContainer}>
          <Text style={styles.inputLabel}>QR Code Size:</Text>
          <View style={styles.sizeButtons}>
            <TouchableOpacity 
              style={[styles.sizeButton, qrSize === 150 && styles.selectedSize]} 
              onPress={() => setQrSize(150)}>
              <Text style={styles.sizeButtonText}>Small</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sizeButton, qrSize === 200 && styles.selectedSize]} 
              onPress={() => setQrSize(200)}>
              <Text style={styles.sizeButtonText}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sizeButton, qrSize === 250 && styles.selectedSize]} 
              onPress={() => setQrSize(250)}>
              <Text style={styles.sizeButtonText}>Large</Text>
            </TouchableOpacity>
          </View>
        </View>

        {onSave && (
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={() => onSave(qrValue, qrSize)}
          >
            <Text style={styles.saveButtonText}>Save QR Code</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  qrPlaceholder: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  placeholderText: {
    color: '#777',
    textAlign: 'center',
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  sizeContainer: {
    marginTop: 10,
  },
  sizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    margin: 5,
    alignItems: 'center',
  },  selectedSize: {
    backgroundColor: '#000',
  },
  sizeButtonText: {
    fontWeight: 'bold',
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QRCodeGenerator;
