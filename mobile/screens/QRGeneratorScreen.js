import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const QRGeneratorScreen = () => {
  const [qrValue, setQrValue] = useState('https://example.com');
  const [qrSize, setQrSize] = useState(200);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>QR Code Generator</Text>
      </View>
      
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
        )}
      </View>
      
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

        <TouchableOpacity style={styles.generateButton}>
          <Text style={styles.generateButtonText}>Save QR Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#000',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  qrPlaceholder: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#777',
  },
  inputContainer: {
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#000',
  },
  sizeContainer: {
    marginBottom: 20,
  },
  sizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedSize: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  sizeButtonText: {
    color: '#000',
  },
  generateButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QRGeneratorScreen;
