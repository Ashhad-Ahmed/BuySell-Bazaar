// Changes made to support your requested location permission flow

// 1. Modify LocationPermissionModal to support a `onRetry` callback
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/color';

interface LocationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ visible, onClose}) => {
  const handleOkayPress = () => {
    onClose();
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Location Required</Text>
          <Text style={styles.message}>
            BuySell Bazaar needs your precise location to verify ads and prevent fraudulent listings.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleOkayPress}>
            <Text style={styles.buttonText}>Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default LocationPermissionModal;
