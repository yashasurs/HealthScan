import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { QRCodeGenerator } from '../components/qr';
import { Header } from '../components/common';

const QRGeneratorScreen = () => {
  const handleSaveQRCode = (value, size) => {
    // In a real app, this would save the QR code to the device
    Alert.alert(
      "QR Code Saved",
      `QR Code with value "${value}" and size ${size}px has been saved.`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="QR Code Generator" />
      <QRCodeGenerator 
        initialValue="https://example.com"
        initialSize={200}
        onSave={handleSaveQRCode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default QRGeneratorScreen;
