import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../constants/color';

interface ValidationModalProps {
  visible: boolean;
  errors: string[];
  onClose: () => void;
}

const ValidationModal: React.FC<ValidationModalProps> = ({ visible, errors, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Please fix the following:</Text>
          {errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>• {error}</Text>
          ))}
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.primary,
  },
  errorText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  button: {
    alignSelf: 'flex-end',
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
});

export default ValidationModal;
