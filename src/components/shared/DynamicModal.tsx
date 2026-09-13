import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/color';
import { fonts } from '../../config/themes/typography';

const { width } = Dimensions.get('window');

interface DynamicModalProps {
  visible: boolean;
  icon: React.ReactNode;
  text: string;
  onAccept: () => void;
  onReject?: () => void;
  acceptText: string;
  rejectText: string;
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  visible,
  icon,
  text,
  onAccept,
  onReject,
  acceptText,
  rejectText,
}) => {
  const handleAccept = () => {
    onAccept();
    if (rejectText === '' && typeof onReject === 'function') {
      onReject(); // ✅ safely call only if defined and a function
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onReject}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>{icon}</View>
          <Text style={styles.text}>{text}</Text>

          <View style={styles.buttonRow}>
            {rejectText !== '' && (
              <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
                <Text style={styles.rejectText}>{rejectText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
              <Text style={styles.acceptText}>{acceptText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Colors.white,
    width: width * 0.85,
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.text,
    marginBottom: 25,
    fontFamily: fonts['Poppins-Regular'],
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#eee',
    paddingVertical: 12,
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: fonts['Poppins-SemiBold'],
  },
  rejectText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: fonts['Poppins-SemiBold'],
  },
});

export default DynamicModal;
